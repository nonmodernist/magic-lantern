#!/usr/bin/env node

// magic-lantern-v4.js - Combines multi-strategy search with basic full text analysis
const fs = require('fs');
const path = require('path');
const https = require('https');

// Import the SearchStrategyGenerator from v3
class SearchStrategyGenerator {
    constructor() {
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
            ...this.fuzzySearches(film),
            ...this.contextualSearches(film)
        ];

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


    // // DONE implement multiple keyword searches using Lantern's search url formatting - keyword, then second keyword, then third keyword - will return fewer more precise results
    // e.g. "https://lantern.mediahist.org/catalog?f%5Bcollection%5D%5B%5D=Early+Cinema&f%5Bcollection%5D%5B%5D=Hollywood+Studio+System&f%5Bcollection%5D%5B%5D=Fan+Magazines&range%5Byear%5D%5Bbegin%5D=1915&range%5Byear%5D%5Bend%5D=1919&op=AND&keyword=%22amarilly+of+clothesline+alley%22&second_keyword=%22mary+pickford%22&third_keyword=&title=&Author=&subject=&date_text=&publisher=&description=&sort=score+desc%2C+dateStart+desc%2C+title+asc&search_field=advanced&commit=Search"

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
            // TODO expand list of author variations
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
        
        // Known author variations
        const knownVariations = {
            'Fannie Hurst': ['Fanny Hurst'],
            'Gene Stratton-Porter': ['Gene Stratton Porter', 'Stratton-Porter'],
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

class UnifiedMagicLantern {
    constructor() {
        this.baseUrl = 'https://lantern.mediahist.org';
        this.rateLimitDelay = 200;
        this.strategyGenerator = new SearchStrategyGenerator();
        this.allResults = [];
        this.seenIds = new Set();
        
        // Content patterns from v1 for full text analysis
        this.contentPatterns = {
            review: /\b(review|reviewed|critique|criticism|notices?)\b/i,
            production: /\b(production|producing|filming|started|completed|announced)\b/i,
            boxOffice: /\b(gross|box[\s-]?office|earnings|receipts|revenue|record)\b/i,
            advertisement: /\b(cuts and mats|now showing|coming|opens|playing|at the|theatre|theater)\b/i,
            photo: /\b(photograph|photo|picture|scene from|production still)\b/i,
            interview: /\b(interview|talks about|discusses|says)\b/i
        };

            // Scoring configuration
    this.scoringConfig = {
        maxFullTextFetches: 7,
        collectionWeights: {
            "Fan Magazines": 0.8,
            "Hollywood Studio System": 1.0,
            "Early Cinema": 1.0,
            "Broadcasting & Recorded Sound": 1.0,
            "Theatre and Vaudeville": 0.8,
            "Year Book": 0.7
        },
        publicationWeights: {
            "variety": 1.0,
            "motion picture world": 1.3,
            "photoplay": 1.2,
            "motion picture herald": 1.0,
            "film daily": 1.0,
            "exhibitors herald": 1.0,
            "moving picture world": 1.3,
            "motography": 1.5,
            "modern screen": 1.0,
            "silver screen": 1.0
        }
    };
}

// New method: Calculate position-based score
getPositionScore(position) {
    // Give high scores to top positions, declining gradually
    if (position <= 5) return 100 - (position - 1) * 5;  // 100, 95, 90, 85, 80
    if (position <= 10) return 75 - (position - 6) * 5;  // 75, 70, 65, 60, 55
    if (position <= 20) return 50 - (position - 11) * 2; // 50, 48, 46...
    return Math.max(10, 30 - (position - 21));           // Minimum score of 10
}

// New method: Extract publication from item ID
extractPublication(itemId) {
    // Handle various ID patterns
    const id = itemId.toLowerCase();

    // Debug logging
    console.log(`   Extracting from ID: ${id}`);

    // Updated patterns based on actual IDs
    const patterns = {
        'new movie magazine': /newmoviemag/,
        'photoplay': /photo(?!play)/,  // photo but not photoplay
        'picture play': /pictureplay/,
        'motion picture world': /motionpicture?wor|mopicwor/,
        'moving picture world': /movingpicture|movpict/,
        'motion picture herald': /motionpictureher/,
        'variety': /variety/,
        'film daily': /filmdaily/,
        'exhibitors herald': /exhibher|exhibitorsh/,
        'modern screen': /modernscreen/,
        'motography': /motography/,
        'movie mirror': /moviemirror/,
        'silver screen': /silverscreen/,
        'screenland': /screenland/,
        'motion picture news': /motionpicturenew/,
        'fan scrapbook': /fanscrapbook/,
        'hollywood reporter': /hollywoodreport/,
        'box office': /boxoffice/,
        'independent': /independ/,
        'wids': /wids/,
        'paramount press': /paramountpress|artcraftpress/,
        'universal weekly': /universalweekly/
    };

    // Check patterns in order (most specific first)
    for (const [pub, pattern] of Object.entries(patterns)) {
        if (pattern.test(id)) {
            return pub;
        }
    }
    
    return null;
}


// New method: Score and rank all results
scoreAndRankResults() {
    console.log('\n📊 Scoring and ranking results...');

        // Debug first result
    if (this.allResults.length > 0) {
        console.log('\n🔍 Debug first result structure:');
        console.log('ID:', this.allResults[0].id);
        console.log('Attributes keys:', Object.keys(this.allResults[0].attributes || {}));
    }
    
// Score each result
    this.allResults = this.allResults.map((result, index) => {
        // 1. Base score from Lantern position
        const positionScore = this.getPositionScore(index + 1);
        
        // 2. Collection weight - we'll apply this AFTER full text fetch
        // For now, just use 1.0
        const collectionWeight = 1.0;
        
        // 3. Publication weight
        const publication = this.extractPublication(result.id);
        const publicationWeight = publication ? 
            (this.scoringConfig.publicationWeights[publication] || 1.0) : 1.0;
        
        // Calculate final score
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
    
    // Re-sort by final score
    this.allResults.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);
    
    // Show top 5 for verification
    console.log('\n🏆 Top 5 scored results:');
    this.allResults.slice(0, 5).forEach((result, i) => {
        const s = result.scoring;
        console.log(`${i + 1}. [Score: ${s.finalScore.toFixed(1)}] ${s.publication}`);
        console.log(`   Position: ${s.position} (${s.positionScore}) × ` +
                    `Publication: ${s.publicationWeight}`);
        console.log(`   ID: ${result.id}`);
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

    // Search method from v3 with date filtering
    async searchWithStrategy(strategy, film) {

        // Parse the strategy query to extract multiple keywords
        const keywords = this.parseStrategyKeywords(strategy, film);

    // Build advanced search parameters
        const params = new URLSearchParams({
            search_field: 'advanced',
            commit: 'Search',
            sort: 'score desc, dateStart desc, title asc',
            op: 'AND',  // AND operator for all keywords
            per_page: '20'  // can adjust based on research needs
    });

        // Add the keywords (up to 3 supported by Lantern)
        if (keywords.keyword) params.append('keyword', keywords.keyword);
        if (keywords.second_keyword) params.append('second_keyword', keywords.second_keyword);
        if (keywords.third_keyword) params.append('third_keyword', keywords.third_keyword);


        // Add format filter
        params.append('f_inclusive[format][]', 'Periodicals');
    
        // Add collection filters
        const collections = ['Fan Magazines', 'Hollywood Studio System', 'Early Cinema'];
        collections.forEach(collection => {
            params.append('f_inclusive[collection][]', collection);
        });

        // Date range filtering based on confidence
        const year = parseInt(film.year || film.Year);
        if (year) {
            const ranges = {
                'high': { begin: year - 1, end: year + 1 },
                'medium': { begin: year - 2, end: year + 2 },
                'low': { begin: year - 3, end: year + 3 }
            };
            
            const range = ranges[strategy.confidence];
            if (range) {
                params.append('range[year][begin]', range.begin);
                params.append('range[year][end]', range.end);
            }
        }
        
        const url = `${this.baseUrl}/catalog.json?${params}`;
        
        console.log(`\n🔍 [${strategy.confidence.toUpperCase()}] ${strategy.description}`);
        console.log(`   Keywords: ${keywords.keyword}${keywords.second_keyword ? ' + ' + keywords.second_keyword : ''}${keywords.third_keyword ? ' + ' + keywords.third_keyword : ''}`);
    
        
        try {
            // Note: We need to use catalog.json endpoint
            const jsonUrl = url.replace('/catalog?', '/catalog.json?');
            const results = await this.makeRequest(jsonUrl);
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

    // Add this new helper method to parse keywords from strategies
parseStrategyKeywords(strategy, film) {
    const keywords = {};
    
    // Extract quoted phrases and keywords from the query
    const quotedPhrases = strategy.query.match(/"[^"]+"/g) || [];
    const remainingText = strategy.query.replace(/"[^"]+"/g, '').trim();
    const unquotedWords = remainingText.split(/\s+/).filter(w => w.length > 0);
    
    // Build keywords based on strategy type
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

// And update the full text fetch to include collection scoring
async fetchFullPageText(pageId) {
    const url = `${this.baseUrl}/catalog/${pageId}/raw.json`;
    console.log(`   📄 Fetching full text for: ${pageId}`);
    
    try {
        const pageData = await this.makeRequest(url);
        
        // Now we have collection data!
        const collections = pageData.collection || [];
        
        // Calculate collection weight
        let collectionWeight = 1.0;
        for (const collection of collections) {
            const weight = this.scoringConfig.collectionWeights[collection] || 1.0;
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
            collection: collections,  // Include the collections
            collectionWeight: collectionWeight,  // Include the weight
            iaPage: pageData.iaPage,
            readUrl: pageData.read,
            wordCount: (pageData.body || '').split(/\s+/).length
        };
    } catch (error) {
        console.error(`   ❌ Failed to fetch full text for ${pageId}`);
        return null;
    }
}

    // Content analysis from v1
    identifyContentTypes(text) {
        const types = [];
        
        for (const [type, pattern] of Object.entries(this.contentPatterns)) {
            if (pattern.test(text)) {
                types.push(type);
            }
        }
        
        return types.length > 0 ? types : ['mention'];
    }

    checkForPhoto(text) {
        const photoIndicators = [
            'scene from', 'production still', 'photograph',
            'pictured above', 'shown here', 'exclusive photo',
            'production cuts', 'mats'
        ];
        
        const lowerText = text.toLowerCase();
        return photoIndicators.some(indicator => lowerText.includes(indicator));
    }

    // Combined comprehensive search
    async comprehensiveSearch(film) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🎭 COMPREHENSIVE TREASURE HUNT: ${film.title || film.Title} (${film.year || film.Year})`);
        console.log(`${'='.repeat(70)}`);
        
        // Reset for new film
        this.allResults = [];
        this.seenIds = new Set();
        
        // Generate and execute strategies
        const strategies = this.strategyGenerator.generateAllStrategies(film);
        const byConfidence = {
            high: strategies.filter(s => s.confidence === 'high'),
            medium: strategies.filter(s => s.confidence === 'medium'),
            low: strategies.filter(s => s.confidence === 'low')
        };
        
        // Execute high confidence strategies first
        for (const strategy of byConfidence.high) {
            await this.searchWithStrategy(strategy, film);
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
        
        // Continue with medium if needed
        if (this.allResults.length < 25) {
            for (const strategy of byConfidence.medium) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        
        // Low confidence if really needed
        if (this.allResults.length < 15) {
            for (const strategy of byConfidence.low.slice(0, 5)) {
                await this.searchWithStrategy(strategy, film);
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
        }
        
        // Sort all results by relevance score

// After all searches complete, score and rank
    this.scoreAndRankResults();
    
    // Fetch full text for TOP scored results (not just first N)
    console.log(`\n📚 Fetching full text for top ${this.scoringConfig.maxFullTextFetches} results...`);
    const fullTextResults = [];
    
    const topResults = this.allResults.slice(0, this.scoringConfig.maxFullTextFetches);
    
    for (let i = 0; i < topResults.length; i++) {
        const result = topResults[i];
        
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
        
        const fullPageData = await this.fetchFullPageText(result.id);
        
        if (fullPageData) {
            // Add all the metadata
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

    async run(filePath) {
        console.log('✨ MAGIC LANTERN UNIFIED - Multi-Strategy Search + Full Text Analysis ✨\n');
        console.log('Combines comprehensive search strategies with deep text analysis\n');
        
        try {
            const films = await this.loadFilms(filePath);
            
            console.log('🧪 Testing with first film...\n');
            const results = await this.comprehensiveSearch(films[0]);
            
            // Save two separate JSON files
            
            // 1. All search results (v3 style)
            const searchResultsData = {
                film: results.film,
                totalUniqueSources: results.totalUniqueSources,
                searchStrategySummary: this.summarizeStrategies(results.allSearchResults),
                sources: results.allSearchResults
            };
            fs.writeFileSync('comprehensive-search-results.json', 
                JSON.stringify(searchResultsData, null, 2));
            
            // 2. Full text analysis of top 7 (v1 style)
            const fullTextData = {
                film: results.film,
                searchQuery: `Multiple strategies (${results.totalUniqueSources} total found)`,
                totalFound: results.totalUniqueSources,
                fullTextAnalyzed: results.fullTextAnalysis.length,
                treasures: results.fullTextAnalysis
            };
            fs.writeFileSync('full-text-results.json', 
                JSON.stringify(fullTextData, null, 2));
            
            console.log('\n💾 Results saved:');
            console.log('   - comprehensive-search-results.json (all search results)');
            console.log('   - full-text-results.json (top 7 with full text)');
            
            console.log('\n🎉 Search complete!');
            console.log(`   Total sources found: ${results.totalUniqueSources}`);
            console.log(`   Full text analyzed: ${results.fullTextAnalysis.length}`);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            console.error(error.stack);
        }
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
    const filePath = process.argv[2] || 'films.csv';
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nUsage: node magic-lantern-unified.js [path-to-csv]');
        process.exit(1);
    }
    
    const lantern = new UnifiedMagicLantern();
    lantern.run(filePath);
}

module.exports = UnifiedMagicLantern;