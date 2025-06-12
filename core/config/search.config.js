// config/search.config.js
module.exports = {

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
    
    // REMOVED: fullText section
    // Full text fetching is now a user-initiated feature - see `tools/fetch-full-text.js' and related documentation
};