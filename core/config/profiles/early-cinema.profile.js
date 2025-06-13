// config/profiles/early-cinema.profile.js

const basePatterns = require('./base-patterns');

module.exports = {
    name: "Early Cinema (1905-1920)",
    description: "Comprehensive early film industry coverage showcasing global perspectives",
    
    publications: {
        // Diverse publication weights showcasing ML's scoring capabilities
        weights: {
            // US Trade Papers - Core coverage
            "moving picture world": 1.7,        
            "motography": 1.7,                  
            "motion picture news": 1.6,         
            "exhibitors herald": 1.5,           
            "wids": 1.5,                        
            "exhibitors trade review": 1.5,
            "billboard": 1.5,

            // Studio Publications
            "reel life": 1.8,
            "universal weekly": 1.8,                   
            
            // Fan/Popular Magazines
            "motion picture story magazine": 1.6,
            "photoplay": 1.4,                   
            "picture play": 1.5,                
            "picture-play magazine": 1.5,       
            
            // International Perspectives
            "the bioscope": 1.8,                
            "canadian moving picture digest": 1.7,
            "cinemundial": 1.6,                 
            "cine-journal": 1.7,                
            "der kinematograph": 1.7,           
            
            // General Entertainment
            "variety": 1.2,                     
            "the new york clipper": 1.3,            
            "the film daily": 1.3,              
            "show world": 1.4,  
        },

    patterns: basePatterns
    },
    
    collections: {
        weights: {
            "Early Cinema": 1.8,                
            "Hollywood Studio System": 1.2,     
            "Theatre and Vaudeville": 1.3,      
            "Fan Magazines": 1.2,    
        }
    },
    
    searchStrategies: {
        // Maybe disable some modern strategies?
        enabled: {
            starSearches: true, // need to set some early film stars
            studioSearches: true, // but use early studio names
            earlySearches: true,
        },

        weights: {
            'exact_title': 1.5,
            'title_no_article': 1.1,
            'studio_production': 0.7,     // too broad
            'studio_title': 1.4,
            'director_title': 1,        // Less important early
            'title_production': 1.4,      // Good for this era
            'title_exhibitor': 1.2,       // Exhibition important
            'title_box_office': 0.8,      // Less relevant early
        }
    },

    // future functionality
    reports: {
        generateMarkdown: true,      // Generate reports at all
        createSubfolders: true,      // Put individual films in subfolder
        includeComparative: true,    // Generate comparative analysis
        includeSummary: true,        // Generate executive summary
        
        // Control what goes in reports
        sections: {
            contentBreakdown: true,
            researchNotes: true,
            nextSteps: true          // Add from legacy version
        }
    }
}