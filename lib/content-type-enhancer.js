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

    // Enhanced content type detection for comprehensive search results
    detectContentTypes(text, title = '') {
        return this.analyzer.detectContentTypes(text, title);
    }
    
    // Analyze content context for search results
    analyzeContentContext(result, film) {
        const context = {
            contentTypes: [],
            significance: 'low',
            themes: [],
            marketingMentions: false,
            authorMention: false,
            visualContent: false,
            entities: {
                people: [],
                companies: [],
                places: []
            }
        };
        
        const text = (result.excerpt || result.title || '').toLowerCase();
        const filmTitle = (film.title || '').toLowerCase();
        
        // Detect content types
        context.contentTypes = this.detectContentTypes(text, result.title);
        
        // Assess significance
        if (text.includes(filmTitle) && text.length > 100) {
            context.significance = 'high';
        } else if (text.includes(filmTitle) || text.length > 50) {
            context.significance = 'medium';
        }
        
        // Detect themes
        context.themes = this.analyzer.extractThemes(text);
        
        // Marketing intelligence
        const marketingTerms = ['campaign', 'herald', 'publicity', 'promotion', 'advertising'];
        context.marketingMentions = marketingTerms.some(term => text.includes(term));
        
        // Author connection
        if (film.author && text.includes(film.author.toLowerCase())) {
            context.authorMention = true;
        }
        
        // Visual content indicators
        const visualTerms = ['photo', 'picture', 'still', 'scene from', 'pictured'];
        context.visualContent = visualTerms.some(term => text.includes(term));
        
        // Extract basic entities
        context.entities = this.analyzer.extractBasicEntities(result.excerpt || result.title || '');
        
        return context;
    }
    
    // Enhanced full text result processing
    enhanceResult(fullTextResult) {
        // Ensure we have valid input
        if (!fullTextResult || !fullTextResult.fullText) {
            console.warn('Invalid fullTextResult provided to enhanceResult');
            return {
                ...fullTextResult,
                contentAnalysis: {
                    primaryType: 'unknown',
                    confidence: 'low',
                    allTypes: [],
                    themes: [],
                    significance: [],
                    entities: { people: [], companies: [], places: [] },
                    sentiment: 'neutral'
                },
                contentTypes: ['unknown'],
                contentScore: 0,
                isTreasure: false,
                keyExcerpts: []
            };
        }
        
        const enhanced = { ...fullTextResult };
        const text = fullTextResult.fullText;
        
        // Perform deep analysis
        const deepAnalysis = this.performDeepAnalysis(text, fullTextResult.film || {});
        
        // Legacy analyzer for backward compatibility
        const legacyAnalysis = this.analyzer.analyzeContent(
            text,
            { includeEvidence: this.config.includeEvidence }
        );
        
        // Combine analyses
        enhanced.contentAnalysis = {
            primaryType: deepAnalysis.contentTypes[0]?.type || legacyAnalysis.primaryType || 'unknown',
            confidence: deepAnalysis.contentTypes[0]?.confidence || legacyAnalysis.confidence || 'low',
            allTypes: deepAnalysis.contentTypes,
            themes: deepAnalysis.themes,
            significance: deepAnalysis.significance,
            entities: deepAnalysis.entities,
            sentiment: deepAnalysis.sentiment
        };
        
        // Enhanced content types
        enhanced.contentTypes = deepAnalysis.contentTypes.map(ct => ct.type);
        
        // Calculate enhanced content score
        enhanced.contentScore = this.calculateEnhancedContentScore(deepAnalysis);
        
        // Extract key excerpts
        enhanced.keyExcerpts = this.analyzer.extractKeyExcerpts(text, fullTextResult.film || {});
        
        // Enhanced excerpt if configured
        if (this.config.enhanceExcerpts && legacyAnalysis.evidence?.length > 0) {
            enhanced.enhancedExcerpt = this.createEnhancedExcerpt(
                text,
                legacyAnalysis.evidence[0]
            );
        }
        
        // Enhanced treasure detection
        enhanced.isTreasure = this.isTreasureEnhanced(deepAnalysis);
        
        return enhanced;
    }
    
    // Perform deep content analysis
    performDeepAnalysis(text, _film) {
        const analysis = {
            contentTypes: [],
            themes: [],
            significance: [],
            entities: { people: [], companies: [], places: [] },
            sentiment: 'neutral'
        };
        
        // Enhanced content type detection
        analysis.contentTypes = this.analyzer.detectContentTypes(text);
        
        // Theme extraction
        analysis.themes = this.analyzer.extractThemes(text.toLowerCase());
        
        // Significance assessment
        analysis.significance = this.analyzer.assessSignificance(text.toLowerCase());
        
        // Entity extraction
        analysis.entities = this.analyzer.extractBasicEntities(text);
        
        // Basic sentiment analysis
        analysis.sentiment = this.analyzer.analyzeSentiment(text);
        
        return analysis;
    }

    // Enhance multiple results
    enhanceResults(fullTextResults) {
        return fullTextResults.map(result => this.enhanceResult(result));
    }

    // Calculate overall content score (legacy compatibility)
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
    
    // Calculate enhanced content score
    calculateEnhancedContentScore(analysis) {
        let baseScore = 0;
        
        // Content type scoring
        if (analysis.contentTypes && analysis.contentTypes.length > 0) {
            const typeWeights = {
                review: 8,
                box_office: 7,
                production: 6,
                interview: 6,
                industry_news: 5,
                advertisement: 4,
                photo: 4,
                mention: 2
            };
            
            const confidenceMultipliers = { high: 1.0, medium: 0.8, low: 0.5 };
            
            analysis.contentTypes.forEach(ct => {
                const typeWeight = typeWeights[ct.type] || 3;
                const confidence = confidenceMultipliers[ct.confidence] || 0.5;
                baseScore += typeWeight * confidence;
            });
            
            // Average if multiple types
            baseScore = baseScore / Math.max(analysis.contentTypes.length, 1);
        }
        
        // Bonus for themes
        if (analysis.themes && analysis.themes.length > 0) {
            baseScore += analysis.themes.length * 0.5;
        }
        
        // Bonus for significance
        if (analysis.significance && analysis.significance.length > 0) {
            baseScore += analysis.significance.length * 1.0;
        }
        
        // Sentiment bonus
        if (analysis.sentiment === 'positive') baseScore += 0.5;
        else if (analysis.sentiment === 'negative') baseScore += 0.3; // Controversy can be valuable
        
        return Math.round(Math.min(baseScore, 10) * 10) / 10;
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

    // Determine if content is a "treasure" (high-value find) - legacy compatibility
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
    
    // Enhanced treasure detection
    isTreasureEnhanced(analysis) {
        // High content score
        const score = this.calculateEnhancedContentScore(analysis);
        if (score >= 8.0) return true;
        
        // Multiple high-confidence content types
        const highConfidenceTypes = analysis.contentTypes?.filter(ct => ct.confidence === 'high') || [];
        if (highConfidenceTypes.length >= 2) return true;
        
        // High-value content types with good confidence
        const valuableTypes = ['review', 'box_office', 'interview', 'production'];
        const hasValuableContent = analysis.contentTypes?.some(ct => 
            valuableTypes.includes(ct.type) && ['high', 'medium'].includes(ct.confidence)
        ) || false;
        
        // Significant content indicators
        const hasSignificance = analysis.significance && analysis.significance.length > 0;
        
        // Multiple themes (indicates rich content)
        const hasMultipleThemes = analysis.themes && analysis.themes.length >= 2;
        
        // Combination of factors
        if (hasValuableContent && (hasSignificance || hasMultipleThemes)) {
            return true;
        }
        
        return false;
    }

    // Get enhanced statistics about results
    getEnhancementStats(enhancedResults) {
        const stats = {
            total: enhancedResults.length,
            byType: {},
            byConfidence: { high: 0, medium: 0, low: 0 },
            byTheme: {},
            bySignificance: {},
            treasures: 0,
            averageContentScore: 0,
            keyEntities: {
                people: new Set(),
                companies: new Set(),
                places: new Set()
            },
            marketingMentions: 0,
            exceptionalContent: []
        };
        
        if (!enhancedResults || enhancedResults.length === 0) {
            return this.normalizeStats(stats);
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
            
            // Count themes
            if (result.contentAnalysis.themes) {
                result.contentAnalysis.themes.forEach(theme => {
                    stats.byTheme[theme] = (stats.byTheme[theme] || 0) + 1;
                });
            }
            
            // Count significance indicators
            if (result.contentAnalysis.significance) {
                result.contentAnalysis.significance.forEach(sig => {
                    stats.bySignificance[sig] = (stats.bySignificance[sig] || 0) + 1;
                });
            }
            
            // Collect entities
            if (result.contentAnalysis.entities) {
                const entities = result.contentAnalysis.entities;
                if (entities.people) entities.people.forEach(p => stats.keyEntities.people.add(p));
                if (entities.companies) entities.companies.forEach(c => stats.keyEntities.companies.add(c));
                if (entities.places) entities.places.forEach(pl => stats.keyEntities.places.add(pl));
            }
            
            // Count treasures
            if (result.isTreasure) stats.treasures++;
            
            // Track exceptional content
            if (result.contentAnalysis.significance?.includes('exceptional_performance')) {
                stats.exceptionalContent.push(result);
            }
            
            // Count marketing mentions
            if (result.contentAnalysis.themes?.includes('marketing_campaign')) {
                stats.marketingMentions++;
            }
            
            // Sum scores
            totalScore += result.contentScore || 0;
        });
        
        stats.averageContentScore = stats.total > 0 
            ? Math.round((totalScore / stats.total) * 10) / 10 
            : 0;
        
        return this.normalizeStats(stats);
    }
    
    // Normalize stats for JSON serialization
    normalizeStats(stats) {
        // Convert sets to arrays
        stats.keyEntities.people = Array.from(stats.keyEntities.people);
        stats.keyEntities.companies = Array.from(stats.keyEntities.companies);
        stats.keyEntities.places = Array.from(stats.keyEntities.places);
        
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