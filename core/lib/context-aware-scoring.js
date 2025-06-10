// core/lib/context-aware-scoring.js
// Context-aware scoring algorithm for Magic Lantern
// Designed to work with limited excerpts and poor OCR quality

class ContextAwareScoring {
    constructor(config = {}) {
        // Default weights that acknowledge our limitations
        this.weights = {
            sourceCredibility: config.sourceCredibility || 0.35,
            searchPrecision: config.searchPrecision || 0.25,
            diversity: config.diversity || 0.25,
            lanternRelevance: config.lanternRelevance || 0.15
        };
        
        // Trust levels for different search strategies
        this.strategyTrust = {
            // High precision searches
            'exact_title': 0.95,
            'author_title': 0.92,
            'novel_film_title': 0.90,
            'director_title': 0.88,
            'title_no_article': 0.85,
            
            // Medium precision
            'studio_title': 0.75,
            'title_box_office': 0.70,
            'title_production': 0.68,
            'title_exhibitor': 0.65,
            'star_title': 0.65,
            
            // Lower precision (more false positives)
            'abbreviated_title': 0.50,
            'author_only': 0.45,
            'director_only': 0.45,
            'keyword_film': 0.40,
            'possessive_title': 0.35,
            'partial_title': 0.30,
            
            // Labor-specific (when enabled)
            'title_strike': 0.80,
            'studio_labor': 0.70,
            'title_picket_line': 0.75
        };
        
        // Track what we've seen for diversity scoring
        this.reset();
    }
    
    reset() {
        // Reset tracking for each film
        this.seenTracking = {
            publications: new Map(),      // Count per publication
            strategies: new Map(),        // Count per search strategy
            yearMonths: new Map(),       // Count per year-month
            excerptHashes: new Set(),    // Simple duplicate detection
            publicationStrategies: new Map() // Track pub+strategy combos
        };
    }
    
    // Main scoring method
    scoreResult(result, index, allResults, config) {
        // 1. Source credibility (based on publication quality)
        const credibility = this.getSourceCredibility(result, config);
        
        // 2. Search precision (how much we trust this search strategy)
        const precision = this.getSearchPrecision(result);
        
        // 3. Diversity score (variety bonus)
        const diversity = this.getDiversityScore(result);
        
        // 4. Lantern's relevance (position-based, but less important)
        const relevance = this.getLanternRelevance(index, allResults.length);
        
        // Calculate weighted final score
        const components = {
            credibility: credibility * this.weights.sourceCredibility,
            precision: precision * this.weights.searchPrecision,
            diversity: diversity * this.weights.diversity,
            relevance: relevance * this.weights.lanternRelevance
        };
        
        const finalScore = Object.values(components).reduce((a, b) => a + b, 0);
        
        // Update tracking for next result
        this.updateTracking(result);
        
        return {
            finalScore,
            components: {
                credibility,
                precision,
                diversity,
                relevance
            },
            breakdown: components
        };
    }
    
    // Source credibility based on publication
    getSourceCredibility(result, config) {
        const publication = result.scoring?.publication || 'unknown';
        const publicationWeight = config.scoring.publications.weights[publication] || 1.0;
        
        // Normalize to 0-100 scale (assuming weights are 0.5-2.0)
        return Math.min(100, publicationWeight * 50);
    }
    
    // Search strategy precision score
    getSearchPrecision(result) {
        const strategy = result.foundBy;
        const trustLevel = this.strategyTrust[strategy] || 0.5;
        
        // If we have search keywords, we can add small bonuses
        let precisionBonus = 0;
        if (result.keywords) {
            // Bonus for multiple keywords (more specific search)
            if (result.keywords.second_keyword) precisionBonus += 5;
            if (result.keywords.third_keyword) precisionBonus += 5;
        }
        
        return Math.min(100, (trustLevel * 100) + precisionBonus);
    }
    
