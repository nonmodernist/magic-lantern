const basePatterns = require('../config/profiles/base-patterns');

module.exports = {
  name: "Studio Era Literary Adaptations",
  description: "Prestige adaptations and regional reception",
  publications: {
    weights: {
      // National trades with literary coverage
      "motion picture herald": 1.4,
      "variety": 1.5,
      "hollywood reporter": 1.2,
      
      // Fan magazines - peak literary discussion
      "photoplay": 1.5,              // Peak influence, literary focus
      "modern screen": 1.3,
      "silver screen": 1.2,
      "new movie magazine": 1.4,     // 1929-1935, huge circulation
      
      // Regional/exhibitor perspective
      "boxoffice": 1.5,              // Kansas City, heartland view
      "showmens trade review": 1.4,  // Independent exhibitors
      "harrisons reports": 1.4,      // Unbiased, mentioned sources
      "independent exhibitors film bulletin": 1.3
    },
    
    patterns: basePatterns
  },
  searchStrategies: {
    weights: {
      "author_title": 1.8,
      "novel_film_title": 1.7,      // Often mentioned both titles
      "source_adaptation": 1.6,
      "studio_title": 1.3           // Prestige pictures
    }
  },

  dateRanges: {
    high: { before: 2, after: 1 },
    medium: { before: 2, after: 1 },
    low: { before: 3, after: 2 }  // Maybe slightly wider for low confidence
  },

<<<<<<< HEAD:config/profiles/studio-era-adaptations.profile.js
    reports: {
        generateMarkdown: true,      // Generate reports at all
        createSubfolders: true,      // Put individual films in subfolder
        includeComparative: true,    // Generate comparative analysis
        includeSummary: true,        // Generate executive summary
        
        // Control what goes in reports
        sections: {
            treasures: true,
            contentBreakdown: true,
            researchNotes: true,
            nextSteps: true          // Add from legacy version
        }
    },

  contentPriorities: ["review", "advertisement", "production"],
=======
>>>>>>> main:legacy/studio-era-adaptations.profile.js
  notes: "Peak of prestige adaptations - Gone with the Wind era"
}