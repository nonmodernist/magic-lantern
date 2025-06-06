// test-with-existing-results.js
// Test the historical content analyzer with your previous Magic Lantern results

const fs = require('fs');
const path = require('path');
const ContentTypeEnhancer = require('../lib/content-type-enhancer');

function loadLatestResults() {
    const resultsDir = path.join(__dirname, '..', 'results');
    
    if (!fs.existsSync(resultsDir)) {
        console.error('❌ No results directory found. Run Magic Lantern at least once first.');
        return null;
    }
    
    // Find all full-text-results files
    const files = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith('full-text-results_') && f.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first
    
    if (files.length === 0) {
        console.error('❌ No full-text results files found in results directory.');
        return null;
    }
    
    console.log(`\n📁 Found ${files.length} result file(s):`);
    files.slice(0, 5).forEach((file, i) => {
        console.log(`   ${i + 1}. ${file}`);
    });
    
    // Load the most recent by default
    const fileToLoad = files[0];
    console.log(`\n📂 Loading: ${fileToLoad}`);
    
    try {
        const data = JSON.parse(fs.readFileSync(path.join(resultsDir, fileToLoad), 'utf8'));
        return { filename: fileToLoad, data };
    } catch (error) {
        console.error(`❌ Error loading file: ${error.message}`);
        return null;
    }
}