    // Diversity scoring - rewards variety
    getDiversityScore(result) {
        let score = 100; // Start at maximum
        
        // 1. Publication diversity
        const pubCount = this.seenTracking.publications.get(result.scoring?.publication) || 0;
        if (pubCount > 0) {
            // Decay: 100%, 70%, 50%, 35%, 25%...
            score *= Math.pow(0.7, pubCount);
        }
        
        // 2. Search strategy diversity
        const stratCount = this.seenTracking.strategies.get(result.foundBy) || 0;
        if (stratCount > 0) {
            // Less harsh penalty for repeated strategies
            score *= Math.pow(0.85, stratCount);
        }
        
        // 3. Publication + Strategy combination
        // Extra penalty for same publication found by same search
        const comboKey = `${result.scoring?.publication}-${result.foundBy}`;
        const comboCount = this.seenTracking.publicationStrategies.get(comboKey) || 0;
        if (comboCount > 0) {
            score *= 0.5; // Harsh penalty for exact same type of result
        }
        
        // 4. Simple duplicate detection based on excerpt
        if (result.attributes?.body?.attributes?.value) {
            const excerpt = result.attributes.body.attributes.value;
            const excerptStart = excerpt.substring(0, 50).toLowerCase().replace(/\s+/g, '');
            
            if (this.seenTracking.excerptHashes.has(excerptStart)) {
                score *= 0.2; // Very harsh penalty for likely duplicate
            }
        }
        
        return Math.max(10, score); // Minimum score of 10
    }
    
    // Lantern's relevance ranking (position-based)
    getLanternRelevance(index, totalResults) {
        // Use a gentler curve since we don't trust position as much
        const normalizedPosition = index / Math.max(totalResults - 1, 1);
        
        // Linear decay is fine here since it has low weight
        return Math.max(20, 100 - (normalizedPosition * 80));
    }
    
    // Update tracking after scoring
    updateTracking(result) {
        // Track publication
        const pub = result.scoring?.publication || 'unknown';
        this.seenTracking.publications.set(pub, 
            (this.seenTracking.publications.get(pub) || 0) + 1);
        
        // Track strategy
        this.seenTracking.strategies.set(result.foundBy,
            (this.seenTracking.strategies.get(result.foundBy) || 0) + 1);
        
        // Track combination
        const combo = `${pub}-${result.foundBy}`;
        this.seenTracking.publicationStrategies.set(combo,
            (this.seenTracking.publicationStrategies.get(combo) || 0) + 1);
        
        // Track excerpt for duplicate detection
        if (result.attributes?.body?.attributes?.value) {
            const excerpt = result.attributes.body.attributes.value;
            const excerptStart = excerpt.substring(0, 50).toLowerCase().replace(/\s+/g, '');
            this.seenTracking.excerptHashes.add(excerptStart);
        }
    }
    
    // Apply this scoring to a full result set
    scoreAndRankResults(allResults, config) {
        console.log('\n📊 Context-aware scoring with limited excerpt data...');
        
        // Reset tracking for this film
        this.reset();
        
        // Score all results
        const scoredResults = allResults.map((result, index) => {
            const scoring = this.scoreResult(result, index, allResults, config);
            
            return {
                ...result,
                scoring: {
                    ...result.scoring, // Preserve existing scoring data
                    ...scoring,
                    position: index + 1,
                    publication: result.scoring?.publication || this.extractPublication(result.id, config)
                }
            };
        });
        
        // Sort by final score
        scoredResults.sort((a, b) => b.scoring.finalScore - a.scoring.finalScore);
        
        // Log analysis
        this.logScoringAnalysis(scoredResults);
        
        return scoredResults;
    }
    
    // Helper to extract publication
    extractPublication(itemId, config) {
        const id = itemId.toLowerCase();
        
        for (const [pub, pattern] of Object.entries(config.scoring.publications.patterns)) {
            if (pattern.test(id)) {
                return pub;
            }
        }
        
        return 'unknown';
    }
    
    // Log helpful analysis
    logScoringAnalysis(results) {
        console.log('\n🏆 Top 5 results (Context-Aware Scoring):');
        results.slice(0, 5).forEach((result, i) => {
            const s = result.scoring;
            console.log(`${i + 1}. [${s.finalScore.toFixed(1)}] ${s.publication} via ${result.foundBy}`);
            console.log(`   Credibility: ${s.components.credibility.toFixed(0)} | ` +
                       `Precision: ${s.components.precision.toFixed(0)} | ` +
                       `Diversity: ${s.components.diversity.toFixed(0)} | ` +
                       `Relevance: ${s.components.relevance.toFixed(0)}`);
        });
        
        // Diversity report
        const top10Pubs = new Set(results.slice(0, 10).map(r => r.scoring.publication));
        const top10Strats = new Set(results.slice(0, 10).map(r => r.foundBy));
        
        console.log(`\n📈 Top 10 Diversity: ${top10Pubs.size} publications, ${top10Strats.size} search strategies`);
        
        // Potential duplicates
        const duplicates = results.filter(r => r.scoring.components.diversity < 20);
        if (duplicates.length > 0) {
            console.log(`\n⚠️  ${duplicates.length} potential duplicate/redundant results detected`);
        }
    }
}

module.exports = ContextAwareScoring;