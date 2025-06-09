// config/profiles/adaptation-studies.profile.js
const basePatterns = require('./base-patterns');

module.exports = {
  name: "Literary Adaptations",
  description: "Emphasizes author attribution and source materials",
  
  publications: {
    // Weights for scoring
    weights: {
      "variety": 1.2,
      "moving picture world": 1.5,
      "motion picture herald": 1.3,
      "the film daily": 1.2,
      "exhibitors herald": 1.3,
      "photoplay": 1.5,  
      "modern screen": 1.3,
      "silver screen": 1.2,
      "screenland": 1.1,
      "motography": 1.4,  // Good early coverage
      "motion picture magazine": 1.4,
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
    enabled: {
        titleVariations: true,
        reviewSearches: true,
        adaptationSearches: true,    
        productionSearches: true,
        starSearches: false,
        contextualSearches: true,
        advertisementSearches: false,
    },
    
    weights: {
        // Author/adaptation searches - RUN FIRST
        'author_title': 2.5,
        'novel_film_title': 2.0,
        'author_only': 1.8,
        'source_adaptation': 1.6,
        'author_variant': 1.5, // set variations of an author's name in lib/utils.js
        'lastname_title': 1.4,
        
        // Director
        'director_title': 1.0,
        
        // Title searches - RUN LAST so they don't overwhelm results and keep us from finding the good stuff
        'exact_title': 0.3,
        'title_no_article': 0.2,
        'abbreviated_title': 0.2,
        
        // Skip these for adaptations
        'title_box_office': 0,
        'title_exhibitor': 0
    }
}
};