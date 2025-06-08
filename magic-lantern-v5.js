#!/usr/bin/env node

const VERSION = '5.0.1';
console.log(`✨ MAGIC LANTERN v${VERSION}`);

// magic-lantern-v5.js - Refactored to use external configuration
const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');
const SearchStrategyGenerator = require('./lib/search-strategy-generator');
const strategyRegistry = require('./lib/strategy-registry');
const MarkdownReportGenerator = require('./lib/markdown-report-generator');

class UnifiedMagicLantern {
    constructor(configProfile = 'test', researchProfile = 'default') {
        // Load configuration with both profiles
        this.config = config.load(configProfile, researchProfile);
        
        console.log(`\n📚 Research Profile: ${this.config.profileInfo.profileName}`);
        console.log(`   ${this.config.profileInfo.profileDescription}`);
        console.log(`📊 Corpus Profile: ${configProfile}\n`);
        
        // Set up from merged config
        this.baseUrl = this.config.search.api.baseUrl;
        this.rateLimitDelay = this.config.search.api.rateLimitMs;
        this.maxResultsPerPage = this.config.search.api.maxResultsPerPage;
        
        // Initialize strategy generator with profile awareness
        this.strategyGenerator = new SearchStrategyGenerator();
        this.configureStrategyGenerator();
        
        this.allResults = [];
        this.seenIds = new Set();

    }

    // Calculate position-based score
    getPositionScore(position) {
        if (position <= 5) return 100 - (position - 1) * 5;
        if (position <= 10) return 75 - (position - 6) * 5;
        if (position <= 20) return 50 - (position - 11) * 2;
        return Math.max(10, 30 - (position - 21));
    }

    // Extract publication title using base-patterns.js
    extractPublication(itemId) {
        const id = itemId.toLowerCase();
        
        for (const [pub, pattern] of Object.entries(this.config.scoring.publications.patterns)) {
            if (pattern.test(id)) {
                return pub;
            }
        }
        
        return null;
    }

        // New method to configure strategy generator based on profile
    configureStrategyGenerator() {
        const profileStrategies = this.config.search.strategies;
        
        // Apply enabled/disabled strategies
        if (profileStrategies.enabled) {
            this.strategyGenerator.enabledStrategies = profileStrategies.enabled;
        }
        
        // Apply strategy weights if present
        if (profileStrategies.weights) {
            this.strategyGenerator.strategyWeights = profileStrategies.weights;
        }
        
        // Apply custom author variations if present
        if (this.config.profileInfo.research === 'adaptation-studies' && 
            profileStrategies.customVariations) {
            this.strategyGenerator.customAuthorVariations = profileStrategies.customVariations;
        }
    }

    // Score and rank results using config weights
    scoreAndRankResults() {
        console.log('\n📊 Scoring and ranking results...');
        
        this.allResults = this.allResults.map((result, index) => {
            const positionScore = this.getPositionScore(index + 1);
            const collectionWeight = 1.0; // Applied after full text fetch
            
            const publication = this.extractPublication(result.id);
            const publicationWeight = publication ? 
                (this.config.scoring.publications.weights[publication] || 1.0) : 1.0;
            
            const finalScore = positionScore * publicationWeight;
            
            return {
                ...result,
                scoring: {
                    position: index + 1,
                    positionScore,
                    collectionWeight,
                    publicationWeight,
                    publication: publication || 'unknown',
                    finalScore
                }
            };
        });
        
        this.allResults.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);
        
