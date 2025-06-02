#!/usr/bin/env node

// magic-lantern-v2.js - Multi-Strategy Treasure Finder
const fs = require('fs');
const path = require('path');
const https = require('https');

class SearchStrategyGenerator {
    constructor() {
        // Common title words to potentially remove
        this.articles = ['The', 'A', 'An'];
        this.commonWords = ['of', 'and', 'in', 'at', 'to', 'for', 'with', 'on'];
    }

    generateAllStrategies(film) {
        console.log(`\n🎯 Generating search strategies for: ${film.title || film.Title}`);
        
        const strategies = [
            ...this.titleVariations(film),
            ...this.creatorSearches(film),
            ...this.productionSearches(film),
            ...this.starSearches(film),
            ...this.temporalSearches(film),
            ...this.fuzzySearches(film),
            ...this.contextualSearches(film)
        ];

        // Remove duplicates and sort by confidence
        const uniqueStrategies = this.deduplicateStrategies(strategies);
        
        console.log(`✨ Generated ${uniqueStrategies.length} unique search strategies!`);
        return uniqueStrategies;
    }

    // Updated titleVariations method
    titleVariations(film) {
        const strategies = [];
        const title = film.title || film.Title;
        // DON'T include year in search query!
        
    // Exact title (NO YEAR!)
    strategies.push({
        query: `"${title}"`,
        type: 'exact_title',
        confidence: 'high',
        description: 'Exact title match'
    });
        
        // Title without "The/A/An"
        this.articles.forEach(article => {
            if (title.startsWith(article + ' ')) {
                const shortTitle = title.substring(article.length + 1);
                strategies.push({
                    query: `"${shortTitle}"`,
                    type: 'title_no_article',
                    confidence: 'high',
                    description: `Title without "${article}"`
                });
                
                // Also try without quotes for broader match
                strategies.push({
                    query: `${shortTitle}`,
                    type: 'title_no_article_broad',
                    confidence: 'medium',
                    description: `Broad search without "${article}"`
                });
            }
        });
        
        
        // Abbreviated title (first 2-3 significant words)
        const abbreviated = this.abbreviateTitle(title);
        if (abbreviated !== title) {
            strategies.push({
                query: `"${abbreviated}"`,
                type: 'abbreviated_title',
                confidence: 'medium',
                description: 'Abbreviated title'
            });
        }
        
        // Possessive forms (film's, picture's)
        strategies.push({
            query: `"${title}'s"`,
            type: 'possessive_title',
            confidence: 'low',
            description: 'Possessive form'
        });
        
        // Key word from title
        const keyword = this.extractKeyword(title);
        if (keyword && keyword !== title) {
            strategies.push({
                query: `"${keyword}" film`,
                type: 'keyword_film',
                confidence: 'low',
                description: `Key word: "${keyword}"`
            });
        }
        
        return strategies;
    }

    // 2. CREATOR SEARCHES - Author/Director focused
    creatorSearches(film) {
        const strategies = [];
        const title = film.title || film.Title;
        
        // Author searches (for adaptations)
        const author = film.author || film.Author;
        if (author && author !== '-') {
            // Full author + title
            strategies.push({
                query: `"${author}" "${title}"`,
                type: 'author_title',
                confidence: 'high',
                description: 'Author + exact title'
            });
            
            // Author (finds "Baum's latest")
            strategies.push({
                query: `"${author}"`,
                type: 'author_year',
                confidence: 'medium',
                description: 'Author name only'
            });
            
            // Last name + title
            const lastName = author.split(' ').pop();
            strategies.push({
                query: `"${lastName}" "${title}"`,
                type: 'lastname_title',
                confidence: 'medium',
                description: 'Author last name + title'
            });
            
            // Author variations (Fannie vs Fanny)
            const authorVariations = this.getAuthorVariations(author);
            authorVariations.forEach(variant => {
                strategies.push({
                    query: `"${variant}" "${title}"`,
                    type: 'author_variant',
                    confidence: 'medium',
                    description: `Author variant: ${variant}`
                });
            });
        }
        
        // Director searches
        const director = film.director || film.Director;
        if (director && director !== '-') {
            // Director + title
            strategies.push({
                query: `"${director}" "${title}"`,
                type: 'director_title',
                confidence: 'high',
                description: 'Director + title'
            });
            
            // Director + year
            strategies.push({
                query: `"${director}" picture`,
                type: 'director_picture',
                confidence: 'medium',
                description: 'Director + "picture"'
            });
            
            // Director last name only
            const dirLastName = director.split(' ').pop();
            strategies.push({
                query: `"${dirLastName}" director "${title}"`,
                type: 'director_lastname',
                confidence: 'low',
                description: 'Director last name'
            });
        }
        
        return strategies;
    }

