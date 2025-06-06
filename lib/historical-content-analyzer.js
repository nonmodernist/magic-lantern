// lib/historical-content-analyzer.js
// Modular historical pattern matching for Magic Lantern

class HistoricalContentAnalyzer {
    constructor() {
        this.initializePatterns();
    }

    // Helper method for OCR-friendly patterns
    createOCRFriendlyPattern(phrase) {
        const words = phrase.split(/\s+/);
        const pattern = words
            .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('\\s+');
        
        return new RegExp(pattern, 'i');
    }

    initializePatterns() {
        // Theme detection patterns
        this.themePatterns = {
            labor_relations: [/\b(strike|union|labor|workers?)\b/gi, /\b(picket|walkout|solidarity)\b/gi],
            censorship: [/\b(censorship|banned|controversial|objectionable)\b/gi, /\b(cut|edited|removed)\b/gi],
            family_audience: [/\b(family|children|parents|wholesome)\b/gi, /\b(suitable|appropriate)\b/gi],
            technical_innovation: [/\b(technical|innovation|new|first)\b/gi, /\b(breakthrough|pioneer|advance)\b/gi],
            marketing_campaign: [/\b(campaign|publicity|promotion|marketing)\b/gi, /\b(herald|trailer|poster)\b/gi],
            cultural_controversy: [/\b(controversy|scandal|protest|objection)\b/gi, /\b(moral|decency|propriety)\b/gi]
        };
        
        // Significance indicators
        this.significancePatterns = {
            exceptional_performance: [/\b(unusual results|exceptional|extraordinary|record)\b/gi],
            technical_innovation: [/\b(first|pioneer|innovation|new technique|breakthrough)\b/gi],
            cultural_controversy: [/\b(controversy|scandal|banned|censored|protest)\b/gi],
            broad_distribution: [/\b(national|international|worldwide|coast to coast)\b/gi],
            critical_acclaim: [/\b(acclaim|praised|lauded|celebrated|triumph)\b/gi],
            commercial_success: [/\b(smash|blockbuster|phenomenal|overwhelming success)\b/gi]
        };
    }

    
    // Extract themes from text
    extractThemes(text) {
        const themes = [];
        
        for (const [theme, patterns] of Object.entries(this.themePatterns)) {
            const hasTheme = patterns.some(pattern => 
                (text.match(pattern) || []).length > 0
            );
            
            if (hasTheme) {
                themes.push(theme);
            }
        }
        
        return themes;
    }
    
    // Assess significance of content
    assessSignificance(text) {
        const significance = [];
        
        for (const [sigType, patterns] of Object.entries(this.significancePatterns)) {
            const hasSignificance = patterns.some(pattern => 
                (text.match(pattern) || []).length > 0
            );
            
            if (hasSignificance) {
                significance.push(sigType);
            }
        }
        
        return significance;
    }
    
    // Basic sentiment analysis
    analyzeSentiment(text) {
        const positive = /\b(excellent|outstanding|brilliant|magnificent|wonderful|superb|acclaimed|praised)\b/gi;
        const negative = /\b(disappointing|terrible|awful|dreadful|poor|weak|criticized|condemned)\b/gi;
        
        const positiveMatches = (text.match(positive) || []).length;
        const negativeMatches = (text.match(negative) || []).length;
        
        if (positiveMatches > negativeMatches + 1) return 'positive';
        if (negativeMatches > positiveMatches + 1) return 'negative';
        return 'neutral';
    }
    
