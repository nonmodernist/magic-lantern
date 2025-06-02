// lantern-research-dashboard.js
// Visual dashboard and smart recommendations for Hollywood Regionalism research

const fs = require('fs');
const path = require('path');

class LanternResearchDashboard {
    constructor() {
        this.lanternData = this.loadLanternReport();
        this.filmFiles = this.scanFilmFiles();
        this.researchStatus = this.analyzeResearchStatus();
    }

    // Load the Lantern report
    loadLanternReport() {
        const reportPath = path.join('reports', 'lantern-reports', 'lantern-report-v3.json');
        try {
            const data = fs.readFileSync(reportPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Could not load Lantern report. Run lantern-tool-v3.js first!');
            process.exit(1);
        }
    }

    // Scan film files to get complete list
    scanFilmFiles() {
        const filmsDir = path.join(process.cwd(), 'content', 'films');
        const files = fs.readdirSync(filmsDir)
            .filter(f => f.endsWith('.md') && f !== '_index.md');
        
        return files.map(file => {
            const content = fs.readFileSync(path.join(filmsDir, file), 'utf8');
            const titleMatch = content.match(/title = "([^"]+)"/);
            const yearMatch = content.match(/year = (\d+)/);
            
            return {
                fileName: file,
                title: titleMatch ? titleMatch[1] : file,
                year: yearMatch ? parseInt(yearMatch[1]) : null,
                hasResearchNotes: content.includes('## Notes'),
                citationCount: (content.match(/{{ cite\(id="/g) || []).length
            };
        });
    }

    // Analyze research status for each film
    analyzeResearchStatus() {
        const lanternFilms = new Map(
            this.lanternData.films.map(f => [`${f.title}-${f.year}`, f])
        );

        return this.filmFiles.map(film => {
            const key = `${film.title}-${film.year}`;
            const lanternData = lanternFilms.get(key);
            
            // Determine research status
            let status = 'not_started';
            let completeness = 0;
            
            if (lanternData && lanternData.qualityFound > 0) {
                // Has Lantern data
                if (film.hasResearchNotes && film.citationCount > 0) {
                    status = 'fully_researched';
                    completeness = 100;
                } else {
                    status = 'partially_researched';
                    // Calculate completeness based on factors
                    if (lanternData.qualityFound > 0) completeness += 40;
                    if (lanternData.qualityFound > 5) completeness += 20;
                    if (this.hasReview(lanternData)) completeness += 20;
                    if (this.hasProduction(lanternData)) completeness += 20;
                }
            } else if (film.citationCount > 0) {
                // Has citations but no Lantern data
                status = 'non_lantern_research';
                completeness = 50;
            }

            return {
                ...film,
                lanternData,
                status,
                completeness,
                sourceCount: lanternData ? lanternData.qualityFound : 0,
                bestScore: lanternData && lanternData.bestResult ? lanternData.bestResult.score : 0,
                contentTypes: this.getContentTypes(lanternData)
            };
        });
    }

    // Check if film has review
    hasReview(lanternData) {
        return lanternData.uniqueResults?.some(r => r.contentType === 'review') || false;
    }

    // Check if film has production news
    hasProduction(lanternData) {
        return lanternData.uniqueResults?.some(r => r.contentType === 'production') || false;
    }

    // Get content types for film
    getContentTypes(lanternData) {
        if (!lanternData || !lanternData.uniqueResults) return [];
        const types = new Set(lanternData.uniqueResults.map(r => r.contentType));
        return Array.from(types);
    }

    // Generate the dashboard HTML
    generateDashboard() {
        const stats = this.calculateStats();
        const recommendations = this.generateRecommendations();
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hollywood Regionalism - Research Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #3498db;
            margin: 10px 0;
        }
        .stat-label {
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: #3498db;
            transition: width 0.3s ease;
        }
        .recommendations {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .rec-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .rec-section h3 {
            margin-top: 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .film-item {
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        .film-item:last-child {
            border-bottom: none;
        }
        .film-title {
            font-weight: 600;
            color: #2c3e50;
        }
        .film-meta {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 4px;
        }
        .coverage-heatmap {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        .heatmap-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 4px;
            margin-top: 20px;
        }
        .heatmap-cell {
            padding: 8px;
            text-align: center;
            font-size: 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .heatmap-cell:hover {
            transform: scale(1.05);
        }
        .heat-0 { background: #ecf0f1; color: #7f8c8d; }
        .heat-1 { background: #e8f5e9; color: #2e7d32; }
        .heat-2 { background: #c8e6c9; color: #1b5e20; }
        .heat-3 { background: #a5d6a7; color: #1b5e20; }
        .heat-4 { background: #81c784; color: white; }
        .heat-5 { background: #66bb6a; color: white; }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-fully_researched { background: #27ae60; color: white; }
        .status-partially_researched { background: #f39c12; color: white; }
        .status-not_started { background: #95a5a6; color: white; }
        .status-non_lantern_research { background: #9b59b6; color: white; }
        .gap-analysis {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .gap-list {
            margin-top: 15px;
        }
        .gap-item {
            padding: 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 Hollywood Regionalism Research Dashboard</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <!-- Summary Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Films</div>
                <div class="stat-number">${stats.totalFilms}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Fully Researched</div>
                <div class="stat-number">${stats.fullyResearched}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stats.fullyResearched / stats.totalFilms * 100).toFixed(1)}%"></div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">In Progress</div>
                <div class="stat-number">${stats.partiallyResearched}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stats.partiallyResearched / stats.totalFilms * 100).toFixed(1)}%; background: #f39c12;"></div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Not Started</div>
                <div class="stat-number">${stats.notStarted}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Lantern Sources</div>
                <div class="stat-number">${stats.totalSources}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Sources/Film</div>
                <div class="stat-number">${stats.avgSourcesPerFilm.toFixed(1)}</div>
            </div>
        </div>

        <!-- Smart Recommendations -->
        <h2>📊 Smart Research Recommendations</h2>
        <div class="recommendations">
            <div class="rec-section">
                <h3>🎯 High-Value Films to Research Next</h3>
                <div class="film-list">
                    ${recommendations.highValue.map(film => `
                        <div class="film-item">
                            <div class="film-title">${film.title} (${film.year})</div>
                            <div class="film-meta">
                                ${film.sourceCount} sources • Best score: ${film.bestScore.toFixed(1)}
                                ${film.contentTypes.includes('review') ? '• Has review' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="rec-section">
                <h3>⚡ Quick Wins</h3>
                <div class="film-list">
                    ${recommendations.quickWins.map(film => `
                        <div class="film-item">
                            <div class="film-title">${film.title} (${film.year})</div>
                            <div class="film-meta">
                                ${film.sourceCount} high-quality source${film.sourceCount > 1 ? 's' : ''}
                                • Score: ${film.bestScore.toFixed(1)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="rec-section">
                <h3>🔍 Deep Dive Candidates</h3>
                <div class="film-list">
                    ${recommendations.deepDive.map(film => `
                        <div class="film-item">
                            <div class="film-title">${film.title} (${film.year})</div>
                            <div class="film-meta">
                                ${film.sourceCount} sources to review
                                • ${film.contentTypes.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Coverage Heatmap -->
        <div class="coverage-heatmap">
            <h2>🌡️ Coverage Heatmap</h2>
            <p>Click on any film to see details. Color indicates number of sources.</p>
            <div class="heatmap-grid">
                ${this.researchStatus
                    .sort((a, b) => b.sourceCount - a.sourceCount)
                    .map(film => {
                        const heatLevel = this.getHeatLevel(film.sourceCount);
                        return `
                            <div class="heatmap-cell heat-${heatLevel}" 
                                 title="${film.title} (${film.year}): ${film.sourceCount} sources"
                                 onclick="alert('${film.title} (${film.year})\\n${film.sourceCount} sources\\nStatus: ${film.status}\\nBest score: ${film.bestScore.toFixed(1)}')">
                                <div style="font-weight: 600;">${film.title.substring(0, 15)}${film.title.length > 15 ? '...' : ''}</div>
                                <div style="font-size: 10px;">${film.year}</div>
                                <div style="font-size: 11px; margin-top: 4px;">${film.sourceCount} sources</div>
                            </div>
                        `;
                    }).join('')}
            </div>
        </div>

        <!-- Gap Analysis -->
        <div class="gap-analysis">
            <h2>🔎 Gap Analysis</h2>
            <div class="gap-list">
                <h4>Films with No Reviews (${stats.noReviews} films)</h4>
                ${this.researchStatus
                    .filter(f => f.sourceCount > 0 && !f.contentTypes.includes('review'))
                    .slice(0, 10)
                    .map(f => `
                        <div class="gap-item">
                            <span>${f.title} (${f.year})</span>
                            <span>${f.sourceCount} sources, no reviews</span>
                        </div>
                    `).join('')}
                
                <h4 style="margin-top: 20px;">Films with No Production News (${stats.noProduction} films)</h4>
                ${this.researchStatus
                    .filter(f => f.sourceCount > 0 && !f.contentTypes.includes('production'))
                    .slice(0, 10)
                    .map(f => `
                        <div class="gap-item">
                            <span>${f.title} (${f.year})</span>
                            <span>${f.sourceCount} sources, no production news</span>
                        </div>
                    `).join('')}
                
                <h4 style="margin-top: 20px;">Films with No Lantern Coverage</h4>
                <p>${stats.noLanternCoverage} films have no results in Lantern database</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    // Calculate overall statistics
    calculateStats() {
        const fullyResearched = this.researchStatus.filter(f => f.status === 'fully_researched').length;
        const partiallyResearched = this.researchStatus.filter(f => f.status === 'partially_researched').length;
        const notStarted = this.researchStatus.filter(f => f.status === 'not_started').length;
        
        const filmsWithSources = this.researchStatus.filter(f => f.sourceCount > 0);
        const totalSources = filmsWithSources.reduce((sum, f) => sum + f.sourceCount, 0);
        
        const noReviews = filmsWithSources.filter(f => !f.contentTypes.includes('review')).length;
        const noProduction = filmsWithSources.filter(f => !f.contentTypes.includes('production')).length;
        const noLanternCoverage = this.researchStatus.filter(f => f.sourceCount === 0).length;

        return {
            totalFilms: this.researchStatus.length,
            fullyResearched,
            partiallyResearched,
            notStarted,
            totalSources,
            avgSourcesPerFilm: filmsWithSources.length > 0 ? totalSources / filmsWithSources.length : 0,
            noReviews,
            noProduction,
            noLanternCoverage
        };
    }

    // Generate smart recommendations
    generateRecommendations() {
        // High-value films: Good sources but not fully researched
        const highValue = this.researchStatus
            .filter(f => f.status === 'partially_researched' && f.sourceCount >= 3 && f.bestScore >= 7)
            .sort((a, b) => b.bestScore - a.bestScore)
            .slice(0, 5);

        // Quick wins: 1-2 high-quality sources, not yet researched
        const quickWins = this.researchStatus
            .filter(f => f.status === 'partially_researched' && f.sourceCount <= 2 && f.bestScore >= 8)
            .sort((a, b) => b.bestScore - a.bestScore)
            .slice(0, 5);

        // Deep dive: Many sources to review
        const deepDive = this.researchStatus
            .filter(f => f.sourceCount >= 15)
            .sort((a, b) => b.sourceCount - a.sourceCount)
            .slice(0, 5);

        return {
            highValue,
            quickWins,
            deepDive
        };
    }

    // Get heat level for heatmap
    getHeatLevel(sourceCount) {
        if (sourceCount === 0) return 0;
        if (sourceCount <= 2) return 1;
        if (sourceCount <= 5) return 2;
        if (sourceCount <= 10) return 3;
        if (sourceCount <= 20) return 4;
        return 5;
    }

    // Save dashboard
    saveDashboard() {
        const outputDir = path.join('reports', 'lantern-reports');
        const dashboardPath = path.join(outputDir, 'research-dashboard.html');
        
        const html = this.generateDashboard();
        fs.writeFileSync(dashboardPath, html);
        
        console.log(`✅ Dashboard saved to: ${dashboardPath}`);
        console.log('📊 Open in your browser to view the interactive dashboard!');

        // Also save JSON data for other tools
        const dataPath = path.join(outputDir, 'research-status.json');
        fs.writeFileSync(dataPath, JSON.stringify({
            generated: new Date().toISOString(),
            stats: this.calculateStats(),
            recommendations: this.generateRecommendations(),
            films: this.researchStatus
        }, null, 2));
        
        console.log(`💾 Research data saved to: ${dataPath}`);
    }
}

// Main execution
function main() {
    console.log('🎬 Hollywood Regionalism - Research Dashboard Generator\n');
    
    const dashboard = new LanternResearchDashboard();
    dashboard.saveDashboard();
    
    // Quick console summary
    const stats = dashboard.calculateStats();
    console.log('\n📈 Quick Summary:');
    console.log(`   Total films: ${stats.totalFilms}`);
    console.log(`   Fully researched: ${stats.fullyResearched} (${(stats.fullyResearched / stats.totalFilms * 100).toFixed(1)}%)`);
    console.log(`   In progress: ${stats.partiallyResearched}`);
    console.log(`   Not started: ${stats.notStarted}`);
    
    const recommendations = dashboard.generateRecommendations();
    if (recommendations.highValue.length > 0) {
        console.log('\n🎯 Top recommendation to research next:');
        const top = recommendations.highValue[0];
        console.log(`   "${top.title}" (${top.year}) - ${top.sourceCount} sources, score ${top.bestScore.toFixed(1)}`);
    }
}

if (require.main === module) {
    main();
}

module.exports = LanternResearchDashboard;