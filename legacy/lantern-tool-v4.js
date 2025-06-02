// lantern-tool-v4-title-focused.js
// Alternative search strategy prioritizing title and year over author
// Maintains all functionality from v3

const fs = require('fs');
const path = require('path');
const https = require('https');

class LanternSearcher {
    constructor() {
        this.results = [];
        this.rateLimitDelay = 200; // ms between API calls
    }

    // Modified search query generation - title/year focused
    generateSearchQueries(film) {
        const queries = [];
        
        // Strategy 1: Title + Year (most specific)
        if (film.year) {
            queries.push({
                query: `"${film.title}" ${film.year}`,
                strategy: 'title_year_exact'
            });
        }
        
        // Strategy 2: Title + Director (production focus)
        if (film.director && film.director !== '-') {
            queries.push({
                query: `"${film.title}" "${film.director}"`,
                strategy: 'title_director'
            });
        }
        
        // Strategy 3: Title + Studio (industry focus)
        if (film.studio && film.studio !== '-') {
            queries.push({
                query: `"${film.title}" "${film.studio}"`,
                strategy: 'title_studio'
            });
        }
        
        // Strategy 4: Title only (broadest)
        queries.push({
            query: `"${film.title}"`,
            strategy: 'title_only'
        });
        
        // Strategy 5: Title + Author (last resort, catches literary connections)
        if (film.storyAuthor && film.storyAuthor !== '-') {
            queries.push({
                query: `"${film.title}" "${film.storyAuthor}"`,
                strategy: 'title_author'
            });
        }
        
        return queries;
    }