        console.log('\n🏆 Top 5 scored results:');
        this.allResults.slice(0, 5).forEach((result, i) => {
            const s = result.scoring;
            console.log(`${i + 1}. [Score: ${s.finalScore.toFixed(1)}] ${s.publication}`);
            console.log(`   Position: ${s.position} (${s.positionScore}) × Publication: ${s.publicationWeight}`);
        });
    }

    // Add this method to check if Lantern is available before starting

    async checkLanternAvailability() {
        console.log('\n🏮 Checking Lantern availability...');
        
        try {
            const testUrl = `${this.baseUrl}/catalog.json?per_page=1`;
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 10000)
            );
            
            await Promise.race([
                this.makeRequest(testUrl),
                timeout
            ]);
            
            console.log('✅ Lantern is available!\n');
            return true;
        } catch (error) {
            console.log('❌ Lantern appears to be down or unreachable');
            console.log(`   Error: ${error.message}`);
            console.log('\n💡 Suggestions:');
            console.log('   1. Check if https://lantern.mediahist.org/ loads in your browser');
            console.log('   2. Check https://mediahistoryproject.org/ for maintenance notices');
            console.log('   3. Try again later - the site may be temporarily down');
            console.log('   4. Check your internet connection\n');
            return false;
        }
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

    async searchWithStrategy(strategy, film) {
        const keywords = this.parseStrategyKeywords(strategy, film);
        
        const params = new URLSearchParams({
            search_field: 'advanced',
            commit: 'Search',
            sort: 'score desc, dateStart desc, title asc',
            op: 'AND',
            per_page: this.maxResultsPerPage.toString()
        });

        if (keywords.keyword) params.append('keyword', keywords.keyword);
        if (keywords.second_keyword) params.append('second_keyword', keywords.second_keyword);
        if (keywords.third_keyword) params.append('third_keyword', keywords.third_keyword);

        params.append('f_inclusive[format][]', 'Periodicals');
        
        // ! configurable? are these the correct fallbacks?
        // Use collections from config
        const collections = this.config.search.api.collections || 
            ['Fan Magazines', 'Hollywood Studio System', 'Early Cinema'];
        collections.forEach(collection => {
            params.append('f_inclusive[collection][]', collection);
        });

        // Date range filtering using config
        const year = parseInt(film.year || film.Year);
        if (year) {
            const range = this.config.search.strategies.dateRanges[strategy.confidence];
            if (range) {
                params.append('range[year][begin]', year - range.before);
                params.append('range[year][end]', year + range.after);
            }
        }
        
        const url = `${this.baseUrl}/catalog.json?${params}`;
        
        console.log(`\n🔍 [${strategy.confidence.toUpperCase()}] ${strategy.description}`);
        console.log(`   Weight: ${strategy.profileWeight || 1.0} | Type: ${strategy.type}`);
        console.log(`   Keywords: ${keywords.keyword}${keywords.second_keyword ? ' + ' + keywords.second_keyword : ''}${keywords.third_keyword ? ' + ' + keywords.third_keyword : ''}`);
        
        try {
            const results = await this.makeRequest(url);
            const count = results.meta?.pages?.total_count || 0;
            
            if (count > 0) {
                console.log(`   ✅ Found ${count} results!`);
                
                if (results.data) {
                    results.data.forEach(item => {
                        if (!this.seenIds.has(item.id)) {
                            this.seenIds.add(item.id);
                            this.allResults.push({
                                ...item,
                                foundBy: strategy.type,
                                searchQuery: strategy.query,
                                strategyConfidence: strategy.confidence,
                                keywords: keywords
                            });
                        }
                    });
                }
            } else {
                console.log(`   ○ No results`);
            }
            
            return count;
        } catch (error) {
            console.log(`   ❌ Search failed: ${error.message}`);
            return 0;
        }
    }

    parseStrategyKeywords(strategy, film) {
        
        // Use the registry to parse
        const keywords = strategyRegistry.parseQuery(strategy.query, strategy.type);

        // If registry couldn't parse, fall back to existing logic

        if (Object.keys(keywords).length === 0) {
            // Keep existing switch statement for backward compatibility
            // This allows gradual migration
            return this.legacyParseStrategyKeywords(strategy, film);
        };
        return keywords;
    }
    
    // Rename previous method to legacy
    legacyParseStrategyKeywords(strategy, film) {
        const keywords = {};
        const quotedPhrases = strategy.query.match(/"[^"]+"/g) || [];
        const remainingText = strategy.query.replace(/"[^"]+"/g, '').trim();
        const unquotedWords = remainingText.split(/\s+/).filter(w => w.length > 0);
        
    switch (strategy.type) {
        case 'exact_title':
        case 'title_no_article':
            keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
            break;
            
        case 'author_title':
        case 'director_title':
        case 'star_title':
        case 'studio_title':
            keywords.keyword = quotedPhrases[0]; // First quoted phrase (creator/studio)
            keywords.second_keyword = quotedPhrases[1]; // Second quoted phrase (title)
            break;
            
        case 'title_box_office':
            keywords.keyword = quotedPhrases[0]; // Title
            keywords.second_keyword = '"box office"';
            break;
            
        case 'title_production':
            keywords.keyword = quotedPhrases[0]; // Title
            keywords.second_keyword = 'production';
            keywords.third_keyword = 'filming';
            break;
            
        case 'title_exhibitor':
            keywords.keyword = quotedPhrases[0]; // Title
            keywords.second_keyword = 'exhibitor';
            break;
            
        case 'source_adaptation':
            keywords.keyword = quotedPhrases[0]; // Novel title
            keywords.second_keyword = 'adaptation';
            break;
            
        case 'author_variant':
            keywords.keyword = quotedPhrases[0]; // Author variant
            keywords.second_keyword = quotedPhrases[1]; // Title
            break;

        case 'title_strike':
            keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
            keywords.second_keyword = '"picketed"';
            break;

        case 'title_work_stoppage':
            keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
            keywords.second_keyword = '"work stoppage"';
            break;

        case 'title_picket_line':
            keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
            keywords.second_keyword = '"picket line"';
            break;

        case 'title_walkout':
            keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
            keywords.second_keyword = '"walk out"';
            break;

        case 'studio_strike':
            // This one is special - the full phrase is the search
            keywords.keyword = strategy.query; // This will be "strike against MGM"
            break;

        case 'studio_labor':
            keywords.keyword = quotedPhrases[0]; // Studio name
            keywords.second_keyword = '"labor dispute"';
            break;

        case 'studio_boycott':
            keywords.keyword = quotedPhrases[0]; // Studio name
            keywords.second_keyword = 'boycott';
            break;

        case 'studio_strike_2':
            keywords.keyword = quotedPhrases[0]; // Studio name
            keywords.second_keyword = '"strike action"';
            break;

        case 'studio_production':
            keywords.keyword = quotedPhrases[0]; // Studio name  
            keywords.second_keyword = 'production';
            break;
            
        default:
            // For other cases, use up to 3 keywords/phrases
            if (quotedPhrases.length > 0) {
                keywords.keyword = quotedPhrases[0];
                if (quotedPhrases.length > 1) keywords.second_keyword = quotedPhrases[1];
                if (quotedPhrases.length > 2) keywords.third_keyword = quotedPhrases[2];
            } else if (unquotedWords.length > 0) {
                keywords.keyword = unquotedWords[0];
                if (unquotedWords.length > 1) keywords.second_keyword = unquotedWords[1];
                if (unquotedWords.length > 2) keywords.third_keyword = unquotedWords[2];
            }
    }
        
        return keywords;
    }

    async fetchFullPageText(pageId) {
        const url = `${this.baseUrl}/catalog/${pageId}/raw.json`;
        console.log(`   📄 Fetching full text for: ${pageId}`);
        
        try {
            const pageData = await this.makeRequest(url);
            const collections = pageData.collection || [];
            
            // Calculate collection weight from config
            let collectionWeight = 1.0;
            for (const collection of collections) {
                const weight = this.config.scoring.collections.weights[collection] || 1.0;
                collectionWeight = Math.max(collectionWeight, weight);
            }
            
            return {
                id: pageId,
                fullText: pageData.body || '',
                title: pageData.title,
                volume: pageData.volume,
                date: pageData.date || pageData.dateString,
                year: pageData.year,
                creator: pageData.creator,
                collection: collections,
                collectionWeight: collectionWeight,
                iaPage: pageData.iaPage,
                readUrl: pageData.read,
                wordCount: (pageData.body || '').split(/\s+/).length
            };
        } catch (error) {
            console.error(`   ❌ Failed to fetch full text for ${pageId}`);
            return null;
        }
    }

    // TODO test commenting this out before removing

    // identifyContentTypes(text) {
    //     const types = [];
        
    //     for (const [type, pattern] of Object.entries(this.contentPatterns)) {
    //         if (pattern.test(text)) {
    //             types.push(type);
    //         }
    //     }
        
    //     return types.length > 0 ? types : ['mention'];
    // }

    // // ! configurable

    // checkForPhoto(text) {
    //     const photoIndicators = [
    //         'scene from', 'production still', 'photograph',
    //         'pictured above', 'shown here', 'exclusive photo',
    //         'production cuts', 'mats'
    //     ];
        
    //     const lowerText = text.toLowerCase();
    //     return photoIndicators.some(indicator => lowerText.includes(indicator));
    // }


