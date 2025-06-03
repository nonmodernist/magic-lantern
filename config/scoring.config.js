// config/scoring.config.js
module.exports = {
  publications: {
    weights: {
      // Trade papers - highest value
      "variety": 1.0,
      "motion picture world": 1.3,
      "motion picture herald": 1.0,
      "film daily": 1.0,
      "exhibitors herald": 1.0,
      "moving picture world": 1.3,
      
      // Fan magazines - good but different audience
      "photoplay": 1.2,
      "modern screen": 1.0,
      "silver screen": 1.0,
      "screenland": 0.9,
      
      // Specialized/rare
      "motography": 1.5,  // Early technical journal
      // "wids": 1.1,        // Women in film focus
      
      // Lower priority
      "fan scrapbook": 0.7
    },
    
    // Pattern matching for publication extraction
    patterns: {
        'new movie magazine': /newmoviemag/,
        'photoplay': /photo(?!play)/,  // photo but not photoplay
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
      "Early Cinema": 1.0,
      "Fan Magazines": 0.8,
      "Broadcasting & Recorded Sound": 0.8,
      "Theatre and Vaudeville": 0.8,
      "Year Book": 0.7
    }
  },
  
  contentTypes: {
    scores: {
      review: 10,
      productionPhoto: 9,
      boxOfficeData: 8,
      interview: 7,
      productionNews: 6,
      advertisement: 5,
      tradeMention: 3,
      mention: 1
    }
  }
};