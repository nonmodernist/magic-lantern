// film-industry-lexicon.js
// Comprehensive lexicon for film industry terminology and NLP patterns

module.exports = {
    // People recognition patterns
    people: {
        // Common first names in film history
        firstNames: {
            'Victor': 'FirstName',
            'George': 'FirstName',
            'Mervyn': 'FirstName',
            'Jack': 'FirstName',
            'Ray': 'FirstName',
            'Bert': 'FirstName',
            'Judy': 'FirstName',
            'Harold': 'FirstName',
            'William': 'FirstName',
            'David': 'FirstName',
            'Frank': 'FirstName',
            'Alfred': 'FirstName',
            'John': 'FirstName',
            'Louis': 'FirstName',
            'Samuel': 'FirstName',
            'Cecil': 'FirstName',
            'Irving': 'FirstName',
            'Darryl': 'FirstName',
            'Harry': 'FirstName'
        },
        
        // Common last names
        lastNames: {
            'Fleming': 'LastName',
            'Cukor': 'LastName',
            'LeRoy': 'LastName',
            'Garland': 'LastName',
            'Bolger': 'LastName',
            'Lahr': 'LastName',
            'Haley': 'LastName',
            'Rosson': 'LastName',
            'Mayer': 'LastName',
            'Goldwyn': 'LastName',
            'Warner': 'LastName',
            'Zanuck': 'LastName',
            'Selznick': 'LastName',
            'Hitchcock': 'LastName',
            'Ford': 'LastName',
            'Hawks': 'LastName',
            'Capra': 'LastName',
            'Wilder': 'LastName',
            'Huston': 'LastName'
        },
        
        // Role indicators
        roles: {
            'director': ['directed', 'helmed', 'megaphoned', 'directed by', 'helmed by', 'megaphoned by', 'director'],
            'producer': ['produced', 'produced by', 'producer', 'production by'],
            'actor': ['stars', 'stars as', 'toplines', 'toplines as', 'plays', 'playing', 'with', 'featuring', 'starred'],
            'writer': ['written by', 'screenplay by', 'scripted by', 'adapted by', 'scenarist'],
            'cinematographer': ['lensed by', 'cinematography by', 'photographed by', 'shot by'],
            'composer': ['music by', 'score by', 'composed by'],
            'editor': ['edited by', 'cut by', 'editing by']
        }
    },
    
    // Organizations
    organizations: {
        studios: {
            'MGM': 'Studio',
            'M-G-M': 'Studio',
            'Metro': 'Studio',
            'Metro-Goldwyn-Mayer': 'Studio',
            'RKO': 'Studio',
            'Paramount': 'Studio',
            'Warner Bros': 'Studio',
            'Warner Brothers': 'Studio',
            'Columbia': 'Studio',
            'Universal': 'Studio',
            '20th Century Fox': 'Studio',
            'Republic': 'Studio',
            'United Artists': 'Studio',
            'Disney': 'Studio',
            'Selznick International': 'Studio'
        },
        
        theaters: {
            'Capitol': 'Theater',
            'Radio City': 'Theater',
            'Grauman\'s Chinese': 'Theater',
            'Roxy': 'Theater',
            'Loew\'s': 'Theater',
            'Paramount Theatre': 'Theater',
            'Fox Theatre': 'Theater'
        },
        
        unions: {
            'IATSE': 'Union',
            'SAG': 'Union',
            'Screen Actors Guild': 'Union',
            'Writers Guild': 'Union',
            'Directors Guild': 'Union'
        }
    },
    
    // Places
    places: {
        cities: {
            'Hollywood': 'City',
            'Culver City': 'City',
            'Burbank': 'City',
            'New York': 'City',
            'Los Angeles': 'City',
            'Chicago': 'City',
            'London': 'City',
            'Paris': 'City'
        },
        
        locations: {
            'backlot': 'StudioLocation',
            'sound stage': 'StudioLocation',
            'studios': 'StudioLocation',
            'lot': 'StudioLocation',
            'on location': 'FilmingLocation'
        }
    },
    
    // Film industry verbs
    verbs: {
        production: {
            'helmed': 'Infinitive',
            'megaphoned': 'Infinitive',
            'lensed': 'Infinitive',
            'toplined': 'Infinitive',
            'wrapped': 'Infinitive',
            'bowed': 'Infinitive',
            'clicked': 'Infinitive',
            'flopped': 'Infinitive'
        },
        
        tenses: {
            'helming': 'Gerund',
            'megaphoning': 'Gerund',
            'lensing': 'Gerund',
            'toplining': 'Gerund'
        }
    },
    
    // Industry-specific nouns
    nouns: {
        business: {
            'b.o.': 'BoxOffice',
            'box office': 'BoxOffice',
            'boxoffice': 'BoxOffice',
            'gross': 'BoxOffice',
            'take': 'BoxOffice',
            'receipts': 'BoxOffice',
            'rentals': 'BoxOffice'
        },
        
        venues: {
            'nabes': 'Theaters',
            'first-run': 'TheaterType',
            'grindhouse': 'TheaterType',
            'showcase': 'TheaterType',
            'four-waller': 'TheaterType'
        },
        
        production: {
            'dailies': 'ProductionTerm',
            'rushes': 'ProductionTerm',
            'print': 'ProductionTerm',
            'negative': 'ProductionTerm',
            'workprint': 'ProductionTerm'
        },
        
        formats: {
            'Technicolor': 'Format',
            'CinemaScope': 'Format',
            'VistaVision': 'Format',
            'Cinerama': 'Format',
            'Todd-AO': 'Format',
            'Panavision': 'Format'
        }
    },
    
    // Industry adjectives
    adjectives: {
        positive: {
            'socko': 'PositiveReview',
            'boffo': 'PositiveReview',
            'smash': 'PositiveReview',
            'blockbuster': 'PositiveReview',
            'wow': 'PositiveReview',
            'terrific': 'PositiveReview',
            'sensational': 'PositiveReview'
        },
        
        negative: {
            'turkey': 'NegativeReview',
            'bomb': 'NegativeReview',
            'flop': 'NegativeReview',
            'dud': 'NegativeReview',
            'stinker': 'NegativeReview'
        }
    },
    
    // Common expressions and patterns
    expressions: {
        production: {
            'went before the cameras': 'production_start',
            'began lensing': 'production_start',
            'started production': 'production_start',
            'wrapped production': 'production_end',
            'in the can': 'production_complete',
            'in post': 'post_production'
        },
        
        business: {
            'clean up': 'success',
            'doing boffo': 'success',
            'packing them in': 'success',
            'SRO': 'sold_out',
            'standing room only': 'sold_out'
        },
        
        labor: {
            'walked out': 'strike',
            'hit the bricks': 'strike',
            'back to work': 'strike_end',
            'labor dispute': 'labor_issue',
            'contract dispute': 'labor_issue'
        }
    },
    
    // OCR correction patterns
    ocrCorrections: {
        // Common OCR errors in film texts
        'M-G-M': 'MGM',
        'M.G.M.': 'MGM',
        'B.O.': 'b.o.',
        'Culver Gity': 'Culver City',
        'Teehnicolor': 'Technicolor',
        'llollywood': 'Hollywood',
        'Ilollywood': 'Hollywood',
        'tlie': 'the',
        'tiie': 'the',
        'wlth': 'with',
        'fllm': 'film',
        'productlon': 'production',
        // Add more as you encounter them
    },
    
    // Date patterns specific to film industry
    datePatterns: {
        production: [
            'production began',
            'started filming',
            'went into production',
            'wrapped',
            'completed filming',
            'post-production began'
        ],
        
        release: [
            'opened',
            'bowed',
            'premiered',
            'general release',
            'roadshow engagement',
            'wide release'
        ]
    },
    
    // Money patterns
    moneyPatterns: {
        indicators: [
            'budget',
            'cost',
            'negative cost',
            'gross',
            'grossed',
            'earned',
            'rental',
            'take'
        ]
    }
};