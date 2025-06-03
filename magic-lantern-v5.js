#!/usr/bin/env node

// magic-lantern-v5.js - Refactored to use external configuration
const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');

// Import the SearchStrategyGenerator (unchanged)
class SearchStrategyGenerator {
    constructor() {
        this.articles = ['The', 'A', 'An'];
        this.commonWords = ['of', 'and', 'in', 'at', 'to', 'for', 'with', 'on'];
    }

generateAllStrategies(film) {
    console.log(`\n🎯 Generating search strategies for: ${film.title || film.Title}`);
    
    const strategies = [];
    
    // Check if each strategy type is enabled
    if (!this.enabledStrategies || this.enabledStrategies.titleVariations !== false) {
        strategies.push(...this.titleVariations(film));
    }
    if (!this.enabledStrategies || this.enabledStrategies.creatorSearches !== false) {
        strategies.push(...this.creatorSearches(film));
    }
    if (!this.enabledStrategies || this.enabledStrategies.productionSearches !== false) {
        strategies.push(...this.productionSearches(film));
    }
    if (!this.enabledStrategies || this.enabledStrategies.starSearches !== false) {
        strategies.push(...this.starSearches(film));
    }
    if (!this.enabledStrategies || this.enabledStrategies.fuzzySearches !== false) {
        strategies.push(...this.fuzzySearches(film));
    }
    if (!this.enabledStrategies || this.enabledStrategies.contextualSearches !== false) {
        strategies.push(...this.contextualSearches(film));
    }

    const uniqueStrategies = this.deduplicateStrategies(strategies);
    console.log(`✨ Generated ${uniqueStrategies.length} unique search strategies!`);
    return uniqueStrategies;
}