async comprehensiveSearch(film) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎬 COMPREHENSIVE SEARCH: ${film.title || film.Title} (${film.year || film.Year})`);
    console.log(`${'='.repeat(70)}`);
    
    this.allResults = [];
    this.seenIds = new Set();
    
    // Generate strategies
    let strategies = this.strategyGenerator.generateAllStrategies(film);
    
    // Apply corpus limits if configured
    if (this.config.corpus && this.config.corpus.strategiesPerFilm) {
        strategies = strategies.slice(0, this.config.corpus.strategiesPerFilm);
    }
    
    // Apply profile weights and sort by them
    if (this.strategyGenerator.strategyWeights) {
        strategies = strategies.map(s => ({
            ...s,
            profileWeight: this.strategyGenerator.strategyWeights[s.type] || 1.0
        }));
        
        // Filter out weight 0 strategies
        strategies = strategies.filter(s => s.profileWeight > 0);
        
        // Sort by profile weight (highest first), then confidence as tiebreaker
        strategies.sort((a, b) => {
            const weightDiff = b.profileWeight - a.profileWeight;
            if (weightDiff !== 0) return weightDiff;
            
            // Tiebreaker: confidence
            const confOrder = { high: 0, medium: 1, low: 2 };
            return confOrder[a.confidence] - confOrder[b.confidence];
        });
        
        console.log('\n📊 Strategy execution order (by profile weight):');
        strategies.slice(0, 10).forEach((s, i) => {
            console.log(`   ${i + 1}. [${s.profileWeight}] ${s.type} - ${s.description}`);
        });
    }
    
    // Execute strategies in profile-weighted order
    console.log('\n🔍 Beginning searches...');
    
    for (const strategy of strategies) {
        await this.searchWithStrategy(strategy, film);
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        
        // Check stop conditions
        if (this.allResults.length >= this.config.search.api.stopConditions.maxResultsPerFilm) {
            console.log(`   ⚡ Reached maximum results limit (${this.config.search.api.stopConditions.maxResultsPerFilm})`);
            break;
        }
        
        // Optional: Different threshold for high-weight strategies
        if (strategy.profileWeight < 1.0 && 
            this.allResults.length >= this.config.search.api.stopConditions.highQualityThreshold) {
            console.log(`   ✨ Found sufficient coverage for low-weight strategies`);
            break;
        }
    }
        
        this.scoreAndRankResults();
        
        // Fetch full text based on config
        const maxFetches = this.config.corpus?.fullTextFetches || 
                        this.config.search.fullText.maxFetches;
        
        console.log(`\n📚 Fetching full text for top ${maxFetches} results...`);
        
        const fullTextResults = [];
        const topResults = this.allResults
            .filter(r => r.scoring.finalScore >= (this.config.search.fullText.minScoreForFetch || 0))
            .slice(0, maxFetches);
        
        for (let i = 0; i < topResults.length; i++) {
            const result = topResults[i];
            
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
            
            const fullPageData = await this.fetchFullPageText(result.id);
            
            if (fullPageData) {
                // Debug logging
                console.log(`   ✓ Fetched ${fullPageData.wordCount || 0} words`);
                
                // Just use the fullPageData directly
                let enhancedData = {
                    ...fullPageData,
                    excerpt: fullPageData.fullText.substring(0, 300) + '...'
                };
                // Copy over the additional metadata
                enhancedData.foundBy = result.foundBy;
                enhancedData.searchQuery = result.searchQuery;
                enhancedData.strategyConfidence = result.strategyConfidence;
                enhancedData.finalScore = result.scoring.finalScore;
                enhancedData.publication = result.scoring.publication;

                // Keep the simple excerpt if no enhanced one
                if (!enhancedData.enhancedExcerpt) {
                    enhancedData.excerpt = fullPageData.fullText.substring(0, 300) + '...';
                }
                
                fullTextResults.push(enhancedData);  // Push the enhanced version
            }
        }        
        
        return {
            film: film,
            totalUniqueSources: this.allResults.length,
            allSearchResults: this.allResults,
            fullTextAnalysis: fullTextResults,
        };
    }

    async loadFilms(filePath) {
        console.log('🎬 Loading films from:', filePath);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const films = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const film = {};
            headers.forEach((header, i) => {
                film[header] = values[i];
            });
            return film;
        });
        
        console.log(`✨ Found ${films.length} films to research!\n`);
        return films;
    }

    async run(filePath, options = {}) {
        const profileName = options.profile || 'test';
        console.log(`✨ MAGIC LANTERN v5`);
        console.log(`   Corpus: ${this.config.profileInfo.corpus}`);
        console.log(`   Research Profile: ${this.config.profileInfo.research}\n`);        
    // Check if Lantern is available
    const isAvailable = await this.checkLanternAvailability();
    if (!isAvailable) {
        console.log('⚠️  Cannot proceed without access to Lantern. Exiting.\n');
        return;
    }
    
    try {
            const films = await this.loadFilms(filePath);
            
            const outputDir = path.join(__dirname, 'results');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const now = new Date();
            const pad = n => n.toString().padStart(2, '0');
            const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

            // Process films based on corpus limits
            const filmsToProcess = this.config.corpus?.filmsToProcess || 1;
            console.log(`🎬 Processing ${Math.min(filmsToProcess, films.length)} films...\n`);
            
            const allResults = [];
            
            for (let i = 0; i < Math.min(filmsToProcess, films.length); i++) {
                console.log(`\n📊 Progress: ${i + 1}/${Math.min(filmsToProcess, films.length)}`);
                const results = await this.comprehensiveSearch(films[i]);
                allResults.push(results);
                
                // Save intermediate results every 5 films
                if ((i + 1) % 5 === 0) {
                    console.log(`\n💾 Saving intermediate results...`);
                    this.saveResults(allResults, outputDir, `interim_${timestamp}`);
                }
            }
            
            // Save final results
            this.saveResults(allResults, outputDir, timestamp);
            
            console.log('\n🎉 Search complete!');
            console.log(`   Corpus: ${this.config.profileInfo.corpus}`);
            console.log(`   Research Profile: ${this.config.profileInfo.research}`);
            console.log(`   Films processed: ${allResults.length}`);
    
    } catch (error) {
                    console.error('❌ Error:', error.message);
                    console.error(error.stack);
                }
    }

    saveResults(results, outputDir, timestamp) {
        // Save comprehensive results
        const searchResultsData = results.map(r => ({
            film: r.film,
            totalUniqueSources: r.totalUniqueSources,
            searchStrategySummary: this.summarizeStrategies(r.allSearchResults),
            sources: r.allSearchResults
        }));
        
        fs.writeFileSync(
            path.join(outputDir, `comprehensive-search-results_${timestamp}.json`),
            JSON.stringify(searchResultsData, null, 2)
        );
        
        // Save full text analysis
        const fullTextData = results.map(r => ({
            film: r.film,
            totalFound: r.totalUniqueSources,
            fullTextAnalyzed: r.fullTextAnalysis.length,
            treasures: r.fullTextAnalysis
        }));
        
        fs.writeFileSync(
            path.join(outputDir, `full-text-results_${timestamp}.json`),
            JSON.stringify(fullTextData, null, 2)
        );
        
        console.log(`\n💾 Results saved with timestamp: ${timestamp}`);
        
    }

    summarizeStrategies(results) {
        const summary = {};
        results.forEach(result => {
            summary[result.foundBy] = (summary[result.foundBy] || 0) + 1;
        });
        return summary;
    }
}

// Helper function to find most recent result files
function findMostRecentResults(resultsDir = 'results') {
    try {
        const files = fs.readdirSync(resultsDir);
        
        // Find all comprehensive result files
        const resultFiles = files.filter(f => 
            f.startsWith('comprehensive-search-results_') && f.endsWith('.json')
        );
        
        if (resultFiles.length === 0) {
            console.error('❌ No result files found in results directory');
            return null;
        }
        
        // Sort by timestamp (most recent first)
        resultFiles.sort((a, b) => b.localeCompare(a));
        
        // Extract timestamp from most recent
        const mostRecent = resultFiles[0];
        const timestamp = mostRecent.match(/_(\d{8}_\d{6})\.json$/)[1];
        
        return {
            comprehensive: path.join(resultsDir, mostRecent),
            fullText: path.join(resultsDir, `full-text-results_${timestamp}.json`),
            timestamp: timestamp
        };
    } catch (error) {
        console.error('❌ Error finding result files:', error.message);
        return null;
    }
}

// Function to regenerate reports from existing data
async function regenerateReports(options = {}) {
    console.log('📋 Regenerating reports from existing data...\n');
    
    const resultsDir = options.resultsDir || 'results';
    const files = options.files || findMostRecentResults(resultsDir);
    
    if (!files) {
        process.exit(1);
    }
    
    console.log(`📂 Using results from: ${files.timestamp}`);
    
    try {
        // Check which files actually exist
        const hasComprehensive = fs.existsSync(files.comprehensive);
        const hasFullText = fs.existsSync(files.fullText);
        
        if (!hasComprehensive) {
            console.error('❌ Comprehensive results file not found');
            process.exit(1);
        }
        // Load the comprehensive data (always required)
        const comprehensiveData = JSON.parse(
            fs.readFileSync(files.comprehensive, 'utf8')
        );
        // Load full text data if it exists
        let fullTextData = null;
        if (hasFullText) {
            fullTextData = JSON.parse(
                fs.readFileSync(files.fullText, 'utf8')
            );
            console.log('✅ Found full-text results');
        } else {
            console.log('⚠️  No full-text results found - generating basic reports only');
        }
        
// Reconstruct the results format expected by report generator
        const results = comprehensiveData.map((compResult, index) => {
            const fullTextResult = fullTextData ? fullTextData[index] : null;
            
            return {
                film: compResult.film,
                totalUniqueSources: compResult.totalUniqueSources,
                allSearchResults: compResult.sources,
                fullTextAnalysis: fullTextResult?.treasures || [],
                contentStats: fullTextResult?.contentStats || {
                    total: 0,
                    byType: {},
                    byConfidence: { high: 0, medium: 0, low: 0 },
                    treasures: 0,
                    averageContentScore: 0
                }
            };
        });
        
        // Load config to get profile info
        const configProfile = options.corpus || 'test';
        const researchProfile = options.profile || 'default';
        const config = require('./config').load(configProfile, researchProfile);

        // Import the report generator
        const MarkdownReportGenerator = require('./lib/markdown-report-generator');
        
        
        // Create report generator
        const reportGenerator = new MarkdownReportGenerator({
            createSubfolders: true
        });
        
        // Generate reports
        console.log('📝 Generating markdown reports...');
        const reports = await reportGenerator.generateReports(
            results,
            config.profileInfo
        );
        
        // Save reports with original timestamp
        const savedFiles = await reportGenerator.saveReports(
            reports,
            resultsDir,
            files.timestamp
        );
        
        console.log(`\n✅ Successfully generated ${savedFiles.length} report files`);
        console.log(`📁 Reports saved to: ${resultsDir}/`);

            if (!hasFullText) {
            console.log('\n⚠️  Note: Reports were generated without full-text analysis data.');
            console.log('   To get complete reports, run a new search with full-text fetching enabled.');
        }
        
    } catch (error) {
        console.error('❌ Error generating reports:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}


// Run it!
if (require.main === module) {
    const args = process.argv.slice(2);
    
    // Parse arguments
    const filePath = args.find(arg => !arg.startsWith('--')) || 'data/films.csv';
    const corpusProfile = args.find(arg => arg.startsWith('--corpus='))?.split('=')[1] || 'test';
    const researchProfile = args.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'default';
    
    // Parse report options
    const noReports = args.includes('--no-reports');
    const reportsOnly = args.includes('--reports-only');
    
    // Check for help
    if (args.includes('--help') || args.includes('-h')) {
        console.log('\n✨ MAGIC LANTERN v5 - Research Toolkit');
        console.log('\nUsage: node magic-lantern-v5.js [path/to/file.csv] [options]');
        console.log('\nOptions:');
        console.log('  --corpus=PROFILE     Corpus size profile: test, single, medium, full');
        console.log('  --profile=PROFILE    Research profile name');
        console.log('  --list-profiles      List available research profiles');
        console.log('  --no-reports         Skip markdown report generation');
        console.log('  --reports-only       Generate reports from existing JSON results');
        console.log('  --timestamp=TIME     Specific timestamp to use with --reports-only');
        console.log('  --results-dir=DIR    Directory containing results (default: results)');
        console.log('\nExamples:');
        console.log('  node magic-lantern-v5.js data/films.csv --profile=adaptation-studies');
        console.log('  node magic-lantern-v5.js --corpus=medium --profile=early-cinema');
        console.log('  node magic-lantern-v5.js --reports-only  # Use most recent results');
        console.log('  node magic-lantern-v5.js --reports-only --timestamp=20241220_143022');
        process.exit(0);
    }
    
    // List profiles
    if (args.includes('--list-profiles')) {
        console.log('\n🔎 Available Research Profiles:\n');
        const profiles = config.profiles.list();
        profiles.forEach(p => {
            console.log(`  ${p.key}:`);
            console.log(`    ${p.description}\n`);
        });
        process.exit(0);
    }

        // Handle reports-only mode
    if (reportsOnly) {
        // Load most recent JSON files and generate reports
        // Implementation for regenerating reports from existing data

        // Extract any additional options
        const options = {
            corpus: args.find(arg => arg.startsWith('--corpus='))?.split('=')[1],
            profile: args.find(arg => arg.startsWith('--profile='))?.split('=')[1],
            resultsDir: args.find(arg => arg.startsWith('--results-dir='))?.split('=')[1],
            timestamp: args.find(arg => arg.startsWith('--timestamp='))?.split('=')[1]
        };
        
        // If specific timestamp provided, use it
        if (options.timestamp) {
            options.files = {
                comprehensive: path.join(
                    options.resultsDir || 'results',
                    `comprehensive-search-results_${options.timestamp}.json`
                ),
                fullText: path.join(
                    options.resultsDir || 'results', 
                    `full-text-results_${options.timestamp}.json`
                ),
                timestamp: options.timestamp
            };
        }
        
        regenerateReports(options).then(() => {
            console.log('\n✨ Report generation complete!');
        }).catch(error => {
            console.error('Failed:', error);
            process.exit(1);
        });
        
        return; // Don't run normal search flow
    }
    
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nUse --help for usage information');
        process.exit(1);
    }
    
    const lantern = new UnifiedMagicLantern(corpusProfile, researchProfile);
    lantern.run(filePath, { corpusProfile, researchProfile });
}

module.exports = UnifiedMagicLantern;