    // 3. PRODUCTION SEARCHES - Studio/business focused
    productionSearches(film) {
        const strategies = [];
        const title = film.title || film.Title;
        const studio = film.studio || film.Studio;
        
        if (studio && studio !== '-') {
            // Studio + title
            strategies.push({
                query: `"${studio}" "${title}"`,
                type: 'studio_title',
                confidence: 'high',
                description: 'Studio + title'
            });
            
            // Studio + year + production
            strategies.push({
                query: `"${studio}" production`,
                type: 'studio_production',
                confidence: 'medium',
                description: 'Studio production news'
            });
            
            // Studio abbreviations (MGM, RKO, etc.)
            const studioAbbr = this.getStudioAbbreviation(studio);
            if (studioAbbr) {
                strategies.push({
                    query: `"${studioAbbr}" "${title}"`,
                    type: 'studio_abbr',
                    confidence: 'medium',
                    description: `Studio abbreviation: ${studioAbbr}`
                });
            }
        }
        
        // Production-specific searches
        strategies.push({
            query: `"${title}" filming production`,
            type: 'title_production',
            confidence: 'medium',
            description: 'Production news'
        });
        
        strategies.push({
            query: `"${title}" "box office"`,
            type: 'title_box_office',
            confidence: 'medium',
            description: 'Box office data'
        });
        
        strategies.push({
            query: `"${title}" opens theater`,
            type: 'title_exhibition',
            confidence: 'low',
            description: 'Exhibition/opening'
        });
        
        return strategies;
    }

    // 4. STAR SEARCHES - Actor-focused
    starSearches(film) {
        const strategies = [];
        const title = film.title || film.Title;
        
        // If we have star data
        const stars = film.stars || film.Stars || film.cast || film.Cast;
        if (stars) {
            const starList = Array.isArray(stars) ? stars : [stars];
            
            starList.slice(0, 2).forEach(star => { // Top 2 stars only
                if (star && star !== '-') {
                    strategies.push({
                        query: `"${star}" "${title}"`,
                        type: 'star_title',
                        confidence: 'high',
                        description: `Star: ${star}`
                    });
                    
                    strategies.push({
                        query: `"${star}" picture`,
                        type: 'star_picture',
                        confidence: 'medium',
                        description: `${star} in ${year}`
                    });
                }
            });
        }
        
        // For specific films we might know the stars
        const knownStars = this.getKnownStars(title);
        knownStars.forEach(star => {
            strategies.push({
                query: `"${star}" "${title}"`,
                type: 'known_star',
                confidence: 'high',
                description: `Known star: ${star}`
            });
        });
        
        return strategies;
    }

    // 5. TEMPORAL SEARCHES - Different time periods
    temporalSearches(film) {
        return [];
    }

    // 6. FUZZY SEARCHES - Handle OCR errors and variations
    fuzzySearches(film) {
        const strategies = [];
        const title = film.title || film.Title;
        const year = film.year || film.Year;
        
        // Common OCR errors
        const ocrVariants = this.generateOCRVariants(title);
        ocrVariants.forEach(variant => {
            strategies.push({
                query: `"${variant}" ${year}`,
                type: 'ocr_variant',
                confidence: 'low',
                description: `OCR variant: ${variant}`
            });
        });
        
        // Partial title matches (for long titles)
        if (title.split(' ').length > 4) {
            const firstHalf = title.split(' ').slice(0, Math.ceil(title.split(' ').length / 2)).join(' ');
            strategies.push({
                query: `"${firstHalf}" ${year}`,
                type: 'partial_title',
                confidence: 'low',
                description: 'First half of title'
            });
        }
        
        return strategies;
    }

    // 7. CONTEXTUAL SEARCHES - Theme/genre based
    contextualSearches(film) {
        const strategies = [];
        const title = film.title || film.Title;
        const year = film.year || film.Year;
        const novel = film.novel || film.Novel || film.source || film.Source;
        
        // If it's an adaptation
        if (novel && novel !== title) {
            strategies.push({
                query: `"${novel}" adaptation ${year}`,
                type: 'source_adaptation',
                confidence: 'medium',
                description: 'Source novel adaptation'
            });
        }
        
        // Genre-specific (if we can infer)
        const genre = this.inferGenre(title, film);
        if (genre) {
            strategies.push({
                query: `"${title}" ${genre} film`,
                type: 'title_genre',
                confidence: 'low',
                description: `Genre: ${genre}`
            });
        }
        
        // Remake searches (for known remakes)
        if (this.isKnownRemake(title)) {
            strategies.push({
                query: `"${title}" remake ${year}`,
                type: 'remake_search',
                confidence: 'medium',
                description: 'Remake coverage'
            });
        }
        
        return strategies;
    }

