#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * OCR Cleaner for Magic Lantern
 * Cleans OCR text from historical periodicals for better text analysis
 */
class OCRCleaner {
    constructor(options = {}) {
        this.aggressive = options.aggressive || false;
        this.preserveLineBreaks = options.preserveLineBreaks !== false;
        this.customReplacements = options.customReplacements || {};
        
        // Common OCR errors in historical texts
        this.replacements = {
            // Character substitutions
            'ﬁ': 'fi',
            'ﬂ': 'fl',
            'ﬀ': 'ff',
            'ﬃ': 'ffi',
            'ﬄ': 'ffl',
            '«': 'e',
            'ſ': 's',  // Long s
            '¬': '-',   // Soft hyphen often mis-scanned
            
            // Common word-level OCR errors
            ' tbe ': ' the ',
            ' tBe ': ' the ',
            ' tlie ': ' the ',
            ' tiie ': ' the ',
            ' th€ ': ' the ',
            ' thc ': ' the ',
            ' tho ': ' the ',
            ' Tbe ': ' The ',
            ' arid ': ' and ',
            ' anil ': ' and ',
            ' aud ': ' and ',
            ' lias ': ' has ',
            ' liave ': ' have ',
            ' wlio ': ' who ',
            ' witli ': ' with ',
            ' tliat ': ' that ',
            ' tliis ': ' this ',
            ' whicli ': ' which ',
            ' wlien ': ' when ',
            ' wliere ': ' where ',
            ' tliere ': ' there ',
            ' tlieir ': ' their ',
            ' tliey ': ' they ',
            ' miglit ': ' might ',
            ' thouglit ': ' thought ',
            ' brouglit ': ' brought ',
            ' sliould ': ' should ',
            ' sliall ': ' shall ',
            ' higlily ': ' highly ',
            ' riglits ': ' rights ',
            
            // Number/letter confusion
            ' 0f ': ' of ',
            ' 0n ': ' on ',
            ' t0 ': ' to ',
            ' g0 ': ' go ',
            ' d0 ': ' do ',
            ' n0t ': ' not ',
            ' n0w ': ' now ',
            ' 0ne ': ' one ',
            ' tw0 ': ' two ',
            ' als0 ': ' also ',
            ' wh0 ': ' who ',
            ' 0ther ': ' other ',
            ' m0re ': ' more ',
            ' s0me ': ' some ',
            ' 0nly ': ' only ',
            ' pe0ple ': ' people ',
            ' 0ver ': ' over ',
            
            // Letter/number at word boundaries
            '1n ': 'in ',
            '1s ': 'is ',
            '1t ': 'it ',
            ' 1 ': ' I ',
            ' l ': ' I ',  // Lowercase L as I
            
            // Punctuation issues
            ' , ': ', ',
            ' . ': '. ',
            ' ; ': '; ',
            ' : ': ': ',
            ' ! ': '! ',
            ' ? ': '? ',
            ',,': ',',
            '..': '.',
            '  ': ' ',  // Double spaces
            
            // Film industry specific
            'M-G-M': 'MGM',
            'M. G. M.': 'MGM',
            'R K O': 'RKO',
            'R. K. O.': 'RKO',
            '2Oth Century': '20th Century',
            'Centuiy': 'Century',
            'Pictuies': 'Pictures',
            'Pictui-es': 'Pictures',
            'Pai-amount': 'Paramount',
            'Wai-ner': 'Warner'
        };
        
        // Patterns that need regex
        this.regexPatterns = [
            // Fix hyphenation at line breaks
            { pattern: /(\w+)-\s*\n\s*(\w+)/g, replacement: '$1$2' },

            // Multiple spaces
            { pattern: /\s{2,}/g, replacement: ' ' },

            // Broken sentences
            { pattern: /([a-z])\s*\n\s*([a-z])/g, replacement: '$1 $2' },

            // Floating punctuation
            { pattern: /\s+([,.;:!?])/g, replacement: '$1' },

            // Opening quotes/parens - only remove spaces WITHIN the quotes/parens
            // { pattern: /([(\[])\s+(\w)/g, replacement: '$1$2' },
            // { pattern: /"\s+(\w)/g, replacement: '"$1' },

            // Closing quotes/parens - only remove spaces WITHIN the quotes/parens
            // { pattern: /(\w)\s+([\)\]])/g, replacement: '$1$2' },
            // { pattern: /(\w)\s+"/g, replacement: '$1"' },

            // Page numbers (optional removal)
            { pattern: /^\s*\d{1,4}\s*$/gm, replacement: '' },

            // Headers/footers (common patterns)
            { pattern: /^(VARIETY|MOTION PICTURE HERALD|THE FILM DAILY|MOTOGRAPHY).*\d{4}\s*$/gm, replacement: '' }
        ];
        
        // Industry-specific term corrections
        this.industryTerms = {
            'pix': 'pictures',
            'pic': 'picture',
            'pres': 'president',
            'exec': 'executive',
            'dir': 'director',
            'prod': 'producer',
            'dist': 'distributor',
            'exhib': 'exhibitor'
        };
    }
    