    // Make HTTP request to Lantern API
    makeRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON: ${error.message}`));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    // Search Lantern for a specific query
    async searchLantern(film, query, strategy) {
        const baseUrl = 'https://lantern.mediahist.org/catalog.json';
        const params = new URLSearchParams({
            q: query,
            per_page: '20'
        });
        
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`   → Searching: ${query}`);
        
        try {
            const data = await this.makeRequest(url);
            const results = [];
            
            if (data.data && Array.isArray(data.data)) {
                for (const item of data.data) {
                    if (this.isValidResult(item, film)) {
                        const result = this.parseResult(item, film, strategy);
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

    // Parse a single search result
    parseResult(item, film, searchStrategy) {
        const attributes = item.attributes || {};
        
        // Extract the body text
        const bodyAttr = attributes.body;
        const text = bodyAttr?.attributes?.value || '';
        
        // Extract the URL
        const readAttr = attributes.read;
        const urlMatch = readAttr?.attributes?.value?.match(/href="([^"]+)"/);
        const url = urlMatch ? urlMatch[1] : null;
        
        if (!text || !url) return null;
        
        // Determine content type
        const contentType = this.determineContentType(text);
        
        // Extract source publication
        const sourceMatch = url.match(/\/([^\/]+?)(\d{4})?(?:unse|moti|chic|losa|newy)?(?:_\d+)?#/);
        const source = sourceMatch ? sourceMatch[1] : 'unknown';
        
        // Extract year from URL if possible
        const yearInUrl = url.match(/(\d{4})/);
        const sourceYear = yearInUrl ? parseInt(yearInUrl[1]) : null;
        
        // Calculate relevance score with new priorities
        const score = this.calculateScore({ text, source }, film, searchStrategy);
        
        return {
            id: item.id,
            text: text.substring(0, 300) + '...',
            url,
            source,
            sourceYear,
            contentType,
            score,
            searchStrategy,
            film: film.title,
            year: film.year
        };
    }

    // Determine content type from text
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

    // Check if a result is valid for the film
    isValidResult(item, film) {
        const text = item.attributes?.body?.attributes?.value || '';
        const url = item.attributes?.read?.attributes?.value || '';
        
        // Must have both text and URL
        if (!text || !url) return false;
        
        // Check if it mentions the film title (fuzzy match)
        const titleWords = film.title.toLowerCase().split(/\s+/);
        const textLower = text.toLowerCase();
        const titleMatch = titleWords.filter(word => word.length > 3).some(word => textLower.includes(word));
        
        if (!titleMatch) return false;
        
        // Check year relevance (within 5 years)
        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/g);
        if (yearMatch && film.year) {
            const years = yearMatch.map(y => parseInt(y));
            const hasRelevantYear = years.some(y => Math.abs(y - film.year) <= 5);
            if (!hasRelevantYear) return false;
        }
        
        return true;
    }

    // Modified scoring to reflect new priorities
    calculateScore(result, film, searchStrategy) {
        let score = 0;
        const text = result.text.toLowerCase();
        const title = film.title.toLowerCase();
        
        // Title matching (40 points - higher weight)
        const titleWords = title.split(/\s+/);
        const titleMatchCount = titleWords.filter(word => 
            word.length > 2 && text.includes(word)
        ).length;
        const titleMatchRatio = titleMatchCount / titleWords.length;
        score += Math.round(40 * titleMatchRatio);
        
        // Year proximity (25 points)
        const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/g);
        if (yearMatch && film.year) {
            const years = yearMatch.map(y => parseInt(y));
            const closestYear = years.reduce((prev, curr) => 
                Math.abs(curr - film.year) < Math.abs(prev - film.year) ? curr : prev
            );
            const yearDiff = Math.abs(closestYear - film.year);
            if (yearDiff === 0) score += 25;
            else if (yearDiff === 1) score += 20;
            else if (yearDiff === 2) score += 15;
            else if (yearDiff === 3) score += 10;
        }
        
        // Director/Studio mentions (20 points each)
        if (film.director && film.director !== '-' && text.includes(film.director.toLowerCase())) {
            score += 20;
        }
        if (film.studio && film.studio !== '-' && text.includes(film.studio.toLowerCase())) {
            score += 20;
        }
        
        // Content type bonus (15 points)
        const contentPatterns = {
            review: { pattern: /\b(review|reviewed|critique|criticism)\b/i, points: 15 },
            production: { pattern: /\b(production|filming|producing)\b/i, points: 15 },
            box_office: { pattern: /\b(box[\s-]?office|earnings|gross)\b/i, points: 15 },
            advertisement: { pattern: /\b(now showing|opens|playing)\b/i, points: 10 }
        };
        
        for (const [type, config] of Object.entries(contentPatterns)) {
            if (config.pattern.test(text)) {
                score += config.points;
                break;
            }
        }
        
        // Source quality (10 points)
        const qualitySources = {
            'variety': 10,
            'boxoffice': 10,
            'filmdaily': 9,
            'motionpicture': 9,
            'exhibitors': 8,
            'movingpicture': 8,
            'wids': 7,
            'billboard': 7,
            'photoplay': 6,
            'silverscreen': 6
        };
        
        const sourceName = result.source?.toLowerCase() || '';
        for (const [source, points] of Object.entries(qualitySources)) {
            if (sourceName.includes(source)) {
                score += points;
                break;
            }
        }
        
        // Search strategy bonus
        const strategyBonus = {
            'title_year_exact': 10,
            'title_director': 8,
            'title_studio': 8,
            'title_only': 5,
            'title_author': 3
        };
        score += strategyBonus[searchStrategy] || 0;
        
        // Author mention (5 points - lower priority)
        if (film.storyAuthor && film.storyAuthor !== '-' && text.includes(film.storyAuthor.toLowerCase())) {
            score += 5;
        }
        
        // Length bonus (longer excerpts often have more context)
        if (text.length > 200) score += 3;
        if (text.length > 250) score += 2;
        
        return Math.min(score, 100);
    }

    // Extract film information from markdown file
    extractFilmInfo(content, filename) {
        const frontmatterMatch = content.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
        if (!frontmatterMatch) {
            console.warn(`No frontmatter found in ${filename}`);
            return null;
        }

        const frontmatter = frontmatterMatch[1];
        
        // Helper to extract field values
        const extractField = (fieldName) => {
            const regex = new RegExp(`^${fieldName}\\s*=\\s*"?([^"\\n]+)"?`, 'm');
            const match = frontmatter.match(regex);
            return match ? match[1].trim() : null;
        };

        // Helper to extract from taxonomy arrays
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

    // Process a single film
    async processFilm(filmPath) {
        const content = fs.readFileSync(filmPath, 'utf8');
        const film = this.extractFilmInfo(content, path.basename(filmPath));
        
        if (!film) {
            console.error(`Could not extract film info from ${path.basename(filmPath)}`);
            return null;
        }
        
        console.log(`\nSearching for: ${film.title} (${film.year})`);
        if (film.director) console.log(`   Director: ${film.director}`);
        if (film.studio) console.log(`   Studio: ${film.studio}`);
        if (film.storyAuthor) console.log(`   Author: ${film.storyAuthor}`);
        
        const allResults = [];
        const seenIds = new Set();
        
        // Generate queries with new strategy
        const queries = this.generateSearchQueries(film);
        
        for (const { query, strategy } of queries) {
            const results = await this.searchLantern(film, query, strategy);
            
            // Deduplicate and add to results
            for (const result of results) {
                if (!seenIds.has(result.id)) {
                    seenIds.add(result.id);
                    allResults.push(result);
                }
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
        
        // Sort by score (highest first)
        allResults.sort((a, b) => b.score - a.score);
        
        // Summary statistics
        console.log(`   Total unique results: ${allResults.length}`);
        
        if (allResults.length > 0) {
            // Count by content type
            const typeCount = {};
            allResults.forEach(r => {
                typeCount[r.contentType] = (typeCount[r.contentType] || 0) + 1;
            });
            
            console.log(`   Content types:`, typeCount);
            console.log(`   Top result: ${allResults[0].source} (score: ${allResults[0].score})`);
            
            // Show search strategy effectiveness
            const strategyCount = {};
            allResults.forEach(r => {
                strategyCount[r.searchStrategy] = (strategyCount[r.searchStrategy] || 0) + 1;
            });
            console.log(`   Results by strategy:`, strategyCount);
        }
        
        return {
            film: film.title,
            year: film.year,
            director: film.director,
            studio: film.studio,
            author: film.storyAuthor,
            filename: film.filename,
            totalResults: allResults.length,
            contentTypes: this.summarizeContentTypes(allResults),
            searchStrategies: this.summarizeStrategies(allResults),
            results: allResults
        };
    }

    // Summarize content types found
    summarizeContentTypes(results) {
        const types = {};
        results.forEach(r => {
            types[r.contentType] = (types[r.contentType] || 0) + 1;
        });
        return types;
    }

    // Summarize which search strategies were effective
    summarizeStrategies(results) {
        const strategies = {};
        results.forEach(r => {
            strategies[r.searchStrategy] = (strategies[r.searchStrategy] || 0) + 1;
        });
        return strategies;
    }

    // Process all films
    async processAllFilms(options = {}) {
        const filmsDir = path.join(process.cwd(), 'content', 'films');
        
        if (!fs.existsSync(filmsDir)) {
            console.error(`Films directory not found: ${filmsDir}`);
            return;
        }

        const files = fs.readdirSync(filmsDir)
            .filter(f => f.endsWith('.md') && f !== '_index.md');

        console.log(`🎬 Lantern Search Tool v4 - Title-Focused Strategy`);
        console.log(`Found ${files.length} film files`);
        console.log(`Search prioritizes: Title/Year > Director/Studio > Author\n`);

        const limit = options.all ? files.length : 5;
        const results = [];
        
        for (let i = 0; i < Math.min(files.length, limit); i++) {
            const filmPath = path.join(filmsDir, files[i]);
            const result = await this.processFilm(filmPath);
            if (result) {
                results.push(result);
            }
            
            // Progress indicator
            console.log(`\nProgress: ${i + 1}/${limit} films processed`);
        }

        // Save results
        const timestamp = new Date().toISOString().split('T')[0];
        const reportDir = path.join(process.cwd(), 'reports', 'lantern-reports');
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, 'lantern-report-v4-title-focused.json');
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

        console.log(`\n✅ Report saved to: ${reportPath}`);

        // Summary statistics
        this.printSummary(results);
    }

    // Print summary statistics
    printSummary(results) {
        console.log('\n' + '='.repeat(60));
        console.log('SUMMARY STATISTICS');
        console.log('='.repeat(60));

        const totalResults = results.reduce((sum, r) => sum + r.totalResults, 0);
        console.log(`Total results across all films: ${totalResults}`);
        console.log(`Average results per film: ${(totalResults / results.length).toFixed(1)}`);

        // Aggregate content types
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

        // Most successful search strategies
        const allStrategies = {};
        results.forEach(r => {
            Object.entries(r.searchStrategies).forEach(([strategy, count]) => {
                allStrategies[strategy] = (allStrategies[strategy] || 0) + count;
            });
        });

        console.log('\nMost effective search strategies:');
        Object.entries(allStrategies)
            .sort(([,a], [,b]) => b - a)
            .forEach(([strategy, count]) => {
                const percentage = ((count / totalResults) * 100).toFixed(1);
                console.log(`  ${strategy}: ${count} results (${percentage}%)`);
            });

        // Films with most/least coverage
        const filmCoverage = results
            .map(r => ({ title: r.film, year: r.year, count: r.totalResults }))
            .sort((a, b) => b.count - a.count);

        console.log('\nTop 5 films by coverage:');
        filmCoverage.slice(0, 5).forEach(f => {
            console.log(`  ${f.title} (${f.year}): ${f.count} results`);
        });

        console.log('\nFilms with no coverage:');
        const noCoverage = filmCoverage.filter(f => f.count === 0);
        if (noCoverage.length > 0) {
            noCoverage.forEach(f => {
                console.log(`  ${f.title} (${f.year})`);
            });
        } else {
            console.log('  All films have at least some coverage!');
        }
    }

    // Test API connection
    async testAPI() {
        console.log('Testing Lantern API connection...');
        const testUrl = 'https://lantern.mediahist.org/catalog.json?q=test&per_page=1';
        
        try {
            const data = await this.makeRequest(testUrl);
            console.log('✅ API connection successful');
            console.log(`API version: ${data.meta?.pages?.total_count ? 'v2' : 'v1'}`);
            return true;
        } catch (error) {
            console.error('❌ API connection failed:', error.message);
            return false;
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const searcher = new LanternSearcher();
    
    if (args.includes('--test-api')) {
        await searcher.testAPI();
    } else if (args.includes('--all')) {
        await searcher.processAllFilms({ all: true });
    } else {
        await searcher.processAllFilms({ all: false });
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LanternSearcher;