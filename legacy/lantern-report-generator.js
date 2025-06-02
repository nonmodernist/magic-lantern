// lantern-report-generator.js
// Generates formatted research reports from Lantern API results

const fs = require('fs');
const path = require('path');

class LanternReportGenerator {
    constructor(resultsPath = null) {
        // Look for the report in the new location first, then fallback to old location
        if (!resultsPath) {
            const newPath = path.join('reports', 'lantern-reports', 'lantern-report-v3.json');
            const oldPath = 'lantern-report-v3.json';
            
            if (fs.existsSync(newPath)) {
                resultsPath = newPath;
            } else if (fs.existsSync(oldPath)) {
                resultsPath = oldPath;
            } else {
                console.error('❌ No lantern report found. Expected at:');
                console.error(`   ${newPath}`);
                console.error(`   or ${oldPath}`);
                process.exit(1);
            }
        }
        
        this.resultsPath = resultsPath;
        this.data = this.loadResults();
        this.reportDate = new Date().toISOString().split('T')[0];
    }

    loadResults() {
        try {
            const data = fs.readFileSync(this.resultsPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ Could not load results from ${this.resultsPath}`);
            process.exit(1);
        }
    }

    // Generate individual film report
    generateFilmReport(film) {
        if (!film.uniqueResults || film.uniqueResults.length === 0) {
            return this.generateNoResultsReport(film);
        }

        const report = [];
        
        // Header
        report.push(`## Film Research Report: ${film.title} (${film.year})`);
        report.push(`**${film.studio || 'Unknown Studio'}${film.director ? ` | Dir: ${film.director}` : ''}**`);
        if (film.author) {
            report.push(`*Based on work by ${film.author}*`);
        }
        report.push('');

        // Coverage Summary
        report.push('### Coverage Summary');
        const scores = film.uniqueResults.map(r => r.score);
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        
        // Date range
        const dates = film.uniqueResults
            .map(r => r.year)
            .filter(y => y)
            .sort((a, b) => a - b);
        const dateRange = dates.length > 0 ? 
            `${dates[0]}${dates[dates.length - 1] !== dates[0] ? ' - ' + dates[dates.length - 1] : ''}` : 
            'Unknown period';

        // Publication breakdown
        const publicationCounts = {};
        film.uniqueResults.forEach(r => {
            const pubName = r.publication.name;
            publicationCounts[pubName] = (publicationCounts[pubName] || 0) + 1;
        });

        report.push(`- **Total Quality Sources**: ${film.uniqueResults.length} unique items`);
        report.push(`- **Score Range**: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)} (${this.assessCoverage(maxScore)})`);
        report.push(`- **Primary Coverage Period**: ${dateRange}`);
        report.push(`- **Source Publications**: ${this.formatPublicationList(publicationCounts)}`);
        report.push('');

        // Content Analysis
        report.push('### Content Analysis');
        const contentTypes = {};
        film.uniqueResults.forEach(r => {
            contentTypes[r.contentType] = (contentTypes[r.contentType] || 0) + 1;
        });

        report.push('| Type | Count | Significance |');
        report.push('|------|-------|--------------|');
        
        const typeSignificance = {
            'review': 'Critical reception documented',
            'production': 'Behind-the-scenes coverage',
            'box_office': 'Commercial performance data',
            'advertisement': 'Marketing and distribution',
            'announcement': 'Pre-release publicity',
            'mention': 'Industry awareness'
        };

        Object.entries(contentTypes)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                const capType = type.charAt(0).toUpperCase() + type.slice(1);
                const significance = typeSignificance[type] || 'General coverage';
                report.push(`| ${capType} | ${count} | ${significance} |`);
            });
        report.push('');

        // High-Priority Sources
        const highScoreSources = film.uniqueResults
            .filter(r => r.score >= 8)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        if (highScoreSources.length > 0) {
            report.push('### High-Priority Sources (Score 8+)');
            report.push('');

            highScoreSources.forEach((source, idx) => {
                report.push(`#### ${idx + 1}. **${this.formatPublicationName(source.publication.name)}** - ${source.date || 'Date unknown'} [Score: ${source.score.toFixed(1)}]`);
                report.push('```');
                report.push(this.formatExcerpt(source.excerpt, 150));
                report.push('```');
                report.push(`- **Type**: ${this.formatContentType(source.contentType)}`);
                report.push(`- **Significance**: ${this.getSignificance(source, film)}`);
                if (source.readUrl) {
                    const cleanUrl = this.extractUrl(source.readUrl);
                    report.push(`- **IA Link**: [View Full Page](${cleanUrl})`);
                }
                report.push('');
            });
        }

        // Key Findings
        report.push('### Key Findings');
        const findings = this.generateKeyFindings(film);
        findings.forEach(finding => {
            report.push(`- ${finding}`);
        });
        report.push('');

        // Research Notes
        report.push('### Research Notes');
        const notes = this.generateResearchNotes(film);
        notes.forEach(note => {
            report.push(`- ${note}`);
        });
        report.push('');

        // Next Steps
        report.push('### Next Research Steps');
        const nextSteps = this.generateNextSteps(film);
        nextSteps.forEach((step, idx) => {
            report.push(`${idx + 1}. ${step}`);
        });
        report.push('');

        return report.join('\n');
    }

