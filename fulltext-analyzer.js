#!/usr/bin/env node

// test-treasure-analyzer.js - Test historical pattern matching on existing OCR data
const fs = require('fs');

class HistoricalTreasureAnalyzer {
    constructor() {
                // Add configuration for context windows
        this.contextConfig = {
            windowSize: 500,  // characters before and after match
            minWindowSize: 200,  // minimum context even for edge cases
            maxWindows: 5,  // maximum number of context windows to extract
            mergeThreshold: 100  // merge windows if they're this close
        };

        
        // Initialize patterns after methods are available
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

    // Initialize patterns using the helper
    initializePatterns() {
        this.treasurePatterns = {
            fullReview: {
                patterns: [
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
                    // ADD: Patterns that handle OCR spacing
                    /\bpicture\s+is\s+(?:a\s+)?(?:good|excellent|poor)/i,
                    /\bstory\s+is\s+(?:well|poorly)\s+told/i,
                    /\bacting\s+is\s+(?:good|excellent|poor)/i,
                    // ADD: Simpler patterns that are more likely to match
                    /\bgood\s+picture/i,
                    /\bexcellent\s+film/i,
                    /\bpoor\s+photoplay/i,
                    /\bfine\s+production/i,
                    // Classic review structures
                    /Cast[:\s].*Director[:\s]/i,
                    /Running time[:\s]\d+\s*minutes/i,
                    // Old-style ratings
                    /\b(Class\s+[A-D]|Four\s+Stars?|Three\s+Bells)/i
                ],
                minLength: 150,
                score: 10,
                icon: '📰'
            },
            productionPhoto: {
                patterns: [

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
                    // Add some very simple patterns
                    /\bphoto(?:graph)?\b/i,
                    /\bscene\b.*\bfrom\b/i,  // scene...from with anything in between
                    
                    // Layout references common in period
                    /\b(top|bottom|left|right)\s+photo/i,
                    /\bcut\s+shows/i  // "cut" meant photo in trade papers
                ],
                score: 9,
                icon: '📸'
            },
            boxOfficeData: {
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
                icon: '💰'
            },
            interview: {
                patterns: [
                    // Period interview language
                    /\b(says|stated|declared|announced)\s+[A-Z][a-z]+/i,  // "says DeMille"
                    /\b[A-Z][a-z]+\s+(reveals|discloses|tells)/i,
                    /\bquoted\s+as\s+saying/i,
                    /\bin\s+an?\s+(interview|chat|conversation)/i,
                    /\btalking\s+to\s+(your|our)\s+reporter/i,
                    /\b(director|producer|star)\s+[A-Z][a-z]+\s+(stated|said)/i,
                    // Period-specific
                    /\bscribbled?\s+notes/i,  // common phrase for interviews
                    /\bover\s+luncheon/i  // interviews often conducted at meals
                ],
                minLength: 100,
                score: 7,
                icon: '🎤'
            },
            productionNews: {
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
                icon: '🎬'
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
                icon: '📢'
            },
            tradeMention: {
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
                icon: '📋'
            },
            awardsMention: {
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
                icon: '🏆'
            }
        };
    }

    // New method to extract context windows around search terms
    extractContextWindows(fullText, searchTerms) {
        const windows = [];
        const textLower = fullText.toLowerCase();
        
        // For each search term, find all occurrences
        searchTerms.forEach(term => {
            if (!term) return;

                    // Create flexible search patterns
        const searchPatterns = this.createFlexibleSearchPatterns(term);
        
        searchPatterns.forEach(pattern => {
            if (pattern instanceof RegExp) {
                // Use regex matching
                let match;
                while ((match = pattern.exec(textLower)) !== null) {
                    const index = match.index;
                    const matchLength = match[0].length;
                    
                    const start = Math.max(0, index - this.contextConfig.windowSize);
                    const end = Math.min(fullText.length, index + matchLength + this.contextConfig.windowSize);
                    
                    windows.push({
                        start,
                        end,
                        matchStart: index,
                        matchEnd: index + matchLength,
                        term: term,
                        matchedText: match[0]
                    });
                }
            } else {
                // Use string matching for simple terms
            
            const termLower = term.toLowerCase();
            let index = 0;
            
            while ((index = textLower.indexOf(termLower, index)) !== -1) {
                const start = Math.max(0, index - this.contextConfig.windowSize);
                const end = Math.min(fullText.length, index + termLower.length + this.contextConfig.windowSize);
                
                windows.push({
                    start,
                    end,
                    matchStart: index,
                    matchEnd: index + termLower.length,
                    term: term,
                    matchedText: termLower
                });
                
                index += termLower.length;
            }
        }
        });
        });
        
        // Sort windows by start position
        windows.sort((a, b) => a.start - b.start);
        
        // Merge overlapping windows
        const mergedWindows = [];
        for (const window of windows) {
            if (mergedWindows.length === 0) {
                mergedWindows.push(window);
            } else {
                const lastWindow = mergedWindows[mergedWindows.length - 1];
                
                // Check if windows overlap or are close enough to merge
                if (window.start <= lastWindow.end + this.contextConfig.mergeThreshold) {
                    // Merge windows
                    lastWindow.end = Math.max(lastWindow.end, window.end);
                    lastWindow.terms = lastWindow.terms || [lastWindow.term];
                    if (!lastWindow.terms.includes(window.term)) {
                        lastWindow.terms.push(window.term);
                    }
                } else {
                    mergedWindows.push(window);
                }
            }
        }

            // Log what we found for debugging
    console.log(`   Debug: Found ${windows.length} raw windows, merged to ${mergedWindows.length}`);
    if (windows.length > 0) {
        console.log(`   Debug: First match: "${windows[0].matchedText}" at position ${windows[0].matchStart}`);
    }
        
        // Extract text for each window
        return mergedWindows.slice(0, this.contextConfig.maxWindows).map(window => {
            const text = fullText.substring(window.start, window.end);
            
            // Clean up the window edges to start/end at word boundaries
            const cleanedText = this.cleanWindowBoundaries(text);
            
            return {
                text: cleanedText,
                terms: window.terms || [window.term],
                position: {
                    start: window.start,
                    end: window.end
                }
            };
        });
    }
    
    // Helper to clean window boundaries
    cleanWindowBoundaries(text) {
        // Find first word boundary
        const firstSpace = text.indexOf(' ');
        const startClean = firstSpace > 0 && firstSpace < 50 ? firstSpace + 1 : 0;
        
        // Find last word boundary
        const lastSpace = text.lastIndexOf(' ');
        const endClean = lastSpace > text.length - 50 ? lastSpace : text.length;
        
        let cleaned = text.substring(startClean, endClean).trim();
        
        // Add ellipsis if we cut off text
        if (startClean > 0) cleaned = '...' + cleaned;
        if (endClean < text.length) cleaned = cleaned + '...';
        
        return cleaned;
    }

    // New helper method to create flexible search patterns
createFlexibleSearchPatterns(term) {
    const patterns = [];
    
    // Escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 1. Try exact match first (lowercase)
    patterns.push(term.toLowerCase());
    
    // 2. Create regex that handles OCR spacing issues
    // Split the term into words and allow flexible spacing
    const words = term.split(/\s+/);
    const flexibleSpacingPattern = words
        .map(word => escapeRegex(word))
        .join('\\s+');  // One or more whitespace characters
    
    patterns.push(new RegExp(flexibleSpacingPattern, 'gi'));
    
    // 3. Handle potential OCR errors with quotes
    // Replace smart quotes with regular quotes or wildcards
    const quoteVariations = term
        .replace(/[""]/g, '["""\']?')  // Handle various quote types
        .replace(/'/g, "[\\']?");
    
    const quoteFlexiblePattern = quoteVariations
        .split(/\s+/)
        .map(word => escapeRegex(word))
        .join('\\s+');
    
    patterns.push(new RegExp(quoteFlexiblePattern, 'gi'));
    
    // 4. For multi-word terms, also try searching for distinctive keywords
    if (words.length > 2) {
        // Try the most distinctive words (usually not common words)
        const distinctiveWords = words.filter(word => 
            word.length > 4 && !['the', 'of', 'and', 'in', 'at'].includes(word.toLowerCase())
        );
        
        if (distinctiveWords.length >= 2) {
            // Search for any two distinctive words near each other
            const proximityPattern = distinctiveWords
                .slice(0, 2)
                .map(word => escapeRegex(word))
                .join('.{0,20}');  // Allow up to 20 characters between words
            
            patterns.push(new RegExp(proximityPattern, 'gi'));
        }
    }
    
    return patterns;
}


checkForTreasure(text, config) {
    const matches = {
        found: false,
        evidence: [],
        confidence: 'low',
        patternMatches: []
    };

    // Check minimum length requirement
    if (config.minLength && text.length < config.minLength) {
        return matches;
    }

    // QUICK FIX 1: Normalize spacing before pattern matching
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    // Check patterns
    let patternMatches = 0;
    for (const pattern of config.patterns) {
        const match = normalizedText.match(pattern);
        if (match) {
            patternMatches++;
            matches.patternMatches.push(pattern.toString());
            
            // Extract context around match
            const startIndex = Math.max(0, match.index - 75);
            const endIndex = Math.min(normalizedText.length, match.index + match[0].length + 75);
            const context = normalizedText.substring(startIndex, endIndex);
                
            // Highlight the matched portion
            const highlightedContext = context.replace(match[0], `**${match[0]}**`);
            matches.evidence.push(highlightedContext);
        }
    }

    if (patternMatches > 0) {
        matches.found = true;
        matches.confidence = patternMatches >= 2 ? 'high' : 'medium';
    }

    return matches;
}

   // Modified analyzeTreasure method
    analyzeTreasure(fullText, itemId, metadata = {}) {
        const analysis = {
            id: itemId,
            treasures: [],
            totalScore: 0,
            wordCount: fullText.split(/\s+/).length,
            hasValuableContent: false,
            contextWindows: []
        };


        console.log(`\n📄 Analyzing: ${itemId}`);
        console.log(`   Full page word count: ${analysis.wordCount}`);
        

        
        // Extract search terms from metadata
        const searchTerms = this.extractSearchTerms(metadata);
        console.log(`   Search terms: ${searchTerms.join(', ')}`);
        
        // Extract context windows
        const contextWindows = this.extractContextWindows(fullText, searchTerms);
        analysis.contextWindows = contextWindows;
        
        console.log(`   Found ${contextWindows.length} relevant context windows`);
        
        // Analyze each context window instead of full text
        contextWindows.forEach((window, idx) => {
            console.log(`\n   Analyzing window ${idx + 1}/${contextWindows.length} (${window.text.split(/\s+/).length} words)`);
            

                // QUICK FIX: Normalize the window text before analysis
    const normalizedWindowText = window.text.replace(/\s+/g, ' ').trim();
    
            // Check each treasure type within this window
            for (const [type, config] of Object.entries(this.treasurePatterns)) {
        // Pass the normalized text instead
        const matches = this.checkForTreasure(normalizedWindowText, config);
     
                
                if (matches.found) {
                    console.log(`      ${config.icon} Found ${type}!`);
                    
                    // Check if we already found this treasure type
                    const existingTreasure = analysis.treasures.find(t => t.type === type);
                    
                    if (existingTreasure) {
                        // Add evidence to existing treasure
                        existingTreasure.evidence.push(...matches.evidence);
                        existingTreasure.windowsFound.push(idx);
                    } else {
                        // Create new treasure entry
                        analysis.treasures.push({
                            type: type,
                            icon: config.icon,
                            score: config.score,
                            evidence: matches.evidence,
                            confidence: matches.confidence,
                            patternsMatched: matches.patternMatches.length,
                            windowsFound: [idx]
                        });
                        analysis.totalScore += config.score;
                        analysis.hasValuableContent = true;
                    }
                }
            }
        });

         // If no specific treasures but we found the search terms
        if (analysis.treasures.length === 0 && contextWindows.length > 0) {
            console.log(`\n   📄 Basic mention (search terms found but no specific patterns)`);
            analysis.treasures.push({
                type: 'mention',
                icon: '📄',
                score: 1,
                evidence: contextWindows.map(w => 
                    w.text.substring(0, 200) + (w.text.length > 200 ? '...' : '')
                ),
                confidence: 'low'
            });
            analysis.totalScore = 1;
        }

        console.log(`\n   Total Score: ${analysis.totalScore}`);
        
        return analysis;
    }

        // Helper to extract search terms from metadata
    extractSearchTerms(metadata) {
        const terms = [];
        
        // Extract from the film object if available
        if (metadata.film) {
            if (metadata.film.title) terms.push(metadata.film.title);
            if (metadata.film.Title) terms.push(metadata.film.Title);
        }
        
        // Extract from searchQuery if available
        if (metadata.searchQuery) {
            // Extract quoted phrases
            const quotedPhrases = metadata.searchQuery.match(/"([^"]+)"/g);
            if (quotedPhrases) {
                quotedPhrases.forEach(phrase => {
                    terms.push(phrase.replace(/"/g, ''));
                });
            }
        }
        
        // REMOVED: Don't add metadata.title as it's the publication name
        // // Add any other likely search terms
        // if (metadata.title && !terms.includes(metadata.title)) {
        //     terms.push(metadata.title);
        // }
        
        // Remove duplicates and filter out empty terms
        return [...new Set(terms)].filter(term => term && term.length > 0);
    }

}

// Test function
function testTreasureAnalyzer() {
    console.log('🧪 Testing Historical Treasure Analyzer\n');
    console.log('=' .repeat(70));
    
    // Load your JSON file
    const jsonPath = process.argv[2] || 'full-text-results.json';
    
    if (!fs.existsSync(jsonPath)) {
        console.error(`❌ File not found: ${jsonPath}`);
        console.log('\nUsage: node test-treasure-analyzer.js [path-to-json]');
        process.exit(1);
    }
    
    console.log(`📂 Loading OCR data from: ${jsonPath}\n`);
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Create analyzer
    const analyzer = new HistoricalTreasureAnalyzer();
    
    // Analyze each treasure in the JSON
    const results = [];
    const treasures = data.treasures || [data]; // Handle both formats
    
    treasures.forEach((item, index) => {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`ANALYZING ITEM ${index + 1}/${treasures.length}`);
        console.log(`${'='.repeat(70)}`);
        
        const fullText = item.fullText || item.body || '';
        const id = item.id || `item-${index}`;
        
        // Enhanced metadata to include search information
        const metadata = {
            publisher: item.publisher || item.title,
            date: item.date,
            year: item.year,
            film: data.film || item.film,  // Pass film data
            searchQuery: item.searchQuery || data.searchQuery,  // Pass search query
            title: item.title
        };
        
        const analysis = analyzer.analyzeTreasure(fullText, id, metadata);
        results.push(analysis);
    });
    
    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 ANALYSIS SUMMARY');
    console.log(`${'='.repeat(70)}\n`);
    
    const totalTreasures = results.reduce((sum, r) => sum + r.treasures.length, 0);
    const treasureTypes = {};
    
    results.forEach(result => {
        result.treasures.forEach(treasure => {
            treasureTypes[treasure.type] = (treasureTypes[treasure.type] || 0) + 1;
        });
    });
    
    console.log(`Total items analyzed: ${results.length}`);
    console.log(`Total treasures found: ${totalTreasures}`);
    console.log(`\nTreasure breakdown:`);
    
    Object.entries(treasureTypes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
            const config = analyzer.treasurePatterns[type] || { icon: '📄' };
            console.log(`  ${config.icon} ${type}: ${count}`);
        });
    
    // Save results
    const outputPath = 'treasure-analysis-test.json';
    fs.writeFileSync(outputPath, JSON.stringify({
        testRun: new Date().toISOString(),
        inputFile: jsonPath,
        results: results,
        summary: {
            itemsAnalyzed: results.length,
            totalTreasures: totalTreasures,
            treasureTypes: treasureTypes
        }
    }, null, 2));
    
    console.log(`\n💾 Detailed results saved to: ${outputPath}`);
}

// Run the test
testTreasureAnalyzer();