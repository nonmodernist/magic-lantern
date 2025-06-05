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
        this.contentPatterns = {
            review: {
                patterns: [
                    // OCR-friendly patterns
                    this.createOCRFriendlyPattern('picture is excellent'),
                    this.createOCRFriendlyPattern('photoplay proves superb'),
                    this.createOCRFriendlyPattern('film is mediocre'),
                    this.createOCRFriendlyPattern('box office natural'),
                    this.createOCRFriendlyPattern('should please audiences'),
                    this.createOCRFriendlyPattern('will satisfy patrons'),
                    this.createOCRFriendlyPattern('worth booking'),
                    this.createOCRFriendlyPattern('entertainment value'),
                    
                    // Period review language
                    /\b(picture|photoplay|film)\s+(is|proves)\s+(excellent|superb|mediocre|disappointing)/i,
                    /\b(rates?|rating)\s+(high|low|fair|good|excellent)/i,
                    /\bbox[\s-]?office\s+(natural|wow|smash|dud)/i,
                    /\b(should|will)\s+(please|satisfy|disappoint)\s+(audiences|patrons|exhibitors)/i,
                    /\b(direction|acting|photography|story)\s+(excellent|good|fair|poor)/i,
                    /\bworth\s+(booking|playing|showing)/i,
                    /\b(entertainment|program)\s+value/i,
                    /\bexhibitor[s']?\s+(angle|slant|reports?)/i,
                    
                    // Simple patterns for better matching
                    /\bgood\s+picture/i,
                    /\bexcellent\s+film/i,
                    /\bpoor\s+photoplay/i,
                    /\bfine\s+production/i,
                    
                    // Classic review structures
                    /Cast[:\s].*Director[:\s]/i,
                    /Running time[:\s]\d+\s*minutes/i,
                    /\b(Class\s+[A-D]|Four\s+Stars?|Three\s+Bells)/i
                ],
                score: 10,
                minLength: 150,
                type: 'review'
            },
            
            production_photo: {
                patterns: [
                    // OCR-friendly patterns
                    this.createOCRFriendlyPattern('scene from the photoplay'),
                    this.createOCRFriendlyPattern('scene from the picture'),
                    this.createOCRFriendlyPattern('exclusive photograph'),
                    this.createOCRFriendlyPattern('pictured above'),
                    this.createOCRFriendlyPattern('production still'),
                    this.createOCRFriendlyPattern('on the set'),
                    
                    // Period photo captions
                    /\bscene\s+from/i,
                    /\b(?:above|below|here)\s*:?\s*(?:scene|view|shot)/i,
                    /\bexclusive\s+(photo|photograph|picture)/i,
                    /\bpictured\s+(above|here|below)/i,
                    /\b(production|working)\s+still/i,
                    /\bon\s+the\s+set\s+(of|with)/i,
                    /\bcamera\s+catches/i,
                    /\b(see|note)\s+(illustration|photo)/i,
                    
                    // Simple patterns
                    /\bphoto(?:graph)?\b/i,
                    /\bscene\b.*\bfrom\b/i,
                    
                    // Layout references
                    /\b(top|bottom|left|right)\s+photo/i,
                    /\bcut\s+shows/i  // "cut" meant photo in trade papers
                ],
                score: 9,
                type: 'photo'
            },
            
            box_office: {
                patterns: [
                    // Period box office terminology
                    /\b(gross|grossed|grossing)\s*\$[\d,]+/i,
                    /\bbox[\s-]?office\s+(receipts?|returns?|take)/i,
                    /\b(b\.o\.|BO)\s*[:=]\s*\$?[\d,]+/i,
                    /\bweek[ly]?\s+(receipts?|gross|take)/i,
                    /\bhouse\s+record/i,
                    /\b(smash|wow|sock|boff|boffo)\s+(business|b\.o\.)/i,
                    /\b(capacity|near[\s-]capacity|SRO|turnaway)\s+business/i,
                    /\bholdover\s+(second|third|fourth)\s+week/i,
                    /\b(outgrossed|topped|beat)\s+previous/i,
                    
                    // Common period phrases
                    /\bnice\s+business/i,
                    /\bclean[\s-]up/i,  // meant big profits
                    /\bsocko\s+b\.o\./i
                ],
                score: 8,
                type: 'box_office'
            },
            
            interview: {
                patterns: [
                    // Period interview language
                    /\b(says|stated|declared|announced)\s+[A-Z][a-z]+/i,
                    /\b[A-Z][a-z]+\s+(reveals|discloses|tells)/i,
                    /\bquoted\s+as\s+saying/i,
                    /\bin\s+an?\s+(interview|chat|conversation)/i,
                    /\btalking\s+to\s+(your|our)\s+reporter/i,
                    /\b(director|producer|star)\s+[A-Z][a-z]+\s+(stated|said)/i,
                    
                    // Period-specific
                    /\bscribbled?\s+notes/i,
                    /\bover\s+luncheon/i
                ],
                score: 7,
                minLength: 100,
                type: 'interview'
            },
            
            production_news: {
                patterns: [
                    // Period production terminology
                    /\b(began|started|commenced)\s+(production|filming|shooting)/i,
                    /\bgoes\s+before\s+cameras/i,
                    /\b(now|currently)\s+(shooting|filming|in\s+production)/i,
                    /\blensing\s+(at|on|in)/i,  // "lensing" was common
                    /\bmegaphone[rd]?\s+by/i,  // directed by
                    /\bunder\s+(direction|supervision)\s+of/i,
                    /\bwrapped\s+production/i,
                    /\bon\s+location\s+(at|in)/i,
                    /\bcast\s+(set|completed|includes)/i,
                    
                    // Studio system language
                    /\bassigned\s+to\s+(direct|produce|write)/i,
                    /\bborrowed\s+from\s+[A-Z]/i,  // actor loans between studios
                    /\bpacted\s+(for|to)/i  // contracted
                ],
                score: 6,
                type: 'production'
            },
            
            advertisement: {
                patterns: [
                    // Period exhibition ads
                    /\b(now|here)\s+(showing|playing)/i,
                    /\bstarts\s+(today|tomorrow|friday|sunday)/i,
                    /\b(continuous|performances?)\s+(daily|from)/i,
                    /\b(matinee|matinees)\s+(daily|at)/i,
                    /\badmission\s*:?\s*\d+[¢c]/i,  // 25¢
                    /\b(popular|regular)\s+prices/i,
                    /\bspecial\s+midnight\s+show/i,
                    /\b(2|two|3|three)\s+(days|nights)\s+only/i,
                    
                    // Theater names
                    /\bat\s+the\s+[A-Z][a-z]+\s+(Theatre|Theater|Playhouse)/i,
                    
                    // Period slogans
                    /\bdon't\s+miss/i,
                    /\bfunnier\s+than/i
                ],
                score: 5,
                type: 'advertisement'
            },
            
            trade_mention: {
                patterns: [
                    // Brief trade mentions
                    /\b(acquired|purchased|bought)\s+by\s+[A-Z]/i,
                    /\brights\s+(to|for|of)/i,
                    /\bset\s+for\s+release/i,
                    /\bscheduled\s+for/i,
                    /\bin\s+preparation/i,
                    /\bpre[\s-]?production/i,
                    /\bscript\s+(completed|approved)/i,
                    
                    // Contract/deal news
                    /\bsigned\s+(to|for|with)/i,
                    /\bdeals?\s+(set|closed|pending)/i
                ],
                score: 3,
                type: 'mention'
            },
            
            awards: {
                patterns: [
                    // Period award language
                    /\b(Academy|Oscar)\s+(winner|nominee|nomination)/i,
                    /\bbest\s+(picture|actor|actress|director)/i,
                    /\baward[s]?\s+(winner|winning)/i,
                    /\b(won|nominated|competing)\s+for/i,
                    
                    // Period-specific awards
                    /\bPhotoplay\s+(Gold|Medal)/i,
                    /\bBox[\s-]?Office\s+Blue\s+Ribbon/i,
                    /\bFilm\s+Daily\s+Ten\s+Best/i
                ],
                score: 7,
                type: 'awards'
            }
        };
    }

    // Analyze text and return content types with confidence scores
    analyzeContent(text, options = {}) {
        const results = {
            types: [],
            primaryType: 'mention',
            confidence: 0,
            evidence: []
        };

        // Normalize text for better matching
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        
        // Check each content type
        for (const [typeName, config] of Object.entries(this.contentPatterns)) {
            // Check minimum length if specified
            if (config.minLength && normalizedText.length < config.minLength) {
                continue;
            }

            let matchCount = 0;
            const typeEvidence = [];

            // Check patterns
            for (const pattern of config.patterns) {
                const match = normalizedText.match(pattern);
                if (match) {
                    matchCount++;
                    
                    // Extract evidence context
                    if (options.includeEvidence) {
                        const startIndex = Math.max(0, match.index - 50);
                        const endIndex = Math.min(normalizedText.length, match.index + match[0].length + 50);
                        const context = normalizedText.substring(startIndex, endIndex);
                        typeEvidence.push({
                            pattern: pattern.toString(),
                            match: match[0],
                            context: context
                        });
                    }
                }
            }

            if (matchCount > 0) {
                const confidence = this.calculateConfidence(matchCount, config.patterns.length);
                results.types.push({
                    type: config.type,
                    score: config.score,
                    confidence: confidence,
                    matchCount: matchCount,
                    evidence: typeEvidence
                });
            }
        }

        // Sort by confidence and score
        results.types.sort((a, b) => {
            // First sort by confidence (high > medium > low)
            const confOrder = { high: 3, medium: 2, low: 1 };
            const confDiff = (confOrder[b.confidence] || 0) - (confOrder[a.confidence] || 0);
            if (confDiff !== 0) return confDiff;
            
            // Then by score
            return b.score - a.score;
        });

        // Set primary type
        if (results.types.length > 0) {
            results.primaryType = results.types[0].type;
            results.confidence = results.types[0].confidence;
            results.evidence = results.types[0].evidence;
        }

        return results;
    }

    // Calculate confidence based on pattern matches
    calculateConfidence(matchCount, totalPatterns) {
        const matchRatio = matchCount / totalPatterns;
        
        if (matchCount >= 3 || matchRatio >= 0.5) return 'high';
        if (matchCount >= 2 || matchRatio >= 0.3) return 'medium';
        return 'low';
    }

    // Get content type score for ranking
    getContentTypeScore(type) {
        const config = Object.values(this.contentPatterns).find(c => c.type === type);
        return config ? config.score : 1;
    }

    // Check if text contains valuable content
    hasValuableContent(text, threshold = 5) {
        const analysis = this.analyzeContent(text);
        if (analysis.types.length === 0) return false;
        
        const highestScore = Math.max(...analysis.types.map(t => t.score));
        return highestScore >= threshold;
    }

    // Get all available content types
    getContentTypes() {
        return Object.values(this.contentPatterns).map(config => ({
            type: config.type,
            score: config.score,
            patternCount: config.patterns.length
        }));
    }
}

module.exports = HistoricalContentAnalyzer;