    /**
     * Main cleaning function
     */
    clean(text) {
        if (!text) return '';
        
        // Step 1: Basic character replacements
        for (const [find, replace] of Object.entries(this.replacements)) {
            text = text.split(find).join(replace);
        }
        
        // Step 2: Apply custom replacements if provided
        for (const [find, replace] of Object.entries(this.customReplacements)) {
            text = text.split(find).join(replace);
        }
        
        // Step 3: Regex patterns
        for (const {pattern, replacement} of this.regexPatterns) {
            text = text.replace(pattern, replacement);
        }
        
        // Step 4: Fix line breaks if needed
        if (!this.preserveLineBreaks) {
            text = this.mergeLines(text);
        }
        
        // Step 5: Aggressive cleaning if requested
        if (this.aggressive) {
            text = this.aggressiveClean(text);
        }
        
        // Step 6: Final cleanup
        text = text.trim();
        
        return text;
    }
    
    /**
     * Merge lines intelligently
     */
    mergeLines(text) {
        // Preserve paragraph breaks (double line breaks)
        const paragraphs = text.split(/\n\s*\n/);
        
        const mergedParagraphs = paragraphs.map(para => {
            // Remove line breaks within paragraphs
            return para.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        });
        
        return mergedParagraphs.join('\n\n');
    }
    
    /**
     * More aggressive cleaning for heavily corrupted text
     */
    aggressiveClean(text) {
        // Remove non-ASCII characters except common ones
        text = text.replace(/[^\x00-\x7F£€]/g, '');
        
        // Fix m/rn confusion
        text = text.replace(/\brn\b/g, 'm');
        text = text.replace(/\bcorn\b/g, 'com');
        text = text.replace(/\bfrorn\b/g, 'from');
        
        // Fix common ending patterns
        text = text.replace(/\btion\b/g, 'tion');
        text = text.replace(/\bment\b/g, 'ment');
        
        return text;
    }
    
