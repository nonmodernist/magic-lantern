// config/profiles/general-reception.profile.js
const basePatterns = require('./base-patterns');

module.exports = {
    name: "General Reception",
    description: "Focus on reviews and exhibitor reports",

    publications: {
        weights: {
            "variety": 1.0,
            "exhibitors trade review": 1.2,
            "showmens trade review": 1.2,
            "american cinematographer": 1.2,
            "motion picture herald": 1.3,
            "the film daily": 1.0,
            "exhibitors herald": 1.0,
            "moving picture world": 1.0,
            "motion picture reviews": 1.4,
            "photoplay": 1.0,
            "modern screen": 1.0,
            "silver screen": 1.0,
            "screenland": 1.0,
            "motography": 1.0,
            "pressbook": 0.2,

        },

        // patterns are crucial for recognizing publications from their ids
        patterns: basePatterns
    },


    collections: {
        weights: {
        }
    },

    searchStrategies: {
        enabled: {
            titleVariations: false,
            titleSearches: true,
            reviewSearches: true,
            productionSearches: false,
            starSearches: true,
            advertisementSearches: false,
        },

        // No custom weights in default
        weights: {
        // review searches - RUN FIRST
        'title_review': 2.1,
        'title_notices': 2.0,
        'title_comment': 1.8,
        'title_exhibitor': 1.6,
        'title_boxoffice': 1.0,

        // title searches - run last so they don't overwhelm results
        'title_studio': 0.4,
        'exact_title': 0.3,
        'title_no_article': 0.2,
        }
    },

    // Date ranges restrict searches based on year given in csv (usually a film's release year)
    dateRanges: {
        high: { before: 1, after: 1 },
        medium: { before: 1, after: 2 },
        low: { before: 1, after: 3 }
    }
};