    // Extract basic entities from text
    extractBasicEntities(text) {
        const entities = {
            people: new Set(),
            companies: new Set(),
            places: new Set()
        };
        
        if (!text) return this.convertEntitySetsToArrays(entities);
        
        // Normalize OCR text - handle multiple spaces but preserve structure
        const normalizedText = text.replace(/\s{2,}/g, ' ').trim();
        
        // Extract people names using multiple methods
        
        // Method 1: Names after role indicators (OCR-friendly)
        const roleIndicators = 'directed\\s+by|director|produced\\s+by|producer|written\\s+by|writer|screenplay\\s+by|starring|stars|featuring|music\\s+by|composed\\s+by|lyrics\\s+by|from\\s+the\\s+book\\s+by';
        // More flexible pattern for OCR text - stop at various boundaries
        const rolePattern = new RegExp(`\\b(?:${roleIndicators})\\s+([A-Z][A-Za-z'-]+(?:\\s+[A-Z]\\.?)*(?:\\s+[A-Z][A-Za-z'-]+)*?)(?=\\s+•|\\s+and\\s+|\\s+with\\s+|\\s+directed\\s+|\\s+produced\\s+|[.,;]|\\s+A\\s+|$)`, 'gi');
        
        let match;
        while ((match = rolePattern.exec(normalizedText)) !== null) {
            const name = this.cleanPersonName(match[1].trim());
            if (this.isValidPersonName(name)) {
                entities.people.add(name);
            }
        }
        
        // Method 2: Names separated by bullets (•) or sequential pattern
        const bulletPattern = /\b([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\s*•\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/g;
        while ((match = bulletPattern.exec(normalizedText)) !== null) {
            const name1 = this.cleanPersonName(match[1].trim());
            const name2 = this.cleanPersonName(match[2].trim());
            if (this.isValidPersonName(name1)) entities.people.add(name1);
            if (this.isValidPersonName(name2)) entities.people.add(name2);
        }
        
        // Method 2b: Handle space-separated names in sequence (like "Ray Bolger Bert Lahr")
        const sequencePattern = /\b([A-Z][A-Za-z'-]+)\s+([A-Z][A-Za-z'-]+)\s+([A-Z][A-Za-z'-]+)\s+([A-Z][A-Za-z'-]+)\b/g;
        while ((match = sequencePattern.exec(normalizedText)) !== null) {
            // Try to split into two names: first two words + last two words
            const name1 = `${match[1]} ${match[2]}`;
            const name2 = `${match[3]} ${match[4]}`;
            if (this.isValidPersonName(name1) && this.isValidPersonName(name2)) {
                entities.people.add(name1);
                entities.people.add(name2);
            }
        }
        
        // Method 3: Names with "and" pattern  
        const andPattern = /\b([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)\s+and\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)/g;
        while ((match = andPattern.exec(normalizedText)) !== null) {
            const name1 = this.cleanPersonName(match[1].trim());
            const name2 = this.cleanPersonName(match[2].trim());
            if (this.isValidPersonName(name1)) entities.people.add(name1);
            if (this.isValidPersonName(name2)) entities.people.add(name2);
        }
        
        // Method 4: Names with initials
        const initialPattern = /\b([A-Z]\.(?:[A-Z]\.)?)\s+([A-Z][A-Za-z'-]+)/g;
        while ((match = initialPattern.exec(normalizedText)) !== null) {
            const name = `${match[1]} ${match[2]}`;
            if (this.isValidPersonName(name)) {
                entities.people.add(name);
            }
        }
        
        // Method 5: Quoted names
        const quotedPattern = /"([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)+)"/g;
        while ((match = quotedPattern.exec(normalizedText)) !== null) {
            const name = this.cleanPersonName(match[1].trim());
            if (this.isValidPersonName(name)) {
                entities.people.add(name);
            }
        }
        
        // Extract company names
        const studioVariations = {
            'Metro-Goldwyn-Mayer': ['M-G-M', 'MGM', 'Metro'],
            'Warner Bros': ['Warner Brothers', 'Warner Bros.', 'WB'],
            'RKO': ['RKO Pictures', 'RKO Radio Pictures'],
            'Columbia': ['Columbia Pictures'],
            'Universal': ['Universal Pictures', 'Universal Studios'],
            'Paramount': ['Paramount Pictures'],
            'Fox': ['20th Century Fox', 'Twentieth Century Fox']
        };
        
        // Check for known studios and their variations
        for (const [canonical, variations] of Object.entries(studioVariations)) {
            const allForms = [canonical, ...variations];
            for (const form of allForms) {
                if (new RegExp(`\\b${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(normalizedText)) {
                    entities.companies.add(canonical);
                    break;
                }
            }
        }
        
        // Generic company patterns
        const companyPatterns = [
            /\b([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)*)\s+(?:Pictures?|Studios?|Productions?|Films?)\b/g,
            /\b([A-Z]+-[A-Z]+-[A-Z]+)\b/g, // M-G-M pattern
            /\b([A-Z][A-Za-z'-]+)'s\b/g // Possessive forms like Loew's
        ];
        
        companyPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(normalizedText)) !== null) {
                const company = match[1];
                if (company && company.length > 2 && this.isValidCompanyName(company)) {
                    entities.companies.add(company + (pattern.source.includes("'s") ? "'s" : ""));
                }
            }
        });
        
        // Extract places - venues and theaters
        const venuePattern = /\b([A-Z][A-Za-z'-]+(?:'s)?(?:\s+[A-Z][A-Za-z'-]+)?)\s+(Theatre|Theater|Cinema|Playhouse|Studios?)\b/gi;
        while ((match = venuePattern.exec(normalizedText)) !== null) {
            const venueName = `${match[1]} ${match[2]}`;
            entities.places.add(venueName);
            
            // If it has a possessive (like Loew's), also add the possessive form as a company
            if (match[1].includes("'s")) {
                const possessiveCompany = match[1].match(/([A-Z][A-Za-z'-]+'s)/);
                if (possessiveCompany) {
                    entities.companies.add(possessiveCompany[1]);
                }
            }
        }
        
        // Extract cities and states (avoid partial extractions)
        const locationPattern = /\b(?:in|at|from|filmed in|filmed at|opened in|opened at)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?)(?:,\s*([A-Z][A-Za-z]+))?\b/g;
        while ((match = locationPattern.exec(normalizedText)) !== null) {
            const place1 = match[1];
            const place2 = match[2];
            
            // Validate first place - avoid single characters and common words
            if (place1 && place1.length > 2) {
                const words = place1.split(/\s+/);
                if (words.length <= 2 && !['The', 'From', 'At', 'In', 'MGM'].includes(words[0])) {
                    entities.places.add(place1);
                }
            }
            
            // Validate second place (usually state)
            if (place2 && place2.length > 2) {
                entities.places.add(place2);
                // Add combined form only if first place is a single word
                if (place1 && place1.split(/\s+/).length === 1 && place1.length > 2) {
                    entities.places.add(`${place1}, ${place2}`);
                }
            }
        }
        
        return this.convertEntitySetsToArrays(entities);
    }
    
    // Clean person name by removing unwanted parts
    cleanPersonName(name) {
        if (!name) return '';
        
        // Remove common suffixes that aren't part of names
        return name
            .replace(/\s+(Productions?|Pictures?|Films?|Studios?)$/i, '')
            .replace(/\s+(and|with|featuring|A)\s+.*$/i, '')
            .replace(/^\s*THE\s+/i, '')
            .trim();
    }
    
    // Helper method to validate person names
    isValidPersonName(name) {
        if (!name || name.length < 3) return false;
        
        // Check for movie titles and other non-names
        const movieTitleIndicators = /^(THE\s+)?[A-Z]+(\s+OF\s+[A-Z]+)?$/;
        if (movieTitleIndicators.test(name.toUpperCase())) return false;
        
        const parts = name.split(/\s+/);
        if (parts.length < 2 && !/^[A-Z]\./.test(name)) return false;
        if (parts.length > 4) return false;
        
        // Expanded list of invalid words/patterns
        const invalid = [
            'The', 'This', 'That', 'And', 'With', 'From', 'Production', 'Pictures', 'Films', 'Studios',
            'WIZARD OF OZ', 'THE WIZARD', 'THE MUNCHKINS', 'Munchkins', 'Wonder Show', 'Technicolor', 'Show'
        ];
        
        // Check if any part is an invalid word
        for (const part of parts) {
            if (invalid.some(inv => part.toUpperCase() === inv.toUpperCase())) {
                return false;
            }
        }
        
        // Check for specific invalid patterns
        if (name.includes('Screen Play') || name.includes('SCREEN PLAY')) return false;
        if (name.includes('FLEMING Production') || name.includes('Production')) return false;
        
        return true;
    }
    
    // Helper method to validate company names
    isValidCompanyName(name) {
        if (!name || name.length < 2) return false;
        
        // Filter out person names that are incorrectly detected as companies
        const invalidCompanies = ['VICTOR', 'FLEMING', 'MERVYN', 'JUDY', 'FRANK', 'RAY', 'BERT'];
        return !invalidCompanies.some(invalid => name.toUpperCase().includes(invalid));
    }
    
    // Convert sets to arrays
    convertEntitySetsToArrays(entities) {
        return {
            people: Array.from(entities.people).sort(),
            companies: Array.from(entities.companies).sort(),
            places: Array.from(entities.places).sort()
        };
    }
    
    // Extract key excerpts from full text
    extractKeyExcerpts(text, film) {
        const excerpts = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        // Find sentences mentioning the film title
        const filmTitle = (film.title || '').toLowerCase();
        if (filmTitle) {
            const titleMentions = sentences.filter(s => 
                s.toLowerCase().includes(filmTitle)
            ).slice(0, 2);
            excerpts.push(...titleMentions);
        }
        
        // Find sentences with significance indicators
        const significantSentences = sentences.filter(s => {
            const lowerS = s.toLowerCase();
            return Object.values(this.significancePatterns).some(patterns =>
                patterns.some(pattern => pattern.test(lowerS))
            );
        }).slice(0, 2);
        
        excerpts.push(...significantSentences);
        
        // Deduplicate and return top excerpts
        return [...new Set(excerpts)]
            .slice(0, 3)
            .map(excerpt => excerpt.trim());
    }
    
    // Calculate significance score for content ranking
    calculateSignificanceScore(text) {
        let score = 0;
        
        // Check for significance indicators
        for (const [sigType, patterns] of Object.entries(this.significancePatterns)) {
            const matches = patterns.reduce((count, pattern) => 
                count + ((text.match(pattern) || []).length), 0
            );
            
            if (matches > 0) {
                // Weight different types of significance
                const weights = {
                    exceptional_performance: 10,
                    technical_innovation: 8,
                    cultural_controversy: 7,
                    critical_acclaim: 6,
                    commercial_success: 5,
                    broad_distribution: 4
                };
                score += matches * (weights[sigType] || 3);
            }
        }
        
        return score;
    }
    
    // Check if text contains valuable content based on themes and significance
    hasValuableContent(text, threshold = 5) {
        const significance = this.calculateSignificanceScore(text);
        const themes = this.extractThemes(text);
        
        // Content is valuable if it has significant themes or high significance score
        return significance >= threshold || themes.length > 0;
    }
}

module.exports = HistoricalContentAnalyzer;