    /**
     * Analyze OCR quality
     */
    analyzeQuality(text) {
        const issues = {
            suspiciousPatterns: 0,
            nonAscii: 0,
            likelyErrors: 0,
            brokenWords: 0
        };
        
        // Count suspicious patterns
        const suspiciousPatterns = [
            /[0-9][a-z]/g,  // Numbers followed by letters
            /[a-z][0-9]/g,  // Letters followed by numbers
            /[A-Z]{20,}/g,  // Very long uppercase sequences
            /[^a-zA-Z0-9\s]{5,}/g  // Long sequences of special chars
        ];
        
        for (const pattern of suspiciousPatterns) {
            const matches = text.match(pattern);
            if (matches) issues.suspiciousPatterns += matches.length;
        }
        
        // Count non-ASCII
        const nonAscii = text.match(/[^\x00-\x7F]/g);
        if (nonAscii) issues.nonAscii = nonAscii.length;
        
        // Count likely OCR errors
        const errorPatterns = ['tbe', 'tlie', 'arid', 'lias', 'wlio'];
        for (const error of errorPatterns) {
            const regex = new RegExp(`\\b${error}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) issues.likelyErrors += matches.length;
        }
        
        // Estimate quality score (0-100)
        const wordCount = text.split(/\s+/).length;
        const errorRate = (issues.suspiciousPatterns + issues.likelyErrors) / wordCount;
        const qualityScore = Math.max(0, Math.min(100, 100 - (errorRate * 500)));
        
        return {
            qualityScore: qualityScore.toFixed(1),
            wordCount,
            issues,
            recommendation: qualityScore > 80 ? 'Good' : 
                           qualityScore > 60 ? 'Fair - cleaning recommended' :
                           qualityScore > 40 ? 'Poor - aggressive cleaning needed' :
                           'Very poor - consider manual review'
        };
    }
    
    /**
     * Process Magic Lantern results file
     */
    async processResults(filePath, options) {
        console.log('🧹 OCR CLEANER FOR MAGIC LANTERN\n');
        
        // Load results
        const results = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        let totalCleaned = 0;
        let totalAnalyzed = 0;
        const qualityScores = [];
        
        // Process each film's sources
        for (const filmResult of results) {
            console.log(`\n📽️  ${filmResult.film.title} (${filmResult.film.year})`);
            
            for (const source of filmResult.sources) {
                if (source.fullText && source.fullTextFetched) {
                    totalAnalyzed++;
                    
                    // Analyze quality
                    const quality = this.analyzeQuality(source.fullText);
                    qualityScores.push(parseFloat(quality.qualityScore));
                    
                    if (options.analyze) {
                        console.log(`   ${source.id}: Quality ${quality.qualityScore} - ${quality.recommendation}`);
                    }
                    
                    // Clean if requested
                    if (!options.analyzeOnly) {
                        const cleanedText = this.clean(source.fullText);
                        
                        // Store both versions
                        source.fullTextOriginal = source.fullText;
                        source.fullText = cleanedText;
                        source.fullTextCleaned = true;
                        source.fullTextCleanedAt = new Date().toISOString();
                        source.ocrQuality = quality;
                        
                        totalCleaned++;
                        
                        if (options.verbose) {
                            const reduction = ((source.fullTextOriginal.length - cleanedText.length) / 
                                             source.fullTextOriginal.length * 100).toFixed(1);
                            console.log(`   ✓ Cleaned ${source.id} - ${reduction}% reduction`);
                        }
                    }
                }
            }
        }
        
        // Summary statistics
        console.log('\n📊 SUMMARY\n');
        console.log(`Total sources analyzed: ${totalAnalyzed}`);
        
        if (qualityScores.length > 0) {
            const avgQuality = qualityScores.reduce((a, b) => a + b) / qualityScores.length;
            console.log(`Average OCR quality: ${avgQuality.toFixed(1)}`);
            console.log(`Quality distribution:`);
            console.log(`  Excellent (90-100): ${qualityScores.filter(s => s >= 90).length}`);
            console.log(`  Good (80-89): ${qualityScores.filter(s => s >= 80 && s < 90).length}`);
            console.log(`  Fair (60-79): ${qualityScores.filter(s => s >= 60 && s < 80).length}`);
            console.log(`  Poor (40-59): ${qualityScores.filter(s => s >= 40 && s < 60).length}`);
            console.log(`  Very Poor (<40): ${qualityScores.filter(s => s < 40).length}`);
        }
        
        if (!options.analyzeOnly) {
            console.log(`\nTotal sources cleaned: ${totalCleaned}`);
            
            // Save results
            const outputPath = options.output || filePath.replace('.json', '_cleaned.json');
            fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
            console.log(`\n💾 Saved to: ${outputPath}`);
        }
    }
    
    /**
     * Export cleaned text for external analysis
     */
    exportForAnalysis(filePath, options) {
        const results = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const outputDir = options.outputDir || 'cleaned_texts';
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        let exported = 0;
        
        for (const filmResult of results) {
            const filmDir = path.join(outputDir, 
                filmResult.film.title.replace(/[^a-z0-9]/gi, '_'));
            
            if (!fs.existsSync(filmDir)) {
                fs.mkdirSync(filmDir);
            }
            
            for (const source of filmResult.sources) {
                if (source.fullText && source.fullTextCleaned) {
                    const filename = `${source.id}.txt`;
                    const filepath = path.join(filmDir, filename);
                    
                    // Write cleaned text
                    fs.writeFileSync(filepath, source.fullText);
                    
                    // Write metadata
                    const metadata = {
                        id: source.id,
                        publication: source.scoring?.publication,
                        date: source.fullTextMetadata?.date,
                        quality: source.ocrQuality
                    };
                    fs.writeFileSync(
                        filepath.replace('.txt', '_metadata.json'),
                        JSON.stringify(metadata, null, 2)
                    );
                    
                    exported++;
                }
            }
        }
        
        console.log(`\n✅ Exported ${exported} cleaned texts to ${outputDir}/`);
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
🧹 MAGIC LANTERN OCR CLEANER

Usage: node clean-ocr.js <results.json> [options]

Options:
  --analyze             Show OCR quality analysis
  --analyze-only        Only analyze, don't clean
  --aggressive          Use aggressive cleaning (removes more)
  --no-line-breaks      Remove all line breaks within paragraphs
  --output=PATH         Output file path
  --export-texts        Export cleaned texts as separate files
  --output-dir=PATH     Directory for exported texts
  --verbose             Show detailed progress

Examples:
  # Analyze OCR quality
  node clean-ocr.js results.json --analyze-only
  
  # Clean with default settings
  node clean-ocr.js results.json
  
  # Aggressive cleaning
  node clean-ocr.js results.json --aggressive --no-line-breaks
  
  # Export for external analysis
  node clean-ocr.js results_cleaned.json --export-texts --output-dir=corpus

Custom Replacements:
  Create a JSON file with custom replacements:
  {
    "Wamer Bros": "Warner Bros",
    "Umted Artists": "United Artists"
  }
  
  Then use: --custom=replacements.json
`);
        process.exit(0);
    }
    
    const filePath = args.find(arg => !arg.startsWith('--'));
    const options = {};
    
    // Parse options
    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=');
            options[key.replace(/-/g, '')] = value || true;
        }
    });
    
    // Load custom replacements if provided
    if (options.custom) {
        try {
            options.customReplacements = JSON.parse(
                fs.readFileSync(options.custom, 'utf8')
            );
        } catch (error) {
            console.error(`Error loading custom replacements: ${error.message}`);
            process.exit(1);
        }
    }
    
    const cleaner = new OCRCleaner(options);
    
    if (options.exporttexts) {
        cleaner.exportForAnalysis(filePath, options);
    } else {
        cleaner.processResults(filePath, options);
    }
}

module.exports = OCRCleaner;