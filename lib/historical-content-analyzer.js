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
        // Enhanced content type detection patterns
        this.contentPatterns = {
            // Core content patterns - enhanced with multi-level detection
            review: {
                primary: [/\b(review|critique|criticism|appraisal)\b/gi],
                secondary: [/\b(performance|acting|direction|cinematography)\b/gi, /\b(recommend|disappointing|excellent|mediocre)\b/gi],
                indicators: [/\b(stars?|rating|grade)\b/gi, /\b(verdict|opinion|assessment)\b/gi],
                score: 10,
                minLength: 150,
                type: 'review'
            },
            
            box_office: {
                primary: [/\b(box office|gross|receipts|earnings)\b/gi],
                secondary: [/\b(business|attendance|popular)\b/gi, /\b(unusual results|commercial)\b/gi],
                indicators: [/\$[\d,]+/g, /\b(hit|flop|success|failure)\b/gi, /\b\d+\s*(week|day)s?\b/gi],
                score: 9,
                type: 'box_office'
            },
            
            production: {
                primary: [/\b(filming|shooting|production)\b/gi],
                secondary: [/\b(location|set|studio)\b/gi, /\b(behind the scenes|on set)\b/gi],
                indicators: [/\b(cast|crew|director|producer)\b/gi, /\b(wrap|principal photography|rushes)\b/gi],
                score: 6,
                type: 'production'
            },
            
            advertisement: {
                primary: [/\b(now showing|coming soon)\b/gi],
                secondary: [/\b(theatre|theater|cinema)\b/gi, /\b(admission|matinee|evening show)\b/gi],
                indicators: [/\b(herald|poster|lobby card)\b/gi, /\b(advertis|promot)\b/gi],
                score: 3,
                type: 'advertisement'
            },
            
            interview: {
                primary: [/\b(interview|exclusive)\b/gi],
                secondary: [/\b(talks with|speaks to|says)\b/gi, /\b(chat|conversation)\b/gi],
                indicators: [/["']\w+.*["']\s+(?:said|stated|explained)/gi, /\bQ:\s*|\bA:\s*/gi],
                score: 7,
                minLength: 100,
                type: 'interview'
            },
            
            industry_news: {
                primary: [/\b(announcement|official|confirms)\b/gi],
                secondary: [/\b(contract|deal|signed|studio)\b/gi, /\b(personnel|executive|department)\b/gi],
                indicators: [/\b(appointment|resignation|promotion)\b/gi, /\b(merger|acquisition)\b/gi],
                score: 8,
                type: 'industry_news'
            },
            
            photo: {
                primary: [/\b(photo|still|image)\b/gi],
                secondary: [/\b(scene from|production still)\b/gi, /\b(pictured|shown|depicts)\b/gi],
                indicators: [/\b(caption|photographer)\b/gi, /\b(poses|posing)\b/gi],
                score: 4,
                type: 'photo'
            },
            
            mention: {
                primary: [/\b(mention|noted|reference)\b/gi],
                secondary: [/\b(brief|short|quick)\b/gi],
                indicators: [/\b(also|in addition|meanwhile)\b/gi],
                score: 2,
                type: 'mention'
            },
            
            // Legacy patterns preserved for backward compatibility
            historical_review: {
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

    // Enhanced content type detection with multi-level patterns
    detectContentTypes(text, title = '') {
        const detected = new Map();
        const combinedText = `${text} ${title}`.toLowerCase();
        const normalizedText = text.replace(/\s{2,}/g, ' ').trim();
        
        for (const [type, patterns] of Object.entries(this.contentPatterns)) {
            let score = 0;
            let matchCount = 0;
            
            // Handle new-style pattern objects (primary/secondary/indicators)
            if (patterns.primary || patterns.secondary || patterns.indicators) {
                // Primary patterns (highest weight)
                if (patterns.primary) {
                    patterns.primary.forEach(pattern => {
                        const matches = (combinedText.match(pattern) || []).length;
                        score += matches * 3;
                        matchCount += matches;
                    });
                }
                
                // Secondary patterns (medium weight)
                if (patterns.secondary) {
                    patterns.secondary.forEach(pattern => {
                        const matches = (combinedText.match(pattern) || []).length;
                        score += matches * 1.5;
                        matchCount += matches;
                    });
                }
                
                // Indicator patterns (lowest weight)
                if (patterns.indicators) {
                    patterns.indicators.forEach(pattern => {
                        const matches = (combinedText.match(pattern) || []).length;
                        score += matches * 0.5;
                        matchCount += matches;
                    });
                }
            }
            // Handle legacy pattern objects (historical film patterns)
            else if (patterns.patterns) {
                // Check minimum length if specified
                if (patterns.minLength && normalizedText.length < patterns.minLength) {
                    continue;
                }
                
                // Legacy patterns with historical film domain knowledge
                patterns.patterns.forEach(pattern => {
                    const matches = (normalizedText.match(pattern) || []).length;
                    if (matches > 0) {
                        // Use legacy scoring system but integrate with new confidence levels
                        const legacyScore = patterns.score || 1;
                        score += matches * (legacyScore / 10); // Normalize to new scale
                        matchCount += matches;
                    }
                });
            }
            
            if (score > 0.1) {
                // Enhanced confidence calculation considering both score and match count
                let confidence = 'low';
                if (score >= 3 || matchCount >= 3) {
                    confidence = 'high';
                } else if (score >= 1.5 || matchCount >= 2) {
                    confidence = 'medium';
                }
                
                // Merge with existing detection if type already exists
                if (detected.has(type)) {
                    const existing = detected.get(type);
                    detected.set(type, {
                        score: Math.max(existing.score, score),
                        confidence: confidence === 'high' || existing.confidence === 'high' ? 'high' : 
                                  confidence === 'medium' || existing.confidence === 'medium' ? 'medium' : 'low'
                    });
                } else {
                    detected.set(type, { score, confidence });
                }
            }
        }
        
        return Array.from(detected.entries())
            .sort((a, b) => b[1].score - a[1].score)
            .map(([type, data]) => ({ type, ...data }));
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
    
    // Legacy method - analyze text and return content types with confidence scores
    analyzeContent(text, options = {}) {
        const results = {
            types: [],
            primaryType: 'mention',
            confidence: 0,
            evidence: []
        };

        // Normalize text for better matching
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        
        // Check each legacy content type pattern
        for (const [, config] of Object.entries(this.contentPatterns)) {
            // Skip new-style patterns in legacy method
            if (!config.patterns) continue;
            
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