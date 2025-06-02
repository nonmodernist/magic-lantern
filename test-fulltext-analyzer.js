#!/usr/bin/env node

// test-treasure-analyzer.js - Test historical pattern matching on existing OCR data
const fs = require('fs');

class HistoricalTreasureAnalyzer {
    constructor() {
        // Period-appropriate patterns for 1910-1960 trade publications
        this.treasurePatterns = {
            fullReview: {
                patterns: [
                    // Period review language
                    /\b(picture|photoplay|film)\s+(is|proves)\s+(excellent|superb|mediocre|disappointing)/i,
                    /\b(rates?|rating)\s+(high|low|fair|good|excellent)/i,
                    /\bbox[\s-]?office\s+(natural|wow|smash|dud)/i,
                    /\b(should|will)\s+(please|satisfy|disappoint)\s+(audiences|patrons|exhibitors)/i,
                    /\b(direction|acting|photography|story)\s+(excellent|good|fair|poor)/i,
                    /\bworth\s+(booking|playing|showing)/i,
                    /\b(entertainment|program)\s+value/i,
                    /\bexhibitor[s']?\s+(angle|slant|reports?)/i,
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
                    // Period photo captions
                    /\bscene\s+from\s+(the\s+)?(photoplay|picture|production)/i,
                    /\b(above|below)[:\s]+(scene|view|shot)\s+from/i,
                    /\bexclusive\s+(photo|photograph|picture)/i,
                    /\bpictured\s+(above|here|below)/i,
                    /\b(production|working)\s+still/i,
                    /\bon\s+the\s+set\s+(of|with)/i,
                    /\bcamera\s+catches/i,
                    /\b(see|note)\s+(illustration|photo)/i,
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

        // Check patterns
        let patternMatches = 0;
        for (const pattern of config.patterns) {
            const match = text.match(pattern);
            if (match) {
                patternMatches++;
                matches.patternMatches.push(pattern.toString());
                
                // Extract context around match
                const startIndex = Math.max(0, match.index - 75);
                const endIndex = Math.min(text.length, match.index + match[0].length + 75);
                const context = text.substring(startIndex, endIndex)
                    .replace(/\s+/g, ' ')
                    .trim();
                    
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

    analyzeTreasure(fullText, itemId, metadata = {}) {
        const analysis = {
            id: itemId,
            treasures: [],
            totalScore: 0,
            wordCount: fullText.split(/\s+/).length,
            hasValuableContent: false
        };

        console.log(`\n📄 Analyzing: ${itemId}`);
        console.log(`   Word count: ${analysis.wordCount}`);
        console.log(`   Publisher: ${metadata.publisher || 'Unknown'}`);

        // Check each treasure type
        for (const [type, config] of Object.entries(this.treasurePatterns)) {
            const matches = this.checkForTreasure(fullText, config);
            
            if (matches.found) {
                console.log(`\n   ${config.icon} Found ${type}!`);
                console.log(`      Confidence: ${matches.confidence}`);
                console.log(`      Patterns matched: ${matches.patternMatches.length}`);
                
                analysis.treasures.push({
                    type: type,
                    icon: config.icon,
                    score: config.score,
                    evidence: matches.evidence,
                    confidence: matches.confidence,
                    patternsMatched: matches.patternMatches.length
                });
                analysis.totalScore += config.score;
                analysis.hasValuableContent = true;

                // Show first evidence
                if (matches.evidence.length > 0) {
                    console.log(`      Evidence: "${matches.evidence[0]}"`);
                }
            }
        }

        // If no specific treasures but substantial text
        if (analysis.treasures.length === 0 && analysis.wordCount > 50) {
            console.log(`\n   📄 Basic mention (no specific patterns matched)`);
            analysis.treasures.push({
                type: 'mention',
                icon: '📄',
                score: 1,
                evidence: ['Brief mention in trade publication'],
                confidence: 'low'
            });
            analysis.totalScore = 1;
        }

        console.log(`\n   Total Score: ${analysis.totalScore}`);
        
        return analysis;
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
        const metadata = {
            publisher: item.publisher || item.title,
            date: item.date,
            year: item.year
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