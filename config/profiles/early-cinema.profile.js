// config/profiles/early-cinema.profile.js
module.exports = {
    name: "Early Cinema (1905-1920)",
    description: "Focused on early film industry formation",
    
    publications: {
        // Prioritize early trade papers
        weights: {
            "moving picture world": 1.5,
            "motography": 1.5,
            "motion picture news": 1.4,
            "variety": 1.2,  // existed but less film-focused early
            "photoplay": 1.2, // fan mag, different perspective
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
            "Early Cinema": 1.5,
        }
    },
    
    searchStrategies: {
        // Maybe disable some modern strategies?
        enabled: {
            starSearches: true,
            studioSearches: true, // but use early studio names
        }
    }
}