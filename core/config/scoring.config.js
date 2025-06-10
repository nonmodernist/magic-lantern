// Context-aware scoring configuration
module.exports.useContextAwareScoring = true; 
module.exports.contextAwareWeights = {
    sourceCredibility: 0.35,
    searchPrecision: 0.25,
    diversity: 0.25,
    lanternRelevance: 0.15
};