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
            "new york clipper": 1.3,
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
        }
    }
}