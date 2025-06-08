// config/profiles/early-cinema.profile.js

const basePatterns = require('./base-patterns');

module.exports = {
    name: "Early Cinema (1905-1920)",
    description: "Focused on early film industry formation",
    
    publications: {
        // Prioritize early trade papers
        weights: {
            "moving picture world": 1.5,
            "reel life": 1.8, // mutual film company
            "motion picture story magazine": 1.5,
            "cinemundial": 1.6,
            "motography": 1.5,
            "wids": 1.5,
            "the film daily": 1.3,
            "motion picture news": 1.4,
            "exhibitors herald": 1.5,
            "the new york clipper": 1.3,
            "exhibitors trade review": 1.5,
            "picture play": 1.5,
            "variety": 1.2,  // existed but less film-focused early
            "photoplay": 1.2, // fan mag, different perspective
        },

    patterns: basePatterns
    },
    
    collections: {
        weights: {
            "Early Cinema": 1.5,
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
    },

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
    }
}