    // HELPER METHODS
    
    abbreviateTitle(title) {
        const words = title.split(' ');
        const significantWords = words.filter(w => !this.commonWords.includes(w.toLowerCase()));
        
        if (significantWords.length >= 2) {
            return significantWords.slice(0, 2).join(' ');
        }
        return title;
    }
    
    extractKeyword(title) {
        const words = title.split(' ');
        const significantWords = words.filter(w => 
            !this.commonWords.includes(w.toLowerCase()) && 
            !this.articles.includes(w) &&
            w.length > 3
        );
        
        // Return the most unique/significant word
        return significantWords[0] || null;
    }
    
    getAuthorVariations(author) {
        const variations = [];
        
        // Known author variations
        const knownVariations = {
            'Fannie Hurst': ['Fanny Hurst'],
            'Gene Stratton-Porter': ['Gene Stratton Porter', 'Stratton-Porter'],
            'L. Frank Baum': ['Frank Baum', 'Baum'],
            'F. Scott Fitzgerald': ['Scott Fitzgerald', 'Fitzgerald']
        };
        
        if (knownVariations[author]) {
            variations.push(...knownVariations[author]);
        }
        
        return variations;
    }
    
    getStudioAbbreviation(studio) {
        const abbreviations = {
            'Metro-Goldwyn-Mayer': 'MGM',
            'Radio-Keith-Orpheum': 'RKO',
            'RKO Radio Pictures': 'RKO',
            'Paramount Pictures': 'Paramount',
            '20th Century Fox': 'Fox',
            'Universal Pictures': 'Universal',
            'Columbia Pictures': 'Columbia',
            'United Artists': 'UA'
        };
        
        return abbreviations[studio] || null;
    }
    
    getKnownStars(title) {
        const starsByFilm = {
            'The Wizard of Oz': ['Judy Garland', 'Ray Bolger', 'Bert Lahr'],
            'Gone with the Wind': ['Clark Gable', 'Vivien Leigh'],
            'Rebecca': ['Laurence Olivier', 'Joan Fontaine'],
            'The Maltese Falcon': ['Humphrey Bogart', 'Mary Astor']
        };
        
        return starsByFilm[title] || [];
    }
    
    generateOCRVariants(title) {
        const variants = [];
        
        // Common OCR substitutions
        const ocrSubs = {
            'l': ['1', 'i'],
            'I': ['l', '1'],
            '0': ['O'],
            'O': ['0'],
            'S': ['5'],
            '5': ['S']
        };
        
        // Generate a few variants (don't go crazy)
        const words = title.split(' ');
        if (words.length <= 3) {
            // Try one substitution
            for (let char in ocrSubs) {
                if (title.includes(char)) {
                    const variant = title.replace(char, ocrSubs[char][0]);
                    if (variant !== title) {
                        variants.push(variant);
                        break; // Only one variant
                    }
                }
            }
        }
        
        return variants;
    }
    
    inferGenre(title, film) {
        // Simple genre inference from title/metadata
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('love') || titleLower.includes('romance')) return 'romance';
        if (titleLower.includes('murder') || titleLower.includes('death')) return 'mystery';
        if (titleLower.includes('adventures') || titleLower.includes('adventure')) return 'adventure';
        if (film.genre) return film.genre.toLowerCase();
        
        return null;
    }
    
    isKnownRemake(title) {
        const knownRemakes = [
            'The Wizard of Oz', // Multiple versions
            'Little Women',
            'The Three Musketeers',
            'Romeo and Juliet'
        ];
        
        return knownRemakes.includes(title);
    }
    
    deduplicateStrategies(strategies) {
        const seen = new Set();
        const unique = [];
        
        strategies.forEach(strategy => {
            const key = strategy.query.toLowerCase().trim();
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(strategy);
            }
        });
        
        // Sort by confidence: high → medium → low
        const order = { high: 0, medium: 1, low: 2 };
        return unique.sort((a, b) => order[a.confidence] - order[b.confidence]);
    }
}

