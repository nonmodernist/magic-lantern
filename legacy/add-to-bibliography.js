// add-to-bibliography.js
// Interactive tool to add Lantern search results to bibliography.toml

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LanternBibliographyTool {
    constructor() {
        this.bibliographyPath = path.join(process.cwd(), 'data', 'bibliography.toml');
        this.lanternReportPath = path.join(process.cwd(), 'reports', 'lantern-reports', 'lantern-report-v3.json');
        this.existingBibliography = '';
        this.existingIds = new Set();
        this.newEntries = [];
        this.reviewDecisions = {}; // Track review decisions
        this.lanternData = null; // Store the full data for updating
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    // Load existing bibliography
    loadBibliography() {
        try {
            this.existingBibliography = fs.readFileSync(this.bibliographyPath, 'utf8');
            // Extract existing IDs to avoid duplicates
            const idMatches = this.existingBibliography.match(/^\[([^\]]+)\]/gm);
            if (idMatches) {
                idMatches.forEach(match => {
                    const id = match.replace(/[\[\]]/g, '');
                    this.existingIds.add(id);
                });
            }
            console.log(`✅ Loaded existing bibliography with ${this.existingIds.size} entries\n`);
        } catch (error) {
            console.error('❌ Could not load bibliography.toml:', error.message);
            process.exit(1);
        }
    }

    // Load Lantern report
    loadLanternReport() {
        try {
            const data = fs.readFileSync(this.lanternReportPath, 'utf8');
            this.lanternData = JSON.parse(data);
            return this.lanternData;
        } catch (error) {
            console.error('❌ Could not load Lantern report:', error.message);
            console.error('Make sure you have run lantern-tool-v3.js first!');
            process.exit(1);
        }
    }

    // Generate citation ID
    generateCitationId(source, filmTitle, year, contentType) {
        // Clean up source name for ID
        const sourceClean = source.name.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
        
        // Clean up film title for ID
        const filmClean = filmTitle.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20); // Limit length
        
        // Base ID
        let baseId = `${sourceClean}_${filmClean}_${year}`;
        
        // Add content type suffix if not a review
        if (contentType !== 'review') {
            baseId += `_${contentType}`;
        }
        
        // Handle duplicates by adding numbers
        let id = baseId;
        let counter = 2;
        while (this.existingIds.has(id) || this.newEntries.some(e => e.id === id)) {
            id = `${baseId}_${counter}`;
            counter++;
        }
        
        return id;
    }

    // Format date from Lantern format
    formatDate(dateString) {
        if (!dateString) return null;
        
        // Try to parse various date formats
        const datePatterns = [
            /(\w+)\s+(\d{1,2}),\s+(\d{4})/,  // "October 10, 1956"
            /(\w+)\s+(\d{4})/,                // "October 1956"
            /(\d{4})-(\d{2})-(\d{2})/,        // "1956-10-10"
            /(\d{4})/                          // "1956"
        ];
        
        for (const pattern of datePatterns) {
            const match = dateString.match(pattern);
            if (match) {
                if (match.length === 4) {
                    // Full date with month name
                    const months = {
                        'january': '01', 'february': '02', 'march': '03', 'april': '04',
                        'may': '05', 'june': '06', 'july': '07', 'august': '08',
                        'september': '09', 'october': '10', 'november': '11', 'december': '12'
                    };
                    const month = months[match[1].toLowerCase()] || match[1];
                    const day = match[2].padStart(2, '0');
                    return `${match[3]}-${month}-${day}`;
                } else if (match.length === 3 && match[0].includes('-')) {
                    // ISO format
                    return match[0];
                } else if (match.length === 3) {
                    // Month Year format
                    return `${match[2]}`;
                } else {
                    // Just year
                    return match[1];
                }
            }
        }
        
        return dateString; // Return as-is if no pattern matches
    }

    // Clean excerpt for TOML
    cleanExcerpt(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/"/g, "'")
            .replace(/\\/g, '')
            .substring(0, 200)
            .trim();
    }

    // Helper function to extract page image URL from IA read URL
