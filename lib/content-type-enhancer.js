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

    
    // Analyze content context for search results focusing on themes, significance, and entities
    analyzeContentContext(result, film) {
        const context = {
            significance: 'low',
            themes: [],
            marketingMentions: false,
            authorMention: false,
            entities: {
                people: [],
                companies: [],
                places: []
            }
        };
        
        const text = (result.excerpt || result.title || '').toLowerCase();
        const filmTitle = (film.title || '').toLowerCase();
        
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
                    themes: [],
                    significance: [],
                    entities: { people: [], companies: [], places: [] },
                    sentiment: 'neutral'
                },
                contentScore: 0,
                keyExcerpts: []
            };
        }
        
        const enhanced = { ...fullTextResult };
        const text = fullTextResult.fullText;
        
        // Perform deep analysis
        const deepAnalysis = this.performDeepAnalysis(text, fullTextResult.film || {});
        
        // Focus on themes, significance, entities, and sentiment
        enhanced.contentAnalysis = {
            themes: deepAnalysis.themes,
            significance: deepAnalysis.significance,
            entities: deepAnalysis.entities,
            sentiment: deepAnalysis.sentiment
        };
        
        // Calculate enhanced content score
        enhanced.contentScore = this.calculateEnhancedContentScore(deepAnalysis);
        
        // Extract key excerpts
        enhanced.keyExcerpts = this.analyzer.extractKeyExcerpts(text, fullTextResult.film || {});
        
        // Enhanced excerpt based on significance and themes
        if (this.config.enhanceExcerpts) {
            enhanced.enhancedExcerpt = this.createThematicExcerpt(text, deepAnalysis);
        }
        
        
        return enhanced;
    }
    
    // Perform deep content analysis focusing on themes, significance, and entities
    performDeepAnalysis(text, _film) {
        const analysis = {
            themes: [],
            significance: [],
            entities: { people: [], companies: [], places: [] },
            sentiment: 'neutral'
        };
        
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
    
    // Calculate enhanced content score based on themes, significance, and entities
    calculateEnhancedContentScore(analysis) {
        let baseScore = 0;
        
        // Base score for having any analysis
        baseScore = 1;
        
        // Bonus for themes
        if (analysis.themes && analysis.themes.length > 0) {
            baseScore += analysis.themes.length * 1.5;
        }
        
        // Bonus for significance
        if (analysis.significance && analysis.significance.length > 0) {
            baseScore += analysis.significance.length * 2.0;
        }
        
        // Bonus for entities
        if (analysis.entities) {
            const entityCount = (analysis.entities.people?.length || 0) + 
                              (analysis.entities.companies?.length || 0) + 
                              (analysis.entities.places?.length || 0);
            baseScore += entityCount * 0.3;
        }
        
        // Sentiment bonus
        if (analysis.sentiment === 'positive') baseScore += 0.5;
        else if (analysis.sentiment === 'negative') baseScore += 0.3; // Controversy can be valuable
        
        return Math.round(Math.min(baseScore, 10) * 10) / 10;
    }

    // Create thematic excerpt based on themes and significance
    createThematicExcerpt(fullText, analysis, maxLength = 300) {
        // Find most significant content based on themes and significance indicators
        const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        let bestSentence = '';
        let bestScore = 0;
        
        for (const sentence of sentences) {
            let score = 0;
            const lowerSentence = sentence.toLowerCase();
            
            // Score based on themes
            if (analysis.themes) {
                analysis.themes.forEach(theme => {
                    if (lowerSentence.includes(theme.replace('_', ' '))) {
                        score += 2;
                    }
                });
            }
            
            // Score based on significance
            if (analysis.significance) {
                analysis.significance.forEach(sig => {
                    if (lowerSentence.includes(sig.replace('_', ' '))) {
                        score += 3;
                    }
                });
            }
            
            if (score > bestScore && sentence.length <= maxLength) {
                bestScore = score;
                bestSentence = sentence;
            }
        }
        
        // If no thematic content found, use first part
        if (!bestSentence) {
            return fullText.substring(0, maxLength) + '...';
        }
        
        return bestSentence.trim();
    }


    // Get enhanced statistics about results
    getEnhancementStats(enhancedResults) {
        const stats = {
            total: enhancedResults.length,
            byType: {},
            byConfidence: { high: 0, medium: 0, low: 0 },
            byTheme: {},
            bySignificance: {},
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
            
            // Count significance levels  
            if (result.contentAnalysis.significance?.length > 0) {
                stats.byConfidence.high++;
            } else if (result.contentAnalysis.themes?.length > 0) {
                stats.byConfidence.medium++;
            } else {
                stats.byConfidence.low++;
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

    // Sort results by content value based on themes and significance
    sortByContentValue(enhancedResults) {
        return [...enhancedResults].sort((a, b) => {
            // Sort by content score (which now reflects themes + significance + entities)
            return b.contentScore - a.contentScore;
        });
    }

    // Filter results by theme
    filterByTheme(enhancedResults, themes) {
        const themeSet = new Set(Array.isArray(themes) ? themes : [themes]);
        
        return enhancedResults.filter(result => 
            result.contentAnalysis.themes?.some(theme => themeSet.has(theme))
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