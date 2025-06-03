module.exports = {
  name: "Regional Literary Reception",
  description: "How adaptations played outside major cities",
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
    }
  },
  contentPriorities: ["box_office", "review", "advertisement"],
  searchFeatures: {
    // Look for these in full text
    textPatterns: [
      "small town", "rural", "neighborhood", 
      "played well in", "midwest", "south"
    ]
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


}

