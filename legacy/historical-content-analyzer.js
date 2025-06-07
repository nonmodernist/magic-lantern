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

            picture_story: {
                patterns: [
                    /\bstory\s+ends\s+with/i,
                    /\bthe\s+epitome\s+of/i,
                    /\bfalls\s+in\s+love\s+with/i,
                    /\breleases\s+the\s+girl\s+from/i,
                    /\bhaving\s+married/i,
                    /\bmakes\s+a\s+proposal\s+to/i,
                    /\bfinds\s+himself\s+the\s+hero/i,
                    /\bnominated\s+for\s+the\s+office/i,
                    /\bhappy\s+in\s+the\s+homage/i,
                    /\blife\s+of\s+devotion/i,
                    /\bdeclares\s+that/i,
                    /\bsettles\s+down\s+in/i,
                    /\bbegins\s+to\s+wane/i,
                    /\breturns\s+to\s+.*\s+and\s+at\s+a\s+meeting/i
                ],
                score: 9,
                type: 'picture_story'
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

                    // Percentage and performance
                    /\b\d{2,3}%/i,  // "151%"
                    /\bgolden\s+returns/i,
                    /\brecord\s+shows/i,
                    /\bbox[\s-]?office\s+revealed/i,
                    /\bregister\s+at\s+the\s+box[\s-]?office/i,

                    // Exhibition terms
                    /\bsimultaneous\s+bookings/i,
                    /\bsecond\s+loop\s+run/i,
                    /\bslated\s+for\s+a\s+second/i,
                    /\bcontinue\s+indefinitely/i,
                    
                    // Common period phrases
                    /\bnice\s+business/i,
                    /\bclean[\s-]up/i,  // meant big profits
                    /\bsocko\s+b\.o\./i
                ],
                score: 2,
                type: 'box_office'
            },

            box_office_data: {
                patterns: [
                    /\bdigest\s+honor\s+box/i,
                    /\bbiggest[\s-]?grossing\s+picture/i,
                    /\b\d{2,3}%/i,  // percentages
                    /\bleaders\s+of\s+\d{4}/i,
                    /\btype\s+of\s+story.*which\s+register\s+at/i,
                    /\brated\s+tops\s+for\s+past\s+years/i,
                    /\bannual\s+poll\s+of\s+theatremen/i,
                    /\bbox[\s-]?office\s+revealed/i,
                    /\bspecial\s+award/i,
                    /\bthis\s+week.*wins\s+with/i
                ],
                score: 2,
                type: 'box_office_data'
            },

            exhibitor_advice: {
                patterns: [
                    /\badvertising\s+suggestions\s+for/i,
                    /\bbenefit\s+of\s+all\s+exhibitors/i,
                    /\bhire\s+a\s+man\s+to/i,
                    /\bteaser\s+advertising/i,
                    /\battract\s+considerable\s+attention/i,
                    /\byour\s+newspaper\s+ads/i,
                    /\bwindow\s+displays/i,
                    /\btie[\s-]up\s+opportunity/i,
                    /\bgood\s+work\s+in\s+the\s+territory/i,
                    /\bget\s+the\s+benefit\s+of/i,
                    /\bmultigraphed\s+and\s+mailed/i,
                    /\binstitutional\s+good[\s-]will\s+builder/i,
                    /\bcall\s+on\s+the\s+local/i
                ],
                score: 4,
                type: 'exhibitor_advice'
            },

            industry_news: {
                patterns: [
                    /\bstrike\s+averted/i,
                    /\bmotion[\s-]picture\s+producers.*conference/i,
                    /\bcraft\s+jurisdictional\s+disputes/i,
                    /\bthreatened\s+economic\s+action/i,
                    /\bwage\s+increase/i,
                    /\bnegotiate.*working\s+conditions/i,
                    /\bcommittees\s+would\s+be\s+appointed/i,
                    /\bblock\s+booking/i,
                    /\bdebate\s+between/i,
                    /\bdefended\s+the.*practice/i,
                    /\bcritics\s+of\s+the\s+country/i,
                    /\bannual.*balloting/i,
                    /\bassets\s+on\s+market/i,
                    /\bcreditors'\s+committee/i,
                    // legal language
                    /district\s+attorney/i,
                    /\banti-trust/i
                ],
                score: 8,
                type: 'industry_news'
            },
            
            interview: {
                patterns: [
                    // Period interview language - but could also be statements reported
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

            publicity_material: {
                patterns: [
                    /\bgreatest\s+picture\s+ever\s+made/i,
                    /\bbeyond\s+your\s+wildest\s+dreams/i,
                    /\bthrill\s+the\s+world/i,
                    /\bwonder\s+show/i,
                    /\bgreatest\s+of\s+all\s+entertainments/i,
                    /\bgolden\s+returns/i,
                    /\bget\s+your\s+share\s+of/i,
                    /\bgreatest\s+list\s+of\s+simultaneous/i,
                    /\b\$[\d,]+\s+advertising\s+campaign/i,
                    /\bfull[\s-]page\s+4[\s-]color/i,
                    /\bnation[\s-]wide.*ads/i,
                    /\brecord\s+publicity\s+results/i,
                    /\bmerited\s+such\s+a\s+campaign/i
                ],
                score: 2,  // Lower score for publicity puff
                type: 'publicity'
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
                score: 3,
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
                score: 6,
                type: 'mention'
            },

            listing: {
                patterns: [
                    /\bcity\s+newspaper/i,
                    // City name patterns in lists
                    /^(ALBANY|ATLANTA|BALTIMORE|BOSTON|BUFFALO)/m,
                    /\b(Aug|Jan|Feb|Mar|Apr|May|Jun|Jul|Sep|Oct|Nov|Dec)\.\s+\d{1,2}/i,
                    /\bten\s+best/i,
                    /\bfilms?\s+of\s+\d{4}/i
                ],
                score: -5,
                type: 'listing'
            },

            continuation: {
                patterns: [
                    /\(continued\s+from\s+page/i,
                    /\bmiscellaneous\s+subjects/i,
                    /\balong\s+the.*with/i,  // column header
                ],
                score: 4,
                type: 'continuation'
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
                score: 2,
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