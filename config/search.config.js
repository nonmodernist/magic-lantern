// config/search.config.js
module.exports = {
    strategies: {
    // Control which strategies to use
    enabled: {
        titleVariations: true,
        creatorSearches: true,
        productionSearches: true,
        starSearches: true,
        fuzzySearches: false,  // Maybe disable for speed
        contextualSearches: true
    },
    
    // Confidence thresholds
    dateRanges: {
        high: { before: 1, after: 1 },
        medium: { before: 2, after: 2 },
        low: { before: 3, after: 3 }
    }
},
    
    api: {
        baseUrl: 'https://lantern.mediahist.org',
        rateLimitMs: 200,
        maxResultsPerPage: 20,
    
        // Stop conditions
        stopConditions: {
            maxResultsPerFilm: 50,
            highQualityThreshold: 25,
            minResultsBeforeMedium: 15
        }
    },
    
    fullText: {
        maxFetches: 7,
        minScoreForFetch: 50
    }
};