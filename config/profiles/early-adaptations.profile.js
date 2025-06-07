const basePatterns = require('./base-patterns');

module.exports =
{
  name: "Early Literary Adaptations",
  description: "Silent era adaptations with author emphasis",
  publications: {
    weights: {
      // Trade papers that covered literary sources
      "moving picture world": 1.5,    // Best for production announcements
      "motion picture news": 1.4,     // Good for independent productions
      "exhibitors herald": 1.3,       // Regional exhibitor perspective
      "motography": 1.3,              // Technical but covered sources
      "motion picture magazine": 1.4,  // Early fan mag, discussed sources
      "photoplay": 1.3,               // Started 1916, literary focus
      "variety": 1.1,                 // Less film-focused early

      // Regional voices
      "exhibitors trade review": 1.2,
      "the exhibitor": 1.2,           // Philadelphia perspective
      "reel life": 1.1                // Mutual films
    },

    // MUST include patterns for extractPublication to work!
    patterns: basePatterns
  },
  searchStrategies: {
    weights: {
      "author_title": 2.0,            // Highest priority
      "author_only": 1.8,             // Authors were celebrities
      "title_only": 1.5,              // Titles often abbreviated
      "abbreviated_title": 1.6        // Common in silent era
    }
  },
  dateRange: { before: 3, after: 2 }, // Wider range for silent era
  notes: "Authors like Gene Stratton-Porter were major draws"
}