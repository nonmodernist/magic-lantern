#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

/**
 * Full Text Fetcher for Magic Lantern
 * Selectively fetches full OCR text for search results
 */
class FullTextFetcher {
    constructor(options = {}) {
        this.baseUrl = 'https://lantern.mediahist.org';
        this.rateLimitDelay = options.rateLimit || 200;
        this.verbose = options.verbose || false;
        
        // Track progress
        this.stats = {
            total: 0,
            fetched: 0,
            failed: 0,
            skipped: 0
        };
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON from ${url}`));
                    }
                });
            }).on('error', reject);
        });
    }

    async fetchSourceText(sourceInfo) {
        const { source, film } = sourceInfo;
        const url = `${this.baseUrl}/catalog/${source.id}/raw.json`;
        
        try {
            if (this.verbose) {
                console.log(`   📄 Fetching: ${source.id} (${source.scoring?.publication || 'unknown'})`);
            }
            
            const pageData = await this.makeRequest(url);
            
            // Update source with full text data
            source.fullText = pageData.body || '';
            source.fullTextFetched = true;
            source.fullTextFetchedAt = new Date().toISOString();
            source.fullTextMetadata = {
                wordCount: (pageData.body || '').split(/\s+/).length,
                collections: pageData.collection || [],
                title: pageData.title,
                volume: pageData.volume,
                date: pageData.date || pageData.dateString,
                year: pageData.year,
                creator: pageData.creator,
                iaPage: pageData.iaPage,
                readUrl: pageData.read
            };
            
            this.stats.fetched++;
            
            // Identify content types if text is substantial
            if (source.fullText.length > 100) {
                source.fullTextMetadata.contentTypes = this.identifyContentTypes(source.fullText);
            }
            
            return true;
        } catch (error) {
            console.error(`   ❌ Failed to fetch ${source.id}: ${error.message}`);
            this.stats.failed++;
            return false;
        }
    }

    identifyContentTypes(text) {
        const types = [];
        const lowerText = text.toLowerCase();
        
        // Simple content type detection
        const patterns = {
            review: /review|critique|criticism|notices?|comment|opinion/i,
            advertisement: /advertisement|now showing|coming soon|at the .* theatre/i,
            news: /production|filming|studio|director .* says|announced/i,
            boxoffice: /gross|box.?office|earnings|receipts|takes in/i,
            profile: /born in|began his career|star of|biography/i
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) {
                types.push(type);
            }
        }
        
        return types.length > 0 ? types : ['mention'];
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    groupByFilm(results) {
        return results.map(filmResult => ({
            film: filmResult.film,
            sources: filmResult.sources
        }));
    }

    async prompt(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise(resolve => {
            rl.question(question, answer => {
                rl.close();
                resolve(answer);
            });
        });
    }

    parseRangeSelection(selection, sources) {
        const selected = [];
        const parts = selection.split(',');
        
        parts.forEach(part => {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                for (let i = start - 1; i < end && i < sources.length; i++) {
                    if (sources[i]) selected.push(sources[i]);
                }
            } else {
                const index = parseInt(part) - 1;
                if (sources[index]) selected.push(sources[index]);
            }
        });
        
        return selected;
    }

    async selectInteractive(results) {
        console.log('\n📋 INTERACTIVE FULL TEXT SELECTION\n');
        
        // Group by film
        const filmGroups = this.groupByFilm(results);
        
        // Film selection
        console.log('Available films:');
        filmGroups.forEach((group, i) => {
            const unfetched = group.sources.filter(s => !s.fullTextFetched).length;
            console.log(`${i + 1}. ${group.film.title} (${group.film.year}) - ${group.sources.length} sources (${unfetched} unfetched)`);
        });
        
        const filmChoice = await this.prompt('\nSelect film number (or "all"): ');
        
        let selectedSources = [];
        
        if (filmChoice.toLowerCase() === 'all') {
            // Show all sources across films
            let allSources = [];
            filmGroups.forEach(g => {
                g.sources.forEach(s => {
                    allSources.push({ source: s, film: g.film });
                });
            });
            selectedSources = await this.selectFromList(allSources);
        } else {
            const filmIndex = parseInt(filmChoice) - 1;
            if (filmIndex >= 0 && filmIndex < filmGroups.length) {
                const filmGroup = filmGroups[filmIndex];
                
                // Convert to source info format
                const sourcesWithFilm = filmGroup.sources.map(s => ({
                    source: s,
                    film: filmGroup.film
                }));
                
                console.log(`\n📰 Sources for ${filmGroup.film.title}:\n`);
                selectedSources = await this.selectFromList(sourcesWithFilm);
            }
        }
        
        return selectedSources;
    }

    async selectFromList(sourceInfos) {
        // Sort by score
        sourceInfos.sort((a, b) => 
            (b.source.scoring?.finalScore || 0) - (a.source.scoring?.finalScore || 0)
        );
        
        // Display with useful info
        sourceInfos.forEach((info, i) => {
            const source = info.source;
            const s = source.scoring || {};
            const excerpt = source.attributes?.body?.attributes?.value || '';
            const shortExcerpt = excerpt.substring(0, 80).replace(/\n/g, ' ') + 
                               (excerpt.length > 80 ? '...' : '');
            
            const fetchedMark = source.fullTextFetched ? '✓' : ' ';
            console.log(`${fetchedMark} ${i + 1}. [${(s.finalScore || 0).toFixed(1)}] ${s.publication || 'unknown'} via ${source.foundBy}`);
            console.log(`     ${shortExcerpt}`);
            console.log('');
        });
        
        console.log('\nOptions:');
        console.log('  - Individual numbers: "1,3,5"');
        console.log('  - Ranges: "1-10,15-20"');
        console.log('  - Top N: "top20"');
        console.log('  - All unfetched: "unfetched"');
        console.log('  - All: "all"');
        
        const selection = await this.prompt('\nSelect sources: ');
        
        if (selection === 'all') {
            return sourceInfos;
        }
        
        if (selection === 'unfetched') {
            return sourceInfos.filter(info => !info.source.fullTextFetched);
        }
        
        if (selection.startsWith('top')) {
            const n = parseInt(selection.substring(3));
            return sourceInfos.slice(0, n);
        }
        
        // Parse range selection
        return this.parseRangeSelection(selection, sourceInfos);
    }

    selectSources(results, options) {
        let sources = [];
        
        // Flatten all sources from all films
        results.forEach(filmResult => {
            filmResult.sources.forEach(source => {
                sources.push({ source, film: filmResult.film });
            });
        });
        
        // Apply selection criteria
        if (options.top) {
            // Sort by score first
            sources.sort((a, b) => 
                (b.source.scoring?.finalScore || 0) - (a.source.scoring?.finalScore || 0)
            );
            sources = sources.slice(0, options.top);
        }
        
        if (options.scoreThreshold) {
            sources = sources.filter(s => 
                (s.source.scoring?.finalScore || 0) >= options.scoreThreshold
            );
        }
        
        if (options.publication) {
            sources = sources.filter(s => 
                s.source.scoring?.publication === options.publication
            );
        }
        
        if (options.film) {
            sources = sources.filter(s => 
                s.film.title === options.film || s.film.Title === options.film
            );
        }
        
        if (options.strategy) {
            sources = sources.filter(s => 
                s.source.foundBy === options.strategy
            );
        }
        
        // Skip already fetched unless refetch is specified
        if (!options.refetch) {
            sources = sources.filter(s => !s.source.fullTextFetched);
        }
        
        return sources;
    }

    saveResults(results, originalPath, options) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        let outputPath = originalPath;
        
        if (options.output) {
            outputPath = options.output;
        } else if (!options.inPlace) {
            // Create new file with timestamp
            const dir = path.dirname(originalPath);
            const basename = path.basename(originalPath, '.json');
            outputPath = path.join(dir, `${basename}_with_fulltext_${timestamp}.json`);
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        
        console.log(`\n💾 Results saved to: ${outputPath}`);
        console.log(`   Total sources: ${this.stats.total}`);
        console.log(`   Fetched: ${this.stats.fetched}`);
        console.log(`   Failed: ${this.stats.failed}`);
        console.log(`   Skipped: ${this.stats.skipped}`);
    }

    async fetchFullText(filePath, options = {}) {
        console.log('✨ MAGIC LANTERN FULL TEXT FETCHER\n');
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }
        
        // Load existing results
        let results;
        try {
            results = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`❌ Failed to parse JSON: ${error.message}`);
            process.exit(1);
        }
        
        // Determine which sources to fetch
        let sourcesToFetch;
        
        if (options.interactive) {
            sourcesToFetch = await this.selectInteractive(results);
        } else {
            sourcesToFetch = this.selectSources(results, options);
        }
        
        this.stats.total = sourcesToFetch.length;
        
        if (sourcesToFetch.length === 0) {
            console.log('📭 No sources to fetch based on criteria.');
            return;
        }
        
        console.log(`\n📄 Fetching full text for ${sourcesToFetch.length} sources...`);
        if (!options.interactive) {
            // Show what we're fetching
            const pubs = {};
            sourcesToFetch.forEach(s => {
                const pub = s.source.scoring?.publication || 'unknown';
                pubs[pub] = (pubs[pub] || 0) + 1;
            });
            console.log('\nBy publication:');
            Object.entries(pubs)
                .sort((a, b) => b[1] - a[1])
                .forEach(([pub, count]) => {
                    console.log(`  ${pub}: ${count}`);
                });
        }
        
        console.log('\n🚀 Starting fetch process...\n');
        
        // Fetch with progress tracking
        for (let i = 0; i < sourcesToFetch.length; i++) {
            const info = sourcesToFetch[i];
            
            if (!this.verbose) {
                // Progress bar for non-verbose mode
                const progress = ((i + 1) / sourcesToFetch.length * 100).toFixed(1);
                process.stdout.write(`\r📊 Progress: ${i + 1}/${sourcesToFetch.length} (${progress}%)`);
            }
            
            await this.fetchSourceText(info);
            
            // Rate limiting
            if (i < sourcesToFetch.length - 1) {
                await this.delay(this.rateLimitDelay);
            }
        }
        
        if (!this.verbose) {
            console.log('\n'); // New line after progress bar
        }
        
        // Save updated results
        this.saveResults(results, filePath, options);
        
        console.log('\n✨ Full text fetching complete!');
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    // Help text
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        console.log(`
✨ MAGIC LANTERN FULL TEXT FETCHER

Usage: node fetch-full-text.js <results.json> [options]

Options:
  --top=N              Fetch top N results by score
  --score-threshold=N  Fetch results with score >= N
  --publication=NAME   Fetch only from specific publication
  --film=TITLE        Fetch only for specific film
  --strategy=TYPE     Fetch only results from specific search strategy
  --interactive       Interactive selection mode
  --refetch          Re-fetch already fetched texts
  --in-place         Overwrite original file (default: create new)
  --output=PATH      Specify output file path
  --verbose          Show detailed progress
  --rate-limit=MS    Rate limit delay (default: 200ms)

Examples:
  node fetch-full-text.js results.json --top=50
  node fetch-full-text.js results.json --publication="variety" --score-threshold=80
  node fetch-full-text.js results.json --film="The Wizard of Oz"
  node fetch-full-text.js results.json --interactive
  node fetch-full-text.js results.json --top=100 --in-place --verbose
`);
        process.exit(0);
    }
    
    // Parse arguments
    const filePath = args.find(arg => !arg.startsWith('--'));
    const options = {};
    
    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            
            // Boolean flags
            if (key === 'interactive' || key === 'refetch' || 
                key === 'in-place' || key === 'verbose') {
                options[key.replace('-', '')] = true;
            } 
            // Numeric values
            else if (key === 'top' || key === 'score-threshold' || key === 'rate-limit') {
                options[key.replace('-', '')] = parseInt(value);
            }
            // String values
            else {
                options[key.replace('-', '')] = value;
            }
        }
    });
    
    // Create fetcher and run
    const fetcher = new FullTextFetcher({
        rateLimit: options.rateLimit,
        verbose: options.verbose
    });
    
    fetcher.fetchFullText(filePath, options).catch(error => {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = FullTextFetcher;