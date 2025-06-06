// lib/markdown-report-generator.js
const fs = require('fs');
const path = require('path');

class MarkdownReportGenerator {
    constructor(options = {}) {
        this.options = {
            createSubfolders: options.createSubfolders !== false,
            ...options
        };
    }

    // Generate reports for all films
    generateReports(results, profileInfo) {
        const reports = {
            individual: [],
            combined: null,
            comparative: null,
            summary: null
        };

        // Individual film reports
        for (const result of results) {
            const report = this.generateFilmReport(result);
            reports.individual.push({
                film: result.film,
                markdown: report,
                filename: this.getFilmFilename(result.film)
            });
        }

         // Combined report - ALWAYS generate if we have individual reports
    if (reports.individual.length > 0) {
        console.log('   📄 Generating combined report...');
        reports.combined = this.generateCombinedReport(results, reports.individual, profileInfo);
    }

       // Comparative analysis - only if multiple films
    if (this.options.includeComparative && results.length > 1) {
        console.log('   📄 Generating comparative analysis...');
        reports.comparative = this.generateComparativeAnalysis(results);
    }

        // Summary statistics
    if (this.options.includeSummary) {
        console.log('   📄 Generating executive summary...');
        reports.summary = this.generateSummaryReport(results, profileInfo);
    }

        return reports;
    }

