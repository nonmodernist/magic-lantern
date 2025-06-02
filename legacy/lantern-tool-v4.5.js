// lantern-tool-v4.5.js
// Combines v3.1's author-focused approach with v4's title-focused strategy
// Includes improved publication scoring and flexible research modes

const fs = require('fs');
const path = require('path');
const https = require('https');

class HybridLanternSearcher {
    constructor() {
        this.results = [];
        this.rateLimitDelay = 200; // ms between API calls
        
        // v3.1's improved source rankings
        this.sourceRankings = {
            high: [
                'variety', 'motion picture world', 'mopicwor', 'motionpic', 'motionpicture', 
                'exhibitors herald', 'moving picture world', 'movpict', 'movingpicturewor', 
                'mowor', 'movingwor', 'movpicwor', 'movwor', 'movinwor', 'moviwor', 'movpic',
                'photoplay', 'picture play', 'motion picture magazine', 'motionpicturemag', 
                'silver screen', 'motion picture classic', 'screenland', 'variety radio', 
                'motography', 'motionpicturerev', 'modernscreen', 'independentfilmj', 
                'newmoviemagazin', 'nationalboardofr', 'photo', 'motionpicturenew', 
                'paramountartcraf', 'camera', 'hollywoodreporte', 'motionpicturesto', 
                'motionnews', 'motionnew', 'movingpicturewee', 'reelslide', 'hollywoodfilmogr', 
                'nickelodeon', 'movieclassic', 'moviemirrorvol', 'motionpicturefam'
            ],
            medium: [
                'film daily', 'motion picture news', 'motionnew', 'wids', 
                'motion picture herald', 'motionpictureher', 'box office', 
                'independent exhibitor', 'indepe', 'independ', 'harrison reports', 
                'film bulletin', 'universalweekly', 'hollywoodfilmogr', 'motionpicturedai', 
                'showmenstraderev', 'movielandtvtimev', 'motionpictureexh', 'harrisonsreports', 
                'picturep', 'exhibitorstrader', 'paramountartcraf', 'americancinemato', 
                'cinemundial', 'clipper', 'exhibitorstimes', 'moviespeoplewhom', 
                'exhibitorsdailyr', 'paramountpressbo', 'filmspectatorvol'
            ],
            low: ['copyright', 'registration', 'index', 'listing', 'directory']
        };
    }

    // Generate search queries using BOTH strategies
    generateSearchQueries(film, mode = 'comprehensive') {
        const queries = [];
        
        // V3.1 Strategy - Author-focused
        if (mode === 'adaptation' || mode === 'comprehensive') {
            if (film.storyAuthor && film.storyAuthor !== '-') {
                // Strategy 1: Title + Author + Year (most specific)
                if (film.year) {
                    queries.push({
                        query: `"${film.title}" "${film.storyAuthor}" ${film.year}`,
                        strategy: 'author_title_year',
                        approach: 'v3'
                    });
                }
                
                // Strategy 2: Title + Author
                queries.push({
                    query: `"${film.title}" "${film.storyAuthor}"`,
                    strategy: 'author_title',
                    approach: 'v3'
                });
                
                // Strategy 3: Author + Year
                if (film.year) {
                    queries.push({
                        query: `"${film.storyAuthor}" ${film.year}`,
                        strategy: 'author_year',
                        approach: 'v3'
                    });
                }
            }
        }
        
        // V4 Strategy - Title/Industry-focused
        if (mode === 'production' || mode === 'comprehensive') {
            // Strategy 1: Title + Year (most specific)
            if (film.year) {
                queries.push({
                    query: `"${film.title}" ${film.year}`,
                    strategy: 'title_year_exact',
                    approach: 'v4'
                });
            }
            
            // Strategy 2: Title + Director (production focus)
            if (film.director && film.director !== '-') {
                queries.push({
                    query: `"${film.title}" "${film.director}"`,
                    strategy: 'title_director',
                    approach: 'v4'
                });
            }
            
            // Strategy 3: Title + Studio (industry focus)
            if (film.studio && film.studio !== '-') {
                queries.push({
                    query: `"${film.title}" "${film.studio}"`,
                    strategy: 'title_studio',
                    approach: 'v4'
                });
            }
            
            // Strategy 4: Title only (broadest)
            queries.push({
                query: `"${film.title}"`,
                strategy: 'title_only',
                approach: 'v4'
            });
        }
        
        return queries;
    }

