#!/usr/bin/env node

/**
 * Magic Lantern Results Reprocessor
 * 
 * Reprocesses existing Magic Lantern JSON results with updated Content Analysis
 * without running a full search. Useful for applying new theme, significance, and
 * entity analysis patterns to previously collected data.
 * 
 * Usage:
 *   node reprocess-results.js <input-file> [options]
 * 
 * Options:
 *   --output, -o     Output file path (default: adds _reprocessed suffix)
 *   --config         Content analyzer config (json string)
 *   --stats-only     Only show statistics without saving
 *   --help, -h       Show help
 * 
 * Examples:
 *   node reprocess-results.js results/full-text-results_20250606_002042.json
 *   node reprocess-results.js treasures_20250606_002042.json --output new-treasures.json
 *   node reprocess-results.js results.json --stats-only
 */

const fs = require('fs');
const path = require('path');
const ContentTypeEnhancer = require('./lib/content-type-enhancer');

class ResultsReprocessor {
    constructor(options = {}) {
        // Default enhancer config
        const defaultConfig = {
            includeEvidence: true,
            enhanceExcerpts: true,
            minConfidence: 'low'
        };
        
        // Merge with user config if provided
        this.enhancerConfig = { ...defaultConfig, ...options.enhancerConfig };
        
        // Initialize content analyzer  
        this.enhancer = new ContentTypeEnhancer(this.enhancerConfig);
        
        this.verbose = options.verbose || false;
    }
    
