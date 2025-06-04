#!/usr/bin/env node

// magic-lantern-v5.js - Refactored to use external configuration
const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');
const SearchStrategyGenerator = require('./lib/search-strategy-generator');




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
        
        // Content patterns for full text analysis
        this.contentPatterns = {
            review: /\b(review|reviewed|critique|criticism|notices?)\b/i,
            production: /\b(production|producing|filming|started|completed|announced)\b/i,
            boxOffice: /\b(gross|box[\s-]?office|earnings|receipts|revenue|record)\b/i,
            advertisement: /\b(contest|cuts and mats|now showing|coming|opens|playing|at the|theatre|theater)\b/i,
            photo: /\b(photograph|photo|scene from|production still)\b/i,
            interview: /\b(interview|talks about|discusses)\b/i,
            listing: /\b(calendar|releases for|table|list)\b/i
        };
    }

    // Calculate position-based score
    getPositionScore(position) {
        if (position <= 5) return 100 - (position - 1) * 5;
        if (position <= 10) return 75 - (position - 6) * 5;
        if (position <= 20) return 50 - (position - 11) * 2;
        return Math.max(10, 30 - (position - 21));
    }

    // Extract publication using config patterns
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
        
        // ! configurable
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
        // [Keep existing implementation]
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
    keywords.second_keyword = 'strike';
    break;

case 'title_union':
    keywords.keyword = quotedPhrases[0] || `"${film.title || film.Title}"`;
    keywords.second_keyword = 'union';
    break;

case 'studio_strike':
    keywords.keyword = quotedPhrases[0]; // Studio name
    keywords.second_keyword = 'strike';
    break;

case 'studio_labor':
    keywords.keyword = quotedPhrases[0]; // Studio name
    keywords.second_keyword = 'labor';
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

    identifyContentTypes(text) {
        const types = [];
        
        for (const [type, pattern] of Object.entries(this.contentPatterns)) {
            if (pattern.test(text)) {
                types.push(type);
            }
        }
        
        return types.length > 0 ? types : ['mention'];
    }

    // ! configurable

    checkForPhoto(text) {
        const photoIndicators = [
            'scene from', 'production still', 'photograph',
            'pictured above', 'shown here', 'exclusive photo',
            'production cuts', 'mats'
        ];
        
        const lowerText = text.toLowerCase();
        return photoIndicators.some(indicator => lowerText.includes(indicator));
    }

async comprehensiveSearch(film) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎭 COMPREHENSIVE SEARCH: ${film.title || film.Title} (${film.year || film.Year})`);
    console.log(`${'='.repeat(70)}`);
    
    this.allResults = [];
    this.seenIds = new Set();
    
    // Generate strategies
    let strategies = this.strategyGenerator.generateAllStrategies(film);
    
    // Apply corpus limits if configured
    if (this.config.corpus && this.config.corpus.strategiesPerFilm) {
        strategies = strategies.slice(0, this.config.corpus.strategiesPerFilm);
    }
    
    // NEW: Apply profile weights and sort by them
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
                fullPageData.contentTypes = this.identifyContentTypes(fullPageData.fullText);
                fullPageData.hasPhoto = this.checkForPhoto(fullPageData.fullText);
                fullPageData.excerpt = fullPageData.fullText.substring(0, 300) + '...';
                fullPageData.foundBy = result.foundBy;
                fullPageData.searchQuery = result.searchQuery;
                fullPageData.strategyConfidence = result.strategyConfidence;
                fullPageData.finalScore = result.scoring.finalScore;
                fullPageData.publication = result.scoring.publication;
                
                fullTextResults.push(fullPageData);
            }
        }
        
        return {
            film: film,
            totalUniqueSources: this.allResults.length,
            allSearchResults: this.allResults,
            fullTextAnalysis: fullTextResults
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

// Run it!
if (require.main === module) {
    const args = process.argv.slice(2);
    
    // Parse arguments
    const filePath = args.find(arg => !arg.startsWith('--')) || 'films.csv';
    const corpusProfile = args.find(arg => arg.startsWith('--corpus='))?.split('=')[1] || 'test';
    const researchProfile = args.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'default';
    
    // Check for help
    if (args.includes('--help') || args.includes('-h')) {
        console.log('\n✨ MAGIC LANTERN v5 - Research Toolkit');
        console.log('\nUsage: node magic-lantern-v5.js [films.csv] [options]');
        console.log('\nOptions:');
        console.log('  --corpus=PROFILE     Corpus size profile: test, single, medium, full');
        console.log('  --profile=PROFILE    Research profile name');
        console.log('  --list-profiles      List available research profiles');
        console.log('\nExamples:');
        console.log('  node magic-lantern-v5.js films.csv --profile=adaptation-studies');
        console.log('  node magic-lantern-v5.js --corpus=medium --profile=early-cinema');
        process.exit(0);
    }
    
    // List profiles
    if (args.includes('--list-profiles')) {
        console.log('\n📚 Available Research Profiles:\n');
        const profiles = config.profiles.list();
        profiles.forEach(p => {
            console.log(`  ${p.key}:`);
            console.log(`    ${p.description}\n`);
        });
        process.exit(0);
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