    // Calculate score with mode-specific weighting
    calculateScore(result, film, searchStrategy, mode = 'comprehensive') {
        let score = 0;
        const text = result.text.toLowerCase();
        const title = film.title.toLowerCase();
        
        // Base scoring components
        const components = {
            titleMatch: this.scoreTitleMatch(text, title),
            yearMatch: this.scoreYearMatch(text, film.year),
            authorMatch: this.scoreAuthorMatch(text, film.storyAuthor),
            directorMatch: this.scoreDirectorMatch(text, film.director),
            studioMatch: this.scoreStudioMatch(text, film.studio),
            sourceQuality: this.scoreSourceQuality(result.source),
            contentType: this.scoreContentType(text),
            strategyBonus: this.getStrategyBonus(searchStrategy)
        };
        
        // Apply mode-specific weights
        const weights = this.getModeWeights(mode);
        
        for (const [component, componentScore] of Object.entries(components)) {
            const weight = weights[component] || 1;
            score += componentScore * weight;
        }
        
        // Normalize to 0-100
        return Math.min(Math.round(score), 100);
    }

    // Get weights based on research mode
    getModeWeights(mode) {
        const weightProfiles = {
            adaptation: {
                titleMatch: 1.0,
                yearMatch: 0.8,
                authorMatch: 2.0,  // Double weight for author
                directorMatch: 0.5,
                studioMatch: 0.5,
                sourceQuality: 1.0,
                contentType: 1.0,
                strategyBonus: 1.0
            },
            production: {
                titleMatch: 1.5,
                yearMatch: 1.0,
                authorMatch: 0.3,  // Minimal weight for author
                directorMatch: 1.5,  // Higher weight for production crew
                studioMatch: 1.5,
                sourceQuality: 1.0,
                contentType: 1.2,  // Bonus for production/box office content
                strategyBonus: 1.0
            },
            comprehensive: {
                titleMatch: 1.0,
                yearMatch: 1.0,
                authorMatch: 1.0,
                directorMatch: 1.0,
                studioMatch: 1.0,
                sourceQuality: 1.0,
                contentType: 1.0,
                strategyBonus: 1.0
            }
        };
        
        return weightProfiles[mode] || weightProfiles.comprehensive;
    }

    // Individual scoring components
    scoreTitleMatch(text, title) {
        const titleWords = title.split(/\s+/);
        const matchedWords = titleWords.filter(word => 
            word.length > 2 && text.includes(word.toLowerCase())
        );
        const matchRatio = matchedWords.length / titleWords.length;
        
        if (text.includes(title)) {
            return 40; // Full title match
        } else {
            return Math.round(25 * matchRatio);
        }
    }

    scoreYearMatch(text, year) {
        if (!year) return 0;
        
        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/g);
        if (!yearMatch) return 0;
        
        const years = yearMatch.map(y => parseInt(y));
        const closestYear = years.reduce((prev, curr) => 
            Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
        );
        