    // Generate report for films with no results
    generateNoResultsReport(film) {
        const report = [];
        
        report.push(`## Film Research Report: ${film.title} (${film.year})`);
        report.push(`**${film.studio || 'Unknown Studio'}${film.director ? ` | Dir: ${film.director}` : ''}**`);
        report.push('');
        report.push('### Coverage Summary');
        report.push('- **No results found in Lantern database**');
        report.push('');
        report.push('### Possible Issues');
        report.push('- Title variation (check for alternate titles)');
        report.push('- Date uncertainty (try broader date ranges)');
        report.push('- Limited trade coverage for this production');
        report.push('- Film may be outside Lantern\'s collection scope');
        report.push('');
        report.push('### Recommended Actions');
        report.push('1. Verify exact title from AFI Catalog or other sources');
        report.push('2. Check contemporary newspapers via other databases');
        report.push('3. Search for the production company or key personnel');
        report.push('4. Try variant spellings or shortened titles');
        report.push('');

        return report.join('\n');
    }

    // Generate comparative analysis
    generateComparativeAnalysis(films) {
        const report = [];
        
        report.push('## Comparative Analysis Report');
        report.push(`*Generated: ${this.reportDate}*`);
        report.push('');

        // Group by author/source
        const byAuthor = {};
        films.forEach(film => {
            if (film.author) {
                if (!byAuthor[film.author]) {
                    byAuthor[film.author] = [];
                }
                byAuthor[film.author].push(film);
            }
        });

        // Analyze each author's adaptations
        Object.entries(byAuthor).forEach(([author, authorFilms]) => {
            if (authorFilms.length > 1) {
                report.push(`### ${author} Adaptations`);
                report.push('');
                
                // Sort by year
                authorFilms.sort((a, b) => parseInt(a.year) - parseInt(b.year));
                
                report.push('| Film | Year | Sources | Top Score | Primary Type |');
                report.push('|------|------|---------|-----------|--------------|');
                
                authorFilms.forEach(film => {
                    const topScore = film.uniqueResults.length > 0 ? 
                        Math.max(...film.uniqueResults.map(r => r.score)) : 0;
                    const primaryType = this.getPrimaryContentType(film);
                    
                    report.push(`| ${film.title} | ${film.year} | ${film.qualityFound} | ${topScore.toFixed(1)} | ${primaryType} |`);
                });
                report.push('');

                // Patterns
                report.push('**Coverage Patterns:**');
                const patterns = this.analyzeAuthorPatterns(authorFilms);
                patterns.forEach(pattern => {
                    report.push(`- ${pattern}`);
                });
                report.push('');
            }
        });

        return report.join('\n');
    }

    // Helper methods
    assessCoverage(maxScore) {
        if (maxScore >= 9) return 'excellent coverage';
        if (maxScore >= 7) return 'good coverage';
        if (maxScore >= 5) return 'moderate coverage';
        return 'limited coverage';
    }

    formatPublicationList(publicationCounts) {
        return Object.entries(publicationCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([pub, count]) => `${this.formatPublicationName(pub)} (${count})`)
            .join(', ');
    }

    formatPublicationName(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatContentType(type) {
        const typeDescriptions = {
            'review': 'Film review',
            'production': 'Production news',
            'box_office': 'Box office report',
            'advertisement': 'Theater advertisement',
            'announcement': 'Release announcement',
            'mention': 'Brief mention'
        };
        return typeDescriptions[type] || type;
    }

    formatExcerpt(excerpt, maxLength = 150) {
        if (excerpt.length <= maxLength) return excerpt;
        return excerpt.substring(0, maxLength) + '...';
    }

    extractUrl(readUrl) {
        const match = readUrl.match(/href="([^"]+)"/);
        return match ? match[1] : readUrl;
    }

