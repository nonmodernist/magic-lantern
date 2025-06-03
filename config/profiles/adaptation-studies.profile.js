// config/profiles/adaptation-studies.profile.js
const basePatterns = require('./base-patterns');


module.exports = {
  name: "Literary Adaptations",
  description: "Emphasizes author attribution and source materials",
  
  publications: {
    // Weights for scoring
    weights: {
      "variety": 1.2,
      "motion picture world": 1.5,  // Great for early adaptations
      "moving picture world": 1.5,
      "motion picture herald": 1.3,
      "film daily": 1.2,
      "exhibitors herald": 1.3,
      "photoplay": 1.5,  // Often discussed literary sources
      "modern screen": 1.3,
      "silver screen": 1.2,
      "screenland": 1.1,
      "motography": 1.4,  // Good early coverage
      "motion picture magazine": 1.4,
      "fan scrapbook": 0.6
    },
    
    // MUST include patterns for extractPublication to work!
    patterns: basePatterns
  },
  
  collections: {
    weights: {
      "Hollywood Studio System": 1.0,
      "Early Cinema": 1.1,  // Many early adaptations
      "Fan Magazines": 0.9,
      "Broadcasting & Recorded Sound": 0.7,
      "Theatre and Vaudeville": 0.8,
      "Year Book": 0.7
    }
  },
  
  searchStrategies: {
    weights: {
      'author_title': 2.0,
      'author_only': 1.8,
      'source_adaptation': 1.6,
      'novel_film_title': 1.5
    }
  }
};