async function analyzeExistingResults() {
    console.log('🧪 Testing Historical Content Analyzer with Real Data\n');
    console.log('=' .repeat(70));
    
    // Load results
    const results = loadLatestResults();
    if (!results) return;
    
    console.log(`\n✅ Loaded results from: ${results.filename}`);
    
    // Initialize enhancer
    const enhancer = new ContentTypeEnhancer({
        includeEvidence: true,
        enhanceExcerpts: true
    });
    
    // Process each film's results
    let totalTreasures = 0;
    let totalProcessed = 0;
    const allEnhancedResults = [];
    
    results.data.forEach((filmData, filmIndex) => {
        const film = filmData.film;
        const treasures = filmData.treasures || filmData.fullTextAnalyzed || [];
        
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🎬 Film ${filmIndex + 1}: ${film.title} (${film.year})`);
        console.log(`   Processing ${treasures.length} full text results...`);
        console.log(`${'='.repeat(70)}`);
        
        // Enhance each treasure/full text result
        treasures.forEach((treasure, index) => {
            // Skip if no full text
            if (!treasure.fullText) {
                console.log(`   ⚠️  Skipping result ${index + 1} - no full text`);
                return;
            }
            
            totalProcessed++;
            
            // Enhance the result
            const enhanced = enhancer.enhanceResult(treasure);
            allEnhancedResults.push({
                ...enhanced,
                filmTitle: film.title,
                filmYear: film.year
            });
            
            // Display analysis
            console.log(`\n   📄 Result ${index + 1}: ${treasure.publication || treasure.title || 'Unknown'}`);
            console.log(`      ID: ${treasure.id}`);
            console.log(`      Word count: ${treasure.wordCount || treasure.fullText.split(/\s+/).length}`);
            console.log(`      Primary type: ${enhanced.contentAnalysis.primaryType} (${enhanced.contentAnalysis.confidence})`);
            console.log(`      Content score: ${enhanced.contentScore}`);
            console.log(`      Is treasure: ${enhanced.isTreasure ? '⭐ YES!' : 'No'}`);
            
            // Show all detected types
            if (enhanced.contentAnalysis.allTypes.length > 1) {
                console.log(`      Other types:`);
                enhanced.contentAnalysis.allTypes.slice(1).forEach(type => {
                    console.log(`        - ${type.type} (${type.confidence})`);
                });
            }
            
            // Show enhanced excerpt
            if (enhanced.enhancedExcerpt) {
                console.log(`      Key excerpt: "${enhanced.enhancedExcerpt.substring(0, 150)}..."`);
            }
            
            if (enhanced.isTreasure) {
                totalTreasures++;
                console.log(`      🌟 TREASURE FOUND!`);
            }
        });
        
        // Film summary
        const filmResults = allEnhancedResults.filter(r => 
            r.filmTitle === film.title && r.filmYear === film.year
        );
        const filmStats = enhancer.getEnhancementStats(filmResults);
        
        console.log(`\n   📊 Film Summary:`);
        console.log(`      Total analyzed: ${filmStats.total}`);
        console.log(`      Treasures: ${filmStats.treasures}`);
        console.log(`      Average score: ${filmStats.averageContentScore}`);
        console.log(`      Content types: ${Object.entries(filmStats.byType)
            .map(([type, count]) => `${type}(${count})`)
            .join(', ')}`);
    });
    
    // Overall statistics
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 OVERALL ANALYSIS SUMMARY');
    console.log(`${'='.repeat(70)}`);
    
    const overallStats = enhancer.getEnhancementStats(allEnhancedResults);
    
    console.log(`\nTotal items processed: ${totalProcessed}`);
    console.log(`Total treasures found: ${totalTreasures} ⭐`);
    console.log(`Treasure rate: ${((totalTreasures / totalProcessed) * 100).toFixed(1)}%`);
    console.log(`Average content score: ${overallStats.averageContentScore}`);
    
    console.log('\nContent type distribution:');
    const sortedTypes = Object.entries(overallStats.byType)
        .sort((a, b) => b[1] - a[1]);
    sortedTypes.forEach(([type, count]) => {
        const percentage = ((count / totalProcessed) * 100).toFixed(1);
        console.log(`  ${type}: ${count} (${percentage}%)`);
    });
    
    console.log('\nConfidence distribution:');
    Object.entries(overallStats.byConfidence).forEach(([level, count]) => {
        const percentage = ((count / totalProcessed) * 100).toFixed(1);
        console.log(`  ${level}: ${count} (${percentage}%)`);
    });
    
    // Find the best treasures
    const sortedTreasures = enhancer.sortByContentValue(
        allEnhancedResults.filter(r => r.isTreasure)
    );
    
    if (sortedTreasures.length > 0) {
        console.log(`\n${'='.repeat(70)}`);
        console.log('⭐ TOP TREASURES');
        console.log(`${'='.repeat(70)}`);
        
        sortedTreasures.slice(0, 5).forEach((treasure, i) => {
            console.log(`\n${i + 1}. ${treasure.filmTitle} (${treasure.filmYear})`);
            console.log(`   Publication: ${treasure.publication || treasure.title}`);
            console.log(`   Type: ${treasure.contentAnalysis.primaryType} (${treasure.contentAnalysis.confidence})`);
            console.log(`   Score: ${treasure.contentScore}`);
            if (treasure.enhancedExcerpt) {
                console.log(`   Excerpt: "${treasure.enhancedExcerpt.substring(0, 200)}..."`);
            }
        });
    }
    
    // Save enhanced results
    const outputFilename = `enhanced-analysis_${new Date().toISOString().split('T')[0]}.json`;
    const outputPath = path.join(__dirname, '..', 'results', outputFilename);
    
    fs.writeFileSync(outputPath, JSON.stringify({
        sourceFile: results.filename,
        analysisDate: new Date().toISOString(),
        stats: overallStats,
        treasures: sortedTreasures,
        allResults: allEnhancedResults
    }, null, 2));
    
    console.log(`\n💾 Enhanced analysis saved to: results/${outputFilename}`);
    
    // Pattern effectiveness analysis
    console.log(`\n${'='.repeat(70)}`);
    console.log('🎯 PATTERN EFFECTIVENESS');
    console.log(`${'='.repeat(70)}`);
    
    // Track which patterns are actually matching
    const patternHits = {};
    allEnhancedResults.forEach(result => {
        result.contentAnalysis.allTypes.forEach(type => {
            patternHits[type.type] = (patternHits[type.type] || 0) + type.matchCount;
        });
    });
    
    console.log('\nPattern matches by type:');
    Object.entries(patternHits)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, hits]) => {
            console.log(`  ${type}: ${hits} total matches`);
        });
}

// Allow specifying a specific file as command line argument
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
        console.log('Usage: node test-with-existing-results.js [options]');
        console.log('Options:');
        console.log('  --help    Show this help message');
        console.log('\nThis script analyzes your most recent Magic Lantern results.');
        console.log('Result files are loaded from the ./results directory.');
    } else {
        analyzeExistingResults();
    }
}

module.exports = { analyzeExistingResults };