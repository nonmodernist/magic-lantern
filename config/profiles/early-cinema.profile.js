// config/profiles/early-cinema.profile.js

const basePatterns = require('./base-patterns');

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
            starSearches: true,
            studioSearches: true, // but use early studio names
        }
    }
}