    // Generate individual film report
    generateFilmReport(result) {
        const { film, totalUniqueSources, fullTextAnalysis, contentStats } = result;
        const report = [];
        
     // Header
    report.push(`## Film Research Report: ${film.title} (${film.year})`);
    if (film.studio || film.director) {
        report.push(`**${film.studio || 'Unknown Studio'}${film.director ? ` | Dir: ${film.director}` : ''}**`);
    }
    if (film.author) {
        report.push(`*Based on work by ${film.author}*`);
    }
    report.push('');

    // Coverage Summary
    report.push('### Coverage Summary');
    report.push(`- **Total Sources Found**: ${totalUniqueSources}`);
    
    // Only show full-text stats if we have them
    if (fullTextAnalysis && fullTextAnalysis.length > 0) {
        report.push(`- **Full Text Analyzed**: ${fullTextAnalysis.length}`);
        
        if (contentStats) {
            report.push(`- **High-Confidence Content**: ${contentStats.byConfidence?.high || 0}`);
            report.push(`- **Average Content Score**: ${contentStats.averageContentScore || 0}`);
        }
    } else {
        report.push('- **Full Text Analysis**: Not available');
    }
    report.push('');

    // Themes and Significance - only if we have data
    if (contentStats && contentStats.byTheme && Object.keys(contentStats.byTheme).length > 0) {
        report.push('### Themes Found');
        report.push('| Theme | Count | Frequency |');
        report.push('|-------|-------|-----------|');
        
        const total = fullTextAnalysis.length;
        Object.entries(contentStats.byTheme)
            .sort((a, b) => b[1] - a[1])
            .forEach(([theme, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                report.push(`| ${this.formatTheme(theme)} | ${count} | ${percentage}% |`);
            });
        report.push('');
    }
    
    if (contentStats && contentStats.bySignificance && Object.keys(contentStats.bySignificance).length > 0) {
        report.push('### Significance Indicators');
        report.push('| Significance | Count | Frequency |');
        report.push('|-------------|-------|-----------|');
        
        const total = fullTextAnalysis.length;
        Object.entries(contentStats.bySignificance)
            .sort((a, b) => b[1] - a[1])
            .forEach(([sig, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                report.push(`| ${this.formatSignificance(sig)} | ${count} | ${percentage}% |`);
            });
        report.push('');
    }

    // Show top sources from comprehensive results if no full text
    if (!fullTextAnalysis || fullTextAnalysis.length === 0) {
        report.push('### Top Sources (No Full Text Available)');
        report.push('*Run a new search to analyze full text content*');
        report.push('');
    }

    // Research Notes
    report.push('### Research Notes');
    const notes = this.generateResearchNotes(result);
    notes.forEach(note => report.push(`- ${note}`));
    report.push('');

    return report.join('\n');
}

    // Generate combined report
    generateCombinedReport(results, individualReports, profileInfo) {
        const report = [];
        
        // Header
        report.push('# Magic Lantern Research Report');
        report.push(`*Generated: ${new Date().toISOString().split('T')[0]}*`);
        report.push(`*Profile: ${profileInfo.profileName}*`);
        report.push('');
        
        // Summary statistics
        report.push('## Summary');
        report.push(`- Films researched: ${results.length}`);
        report.push(`- Total sources found: ${results.reduce((sum, r) => sum + r.totalUniqueSources, 0)}`);
        report.push(`- Total full texts analyzed: ${results.reduce((sum, r) => sum + r.fullTextAnalysis.length, 0)}`);
        report.push('');
        
        // Table of contents
        report.push('## Table of Contents');
        individualReports.forEach((rep, idx) => {
            const anchor = rep.film.title.toLowerCase().replace(/\s+/g, '-');
            report.push(`${idx + 1}. [${rep.film.title} (${rep.film.year})](#${anchor})`);
        });
        report.push('');
        
        report.push('---');
        report.push('');
        
        // Add individual reports
        individualReports.forEach((rep, idx) => {
            report.push(rep.markdown);
            if (idx < individualReports.length - 1) {
                report.push('');
                report.push('---');
                report.push('');
            }
        });
        
        return report.join('\n');
    }

    // Helper methods
    formatTheme(theme) {
        const themeMap = {
            'labor_relations': 'Labor Relations',
            'censorship': 'Censorship',
            'family_audience': 'Family Audience',
            'technical_innovation': 'Technical Innovation',
            'marketing_campaign': 'Marketing Campaign',
            'cultural_controversy': 'Cultural Controversy'
        };
        return themeMap[theme] || theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatSignificance(sig) {
        const sigMap = {
            'exceptional_performance': 'Exceptional Performance',
            'technical_innovation': 'Technical Innovation',
            'cultural_controversy': 'Cultural Controversy',
            'broad_distribution': 'Broad Distribution',
            'critical_acclaim': 'Critical Acclaim',
            'commercial_success': 'Commercial Success'
        };
        return sigMap[sig] || sig.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatPublication(name) {
        if (!name) return 'Unknown';
        return name.split(/[\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatExcerpt(text, maxLength = 150) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    getFilmFilename(film) {
        const title = (film.title || film.Title || 'unknown')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const year = film.year || film.Year || 'unknown';
        return `${title}-${year}.md`;
    }

    generateResearchNotes(result) {
        const notes = [];
        const { fullTextAnalysis, contentStats } = result;
        
        // Pattern observations based on themes and significance
        if (contentStats?.byTheme?.censorship > 0) {
            notes.push('Censorship or controversy themes present');
        }
        
        if (contentStats?.byTheme?.labor_relations > 0) {
            notes.push('Labor relations themes documented');
        }
        
        if (contentStats?.bySignificance?.exceptional_performance > 0) {
            notes.push('Evidence of exceptional performance or results');
        }
        
        if (contentStats?.bySignificance?.technical_innovation > 0) {
            notes.push('Technical innovation or breakthrough documented');
        }
        
        
        // Publication patterns
        const pubCounts = {};
        fullTextAnalysis.forEach(f => {
            pubCounts[f.publication] = (pubCounts[f.publication] || 0) + 1;
        });
        
        const dominant = Object.entries(pubCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (dominant && dominant[1] > fullTextAnalysis.length * 0.4) {
            notes.push(`Heavy coverage in ${this.formatPublication(dominant[0])}`);
        }
        
        return notes.length > 0 ? notes : ['Further analysis recommended'];
    }

generateComparativeAnalysis(results) {
    const report = [];
    
    report.push('## Comparative Analysis');
    report.push(`*Analyzing ${results.length} films*`);
    report.push('');

       // Group by various criteria
    const byYear = {};
    const byStudio = {};
    const byTheme = {};
    
    results.forEach(result => {
        const year = result.film.year || 'Unknown';
        const studio = result.film.studio || 'Unknown';
        
        if (!byYear[year]) byYear[year] = [];
        if (!byStudio[studio]) byStudio[studio] = [];
        
        byYear[year].push(result);
        byStudio[studio].push(result);
        
        // Group by themes
        if (result.contentStats && result.contentStats.byTheme) {
            Object.keys(result.contentStats.byTheme).forEach(theme => {
                if (!byTheme[theme]) byTheme[theme] = [];
                byTheme[theme].push(result);
            });
        }
    });
    
    // Coverage by Year
    report.push('### Coverage by Year');
    Object.entries(byYear)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([year, films]) => {
            const avgSources = films.reduce((sum, f) => sum + f.totalUniqueSources, 0) / films.length;
            report.push(`- **${year}**: ${films.length} films, avg ${avgSources.toFixed(1)} sources`);
        });
    report.push('');
    
    // Coverage by Studio
    report.push('### Coverage by Studio');
    Object.entries(byStudio)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
        .forEach(([studio, films]) => {
            const avgSources = films.reduce((sum, f) => sum + f.totalUniqueSources, 0) / films.length;
            report.push(`- **${studio}**: ${films.length} films, avg ${avgSources.toFixed(1)} sources`);
        });
    report.push('');
    
    // Thematic Analysis
    if (Object.keys(byTheme).length > 0) {
        report.push('### Thematic Analysis');
        Object.entries(byTheme)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 5)
            .forEach(([theme, films]) => {
                report.push(`- **${this.formatTheme(theme)}**: ${films.length} films`);
            });
    }
    
    return report.join('\n');
}

generateSummaryReport(results, profileInfo) {
    const report = [];
    
    report.push('## Executive Summary');
    report.push(`*Research Profile: ${profileInfo.profileName}*`);
    report.push('');
    
    // Overall statistics
    const totalSources = results.reduce((sum, r) => sum + r.totalUniqueSources, 0);
    const totalFullText = results.reduce((sum, r) => sum + r.fullTextAnalysis.length, 0);
    report.push('### Key Findings');
    report.push(`- Researched **${results.length} films** across the collection`);
    report.push(`- Found **${totalSources} unique sources** total`);
    report.push(`- Analyzed **${totalFullText} full text pages**`);
    report.push('');
    
    // Best documented films
    const topFilms = [...results]
        .sort((a, b) => b.totalUniqueSources - a.totalUniqueSources)
        .slice(0, 5);
    
    report.push('### Best Documented Films');
    topFilms.forEach((result, idx) => {
        report.push(`${idx + 1}. **${result.film.title}** (${result.film.year}) - ${result.totalUniqueSources} sources`);
    });
    
    return report.join('\n');
}

    // Save reports to disk
    saveReports(reports, outputDir, timestamp) {
        const savedFiles = [];
        

    // Save individual reports in a subfolder if enabled
        if (reports.individual && this.options.createSubfolders) {
            const filmReportsDir = path.join(outputDir, 'film-reports');
            if (!fs.existsSync(filmReportsDir)) {
                fs.mkdirSync(filmReportsDir, { recursive: true });
            }
            
            reports.individual.forEach(rep => {
                const filepath = path.join(filmReportsDir, rep.filename);
                fs.writeFileSync(filepath, rep.markdown);
                savedFiles.push(filepath);
            });
            
            console.log(`   📁 Individual reports saved to: film-reports/`);
        } else if (reports.individual) {
            // Save individual reports in main results folder
            reports.individual.forEach(rep => {
                const filepath = path.join(outputDir, `${rep.filename.replace('.md', '')}_${timestamp}.md`);
                fs.writeFileSync(filepath, rep.markdown);
                savedFiles.push(filepath);
            });
        }

            // Save combined report in main results folder
    if (reports.combined) {
        const filepath = path.join(outputDir, `combined-report_${timestamp}.md`);
        fs.writeFileSync(filepath, reports.combined);
        savedFiles.push(filepath);
        console.log(`   📄 Saved: combined-report_${timestamp}.md`);
    }

        // Save comparative analysis if present
        if (reports.comparative) {
            const filepath = path.join(outputDir, `comparative-analysis_${timestamp}.md`);
            fs.writeFileSync(filepath, reports.comparative);
            savedFiles.push(filepath);
            console.log(`   📄 Saved: comparative-analysis_${timestamp}.md`);
        }

        // Save executive summary if present
        if (reports.summary) {
            const filepath = path.join(outputDir, `executive-summary_${timestamp}.md`);
            fs.writeFileSync(filepath, reports.summary);
            savedFiles.push(filepath);
            console.log(`   📄 Saved: executive-summary_${timestamp}.md`);
        }

        return savedFiles;
    }
}

module.exports = MarkdownReportGenerator;