    /**
     * Load results from JSON file
     */
    loadResults(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Input file not found: ${filePath}`);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        let data;
        
        try {
            data = JSON.parse(content);
        } catch (error) {
            throw new Error(`Invalid JSON in input file: ${error.message}`);
        }
        
        return data;
    }
    
    /**
     * Identify the type of results file and extract full text results
     */
    extractFullTextResults(data) {
        if (Array.isArray(data)) {
            // Check if it's a treasures file (array of films with treasures)
            if (data.length > 0 && data[0].film && data[0].treasures) {
                console.log('📁 Detected treasures file format');
                return this.extractFromTreasuresFile(data);
            }
            // Check if it's already full text results
            else if (data.length > 0 && data[0].fullText) {
                console.log('📁 Detected individual full text results format');
                return data;
            }
        }
        
        // Check if it's a full-text-results file (array of films with treasures array)
        if (Array.isArray(data) && data.length > 0 && data[0].film && data[0].treasures) {
            console.log('📁 Detected full-text-results file format');
            return this.extractFromFullTextResultsFile(data);
        }
        
        throw new Error('Unrecognized results file format. Expected treasures or full-text-results format.');
    }
    
    /**
     * Extract from treasures file format
     */
    extractFromTreasuresFile(data) {
        const fullTextResults = [];
        
        data.forEach(filmData => {
            if (filmData.treasures && Array.isArray(filmData.treasures)) {
                filmData.treasures.forEach(treasure => {
                    if (treasure.fullText) {
                        fullTextResults.push({
                            ...treasure,
                            film: filmData.film
                        });
                    }
                });
            }
        });
        
        return fullTextResults;
    }
    
    /**
     * Extract from full-text-results file format
     */
    extractFromFullTextResultsFile(data) {
        const fullTextResults = [];
        
        data.forEach(filmData => {
            if (filmData.treasures && Array.isArray(filmData.treasures)) {
                filmData.treasures.forEach(treasure => {
                    if (treasure.fullText) {
                        fullTextResults.push({
                            ...treasure,
                            film: filmData.film
                        });
                    }
                });
            }
        });
        
        return fullTextResults;
    }
    
    /**
     * Reprocess results with Content Analyzer
     */
    reprocessResults(fullTextResults) {
        console.log(`🔄 Reprocessing ${fullTextResults.length} full text results...`);
        
        const reprocessed = [];
        let processed = 0;
        
        for (const result of fullTextResults) {
            if (this.verbose && processed % 10 === 0) {
                console.log(`   Processing ${processed + 1}/${fullTextResults.length}...`);
            }
            
            try {
                const enhanced = this.enhancer.enhanceResult(result);
                reprocessed.push(enhanced);
            } catch (error) {
                console.warn(`⚠️  Error processing result ${result.id}: ${error.message}`);
                // Include original result with error flag
                reprocessed.push({
                    ...result,
                    reprocessingError: error.message
                });
            }
            
            processed++;
        }
        
        console.log(`✅ Reprocessed ${processed} results`);
        return reprocessed;
    }
    
    /**
     * Generate before/after statistics
     */
    generateStatistics(originalResults, reprocessedResults) {
        const stats = {
            processing: {
                originalCount: originalResults.length,
                reprocessedCount: reprocessedResults.length,
                errorCount: reprocessedResults.filter(r => r.reprocessingError).length
            },
            before: this.analyzeResults(originalResults, 'original'),
            after: this.analyzeResults(reprocessedResults, 'reprocessed')
        };
        
        return stats;
    }
    
    /**
     * Analyze results to generate statistics
     */
    analyzeResults(results, label) {
        const analysis = {
            total: results.length,
            withContentAnalysis: 0,
            bySignificanceLevel: { high: 0, medium: 0, low: 0 },
            byTheme: {},
            bySignificance: {},
            averageContentScore: 0,
            scoreDistribution: { 'score_0-2': 0, 'score_2-5': 0, 'score_5-8': 0, 'score_8-10': 0 },
            entities: {
                people: new Set(),
                companies: new Set(),
                places: new Set()
            }
        };
        
        let totalScore = 0;
        
        results.forEach(result => {
            // Skip results with reprocessing errors
            if (result.reprocessingError) return;
            
            // Check for content analysis
            if (result.contentAnalysis) {
                analysis.withContentAnalysis++;
                
                // Significance level (based on presence of themes and significance indicators)
                const hasSignificance = result.contentAnalysis.significance?.length > 0;
                const hasThemes = result.contentAnalysis.themes?.length > 0;
                
                if (hasSignificance) {
                    analysis.bySignificanceLevel.high++;
                } else if (hasThemes) {
                    analysis.bySignificanceLevel.medium++;
                } else {
                    analysis.bySignificanceLevel.low++;
                }
                
                // Themes
                if (result.contentAnalysis.themes) {
                    result.contentAnalysis.themes.forEach(theme => {
                        analysis.byTheme[theme] = (analysis.byTheme[theme] || 0) + 1;
                    });
                }
                
                // Significance indicators
                if (result.contentAnalysis.significance) {
                    result.contentAnalysis.significance.forEach(sig => {
                        analysis.bySignificance[sig] = (analysis.bySignificance[sig] || 0) + 1;
                    });
                }
                
                // Entities
                if (result.contentAnalysis.entities) {
                    const entities = result.contentAnalysis.entities;
                    if (entities.people) entities.people.forEach(p => analysis.entities.people.add(p));
                    if (entities.companies) entities.companies.forEach(c => analysis.entities.companies.add(c));
                    if (entities.places) entities.places.forEach(pl => analysis.entities.places.add(pl));
                }
            }
            
            
            // Content score
            const score = result.contentScore || 0;
            totalScore += score;
            
            // Score distribution
            if (score < 2) analysis.scoreDistribution['score_0-2']++;
            else if (score < 5) analysis.scoreDistribution['score_2-5']++;
            else if (score < 8) analysis.scoreDistribution['score_5-8']++;
            else analysis.scoreDistribution['score_8-10']++;
        });
        
        analysis.averageContentScore = analysis.total > 0 
            ? Math.round((totalScore / analysis.total) * 10) / 10 
            : 0;
        
        // Convert sets to arrays for JSON serialization
        analysis.entities.people = Array.from(analysis.entities.people);
        analysis.entities.companies = Array.from(analysis.entities.companies);
        analysis.entities.places = Array.from(analysis.entities.places);
        
        return analysis;
    }
    
    /**
     * Print statistics to console
     */
    printStatistics(stats) {
        console.log('\n📊 REPROCESSING STATISTICS');
        console.log('='.repeat(50));
        
        // Processing summary
        console.log('\n🔄 Processing Summary:');
        console.log(`   Original results: ${stats.processing.originalCount}`);
        console.log(`   Reprocessed: ${stats.processing.reprocessedCount}`);
        if (stats.processing.errorCount > 0) {
            console.log(`   ⚠️  Errors: ${stats.processing.errorCount}`);
        }
        
        // Before/After comparison
        console.log('\n📈 Content Analysis Comparison:');
        console.log(`   Results with content analysis:`);
        console.log(`     Before: ${stats.before.withContentAnalysis}/${stats.before.total} (${Math.round(stats.before.withContentAnalysis/stats.before.total*100)}%)`);
        console.log(`     After:  ${stats.after.withContentAnalysis}/${stats.after.total} (${Math.round(stats.after.withContentAnalysis/stats.after.total*100)}%)`);
        
        console.log(`\n   Average content score:`);
        console.log(`     Before: ${stats.before.averageContentScore}`);
        console.log(`     After:  ${stats.after.averageContentScore}`);
        
        
        // Significance level distribution
        console.log('\n🎯 Significance Level Distribution (After):');
        Object.entries(stats.after.bySignificanceLevel).forEach(([level, count]) => {
            const percentage = Math.round(count / stats.after.total * 100);
            console.log(`   ${level}: ${count} (${percentage}%)`);
        });
        
        // Top themes
        if (Object.keys(stats.after.byTheme).length > 0) {
            console.log('\n🏷️  Top Themes (After):');
            Object.entries(stats.after.byTheme)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .forEach(([theme, count]) => {
                    console.log(`   ${theme}: ${count}`);
                });
        }
        
        // Top significance indicators
        if (Object.keys(stats.after.bySignificance).length > 0) {
            console.log('\n⭐ Top Significance Indicators (After):');
            Object.entries(stats.after.bySignificance)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .forEach(([sig, count]) => {
                    console.log(`   ${sig}: ${count}`);
                });
        }
        
        // Score distribution
        console.log('\n📊 Score Distribution (After):');
        Object.entries(stats.after.scoreDistribution).forEach(([range, count]) => {
            const percentage = Math.round(count / stats.after.total * 100);
            console.log(`   ${range}: ${count} (${percentage}%)`);
        });
        
        // Entity counts
        console.log('\n👥 Entities Discovered (After):');
        console.log(`   People: ${stats.after.entities.people.length}`);
        console.log(`   Companies: ${stats.after.entities.companies.length}`);
        console.log(`   Places: ${stats.after.entities.places.length}`);
    }
    
    /**
     * Save reprocessed results
     */
    saveResults(reprocessedResults, originalData, outputPath, inputFormat) {
        // Reconstruct the original file format
        let outputData;
        
        if (inputFormat === 'treasures') {
            // Group by film for treasures format
            const filmMap = new Map();
            
            reprocessedResults.forEach(result => {
                const filmKey = JSON.stringify(result.film);
                if (!filmMap.has(filmKey)) {
                    filmMap.set(filmKey, {
                        film: result.film,
                        treasures: []
                    });
                }
                
                // Remove film from individual result to avoid duplication
                const { film, ...treasureData } = result;
                filmMap.get(filmKey).treasures.push(treasureData);
            });
            
            outputData = Array.from(filmMap.values());
        } else {
            // For full-text-results format, maintain the original structure
            outputData = originalData.map(filmData => {
                const reprocessedTreasures = reprocessedResults.filter(r => 
                    JSON.stringify(r.film) === JSON.stringify(filmData.film)
                );
                
                return {
                    ...filmData,
                    treasures: reprocessedTreasures.map(({ film, ...treasureData }) => treasureData)
                };
            });
        }
        
        // Add metadata
        const finalOutput = {
            metadata: {
                reprocessedAt: new Date().toISOString(),
                reprocessorVersion: '1.0.0',
                analyzerConfig: this.enhancerConfig,
                totalResults: reprocessedResults.length,
                errorCount: reprocessedResults.filter(r => r.reprocessingError).length
            },
            data: outputData
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2));
        console.log(`\n💾 Reprocessed results saved to: ${outputPath}`);
    }
    
    /**
     * Main reprocessing workflow
     */
    async reprocess(inputPath, options = {}) {
        try {
            console.log(`🔍 Loading results from: ${inputPath}`);
            
            // Load original data
            const originalData = this.loadResults(inputPath);
            
            // Extract full text results
            const fullTextResults = this.extractFullTextResults(originalData);
            console.log(`📖 Found ${fullTextResults.length} full text results to reprocess`);
            
            if (fullTextResults.length === 0) {
                console.log('❌ No full text results found in input file');
                return;
            }
            
            // Reprocess with Content Analyzer
            const reprocessedResults = this.reprocessResults(fullTextResults);
            
            // Generate statistics
            const stats = this.generateStatistics(fullTextResults, reprocessedResults);
            
            // Print statistics
            this.printStatistics(stats);
            
            // Save results if not stats-only mode
            if (!options.statsOnly) {
                // Determine output path
                const outputPath = options.output || this.generateOutputPath(inputPath);
                
                // Determine input format for proper reconstruction
                const inputFormat = Array.isArray(originalData) && originalData[0]?.treasures ? 'treasures' : 'full-text-results';
                
                // Save reprocessed results
                this.saveResults(reprocessedResults, originalData, outputPath, inputFormat);
                
                // Save statistics
                const statsPath = outputPath.replace(/\.json$/, '_stats.json');
                fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
                console.log(`📈 Statistics saved to: ${statsPath}`);
            }
            
            console.log('\n✨ Reprocessing complete!');
            
        } catch (error) {
            console.error(`❌ Error during reprocessing: ${error.message}`);
            if (this.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
    
    /**
     * Generate output path with _reprocessed suffix
     */
    generateOutputPath(inputPath) {
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const base = path.basename(inputPath, ext);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        return path.join(dir, `${base}_reprocessed_${timestamp}${ext}`);
    }
}

// CLI handling
function showHelp() {
    console.log(`
Magic Lantern Results Reprocessor

Reprocesses existing Magic Lantern JSON results with updated Content Analysis
without running a full search.

Usage:
  node reprocess-results.js <input-file> [options]

Options:
  --output, -o <file>    Output file path (default: adds _reprocessed suffix)
  --config <json>        Content analyzer config as JSON string
  --stats-only           Only show statistics without saving reprocessed results
  --verbose, -v          Show detailed processing information
  --help, -h             Show this help

Examples:
  node reprocess-results.js results/full-text-results_20250606_002042.json
  node reprocess-results.js treasures_20250606_002042.json --output new-treasures.json
  node reprocess-results.js results.json --stats-only
  node reprocess-results.js results.json --config '{"minConfidence":"medium","includeEvidence":false}'

Supported Input Formats:
  - full-text-results_*.json files (from Magic Lantern full searches)
  - treasures_*.json files (treasure-only exports)
  - Any JSON file with the expected Magic Lantern result structure
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }
    
    const inputFile = args[0];
    const options = {};
    
    // Parse command line options
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--output' || arg === '-o') {
            options.output = args[++i];
        } else if (arg === '--config') {
            try {
                options.enhancerConfig = JSON.parse(args[++i]);
            } catch (error) {
                console.error('❌ Invalid JSON in --config option');
                process.exit(1);
            }
        } else if (arg === '--stats-only') {
            options.statsOnly = true;
        } else if (arg === '--verbose' || arg === '-v') {
            options.verbose = true;
        }
    }
    
    // Create reprocessor and run
    const reprocessor = new ResultsReprocessor({
        enhancerConfig: options.enhancerConfig,
        verbose: options.verbose
    });
    
    reprocessor.reprocess(inputFile, options);
}

module.exports = ResultsReprocessor;