// Updated MagicLantern class to use the strategy generator
class MagicLantern {
    constructor() {
        this.baseUrl = 'https://lantern.mediahist.org';
        this.rateLimitDelay = 200;
        this.strategyGenerator = new SearchStrategyGenerator();
        this.allResults = [];
        this.seenIds = new Set();
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
    // Build the query parameters
    const params = new URLSearchParams({
        q: strategy.query,
        per_page: '20',
        sort: 'score desc, date desc',
        search_field: 'all_fields'
    });

    // Add format filters - only periodicals
    params.append('f[format][]', 'Periodicals');
    
    // Add collection filters - focus on trade and fan publications
    const collections = [
        'Fan Magazines',
        'Hollywood Studio System', 
        'Early Cinema',
    ];
    collections.forEach(collection => {
        params.append('f[collection][]', collection);
    });

        // DATE RANGE FILTERING - This is the key!
    const year = parseInt(film.year || film.Year);
    if (year && strategy.confidence === 'high') {
        // For high confidence, strict date range (1 year either side)
        params.append('range[year][begin]', year - 1);
        params.append('range[year][end]', year + 1);
    } else if (year && strategy.confidence === 'medium') {
        // For medium confidence, wider range (2 years either side)
        params.append('range[year][begin]', year - 2);
        params.append('range[year][end]', year + 2);
    } else if (year && strategy.confidence === 'low') {
        // For low confidence, even wider (3 years either side)
        params.append('range[year][begin]', year - 3);
        params.append('range[year][end]', year + 3);
    }
        
        const url = `${this.baseUrl}/catalog.json?${params}`;
        
    console.log(`\n🔍 [${strategy.confidence.toUpperCase()}] ${strategy.description}`);
    console.log(`   Query: "${strategy.query}"`);
    if (year) {
        const begin = params.get('range[year][begin]');
        const end = params.get('range[year][end]');
        console.log(`   📅 Date filter: ${begin}-${end}`);
    }
        try {
            const results = await this.makeRequest(url);
            const count = results.meta?.pages?.total_count || 0;
            
            if (count > 0) {
                console.log(`   ✅ Found ${count} results!`);
                
                // Track which strategy found what
                if (results.data) {
                    results.data.forEach(item => {
                        if (!this.seenIds.has(item.id)) {
                            this.seenIds.add(item.id);
                            this.allResults.push({
                                ...item,
                                foundBy: strategy.type,
                                searchQuery: strategy.query,
                                strategyConfidence: strategy.confidence

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

    async comprehensiveSearch(film) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎭 COMPREHENSIVE TREASURE HUNT: ${film.title || film.Title} (${film.year || film.Year})`);
    console.log(`${'='.repeat(70)}`);
    
    // Reset for new film
    this.allResults = [];
    this.seenIds = new Set();
    
    // Generate all strategies (WITHOUT year in queries)
    const strategies = this.strategyGenerator.generateAllStrategies(film);
    
    // Group by confidence
    const byConfidence = {
        high: strategies.filter(s => s.confidence === 'high'),
        medium: strategies.filter(s => s.confidence === 'medium'),
        low: strategies.filter(s => s.confidence === 'low')
    };
    
    console.log(`\n📊 Strategy Breakdown:`);
    console.log(`   High confidence: ${byConfidence.high.length} strategies`);
    console.log(`   Medium confidence: ${byConfidence.medium.length} strategies`);
    console.log(`   Low confidence: ${byConfidence.low.length} strategies`);
    
    const year = parseInt(film.year || film.Year);
    if (year) {
        console.log(`\n📅 Date Filtering Strategy:`);
        console.log(`   High confidence: ${year - 1} to ${year + 1} (strict 3-year window)`);
        console.log(`   Medium confidence: ${year - 2} to ${year + 2} (5-year window)`);
        console.log(`   Low confidence: ${year - 3} to ${year + 3} (7-year window)`);
    }
    
    // Execute searches with proper filtering
    console.log(`\n${'━'.repeat(50)}`);
    console.log(`🎯 EXECUTING HIGH CONFIDENCE STRATEGIES`);
    console.log(`${'━'.repeat(50)}`);
    
    for (const strategy of byConfidence.high) {
        await this.searchWithStrategy(strategy, film);
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        
        if (this.allResults.length > 30) {
            console.log(`\n🎉 WOW! Already ${this.allResults.length} unique sources!`);
        }
    }
        
        // Continue with medium confidence if needed
        if (this.allResults.length < 25) {
            console.log(`\n${'━'.repeat(50)}`);
            console.log(`🔍 EXECUTING MEDIUM CONFIDENCE STRATEGIES`);
            console.log(`${'━'.repeat(50)}`);
            
            for (const strategy of byConfidence.medium) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        
        // Low confidence only if really needed
        if (this.allResults.length < 15) {
            console.log(`\n${'━'.repeat(50)}`);
            console.log(`🔎 EXECUTING LOW CONFIDENCE STRATEGIES`);
            console.log(`${'━'.repeat(50)}`);
            
            for (const strategy of byConfidence.low.slice(0, 5)) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        
        // Analyze and celebrate findings!
        return this.celebrateDiscoveries(film);
    }

    celebrateDiscoveries(film) {
        console.log(`\n${'🌟'.repeat(35)}`);
        console.log(`\n✨ DISCOVERY COMPLETE: ${film.title || film.Title} (${film.year || film.Year})`);
        console.log(`\n${'🌟'.repeat(35)}\n`);
        
        const uniqueCount = this.allResults.length;
        
        // Different celebration levels
        if (uniqueCount >= 50) {
            console.log(`🎊 EXTRAORDINARY DISCOVERY! ${uniqueCount} unique sources found!`);
            console.log(`💎 This is EXCEPTIONAL - most films have 3-5 sources!`);
            console.log(`📚 Your research on this film will be groundbreaking!\n`);
        } else if (uniqueCount >= 25) {
            console.log(`🎉 AMAZING FIND! ${uniqueCount} unique sources discovered!`);
            console.log(`⭐ This is fantastic coverage - way above average!\n`);
        } else if (uniqueCount >= 15) {
            console.log(`✨ Great coverage! ${uniqueCount} unique sources found.`);
            console.log(`📖 Plenty of material for comprehensive research!\n`);
        } else if (uniqueCount >= 5) {
            console.log(`📚 Found ${uniqueCount} sources - solid coverage for research.\n`);
        } else {
            console.log(`🔍 Found ${uniqueCount} sources - every discovery counts!\n`);
        }
        
        // Show which strategies worked best
        const strategySuccess = {};
        this.allResults.forEach(result => {
            strategySuccess[result.foundBy] = (strategySuccess[result.foundBy] || 0) + 1;
        });
        
        console.log(`📊 Most Successful Search Strategies:`);
        Object.entries(strategySuccess)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([strategy, count], index) => {
                console.log(`   ${index + 1}. ${strategy}: ${count} sources`);
            });
        
        // Sample of discoveries
        console.log(`\n📄 Sample Discoveries:`);
        this.allResults.slice(0, 5).forEach((result, index) => {
            const excerpt = result.attributes?.body?.attributes?.value || 'No excerpt';
            const cleanExcerpt = excerpt.substring(0, 100).replace(/\s+/g, ' ') + '...';
            console.log(`\n   ${index + 1}. Found by: ${result.foundBy}`);
            console.log(`      "${cleanExcerpt}"`);
        });
        
        // Next steps
        console.log(`\n🚀 Next Steps:`);
        console.log(`   1. Fetch full text for these ${uniqueCount} sources`);
        console.log(`   2. Analyze for photos, reviews, and rare content`);
        console.log(`   3. Generate your research treasure report!\n`);
        
        return {
            film: film,
            totalUniqueSources: uniqueCount,
            strategySuccess: strategySuccess,
            sources: this.allResults
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

    async run(filePath) {
        console.log('✨ MAGIC LANTERN v2.0 - Multi-Strategy Treasure Finder ✨\n');
        console.log('This enhanced version searches 8-10 different ways per film');
        console.log('to uncover ALL the treasures, not just the obvious ones!\n');
        
        try {
            const films = await this.loadFilms(filePath);
            
            // Test with first film
            console.log('🧪 Testing comprehensive search with first film...\n');
            const results = await this.comprehensiveSearch(films[0]);
            
            // Save results
            const outputPath = 'comprehensive-search-results.json';
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
            console.log(`💾 Full results saved to ${outputPath}`);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            console.error(error.stack);
        }
    }
}

// Run it!
if (require.main === module) {
    const filePath = process.argv[2] || 'films.csv';
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nUsage: node magic-lantern-v2.js [path-to-csv]');
        process.exit(1);
    }
    
    const lantern = new MagicLantern();
    lantern.run(filePath);
}

module.exports = { MagicLantern, SearchStrategyGenerator };