    getSignificance(source, film) {
        const factors = [];
        
        // Check for specific significant content
        const excerpt = source.excerpt.toLowerCase();
        
        if (source.contentType === 'production' && excerpt.includes('scene from')) {
            return 'Visual documentation, production still';
        }
        
        if (excerpt.includes('unusual results') || excerpt.includes('box office')) {
            return 'Documents commercial performance';
        }
        
        if (source.contentType === 'review') {
            return 'Contemporary critical reception';
        }
        
        if (source.relevance.includes('Mentions author')) {
            return 'Emphasizes literary source/author';
        }
        
        if (source.contentType === 'advertisement') {
            return 'Distribution and exhibition evidence';
        }
        
        return 'Industry documentation';
    }

    generateKeyFindings(film) {
        const findings = [];
        
        // Author prominence
        if (film.author) {
            const authorMentions = film.uniqueResults.filter(r => 
                r.relevance.includes('Mentions author')
            ).length;
            const percentage = ((authorMentions / film.uniqueResults.length) * 100).toFixed(0);
            
            if (percentage > 50) {
                findings.push(`**Strong Author Association**: ${film.author}'s name appears in ${percentage}% of mentions`);
            }
        }
        
        // Publication patterns
        const topPubs = {};
        film.uniqueResults.forEach(r => {
            if (r.publication.tier === 'high') {
                topPubs[r.publication.name] = (topPubs[r.publication.name] || 0) + 1;
            }
        });
        
        const leadingPub = Object.entries(topPubs)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (leadingPub) {
            findings.push(`**Trade Focus**: ${this.formatPublicationName(leadingPub[0])} provided most substantial coverage`);
        }
        
        // Timeline
        const years = film.uniqueResults
            .map(r => r.year)
            .filter(y => y);
        
        if (years.length > 0) {
            const minYear = Math.min(...years);
            const maxYear = Math.max(...years);
            if (minYear < parseInt(film.year)) {
                findings.push(`**Timeline**: Production news from ${minYear}, release coverage through ${maxYear}`);
            }
        }
        
        // Content gaps
        const hasReview = film.uniqueResults.some(r => r.contentType === 'review');
        const hasBoxOffice = film.uniqueResults.some(r => r.contentType === 'box_office');
        
        if (!hasReview && !hasBoxOffice) {
            findings.push('**Missing**: No formal reviews or box office data found in this sample');
        }
        
        return findings;
    }

    generateResearchNotes(film) {
        const notes = [];
        
        // Check for interesting excerpts
        film.uniqueResults.forEach(result => {
            const excerpt = result.excerpt.toLowerCase();
            
            if (excerpt.includes('unusual') || excerpt.includes('extraordinary')) {
                notes.push('Exceptional performance noted in trade coverage');
            }
            
            if (excerpt.includes('campaign') || excerpt.includes('herald')) {
                notes.push('Marketing materials mentioned - possible promotional artifacts');
            }
            
            if (excerpt.includes('parents') || excerpt.includes('children')) {
                notes.push('Family audience targeting evident');
            }
        });
        
        // Remove duplicates
        return [...new Set(notes)];
    }

    generateNextSteps(film) {
        const steps = [];
        
        // Based on what we found
        film.uniqueResults.forEach(result => {
            const excerpt = result.excerpt.toLowerCase();
            
            if (excerpt.includes('unusual results') && !steps.includes('boxoffice')) {
                steps.push('Follow up on "unusual results" - check subsequent issues for box office data');
            }
            
            if (result.contentType === 'production' && excerpt.includes('scene')) {
                steps.push('Look for production stills in referenced issue');
            }
        });
        
        // Based on what's missing
        const hasReview = film.uniqueResults.some(r => r.contentType === 'review');
        if (!hasReview) {
            steps.push('Search contemporary fan magazines for reviews');
        }
        
        // High-value publications not yet checked
        const checkedPubs = new Set(film.uniqueResults.map(r => r.publication.name));
        if (!checkedPubs.has('variety')) {
            steps.push('Check Variety for review and box office data');
        }
        
        return steps.slice(0, 3); // Limit to top 3
    }

    getPrimaryContentType(film) {
        if (!film.uniqueResults || film.uniqueResults.length === 0) return 'None';
        
        const types = {};
        film.uniqueResults.forEach(r => {
            types[r.contentType] = (types[r.contentType] || 0) + 1;
        });
        
        const primary = Object.entries(types)
            .sort((a, b) => b[1] - a[1])[0];
        
        return this.formatContentType(primary[0]);
    }