        const diff = Math.abs(closestYear - year);
        if (diff === 0) return 30;
        if (diff === 1) return 20;
        if (diff === 2) return 10;
        if (diff === 3) return 5;
        return 0;
    }

    scoreAuthorMatch(text, author) {
        if (!author || author === '-') return 0;
        return text.includes(author.toLowerCase()) ? 15 : 0;
    }

    scoreDirectorMatch(text, director) {
        if (!director || director === '-') return 0;
        return text.includes(director.toLowerCase()) ? 15 : 0;
    }

    scoreStudioMatch(text, studio) {
        if (!studio || studio === '-') return 0;
        return text.includes(studio.toLowerCase()) ? 15 : 0;
    }

    scoreSourceQuality(source) {
        const sourceLower = source.toLowerCase();
        
        // Check each tier
        for (const highSource of this.sourceRankings.high) {
            if (sourceLower.includes(highSource)) return 15;
        }
        
        for (const mediumSource of this.sourceRankings.medium) {
            if (sourceLower.includes(mediumSource)) return 10;
        }
        
        for (const lowSource of this.sourceRankings.low) {
            if (sourceLower.includes(lowSource)) return 3;
        }
        
        return 5; // Unknown source
    }

    scoreContentType(text) {
        const contentPatterns = {
            review: { pattern: /\b(review|reviewed|critique|criticism|notices?)\b/i, score: 12 },
            production: { pattern: /\b(production|producing|filming|started|completed|announced)\b/i, score: 12 },
            box_office: { pattern: /\b(gross|box[\s-]?office|earnings|receipts|revenue|record)\b/i, score: 10 },
            advertisement: { pattern: /\b(now showing|coming|opens|playing|at the|theatre|theater)\b/i, score: 8 }
        };
        
        for (const [type, config] of Object.entries(contentPatterns)) {
            if (config.pattern.test(text)) {
                return config.score;
            }
        }
        
        return 5; // Default mention
    }

    getStrategyBonus(strategy) {
        const bonuses = {
            // v3 strategies
            'author_title_year': 10,
            'author_title': 8,
            'author_year': 6,
            // v4 strategies
            'title_year_exact': 10,
            'title_director': 8,
            'title_studio': 8,
            'title_only': 5
        };
        
        return bonuses[strategy] || 0;
    }

    // Main search method
    async searchLantern(film, query, strategy, mode) {
        const baseUrl = 'https://lantern.mediahist.org/catalog.json';
        const params = new URLSearchParams({
            q: query,
            per_page: '20'
        });
        
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`   → [${strategy}] Searching: ${query}`);
        
        try {
            const data = await this.makeRequest(url);
            const results = [];
            
            if (data.data && Array.isArray(data.data)) {
                for (const item of data.data) {
                    if (this.isValidResult(item, film)) {
                        const result = this.parseResult(item, film, strategy, mode);
                        if (result) {
                            results.push(result);
                        }
                    }
                }
            }
            
            console.log(`      Found ${results.length} valid results`);
            return results;
            
        } catch (error) {
            console.error(`   ✗ Search failed: ${error.message}`);
            return [];
        }
    }

    // Parse result with mode awareness
    parseResult(item, film, searchStrategy, mode) {
        const attributes = item.attributes || {};
        
        const bodyAttr = attributes.body;
        const text = bodyAttr?.attributes?.value || '';
        
        const readAttr = attributes.read;
        const urlMatch = readAttr?.attributes?.value?.match(/href="([^"]+)"/);
        const url = urlMatch ? urlMatch[1] : null;
        
        if (!text || !url) return null;
        
        const contentType = this.determineContentType(text);
        const sourceMatch = url.match(/\/([^\/]+?)(\d{4})?(?:unse|moti|chic|losa|newy)?(?:_\d+)?#/);
        const source = sourceMatch ? sourceMatch[1] : 'unknown';
        
        const score = this.calculateScore({ text, source }, film, searchStrategy, mode);
        
        return {
            id: item.id,
            text: text.substring(0, 300) + '...',
            url,
            source,
            contentType,
            score,
            searchStrategy,
            approach: searchStrategy.includes('author') ? 'v3' : 'v4',
            film: film.title,
            year: film.year
        };
    }

    // Process film with mode selection
    async processFilm(filmPath, mode = 'comprehensive') {
        const content = fs.readFileSync(filmPath, 'utf8');
        const film = this.extractFilmInfo(content, path.basename(filmPath));
        
        if (!film) {
            console.error(`Could not extract film info from ${path.basename(filmPath)}`);
            return null;
        }
        
        console.log(`\nSearching for: ${film.title} (${film.year}) - Mode: ${mode}`);
        if (film.storyAuthor) console.log(`   Author: ${film.storyAuthor}`);
        if (film.director) console.log(`   Director: ${film.director}`);
        if (film.studio) console.log(`   Studio: ${film.studio}`);
        
        const allResults = [];
        const seenIds = new Set();
        
        // Generate queries based on mode
        const queries = this.generateSearchQueries(film, mode);
        console.log(`   Using ${queries.length} search strategies`);
        
        for (const { query, strategy, approach } of queries) {
            const results = await this.searchLantern(film, query, strategy, mode);
            
            // Deduplicate and merge
            for (const result of results) {
                if (!seenIds.has(result.id)) {
                    seenIds.add(result.id);
                    allResults.push(result);
                } else {
                    // If we've seen this before, update score if this one is higher
                    const existingIndex = allResults.findIndex(r => r.id === result.id);
                    if (existingIndex >= 0 && result.score > allResults[existingIndex].score) {
                        allResults[existingIndex] = result;
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
        
        // Sort by score
        allResults.sort((a, b) => b.score - a.score);
        
        // Summary statistics
        console.log(`   Total unique results: ${allResults.length}`);
        
        if (allResults.length > 0) {
            const typeCount = {};
            const approachCount = { v3: 0, v4: 0 };
            
            allResults.forEach(r => {
                typeCount[r.contentType] = (typeCount[r.contentType] || 0) + 1;
                approachCount[r.approach]++;
            });
            
            console.log(`   Content types:`, typeCount);
            console.log(`   Results by approach: v3=${approachCount.v3}, v4=${approachCount.v4}`);
            console.log(`   Top result: ${allResults[0].source} (score: ${allResults[0].score}, approach: ${allResults[0].approach})`);
        }
        
        return {
            film: film.title,
            year: film.year,
            director: film.director,
            studio: film.studio,
            author: film.storyAuthor,
            filename: film.filename,
            mode: mode,
            totalResults: allResults.length,
            contentTypes: this.summarizeContentTypes(allResults),
            approachBreakdown: this.summarizeApproaches(allResults),
            results: allResults
        };
    }

    // Helper methods
    determineContentType(text) {
        const contentPatterns = {
            review: /\b(review|reviewed|critique|criticism|picture review|notices?)\b/i,
            production: /\b(production|producing|filming|started production|completed|announced|plans to produce)\b/i,
            box_office: /\b(gross|box[\s-]?office|earnings|receipts|revenue|record|business)\b/i,
            advertisement: /\b(now showing|coming soon|opens|playing at|at the|theatre|theater|starting)\b/i,
        };
        
        for (const [type, pattern] of Object.entries(contentPatterns)) {
            if (pattern.test(text)) {
                return type;
            }
        }
        
        return 'mention';
    }

    isValidResult(item, film) {
        const text = item.attributes?.body?.attributes?.value || '';
        const url = item.attributes?.read?.attributes?.value || '';
        
        if (!text || !url) return false;
        
        // Title relevance check
        const titleWords = film.title.toLowerCase().split(/\s+/);
        const textLower = text.toLowerCase();
        const titleMatch = titleWords.filter(word => word.length > 3).some(word => textLower.includes(word));
        
        if (!titleMatch) return false;
        
        // Year relevance check (within 5 years)
        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/g);
        if (yearMatch && film.year) {
            const years = yearMatch.map(y => parseInt(y));
            const hasRelevantYear = years.some(y => Math.abs(y - film.year) <= 5);
            if (!hasRelevantYear) return false;
        }
        
        return true;
    }

    extractFilmInfo(content, filename) {
        const frontmatterMatch = content.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
        if (!frontmatterMatch) {
            console.warn(`No frontmatter found in ${filename}`);
            return null;
        }

        const frontmatter = frontmatterMatch[1];
        
        const extractField = (fieldName) => {
            const regex = new RegExp(`^${fieldName}\\s*=\\s*"?([^"\\n]+)"?`, 'm');
            const match = frontmatter.match(regex);
            return match ? match[1].trim() : null;
        };

        const extractFromTaxonomy = (taxonomy) => {
            const regex = new RegExp(`^${taxonomy}\\s*=\\s*\\[([^\\]]+)\\]`, 'm');
            const match = frontmatter.match(regex);
            if (match) {
                const items = match[1].match(/"([^"]+)"/g);
                return items ? items[0].replace(/"/g, '') : null;
            }
            return null;
        };

        return {
            filename,
            title: extractField('title') || 'Unknown',
            year: parseInt(extractField('year')) || null,
            director: extractFromTaxonomy('directors') || extractField('director'),
            studio: extractFromTaxonomy('studios') || extractField('studio'),
            storyAuthor: extractFromTaxonomy('authors') || extractField('story_author'),
            originalStory: extractField('original_story')
        };
    }

    summarizeContentTypes(results) {
        const types = {};
        results.forEach(r => {
            types[r.contentType] = (types[r.contentType] || 0) + 1;
        });
        return types;
    }

    summarizeApproaches(results) {
        const approaches = { v3: 0, v4: 0 };
        results.forEach(r => {
            approaches[r.approach]++;
        });
        return approaches;
    }

    makeRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse JSON'));
                    }
                });
            }).on('error', reject);
        });
    }

    // Process all films with mode selection
    async processAllFilms(options = {}) {
        const filmsDir = path.join(process.cwd(), 'content', 'films');
        
        if (!fs.existsSync(filmsDir)) {
            console.error(`Films directory not found: ${filmsDir}`);
            return;
        }

        const files = fs.readdirSync(filmsDir)
            .filter(f => f.endsWith('.md') && f !== '_index.md');

        const mode = options.mode || 'comprehensive';
        console.log(`🎬 Hybrid Lantern Search Tool`);
        console.log(`Found ${files.length} film files`);
        console.log(`Research mode: ${mode.toUpperCase()}\n`);

        const limit = options.all ? files.length : (options.limit || 5);
        const results = [];
        
        for (let i = 0; i < Math.min(files.length, limit); i++) {
            const filmPath = path.join(filmsDir, files[i]);
            const result = await this.processFilm(filmPath, mode);
            if (result) {
                results.push(result);
            }
            
            console.log(`\nProgress: ${i + 1}/${limit} films processed`);
        }

        // Save results
        const timestamp = new Date().toISOString().split('T')[0];
        const reportDir = path.join(process.cwd(), 'reports', 'lantern-reports');
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, `lantern-report-hybrid-${mode}-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

        console.log(`\n✅ Report saved to: ${reportPath}`);
        this.printSummary(results, mode);
    }

    printSummary(results, mode) {
        console.log('\n' + '='.repeat(60));
        console.log(`SUMMARY STATISTICS - ${mode.toUpperCase()} MODE`);
        console.log('='.repeat(60));

        const totalResults = results.reduce((sum, r) => sum + r.totalResults, 0);
        console.log(`Total results across all films: ${totalResults}`);
        console.log(`Average results per film: ${(totalResults / results.length).toFixed(1)}`);

        // Aggregate by approach
        let v3Total = 0, v4Total = 0;
        results.forEach(r => {
            v3Total += r.approachBreakdown.v3 || 0;
            v4Total += r.approachBreakdown.v4 || 0;
        });

        console.log(`\nResults by approach:`);
        console.log(`  v3 (author-focused): ${v3Total} (${((v3Total/totalResults)*100).toFixed(1)}%)`);
        console.log(`  v4 (title-focused): ${v4Total} (${((v4Total/totalResults)*100).toFixed(1)}%)`);

        // Content type breakdown
        const allTypes = {};
        results.forEach(r => {
            Object.entries(r.contentTypes).forEach(([type, count]) => {
                allTypes[type] = (allTypes[type] || 0) + count;
            });
        });

        console.log('\nContent type breakdown:');
        Object.entries(allTypes)
            .sort(([,a], [,b]) => b - a)
            .forEach(([type, count]) => {
                const percentage = ((count / totalResults) * 100).toFixed(1);
                console.log(`  ${type}: ${count} (${percentage}%)`);
            });

        // Top films by coverage
        const filmCoverage = results
            .map(r => ({ title: r.film, year: r.year, count: r.totalResults }))
            .sort((a, b) => b.count - a.count);

        console.log('\nTop 5 films by coverage:');
        filmCoverage.slice(0, 5).forEach(f => {
            console.log(`  ${f.title} (${f.year}): ${f.count} results`);
        });
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const searcher = new HybridLanternSearcher();
    
    // Parse command line options
    const options = {
        all: args.includes('--all'),
        mode: 'comprehensive', // default
        limit: 5
    };
    
    // Check for mode flags
    if (args.includes('--adaptation')) {
        options.mode = 'adaptation';
    } else if (args.includes('--production')) {
        options.mode = 'production';
    } else if (args.includes('--comprehensive')) {
        options.mode = 'comprehensive';
    }
    
    // Check for limit
    const limitIndex = args.indexOf('--limit');
    if (limitIndex > -1 && args[limitIndex + 1]) {
        options.limit = parseInt(args[limitIndex + 1]);
    }
    
    console.log('Usage examples:');
    console.log('  node lantern-tool-hybrid.js                    # Default: 5 films, comprehensive mode');
    console.log('  node lantern-tool-hybrid.js --adaptation       # Focus on author/adaptation coverage');
    console.log('  node lantern-tool-hybrid.js --production       # Focus on production/industry coverage');
    console.log('  node lantern-tool-hybrid.js --all --production # All films, production focus');
    console.log('  node lantern-tool-hybrid.js --limit 10         # Process 10 films\n');
    
    await searcher.processAllFilms(options);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = HybridLanternSearcher;