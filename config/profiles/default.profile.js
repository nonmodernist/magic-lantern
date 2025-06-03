// config/profiles/default.profile.js
const basePatterns = require('./base-patterns');


module.exports = {
  name: "Default",
  description: "Standard Magic Lantern configuration",
  
  // Move publication weights from scoring.config.js
  publications: {
    weights: {
      // Trade papers - highest value
      "variety": 1.0,
      "motion picture world": 1.3,
      "motion picture herald": 1.0,
      "film daily": 1.0,
      "exhibitors herald": 1.0,
      "moving picture world": 1.3,
      
      // Fan magazines - good but different audience
      "photoplay": 1.2,
      "modern screen": 1.0,
      "silver screen": 1.0,
      "screenland": 0.9,
      
      // Specialized/rare
      "motography": 1.5,
      
      // Lower priority
      "fan scrapbook": 0.7 // is this anything?
    },
    
    // Move patterns from scoring.config.js
    patterns: basePatterns
  },
  
  // Move collection weights from scoring.config.js
  collections: {
    weights: {
      "Hollywood Studio System": 1.0,
      "Early Cinema": 1.0,
      "Fan Magazines": 0.8,
      "Broadcasting & Recorded Sound": 0.8,
      "Theatre and Vaudeville": 0.8,
      "Year Book": 0.7
    }
  },
  
  // Move from search.config.js
  searchStrategies: {
    enabled: {
      titleVariations: true,
      creatorSearches: true,
      productionSearches: true,
      starSearches: true,
      fuzzySearches: false,
      contextualSearches: true
    },
    
    // No custom weights in default
    weights: {}
  },
  
  // Date ranges from search.config.js
  dateRanges: {
    high: { before: 1, after: 1 },
    medium: { before: 2, after: 2 },
    low: { before: 3, after: 3 }
  }
};