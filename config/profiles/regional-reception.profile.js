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

}

