// config/profiles/adaptation-studies.profile.js
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
    }
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