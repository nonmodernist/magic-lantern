// config/profiles/default.profile.js
const basePatterns = require('./base-patterns');

module.exports = {
  name: "Default",
  description: "Standard Magic Lantern configuration",
  
  publications: {
    weights: {
      // sample publications, all scored the same for default
      "variety": 1.0,
      "motion picture herald": 1.0,
      "the film daily": 1.0,
      "exhibitors herald": 1.0,
      "moving picture world": 1.0,
      "photoplay": 1.0,
      "modern screen": 1.0,
      "silver screen": 1.0,
      "screenland": 1.0,
      "motography": 1.0,
      
    },
    
    // patterns are crucial for recognizing publications from their ids
    patterns: basePatterns
  },
  
  // sample collections weighted evenly for default
  collections: {
    weights: {
      "Hollywood Studio System": 1.0,
      "Early Cinema": 1.0,
      "Fan Magazines": 1.0,
      "Broadcasting & Recorded Sound": 1.0,
      "Theatre and Vaudeville": 1.0,
      "Year Book": 1.0
    }
  },
  
  searchStrategies: {
    enabled: {
      titleVariations: true,
      reviewSearches: true,
      productionSearches: true,
      starSearches: true,
      fuzzySearches: false, // currently turned off for performance optimization
      contextualSearches: true
    },
    
    // No custom weights in default
    weights: {}
  },
  
  // Date ranges restrict searches based on year given in csv (usually a film's release year)
  dateRanges: {
    high: { before: 1, after: 1 },
    medium: { before: 2, after: 2 },
    low: { before: 3, after: 3 }
  }
};