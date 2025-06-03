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
    }
  },

    patterns: {
      'new movie magazine': /newmoviemag/,
      'photoplay': /photo(?!play)/,
      'picture play': /pictureplay/,
      'motion picture world': /motionpicture?wor|mopicwor/,
      'moving picture world': /movingpicture|movpict/,
      'motion picture herald': /motionpictureher/,
      'variety': /variety/,
      'film daily': /filmdaily/,
      'exhibitors herald': /exhibher|exhibitorsh/,
      'modern screen': /modernscreen/,
      'motography': /motography/,
      'movie mirror': /moviemirror/,
      'silver screen': /silverscreen/,
      'screenland': /screenland/,
      'motion picture news': /motionpicturenew/,
      'fan scrapbook': /fanscrapbook/,
      'hollywood reporter': /hollywoodreport/,
      'box office': /boxoffice/,
      'independent': /independ/,
      'wids': /wids/,
      'paramount press': /paramountpress|artcraftpress/,
      'universal weekly': /universalweekly/
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