    titleVariations(film) {
        const strategies = [];
        const title = film.title || film.Title;
        // DON'T include year in search query!

        // Exact title (NO YEAR!)
        strategies.push({
            query: `"${title}"`,
            type: 'exact_title',
            confidence: 'medium', // ! test setting this to medium to de-prioritize it
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
            
            // Author (finds date filtered mentions of author)
            strategies.push({
                query: `"${author}"`,
                type: 'author',
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
            
            // Director name only - finds mentions of director within date filter
            strategies.push({
                query: `"${director}"`,
                type: 'director_only',
                confidence: 'medium',
                description: 'Director name only'
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
        // Studio + title (will use keyword stacking)
        strategies.push({
            query: `"${studio}" "${title}"`,
            type: 'studio_title',
            confidence: 'high',
            description: 'Studio + title (stacked keywords)'
        });
        
        // Studio abbreviations
        const studioAbbr = this.getStudioAbbreviation(studio);
        if (studioAbbr) {
            strategies.push({
                query: `"${studioAbbr}" "${title}"`,
                type: 'studio_abbr',
                confidence: 'medium',
                description: `Studio abbreviation + title`
            });
        }
    }
            // Studio + "production" filtered by year
            strategies.push({
                query: `"${studio}" production`,
                type: 'studio_production',
                confidence: 'low',
                description: 'Studio production news'
            });

        
        // These will now properly stack keywords
        strategies.push({
            query: `"${title}" "box office"`,
            type: 'title_box_office',
            confidence: 'medium',
            description: 'Title + box office (stacked)'
        });
        
        strategies.push({
            query: `"${title}" exhibitor`,
            type: 'title_exhibitor',
            confidence: 'medium',
            description: 'Title + exhibitor (stacked)'
        });

        strategies.push({
            query: `"${title}" production filming`,
            type: 'title_production',
            confidence: 'medium',
            description: 'Title + production + filming (3 keywords)'
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
                        query: `"${star}"`,
                        type: 'star_only',
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

    // 5. TEMPORAL SEARCHES - Different time periods - currently turned off
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
                query: `"${variant}"`,
                type: 'ocr_variant',
                confidence: 'low',
                description: `OCR variant: ${variant}`
            });
        });
        
        // Partial title matches (for long titles)
        if (title.split(' ').length > 4) {
            const firstHalf = title.split(' ').slice(0, Math.ceil(title.split(' ').length / 2)).join(' ');
            strategies.push({
                query: `"${firstHalf}"`,
                type: 'partial_title',
                confidence: 'low',
                description: 'First half of title'
            });
        }
        
        return strategies;
    }

    // 7. CONTEXTUAL SEARCHES - Theme/genre based - needs keyword stacking
contextualSearches(film) {
    const strategies = [];
    const title = film.title || film.Title;
    const year = film.year || film.Year;
    const novel = film.novel || film.Novel || film.source || film.Source;
    
    // If it's an adaptation
    if (novel && novel !== title) {
        strategies.push({
            query: `"${novel}" adaptation`,
            type: 'source_adaptation',
            confidence: 'medium',
            description: 'Source novel + adaptation (stacked)'
        });
        
        // Also try novel + film title
        strategies.push({
            query: `"${novel}" "${title}"`,
            type: 'novel_film_title',
            confidence: 'high',
            description: 'Novel title + film title (stacked)'
        });
    }
    
    // Genre-specific with stacking
    const genre = this.inferGenre(title, film);
    if (genre) {
        strategies.push({
            query: `"${title}" ${genre}`,
            type: 'title_genre',
            confidence: 'low',
            description: `Title + ${genre} (stacked)`
        });
    }
        
        
        // Remake searches (for known remakes)
        if (this.isKnownRemake(title)) {
            strategies.push({
                query: `"${title}" remake ${year}`,
                type: 'remake_search',
                confidence: 'low',
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

        // ! configurable
        // TODO expand list of author variations (below)

        // Known author variations
        const knownVariations = {
            'Fannie Hurst': ['Fanny Hurst'],
            'Harriet Comstock': ['Harriet T. Comstock'],
            'Gene Stratton-Porter': ['Gene Stratton Porter', 'Stratton-Porter'],
        };
        
        if (knownVariations[author]) {
            variations.push(...knownVariations[author]);
        }
        
        return variations;
    }
    
    // ! configurable

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
    
    // ! configurable

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
    
    // ! configurable
    inferGenre(title, film) {
        // Simple genre inference from title/metadata
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('love') || titleLower.includes('romance')) return 'romance';
        if (titleLower.includes('murder') || titleLower.includes('death')) return 'mystery';
        if (titleLower.includes('adventures') || titleLower.includes('adventure')) return 'adventure';
        if (film.genre) return film.genre.toLowerCase();
        
        return null;
    }
    
    // ! configurable

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
        
        // Generate strategies (respecting config limits if in corpus mode)
        let strategies = this.strategyGenerator.generateAllStrategies(film);
        
        // Apply corpus limits if configured
        if (this.config.corpus && this.config.corpus.strategiesPerFilm) {
            strategies = strategies.slice(0, this.config.corpus.strategiesPerFilm);
        }
        
        const byConfidence = {
            high: strategies.filter(s => s.confidence === 'high'),
            medium: strategies.filter(s => s.confidence === 'medium'),
            low: strategies.filter(s => s.confidence === 'low')
        };
        
        // Execute strategies based on config stop conditions
        for (const strategy of byConfidence.high) {
            await this.searchWithStrategy(strategy, film);
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            
            if (this.allResults.length >= this.config.search.api.stopConditions.highQualityThreshold) {
                console.log(`   ✨ Found sufficient high-quality coverage, stopping search`);
                break;
            }
        }
        
        if (this.allResults.length < this.config.search.api.stopConditions.minResultsBeforeMedium) {
            for (const strategy of byConfidence.medium) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
                
                if (this.allResults.length >= this.config.search.api.stopConditions.maxResultsPerFilm) {
                    break;
                }
            }
        }
        
        if (this.allResults.length < this.config.search.api.stopConditions.minResultsBeforeMedium) {
            for (const strategy of byConfidence.low.slice(0, 5)) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
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
        console.log(`✨ MAGIC LANTERN v5 - Using profile: ${profileName} ✨\n`);
        
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
            console.log(`   Profile used: ${profileName}`);
            console.log(`   Films processed: ${allResults.length}`);
            console.log(`   Total sources found: ${allResults.reduce((sum, r) => sum + r.totalUniqueSources, 0)}`);
            
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