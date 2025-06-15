const basePatterns = require('./base-patterns');

module.exports = {
  name: "Regional Reception",
  description: "How films played outside major cities",
  publications: {
    weights: {
      // Explicitly regional publications
      "boxoffice": 1.8,              // Kansas City
      "the exhibitor": 1.6,          // Philadelphia
      "showmens trade review": 1.5,  // Independent focus
      "exhibitors herald": 1.4,      // Chicago origin
      
      // Publications with regional sections
      "motion picture herald": 1.0,   // Had regional reports
      "harrisons reports": 1.5,       // Small-town focus
      
      // Downweight coastal bias
      "variety": 0.8,                // NYC/LA focus
      "hollywood reporter": 0.7,      // LA only
      "motion picture daily": 0.9     // NYC only
    },

        patterns: basePatterns
  },

    searchStrategies: {
        enabled: {
            titleVariations: false,
            titleSearches: true,
            reviewSearches: true,
            productionSearches: false,
            starSearches: true,
            advertisementSearches: false,
        },


        weights: {
        // review searches - RUN FIRST
        'title_reviewed': 2.1,
        'title_notices': 2.0,
        'title_comment': 1.8,
        'title_review':1.7,
        'title_exhibitor': 1.6,
        'title_boxoffice': 1.3,

        // title searches - run last so they don't overwhelm results
        'title_studio': 0.4,
        'exact_title': 0.3,
        'title_no_article': 0.2,
        }
    },

    // Date ranges restrict searches based on year given in csv (usually a film's release year)
    dateRanges: {
        high: { before: 1, after: 1 },
        medium: { before: 1, after: 2 },
        low: { before: 1, after: 3 }
    }

}

