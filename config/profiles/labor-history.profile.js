const basePatterns = require("./base-patterns");

// config/profiles/labor-history.profile.js
module.exports = {
  name: "Film Industry Labor History",
  description: "Captures the labor environment and industrial relations during film production periods",
  
  publications: {
    weights: {
      // Trade papers with good labor coverage
      "variety": 1.5,                   // Covered strikes extensively
      "the exhibitor": 1.4,
      "motion picture daily": 1.3,
      "hollywood reporter": 1.3,        // Industry perspective
      "the film daily": 1.2,
      "wids": 1.2,
      "motion picture herald": 1.3,
      "moving picture world": 1.2,
      
      // Technical/craft publications 
      "american cinematographer": 1.8,  // Craft perspective
      "motography": 1.4,               // Technical workers
      
      // Exhibitor papers (often pro-worker)
      "harrisons reports": 1.6,
      "independent exhibitors film bulletin": 1.6,
      "showmens trade review": 1.4,
      "boxoffice": 1.3,
      
      // Downweight fan magazines
      "photoplay": 0.5,
      "modern screen": 0.4,
      "screenland": 0.4
    },
    
    patterns: basePatterns
  },
  
  collections: {
    weights: {
      "Hollywood Studio System": 1.2,  // Where labor news lives
      "Early Cinema": 0.9,
      "Fan Magazines": 0.5,           // Rarely discussed strikes
      "Broadcasting & Recorded Sound": 0.7
    }
  },
  
searchStrategies: {
    enabled: {
        titleVariations: false,
        creatorSearches: false,    // Completely disable author searches
        productionSearches: true,
        starSearches: false,
        contextualSearches: true
    },
    
    // Profile-specific weights (0 = skip, higher = run first)
    weights: {
        // Labor-specific searches - RUN FIRST
        "title_strike": 2.0, // this runs "title + picketed"
        "title_work_stoppage": 2.0,
        "title_picket_line": 2.0,
        "title_walkout": 2.0,
        "studio_strike": 1.8,
        "studio_labor": 1.7,
        "studio_boycott": 1.5,
        "studio_strike_2": 1.5,
        
        // Production searches - useful for labor context?
        "title_production": 1.2,
        "studio_production": 1.1,
        
        // Title variations - RUN LAST
        "exact_title": 0.3,
        "title_no_article": 0.3,
        "abbreviated_title": 0.2,
        "title_only": 0.1,
        
        // Skip entirely
        "possessive_title": 0,
        "keyword_film": 0
    }
},
  
  // Wider date range - strikes could happen before/after release
  dateRange: { 
    before: 3, 
    after: 2 
  },
  
  // Content priorities completely different
  contentPriorities: ["strike", "wage_dispute", "union_activity", "production_delay"],
  
  // Keywords for full-text analysis
  searchFeatures: {
    textPatterns: [
      // Labor actions
      "strike", "walkout", "picket line", "work stoppage",
      "labor dispute", "union", "guild", "picketing",
      
      // Organizations
      "IATSE", "Screen Actors Guild", "SAG",
      "Writers Guild", "Directors Guild",
      
      // Labor conditions
      "wages", "overtime", "hours", "conditions",
      "contract", "negotiation", "grievance",
      
      // Production impact
      "production halted", "delayed by strike",
      "shut down", "suspended production"
    ]
  },
  
  // Custom note for researchers
notes: "This profile captures the broader labor context during a film's production period rather than film-specific labor incidents. For researching specific strikes on individual films, consider using targeted searches directly in Lantern. Best used for understanding the industrial relations climate that shaped production conditions."
}