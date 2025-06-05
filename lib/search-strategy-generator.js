// lib/search-strategy-generator.js
const utils = require('./utils');

// SearchStrategyGenerator
class SearchStrategyGenerator {
    constructor() {
        this.articles = ['The', 'A', 'An'];
        this.commonWords = ['of', 'and', 'in', 'at', 'to', 'for', 'with', 'on', 'the'];
    }

    abbreviateTitle(title) {
        return utils.abbreviateTitle(title, this.commonWords);
    }

    extractKeyword(title) {
    return utils.extractKeyword(title, this.commonWords, this.articles);
}

getAuthorVariations(author) {
    return utils.getAuthorVariations(author);
}

getStudioAbbreviation(studio) {
    return utils.getStudioAbbreviation(studio);
}

getKnownStars(title) {
    return utils.getKnownStars(title);
}

generateOCRVariants(title) {
    return utils.generateOCRVariants(title);
}

inferGenre(title, film) {
    return utils.inferGenre(title, film);
}

isKnownRemake(title) {
    return utils.isKnownRemake(title);
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
            confidence: 'high', // keep confidence high to restrict date range
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
    const studio = film.studio || film.Studio; 

    
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
    
    // Labor-specific searches (if profile includes labor keywords)
    if (this.strategyWeights && this.strategyWeights['title_strike']) {
    strategies.push({
        query: `"${title}" picketing`,
        type: 'title_strike',
        confidence: 'high',
        description: 'Film title + picketing'
    });

        strategies.push({
        query: `"${title}" "work stoppage"`,
        type: 'title_work_stoppage',
        confidence: 'high',
        description: 'Film title + work stoppage'
    });
    
    strategies.push({
        query: `"${title}" "picket line"`,
        type: 'title_picket_line',
        confidence: 'medium',
        description: 'Film title + picket line'
    });
}

    // Studio labor relations
    if (studio && studio !== '-' && this.strategyWeights && this.strategyWeights['studio_labor']) {
        strategies.push({
            query: `"${studio}" strike`,
            type: 'studio_strike',
            confidence: 'medium',
            description: 'Studio + strike'
        });
        
        strategies.push({
            query: `"${studio}" labor`,
            type: 'studio_labor',
            confidence: 'medium',
            description: 'Studio + labor'
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

module.exports = SearchStrategyGenerator;