extractPageImageUrl(readUrl) {
    // Extract the clean URL
    const urlMatch = readUrl.match(/href="([^"]+)"/);
    const cleanUrl = urlMatch ? urlMatch[1] : readUrl;
    
    // Parse the IA URL
    // https://archive.org/stream/variety204-1956-10#page/n71/
    const match = cleanUrl.match(/archive\.org\/stream\/([^#]+)#page\/([^\/]+)/);
    
    if (match) {
        const identifier = match[1];
        const pageNum = match[2];
        return `https://archive.org/download/${identifier}/page/${pageNum}_medium.jpg`;
    }
    
    return null;
}

    // Format a single bibliography entry
    formatBibliographyEntry(entry) {
        const lines = [];
        
        lines.push(`[${entry.id}]`);
        lines.push(`type = "lantern"`);
        lines.push(`title = "${entry.title}"`);
        lines.push(`source = "${entry.source}"`);
        
        if (entry.date) {
            lines.push(`date = "${entry.date}"`);
        }
        
        lines.push(`url = "${entry.url}"`);
        lines.push(`accessed = "${entry.accessed}"`);

            // Add featured flag if marked
            if (entry.featured) {
        lines.push(`featured = true`);
        if (entry.featured_note) {
            lines.push(`featured_note = "${entry.featured_note}"`);
        }
        // Try to extract page image URL
        const imageUrl = this.extractPageImageUrl(entry.readUrl);
        if (imageUrl) {
            lines.push(`page_image_url = "${imageUrl}"`);
        }
    }
        
        // Add metadata as comments for reference
        lines.push(`# Film: ${entry.film} (${entry.filmYear})`);
        lines.push(`# Content type: ${entry.contentType}`);
        lines.push(`# Relevance score: ${entry.score}`);
        lines.push(`# Lantern ID: ${entry.lanternId}`);

        // ADD contentType as a field too (for the macro styling)
    lines.push(`contentType = "${entry.contentType}"`);
    lines.push(`film = "${entry.film}"`);
    lines.push(`filmYear = ${entry.filmYear}`);
    lines.push(`lanternId = "${entry.lanternId}"`);
        
        if (entry.excerpt) {
            lines.push(`quote = """${entry.excerpt}"""`);
        }
        
        return lines.join('\n');
    }

    // Prompt user for input
    async prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    // Display sources for a film
    displayFilmSources(film) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🎬 ${film.title} (${film.year})`);
        
        if (film.director) {
            console.log(`   Director: ${film.director}`);
        }
        if (film.author) {
            console.log(`   Based on work by: ${film.author}`);
        }
        
        // Check if this film was previously reviewed
        const previouslyReviewed = film.uniqueResults.some(r => r.reviewStatus);
        if (previouslyReviewed) {
            console.log(`\n   ⚠️  This film has been partially or fully reviewed before`);
        }
        
        console.log(`\nFound ${film.uniqueResults.length} sources:\n`);
        
        film.uniqueResults.forEach((result, index) => {
            const num = index + 1;
            const typeEmoji = {
                'review': '📰',
                'production': '🎬',
                'advertisement': '📢',
                'box_office': '💰',
                'announcement': '📣',
                'mention': '📝'
            };
            
            // Show review status if exists
            let statusIndicator = '';
            if (result.reviewStatus) {
                if (result.reviewStatus === 'added') {
                    statusIndicator = ' ✅ [Previously added]';
                } else if (result.reviewStatus === 'rejected') {
                    statusIndicator = ' ❌ [Previously rejected]';
                }
            }
            
            console.log(`[${num}] ${result.publication.name} - ${result.date || 'Date unknown'} [Score: ${result.score.toFixed(1)}] ${typeEmoji[result.contentType] || '📄'} ${result.contentType}${statusIndicator}`);
            console.log(`    "${this.cleanExcerpt(result.excerpt)}..."`);
            console.log(`    → View: ${this.extractUrl(result.readUrl)}`);
            console.log();
        });
    }

    // Extract clean URL from readUrl HTML
    extractUrl(readUrl) {
        const match = readUrl.match(/href="([^"]+)"/);
        return match ? match[1] : readUrl;
    }

    // Process a single film
 // Replace your existing processFilm method (starting around line 355) with this:
async processFilm(film) {
    if (film.uniqueResults.length === 0) {
        return;
    }
    
    this.displayFilmSources(film);
    
    const response = await this.prompt('Select sources to add (e.g., "1,3,5" or "all" or "none"): ');
    
    let selectedIndices = [];
    let reviewedAll = false;
    
    if (response.toLowerCase() === 'all') {
        selectedIndices = film.uniqueResults.map((_, i) => i);
        reviewedAll = true;
    } else if (response.toLowerCase() === 'none') {
        reviewedAll = true;
    } else if (response !== '') {
        selectedIndices = response.split(',')
            .map(s => parseInt(s.trim()) - 1)
            .filter(i => i >= 0 && i < film.uniqueResults.length);
    }
    
    // Track the review decision for this film
    if (!this.reviewDecisions[film.filePath]) {
        this.reviewDecisions[film.filePath] = {
            filmTitle: film.title,
            filmYear: film.year,
            reviewedAt: new Date().toISOString(),
            reviewedAll: reviewedAll,
            sources: {}
        };
    }
    
    // Ask about featured sources if any were selected
    let featuredIndices = [];
    if (selectedIndices.length > 0) {
        console.log('\n🌟 Featured Sources:');
        const featuredResponse = await this.prompt('Which should be featured on the film page? (e.g., "1,3" or "none"): ');
        
        if (featuredResponse.toLowerCase() !== 'none' && featuredResponse !== '') {
            featuredIndices = featuredResponse.split(',')
                .map(s => parseInt(s.trim()) - 1)
                .filter(i => selectedIndices.includes(i));
        }
    }
    
    // Process selected sources
    for (const index of selectedIndices) {
        const result = film.uniqueResults[index];
        
        const id = this.generateCitationId(
            result.publication,
            film.title,
            film.year,
            result.contentType
        );
        
        const entry = {
            id,
            title: `${film.title} - ${result.contentType}`,
            source: result.publication.name,
            date: this.formatDate(result.date),
            url: this.extractUrl(result.readUrl),
            readUrl: result.readUrl, // Keep for image extraction
            accessed: new Date().toISOString().split('T')[0],
            film: film.title,
            filmYear: film.year,
            contentType: result.contentType,
            score: result.score,
            lanternId: result.id,
            excerpt: this.cleanExcerpt(result.excerpt),
            featured: featuredIndices.includes(index)
        };
        
        // If featured, optionally add a note
        if (entry.featured) {
            const note = await this.prompt(`Featured note for "${entry.source}" (or press Enter to skip): `);
            if (note) {
                entry.featured_note = note;
            }
        }
        
        this.newEntries.push(entry);
        console.log(`   ✅ Added: ${id}${entry.featured ? ' [FEATURED]' : ''}`);
        
        // Track this decision
        this.reviewDecisions[film.filePath].sources[result.id] = {
            status: 'added',
            bibliographyId: id,
            reviewedAt: new Date().toISOString()
        };
    }
    
    // Mark rejected sources if we reviewed all
    if (reviewedAll) {
        film.uniqueResults.forEach((result, index) => {
            if (!selectedIndices.includes(index)) {
                this.reviewDecisions[film.filePath].sources[result.id] = {
                    status: 'rejected',
                    reason: 'not_selected',
                    reviewedAt: new Date().toISOString()
                };
            }
        });
    }
}
    // Save updated bibliography
    saveBibliography() {
        if (this.newEntries.length === 0) {
            console.log('\n📝 No new entries to add.');
            return;
        }
        
        console.log(`\n📝 Adding ${this.newEntries.length} new entries to bibliography...`);
        
        // Group entries by film
        const entriesByFilm = {};
        this.newEntries.forEach(entry => {
            const key = `${entry.film} (${entry.filmYear})`;
            if (!entriesByFilm[key]) {
                entriesByFilm[key] = [];
            }
            entriesByFilm[key].push(entry);
        });
        
        // Build new content
        let newContent = '\n\n# =============================================================================\n';
        newContent += `# 🎬 LANTERN SOURCES - Added ${new Date().toISOString().split('T')[0]}\n`;
        newContent += '# =============================================================================\n';
        
        Object.keys(entriesByFilm).sort().forEach(filmKey => {
            newContent += `\n# ${filmKey}\n`;
            newContent += '# ' + '-'.repeat(60) + '\n\n';
            
            entriesByFilm[filmKey].forEach(entry => {
                newContent += this.formatBibliographyEntry(entry) + '\n\n';
            });
        });
        
        // Append to existing bibliography
        const updatedBibliography = this.existingBibliography.trimEnd() + newContent;
        
        // Create backup
        const backupPath = this.bibliographyPath + '.backup-' + Date.now();
        fs.writeFileSync(backupPath, this.existingBibliography);
        console.log(`✅ Created backup: ${backupPath}`);
        
        // Save updated bibliography
        fs.writeFileSync(this.bibliographyPath, updatedBibliography);
        console.log(`✅ Updated bibliography.toml with ${this.newEntries.length} new entries`);
        
        // Show summary of what was added
        console.log('\n📊 Summary of additions:');
        Object.entries(entriesByFilm).forEach(([film, entries]) => {
            console.log(`   ${film}: ${entries.length} sources`);
        });
    }

    // Parse range selection like "1,3,5-8"
    parseRangeSelection(selection, maxIndex) {
        const indices = new Set();
        const parts = selection.split(',');
        
        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1);
                for (let i = start; i <= end && i < maxIndex; i++) {
                    if (i >= 0) indices.add(i);
                }
            } else {
                const index = parseInt(part.trim()) - 1;
                if (index >= 0 && index < maxIndex) {
                    indices.add(index);
                }
            }
        });
        
        return Array.from(indices).sort((a, b) => a - b);
    }

    // Save updated Lantern report with review status
    saveUpdatedLanternReport() {
        if (Object.keys(this.reviewDecisions).length === 0) {
            console.log('\n📊 No review decisions to save.');
            return;
        }
        
        console.log('\n📊 Updating Lantern report with review status...');
        
        // Update the lanternData with review decisions
        this.lanternData.films.forEach(film => {
            const decision = this.reviewDecisions[film.filePath];
            if (decision) {
                // Add review metadata to the film
                film.reviewMetadata = {
                    lastReviewedAt: decision.reviewedAt,
                    fullyReviewed: decision.reviewedAll
                };
                
                // Update each source with its review status
                film.uniqueResults.forEach(result => {
                    const sourceDecision = decision.sources[result.id];
                    if (sourceDecision) {
                        result.reviewStatus = sourceDecision.status;
                        result.reviewedAt = sourceDecision.reviewedAt;
                        if (sourceDecision.bibliographyId) {
                            result.bibliographyId = sourceDecision.bibliographyId;
                        }
                        if (sourceDecision.reason) {
                            result.rejectionReason = sourceDecision.reason;
                        }
                    }
                });
            }
        });
        
        // Add review summary to the report
        if (!this.lanternData.reviewSummary) {
            this.lanternData.reviewSummary = {
                lastReviewSession: new Date().toISOString(),
                totalSourcesReviewed: 0,
                totalSourcesAdded: 0,
                totalSourcesRejected: 0,
                reviewSessions: []
            };
        }
        
        // Calculate session stats
        let sessionReviewed = 0;
        let sessionAdded = 0;
        let sessionRejected = 0;
        
        Object.values(this.reviewDecisions).forEach(film => {
            Object.values(film.sources).forEach(source => {
                sessionReviewed++;
                if (source.status === 'added') sessionAdded++;
                if (source.status === 'rejected') sessionRejected++;
            });
        });
        
        // Update totals
        this.lanternData.reviewSummary.totalSourcesReviewed += sessionReviewed;
        this.lanternData.reviewSummary.totalSourcesAdded += sessionAdded;
        this.lanternData.reviewSummary.totalSourcesRejected += sessionRejected;
        this.lanternData.reviewSummary.lastReviewSession = new Date().toISOString();
        
        // Add this session to history
        this.lanternData.reviewSummary.reviewSessions.push({
            date: new Date().toISOString(),
            sourcesReviewed: sessionReviewed,
            sourcesAdded: sessionAdded,
            sourcesRejected: sessionRejected,
            filmsProcessed: Object.keys(this.reviewDecisions).length
        });
        
        // Save the updated JSON
        const updatedPath = this.lanternReportPath.replace('.json', '-reviewed.json');
        fs.writeFileSync(updatedPath, JSON.stringify(this.lanternData, null, 2));
        console.log(`✅ Saved review status to: ${path.basename(updatedPath)}`);
        
        // Also update the original file
        fs.writeFileSync(this.lanternReportPath, JSON.stringify(this.lanternData, null, 2));
        console.log(`✅ Updated original report with review status`);
        
        // Show summary
        console.log(`\n📈 This session:`);
        console.log(`   Films processed: ${Object.keys(this.reviewDecisions).length}`);
        console.log(`   Sources reviewed: ${sessionReviewed}`);
        console.log(`   Sources added: ${sessionAdded}`);
        console.log(`   Sources rejected: ${sessionRejected}`);
        
        console.log(`\n📊 Overall totals:`);
        console.log(`   Total sources reviewed: ${this.lanternData.reviewSummary.totalSourcesReviewed}`);
        console.log(`   Total sources added: ${this.lanternData.reviewSummary.totalSourcesAdded}`);
        console.log(`   Total sources rejected: ${this.lanternData.reviewSummary.totalSourcesRejected}`);
    }

    // Main process
    async run() {
        console.log('🎬 Lantern to Bibliography Tool');
        console.log('This tool will help you add Lantern search results to your bibliography.toml\n');
        
        // Load data
        this.loadBibliography();
        const lanternData = this.loadLanternReport();
        
        // Show review summary if exists
        if (lanternData.reviewSummary) {
            console.log('📊 Previous review activity:');
            console.log(`   Sources reviewed: ${lanternData.reviewSummary.totalSourcesReviewed}`);
            console.log(`   Sources added: ${lanternData.reviewSummary.totalSourcesAdded}`);
            console.log(`   Last review: ${new Date(lanternData.reviewSummary.lastReviewSession).toLocaleDateString()}\n`);
        }
        
        // Filter to films with results
        const filmsWithResults = lanternData.films
            .filter(f => f.uniqueResults && f.uniqueResults.length > 0)
            .sort((a, b) => b.uniqueResults.length - a.uniqueResults.length);
        
        console.log(`Found ${filmsWithResults.length} films with Lantern results`);
        
        // Count how many have been reviewed
        const reviewedFilms = filmsWithResults.filter(f => f.reviewMetadata && f.reviewMetadata.fullyReviewed);
        if (reviewedFilms.length > 0) {
            console.log(`(${reviewedFilms.length} films have been fully reviewed)\n`);
        } else {
            console.log('');
        }

        // Process mode selection
        const mode = await this.prompt('Process all films or select specific ones? (all/select): ');
        
        let filmsToProcess = [];
        
        if (mode.toLowerCase() === 'all') {
            filmsToProcess = filmsWithResults;
        } else {
            // Show film list
            console.log('\nAvailable films:');
            filmsWithResults.forEach((film, index) => {
                let status = '';
                if (film.reviewMetadata && film.reviewMetadata.fullyReviewed) {
                    status = ' ✓ [Reviewed]';
                } else if (film.uniqueResults.some(r => r.reviewStatus)) {
                    status = ' ⚠️  [Partially reviewed]';
                }
                console.log(`[${index + 1}] ${film.title} (${film.year}) - ${film.uniqueResults.length} sources${status}`);
            });
            
            const selection = await this.prompt('\nSelect films to process (e.g., "1,3,5-8"): ');
            const indices = this.parseRangeSelection(selection, filmsWithResults.length);
            filmsToProcess = indices.map(i => filmsWithResults[i]);
        }
        
        // Process selected films
        for (const film of filmsToProcess) {
            await this.processFilm(film);
        }
        
        // Save results
        this.saveBibliography();
        
        // Save updated JSON with review status
        this.saveUpdatedLanternReport();
        
        // Cleanup
        this.rl.close();
        
        console.log('\n✨ Complete! Your bibliography has been updated and review status saved.');
        console.log('Remember to review the new entries and adjust as needed.');
    }
}

// Run the tool
async function main() {
    const tool = new LanternBibliographyTool();
    try {
        await tool.run();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = LanternBibliographyTool;