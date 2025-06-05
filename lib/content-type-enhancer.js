// lib/content-type-enhancer.js
// Enhances Magic Lantern full text results with historical pattern analysis

const HistoricalContentAnalyzer = require('./historical-content-analyzer');

class ContentTypeEnhancer {
    constructor(config = {}) {
        this.analyzer = new HistoricalContentAnalyzer();
        this.config = {
            includeEvidence: config.includeEvidence || false,
            minConfidence: config.minConfidence || 'low',
            enhanceExcerpts: config.enhanceExcerpts || true,
            ...config
        };
    }

    // Enhance a single full text result
    enhanceResult(fullTextResult) {
        // Ensure we have valid input
        if (!fullTextResult || !fullTextResult.fullText) {
            console.warn('Invalid fullTextResult provided to enhanceResult');
            return {
                ...fullTextResult,
                contentAnalysis: {
                    primaryType: 'unknown',
                    confidence: 'low',
                    allTypes: []
                },
                contentTypes: ['unknown'],
                contentScore: 0,
                isTreasure: false
            };
        }
        
        const enhanced = { ...fullTextResult };
        
        // Analyze the full text
        const analysis = this.analyzer.analyzeContent(
            fullTextResult.fullText, 
            { includeEvidence: this.config.includeEvidence }
        );
        
        // Add enhanced content type information
        enhanced.contentAnalysis = {
            primaryType: analysis.primaryType,
            confidence: analysis.confidence,
            allTypes: analysis.types.map(t => ({
                type: t.type,
                confidence: t.confidence,
                matchCount: t.matchCount
            }))
        };
        
        // Replace simple content types with historical analysis
        enhanced.contentTypes = analysis.types.map(t => t.type);
        
        // Add content score based on historical patterns
        enhanced.contentScore = this.calculateContentScore(analysis);
        
        // Enhance excerpt if configured
        if (this.config.enhanceExcerpts && analysis.evidence.length > 0) {
            enhanced.enhancedExcerpt = this.createEnhancedExcerpt(
                fullTextResult.fullText,
                analysis.evidence[0]
            );
        }
        
        // Add treasure flag for high-value content
        enhanced.isTreasure = this.isTreasure(analysis);
        
        return enhanced;
    }

    // Enhance multiple results
    enhanceResults(fullTextResults) {
        return fullTextResults.map(result => this.enhanceResult(result));
    }

    // Calculate overall content score
    calculateContentScore(analysis) {
        if (analysis.types.length === 0) return 0;
        
        // Weight by confidence and type score
        const confidenceWeights = { high: 1.0, medium: 0.7, low: 0.4 };
        
        let totalScore = 0;
        analysis.types.forEach(type => {
            const weight = confidenceWeights[type.confidence] || 0.5;
            totalScore += type.score * weight;
        });
        
        return Math.round(totalScore * 10) / 10;
    }

    // Create enhanced excerpt centered on best evidence
    createEnhancedExcerpt(fullText, evidence, maxLength = 300) {
        if (!evidence || !evidence.context) {
            return fullText.substring(0, maxLength) + '...';
        }
        
        // Find the evidence in the full text
        const matchIndex = fullText.indexOf(evidence.match);
        if (matchIndex === -1) {
            return evidence.context;
        }
        
        // Calculate excerpt boundaries
        const halfLength = Math.floor(maxLength / 2);
        let start = Math.max(0, matchIndex - halfLength);
        let end = Math.min(fullText.length, matchIndex + evidence.match.length + halfLength);
        
        // Adjust to word boundaries
        if (start > 0) {
            const spaceIndex = fullText.lastIndexOf(' ', start);
            if (spaceIndex > start - 20) start = spaceIndex + 1;
        }
        
        if (end < fullText.length) {
            const spaceIndex = fullText.indexOf(' ', end);
            if (spaceIndex > 0 && spaceIndex < end + 20) end = spaceIndex;
        }
        
        // Build excerpt with ellipsis
        let excerpt = '';
        if (start > 0) excerpt += '...';
        excerpt += fullText.substring(start, end);
        if (end < fullText.length) excerpt += '...';
        
        return excerpt;
    }

    // Determine if content is a "treasure" (high-value find)
    isTreasure(analysis) {
        // Multiple high-confidence matches
        const highConfidenceCount = analysis.types.filter(t => t.confidence === 'high').length;
        if (highConfidenceCount >= 2) return true;
        
        // Single very high-value type with high confidence
        const hasHighValueType = analysis.types.some(t => 
            t.score >= 8 && t.confidence === 'high'
        );
        if (hasHighValueType) return true;
        
        // Review with good confidence
        const hasGoodReview = analysis.types.some(t => 
            t.type === 'review' && ['high', 'medium'].includes(t.confidence)
        );
        if (hasGoodReview) return true;
        
        return false;
    }

    // Get statistics about enhanced results
    getEnhancementStats(enhancedResults) {
        const stats = {
            total: enhancedResults.length,
            byType: {},
            byConfidence: { high: 0, medium: 0, low: 0 },
            treasures: 0,
            averageContentScore: 0
        };
        
        if (!enhancedResults || enhancedResults.length === 0) {
            return stats;
        }
        
        let totalScore = 0;
        
        enhancedResults.forEach(result => {
            // Skip if no content analysis
            if (!result.contentAnalysis) {
                console.warn('Result missing contentAnalysis:', result.id);
                return;
            }
            
            // Count primary types
            const primaryType = result.contentAnalysis.primaryType || 'unknown';
            stats.byType[primaryType] = (stats.byType[primaryType] || 0) + 1;
            
            // Count confidence levels
            const confidence = result.contentAnalysis.confidence || 'low';
            if (stats.byConfidence.hasOwnProperty(confidence)) {
                stats.byConfidence[confidence]++;
            }
            
            // Count treasures
            if (result.isTreasure) stats.treasures++;
            
            // Sum scores
            totalScore += result.contentScore || 0;
        });
        
        stats.averageContentScore = stats.total > 0 
            ? Math.round((totalScore / stats.total) * 10) / 10 
            : 0;
        
        return stats;
    }

    // Sort results by content value
    sortByContentValue(enhancedResults) {
        return [...enhancedResults].sort((a, b) => {
            // Treasures first
            if (a.isTreasure !== b.isTreasure) {
                return a.isTreasure ? -1 : 1;
            }
            
            // Then by content score
            return b.contentScore - a.contentScore;
        });
    }

    // Filter results by content type
    filterByContentType(enhancedResults, types) {
        const typeSet = new Set(Array.isArray(types) ? types : [types]);
        
        return enhancedResults.filter(result => 
            result.contentTypes.some(type => typeSet.has(type))
        );
    }

    // Get configuration
    getConfig() {
        return { ...this.config };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

module.exports = ContentTypeEnhancer;