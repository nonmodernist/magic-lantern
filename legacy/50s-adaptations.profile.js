const basePatterns = require('../config/profiles/base-patterns');

module.exports = {
  name: "1950s Literary Adaptations",
  description: "Widescreen era adaptations, regional focus",
  publications: {
    weights: {
      // Still publishing in 1950s
      "motion picture herald": 1.3,
      "variety": 1.4,
      "hollywood reporter": 1.2,
      "film daily": 1.2,
      
      // Regional exhibitor focus (many others ceased)
      "boxoffice": 1.6,             // Strongest regional voice
      "harrisons reports": 1.5,      // Still independent
      "motion picture daily": 1.2,
      
      // Late fan magazines
      "photoplay": 1.3,              // Still running
      "modern screen": 1.2,
      "screenland": 1.1              // Until 1952
    },

    patterns: basePatterns
  },

  searchStrategies: {
    enabled: {
      authorSearches: true,           // Still relevant
      remakeSearches: true            // Many readaptations
    }
  },
  dateRange: { before: 2, after: 2 },
  notes: "Fewer publications but remakes common"
}
