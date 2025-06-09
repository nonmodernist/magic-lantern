// lib/utils.js
module.exports = {
    abbreviateTitle(title, commonWords) {
        const words = title.split(' ');
        const significantWords = words.filter(w => !commonWords.includes(w.toLowerCase()));
        
        if (significantWords.length >= 2) {
            return significantWords.slice(0, 2).join(' ');
        }
        return title;
    },
    
    extractKeyword(title, commonWords, articles) {
        const words = title.split(' ');
        const significantWords = words.filter(w => 
            !commonWords.includes(w.toLowerCase()) && 
            !articles.includes(w) &&
            w.length > 3
        );
        
        // Return the most unique/significant word
        return significantWords[0] || null;
    },
    
    getAuthorVariations(author) {
        const variations = [];

        // Known author variations
        const knownVariations = {
            'Fannie Hurst': ['Fanny Hurst'],
            'Harriet Comstock': ['Harriet T. Comstock'],
            'Gene Stratton-Porter': ['Gene Stratton Porter', 'Stratton-Porter'],
        };
        
        if (knownVariations[author]) {
            variations.push(...knownVariations[author]);
        }
        
        return variations;
    },
    
    getStudioAbbreviation(studio) {
        const abbreviations = {
            'Metro-Goldwyn-Mayer': 'MGM',
            'Radio-Keith-Orpheum': 'RKO',
            'RKO Radio Pictures': 'RKO',
            'Paramount Pictures': 'Paramount',
            '20th Century Fox': 'Fox',
            'Universal Pictures': 'Universal',
            'Columbia Pictures': 'Columbia',
            'United Artists': 'UA'
        };
        
        return abbreviations[studio] || null;
    },
    
    getKnownStars(title) {
        const starsByFilm = {
            'The Wizard of Oz': ['Judy Garland', 'Ray Bolger', 'Bert Lahr'],
            'Gone with the Wind': ['Clark Gable', 'Vivien Leigh'],
            'Rebecca': ['Laurence Olivier', 'Joan Fontaine'],
            'The Maltese Falcon': ['Humphrey Bogart', 'Mary Astor']
        };
        
        return starsByFilm[title] || [];
    },
    
    generateOCRVariants(title) {
        const variants = [];
        
        // Common OCR substitutions
        const ocrSubs = {
            'l': ['1', 'i'],
            'I': ['l', '1'],
            '0': ['O'],
            'O': ['0'],
            'S': ['5'],
            '5': ['S']
        };
        
        // Generate a few variants (don't go crazy)
        const words = title.split(' ');
        if (words.length <= 3) {
            // Try one substitution
            for (let char in ocrSubs) {
                if (title.includes(char)) {
                    const variant = title.replace(char, ocrSubs[char][0]);
                    if (variant !== title) {
                        variants.push(variant);
                        break; // Only one variant
                    }
                }
            }
        }
        
        return variants;
    },
    
    inferGenre(title, film) {
        // Simple genre inference from title/metadata
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('love') || titleLower.includes('romance')) return 'romance';
        if (titleLower.includes('murder') || titleLower.includes('death')) return 'mystery';
        if (titleLower.includes('adventures') || titleLower.includes('adventure')) return 'adventure';
        if (film.genre) return film.genre.toLowerCase();
        
        return null;
    },
    
    isKnownRemake(title) {
        const knownRemakes = [
            'The Wizard of Oz', // Multiple versions
            'Little Women',
            'The Three Musketeers',
            'Romeo and Juliet'
        ];
        
        return knownRemakes.includes(title);
    }
};