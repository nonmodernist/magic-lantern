// Context-aware scoring configuration
module.exports.useContextAwareScoring = true; 
module.exports.contextAwareWeights = {
    sourceCredibility: 0.30,    // was 0.35
    searchPrecision: 0.25,      // same
    diversity: 0.35,            // was 0.25
    lanternRelevance: 0.10      // was 0.15
};