    analyzeAuthorPatterns(films) {
        const patterns = [];
        
        // Coverage over time
        const years = films.map(f => parseInt(f.year)).sort((a, b) => a - b);
        patterns.push(`Adaptations span ${years[years.length-1] - years[0]} years (${years[0]}-${years[years.length-1]})`);
        
        // Coverage quality trends
        const avgScores = films.map(f => {
            if (f.uniqueResults.length === 0) return 0;
            const scores = f.uniqueResults.map(r => r.score);
            return scores.reduce((a, b) => a + b, 0) / scores.length;
        });
        
        if (avgScores[0] > avgScores[avgScores.length-1]) {
            patterns.push('Coverage quality decreases over time');
        } else if (avgScores[0] < avgScores[avgScores.length-1]) {
            patterns.push('Coverage quality increases over time');
        }
        
        // Publication shifts
        const earlyPubs = new Set();
        const latePubs = new Set();
        
        films.slice(0, Math.floor(films.length/2)).forEach(f => {
            f.uniqueResults.forEach(r => earlyPubs.add(r.publication.name));
        });
        
        films.slice(Math.floor(films.length/2)).forEach(f => {
            f.uniqueResults.forEach(r => latePubs.add(r.publication.name));
        });
        
        const onlyEarly = [...earlyPubs].filter(p => !latePubs.has(p));
        const onlyLate = [...latePubs].filter(p => !earlyPubs.has(p));
        
        if (onlyEarly.length > 0 || onlyLate.length > 0) {
            patterns.push('Publication sources shift between early and late adaptations');
        }
        
        return patterns;
    }

    // UPDATED: Main report generation with new directory structure
    generateAllReports() {
        // Create the reports directory structure
        const outputDir = path.join('reports', 'lantern-reports');
        if (!fs.existsSync('reports')) {
            fs.mkdirSync('reports');
        }
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('📝 Generating Lantern Research Reports...\n');
        console.log(`📁 Output directory: ${outputDir}/\n`);

        // Individual film reports
        const filmReports = [];
        this.data.films.forEach(film => {
            if (film.qualityFound > 0) {
                const report = this.generateFilmReport(film);
                const filename = `${film.title.toLowerCase().replace(/\s+/g, '-')}-${film.year}.md`;
                const filepath = path.join(outputDir, filename);
                
                fs.writeFileSync(filepath, report);
                console.log(`✅ Generated: ${filename}`);
                
                // Store the actual report content, not the filename
                filmReports.push(report);
            }
        });

        // Combined report - build it piece by piece
        const combinedReportParts = [];
        
        // Header
        combinedReportParts.push('# Lantern Research Reports');
        combinedReportParts.push(`*Generated: ${this.reportDate}*`);
        combinedReportParts.push('');
        combinedReportParts.push(`Total films researched: ${this.data.summary.filmsResearched}`);
        combinedReportParts.push(`Films with coverage: ${this.data.summary.filmsWithCoverage}`);
        combinedReportParts.push('');
        combinedReportParts.push('---');
        combinedReportParts.push('');
        
        // Add each film report with separator
        filmReports.forEach((report, index) => {
            combinedReportParts.push(report);
            if (index < filmReports.length - 1) {
                combinedReportParts.push('');
                combinedReportParts.push('---');
                combinedReportParts.push('');
            }
        });
        
        // Add comparative analysis
        combinedReportParts.push('');
        combinedReportParts.push('---');
        combinedReportParts.push('');
        combinedReportParts.push(this.generateComparativeAnalysis(this.data.films));
        
        // Join with newlines and write
        const combinedReport = combinedReportParts.join('\n');
        fs.writeFileSync(path.join(outputDir, 'combined-report.md'), combinedReport);
        console.log(`\n✅ Generated: combined-report.md`);

        // Summary statistics
        const stats = {
            totalReports: filmReports.length,
            outputDirectory: outputDir,
            files: fs.readdirSync(outputDir)
        };

        console.log(`\n📊 Report Generation Complete:`);
        console.log(`   Reports generated: ${stats.totalReports}`);
        console.log(`   Output directory: ${stats.outputDirectory}/`);
        console.log(`   Files created: ${stats.files.length}`);

        return stats;
    }
}

// Run the report generator
function main() {
    const generator = new LanternReportGenerator();
    generator.generateAllReports();
}

if (require.main === module) {
    main();
}

module.exports = LanternReportGenerator;