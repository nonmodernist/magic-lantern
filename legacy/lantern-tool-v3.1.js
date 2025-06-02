// lantern-research-tool-v3.1.js
// updated with more title matches from Lantern naming patterns
// Corrected version using proper Lantern API parameters

const fs = require('fs');
const path = require('path');
const https = require('https');

class LanternResearchToolV3 {
    constructor() {
        this.results = [];
        this.rateLimitDelay = 200;
        this.baseUrl = 'https://lantern.mediahist.org';
        
        // Source rankings
        this.sourceRankings = {
            high: [
                'variety', 'motion picture world', 'mopicwor', 'motionpic', 'motionpicture', 'exhibitors herald', 'moving picture world', 'movpict', 'movingpicturewor', 'mowor', 'movingwor', 'movpicwor', 'movwor', 'movinwor', 'moviwor', 'movpic',
                'photoplay', 'picture play', 'motion picture magazine', 'motionpicturemag', 'silver screen',
                'motion picture classic', 'screenland', 'variety radio', 'motography', 'motionpicturerev', 'modernscreen', 'independentfilmj', 'newmoviemagazin', 'nationalboardofr', 'photo', 'motionpicturenew', 'paramountartcraf', 'camera', 'hollywoodreporte', 'motionpicturesto', 'motionnews', 'motionnew', 'movingpicturewee', 'reelslide', 'hollywoodfilmogr', 'nickelodeon', 'movieclassic', 'moviemirrorvol', 'motionpicturefam'
            ],
            medium: [
                'film daily', 'motion picture news', 'motionnew', 'wids', 'motion picture herald', 'motionpictureher',
                'box office', 'independent exhibitor', 'indepe', 'independ', 'harrison reports', 'film bulletin', 'universalweekly', 'hollywoodfilmogr', 'motionpicturedai', 'showmenstraderev', 'movielandtvtimev', 'motionpictureexh', 'harrisonsreports', 'picturep', 'exhibitorstrader', 'paramountartcraf', 'americancinemato', 'cinemundial', 'clipper', 'exhibitorstimes', 'moviespeoplewhom', 'exhibitorsdailyr', 'paramountpressbo', 'filmspectatorvol'
            ],
            low: ['copyright', 'registration', 'index', 'listing', 'directory']
        };
        
        // Enhanced content patterns
        this.contentPatterns = {
            review: [
                /\breview/i, /\breviewing\b/i, /\bcritic/i, /\bopinion\b/i,
                /picture is (?:good|excellent|poor|fair)/i,
                /story is (?:well|poorly) told/i,
                /acting is (?:good|excellent|poor)/i,
                /photography is/i, /worth seeing/i, /recommended/i,
                /\bverdict\b/i, /\brating\b/i, /thumbs (?:up|down)/i
            ],
            production: [
                /\bfilming\b/i, /\bproduction\b/i, /\bshooting\b/i,
                /\blocation\b/i, /\bstudio\b/i, /\bdirected by\b/i,
                /\badaptation of\b/i, /\bbased on the (?:novel|story|book)\b/i,
                /\bcast includes\b/i, /\bstarring\b/i, /\bleading role\b/i,
                /\bproduced by\b/i, /\bscreenplay\b/i
            ],
            announcement: [
                /announce/i, /acquire/i, /purchase/i, /rights/i,
                /will (?:film|produce|direct)/i, /plans to/i, /scheduled/i
            ],
            advertisement: [
                /now showing/i, /opening/i, /theatre/i, /theater/i,
                /admission/i, /matinee/i, /coming soon/i, /starts/i
            ],
            box_office: [
                /box office/i, /gross/i, /receipts/i, /business/i,
                /attendance/i, /earnings/i, /revenue/i
            ]
        };
        
        this.seenItems = new Map(); // Track by ID with best score
    }

    // Parse film file
    parseFilmFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatterMatch = content.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
        if (!frontmatterMatch) return null;

        const frontmatter = frontmatterMatch[1];
        
        const film = {
            filePath,
            fileName: path.basename(filePath),
            title: this.extractField(frontmatter, 'title'),
            year: this.extractField(frontmatter, 'year'),
            director: this.extractField(frontmatter, 'director'),
            studio: this.extractField(frontmatter, 'studio'),
            author: this.extractAuthor(frontmatter),
            originalStory: this.extractField(frontmatter, 'original_story'),
            storyAuthor: this.extractField(frontmatter, 'story_author'),
            stars: this.extractArray(frontmatter, 'stars')
        };
        
        // Clean up values
        Object.keys(film).forEach(key => {
            if (typeof film[key] === 'string') {
                film[key] = film[key].replace(/['"]/g, '').trim();
            }
        });
        
        return film.title ? film : null;
    }

    extractField(content, fieldName) {
        const regex = new RegExp(`^${fieldName}\\s*=\\s*(.+)$`, 'm');
        const match = content.match(regex);
        return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
    }

    extractAuthor(content) {
        const match = content.match(/^authors\s*=\s*\[([^\]]*)\]/m);
        if (!match) return null;
        const authors = match[1].split(',').map(a => a.trim().replace(/['"]/g, ''));
        return authors[0] || null;
    }

    extractArray(content, fieldName) {
        const match = content.match(new RegExp(`^${fieldName}\\s*=\\s*\\[([^\\]]*)\\]`, 'm'));
        if (!match) return [];
        return match[1].split(',').map(item => item.trim().replace(/['"]/g, ''));
    }

    // Generate search queries using correct API structure
    generateSearchQueries(filmInfo) {
        const queries = [];
        const { title, year, director, author } = filmInfo;
        
        // Primary search: title + author (if available) + year
        if (author) {
            queries.push({
                params: {
                    keyword: `"${title}"`,
                    second_keyword: this.formatAuthorForSearch(author),
                    date_text: year,
                    op: 'AND'
                },
                description: `Title + Author + Year ${year}`,
                priority: 1
            });
        }
        
        // Title only with year
        queries.push({
            params: {
                keyword: `"${title}"`,
                date_text: year,
                op: 'AND'
            },
            description: `Exact title with year ${year}`,
            priority: 2
        });
        
        // Title with looser year range
        if (year) {
            const yearNum = parseInt(year);
            queries.push({
                params: {
                    keyword: `"${title}"`,
                    date_text: `${yearNum - 1}-${yearNum + 1}`,
                    op: 'AND'
                },
                description: `Title with year range ${yearNum - 1}-${yearNum + 1}`,
                priority: 3
            });
        }
        
        // Director search if no author results
        if (director) {
            queries.push({
                params: {
                    keyword: `"${title}"`,
                    second_keyword: `"${director}"`,
                    date_text: year,
                    op: 'AND'
                },
                description: `Title + Director + Year`,
                priority: 4
            });
        }
        
        return queries;
    }
    
    // Format author name for better search results
    formatAuthorForSearch(author) {
        // Handle specific author variations
        if (author.includes('Stratton-Porter')) {
            return '"gene stratton porter" OR "stratton-porter"';
        } else if (author.includes('Alice Hegan Rice')) {
            return '"alice hegan rice" OR "hegan rice"';
        } else if (author.includes('Fannie Hurst')) {
            return '"fannie hurst" OR "fanny hurst"';
        }
        return `"${author}"`;
    }

    // Make API request
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            
            https.get({
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                headers: {
                    'User-Agent': 'Hollywood-Regionalism-Research/3.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (error) {
                            reject(new Error(`JSON parse error: ${error.message}`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    }
                });
            }).on('error', reject)
              .setTimeout(15000, function() {
                  this.destroy();
                  reject(new Error('Request timeout'));
              });
        });
    }

    // Search Lantern with correct parameters
    async searchLantern(searchQuery, filmInfo) {
        const { params, description } = searchQuery;
        
        // Build URL with correct parameters
        const urlParams = new URLSearchParams({
            ...params,
            search_field: 'advanced',
            commit: 'Search',
            sort: 'score desc, dateStart desc',
            per_page: '50'
        });
        
        // Add collection filters
        ['Hollywood Studio System', 'Early Cinema', 'Fan Magazines'].forEach(collection => {
            urlParams.append('f_inclusive[collection][]', collection);
        });
        
        // Add format filter for periodicals
        urlParams.append('f_inclusive[format][]', 'Periodicals');
        
        const searchUrl = `${this.baseUrl}/catalog.json?${urlParams.toString()}`;
        
        console.log(`      URL: ${searchUrl.replace(this.baseUrl, '[...]')}`);
        
        try {
            const response = await this.makeRequest(searchUrl);
            const totalCount = response.meta?.pages?.total_count || 0;
            const rawResults = response.data || [];
            
            // Process results with date filtering
            const processedResults = this.processResults(rawResults, filmInfo);
            
            return {
                query: params,
                description,
                totalCount,
                processedCount: processedResults.length,
                results: processedResults.slice(0, 10),
                hasMore: processedResults.length > 10
            };
            
        } catch (error) {
            console.error(`   ❌ Search error: ${error.message}`);
            return {
                query: params,
                description,
                totalCount: 0,
                processedCount: 0,
                results: [],
                error: error.message
            };
        }
    }

    // Process results with better date filtering
    processResults(results, filmInfo) {
        const targetYear = parseInt(filmInfo.year);
        
        return results
            .map(result => this.enhanceResult(result, filmInfo))
            .filter(result => this.isValidResult(result, targetYear))
            .sort((a, b) => b.score - a.score);
    }

    // Enhance result with scoring and metadata
    enhanceResult(result, filmInfo) {
        const enhanced = { ...result };
        
        // Extract fields
        enhanced.itemId = result.id || '';
        enhanced.excerpt = result.attributes?.body?.attributes?.value || '';
        enhanced.dateString = result.attributes?.dateString?.attributes?.value || '';
        enhanced.readUrl = result.attributes?.read?.attributes?.value || '';
        
        // Parse year from dateString
        enhanced.parsedYear = this.extractYearFromDate(enhanced.dateString);
        
        // Clean excerpt
        enhanced.cleanExcerpt = this.cleanText(enhanced.excerpt);
        
        // Identify publication
        enhanced.publication = this.identifyPublication(enhanced.itemId);
        
        // Classify content
        enhanced.contentType = this.classifyContent(enhanced.cleanExcerpt);
        
        // Calculate score
        enhanced.score = this.calculateScore(enhanced, filmInfo);
        
        // Explain relevance
        enhanced.relevanceFactors = this.explainRelevance(enhanced, filmInfo);
        
        return enhanced;
    }

    // Extract year from date string
    extractYearFromDate(dateString) {
        if (!dateString) return null;
        
        // Handle various date formats
        const yearMatch = dateString.match(/\b(19\d{2}|20\d{2})\b/);
        if (yearMatch) {
            return parseInt(yearMatch[1]);
        }
        
        return null;
    }

    // Clean text
    cleanText(text) {
        return text
            .replace(/<\/?em>/g, '')
            .replace(/\s+/g, ' ')
            .replace(/[^\x20-\x7E]/g, '')
            .trim();
    }

    // Identify publication
    identifyPublication(itemId) {
        const id = itemId.toLowerCase();
        
        for (let pub of this.sourceRankings.high) {
            const pubKey = pub.replace(/\s+/g, '');
            if (id.includes(pubKey)) {
                return { name: pub, tier: 'high' };
            }
        }
        
        for (let pub of this.sourceRankings.medium) {
            const pubKey = pub.replace(/\s+/g, '');
            if (id.includes(pubKey)) {
                return { name: pub, tier: 'medium' };
            }
        }
        
        // Extract from pattern
        const match = id.match(/^([a-z]+)/);
        if (match) {
            return { name: match[1], tier: 'unknown' };
        }
        
        return { name: 'unknown', tier: 'unknown' };
    }

    // Classify content type
    classifyContent(text) {
        const lower = text.toLowerCase();
        
        // Check each pattern type
        for (let [type, patterns] of Object.entries(this.contentPatterns)) {
            for (let pattern of patterns) {
                if (pattern.test(lower)) {
                    return type;
                }
            }
        }
        
        return 'mention';
    }

    // Calculate relevance score
    calculateScore(result, filmInfo) {
        let score = 0;
        const excerpt = result.cleanExcerpt.toLowerCase();
        const title = filmInfo.title.toLowerCase();
        
        // Publication quality
        if (result.publication.tier === 'high') score += 3;
        else if (result.publication.tier === 'medium') score += 2;
        else score += 0.5;
        
        // Content length bonus
        if (excerpt.length > 200) score += 1;
        if (excerpt.length > 400) score += 1;
        
        // Title matching
        if (excerpt.includes(`"${title}"`)) {
            score += 3;
        } else if (excerpt.includes(title)) {
            score += 2;
        } else {
            // Partial title matching
            const titleWords = title.split(' ').filter(w => w.length > 3);
            const matchedWords = titleWords.filter(w => excerpt.includes(w.toLowerCase()));
            score += (matchedWords.length / titleWords.length) * 1.5;
        }
        
        // Author mention bonus
        if (filmInfo.author) {
            const authorLower = filmInfo.author.toLowerCase();
            if (excerpt.includes(authorLower) || 
                excerpt.includes(authorLower.replace('-', ' ')) ||
                excerpt.includes(authorLower.split(' ').pop())) { // Last name
                score += 2;
            }
        }
        
        // Director mention
        if (filmInfo.director && excerpt.includes(filmInfo.director.toLowerCase())) {
            score += 1.5;
        }
        
        // Content type bonuses
        const contentBonuses = {
            'review': 3,
            'production': 2,
            'box_office': 2,
            'announcement': 1.5,
            'advertisement': 1,
            'mention': 0
        };
        score += contentBonuses[result.contentType] || 0;
        
        // Year proximity bonus
        if (result.parsedYear && filmInfo.year) {
            const yearDiff = Math.abs(result.parsedYear - parseInt(filmInfo.year));
            if (yearDiff === 0) score += 2;
            else if (yearDiff === 1) score += 1;
            else if (yearDiff > 2) score -= 1;
        }
        
        return Math.max(0, score);
    }

    // Explain relevance
    explainRelevance(result, filmInfo) {
        const factors = [];
        const excerpt = result.cleanExcerpt.toLowerCase();
        
        if (result.publication.tier === 'high') {
            factors.push(`High-value: ${result.publication.name}`);
        } else if (result.publication.tier === 'medium') {
            factors.push(`Medium-value: ${result.publication.name}`);
        }
        
        if (excerpt.includes(`"${filmInfo.title.toLowerCase()}"`)) {
            factors.push('Exact title match');
        }
        
        if (filmInfo.author) {
            const authorLower = filmInfo.author.toLowerCase();
            if (excerpt.includes(authorLower) || 
                excerpt.includes(authorLower.replace('-', ' '))) {
                factors.push('Mentions author');
            }
        }
        
        if (result.contentType !== 'mention') {
            factors.push(`${result.contentType.charAt(0).toUpperCase() + result.contentType.slice(1)} content`);
        }
        
        if (result.parsedYear === parseInt(filmInfo.year)) {
            factors.push('Correct year');
        }
        
        return factors;
    }

    // Validate result
    isValidResult(result, targetYear) {
        // Must have content
        if (!result.cleanExcerpt || result.cleanExcerpt.length < 50) {
            return false;
        }
        
        // Filter by year proximity if we have a date
        if (result.parsedYear && targetYear) {
            const yearDiff = Math.abs(result.parsedYear - targetYear);
            if (yearDiff > 2) { // ! Allow 2-year window - TESTING 2 YEAR WINDOW instead of 3
                return false;
            }
        }
        
        // Check for OCR quality
        const specialCharCount = (result.cleanExcerpt.match(/[^a-zA-Z0-9\s,.!?;:'"()-]/g) || []).length;
        const specialCharRatio = specialCharCount / result.cleanExcerpt.length;
        if (specialCharRatio > 0.1) {
            return false;
        }
        
        // Must have minimum score
        return result.score > 1;
    }

    // Deduplicate across all searches for a film
    deduplicateResults(allResults) {
        // Use map to keep best scoring version of each item
        allResults.forEach(result => {
            const existing = this.seenItems.get(result.itemId);
            if (!existing || existing.score < result.score) {
                this.seenItems.set(result.itemId, result);
            }
        });
        
        return Array.from(this.seenItems.values())
            .sort((a, b) => b.score - a.score);
    }

    // Process a single film
    async processFilm(filmInfo) {
        console.log(`\n🎬 Researching: "${filmInfo.title}" (${filmInfo.year})`);
        console.log(`   File: ${filmInfo.fileName}`);
        if (filmInfo.author) console.log(`   Author: ${filmInfo.author}`);
        if (filmInfo.director) console.log(`   Director: ${filmInfo.director}`);
        
        // Clear deduplication map for new film
        this.seenItems.clear();
        
        const queries = this.generateSearchQueries(filmInfo);
        const searchResults = [];
        let totalUniqueResults = 0;
        
        for (const query of queries) {
            console.log(`   🔍 ${query.description}`);
            
            const result = await this.searchLantern(query, filmInfo);
            searchResults.push(result);
            
            console.log(`      → Found ${result.totalCount} total, ${result.processedCount} after filtering`);
            
            // Deduplicate and track
            const allResults = searchResults.flatMap(sr => sr.results);
            const uniqueResults = this.deduplicateResults(allResults);
            totalUniqueResults = uniqueResults.length;
            
            // Show top unique results
            if (result.results.length > 0) {
                console.log(`      Top matches (${totalUniqueResults} unique so far):`);
                result.results.slice(0, 3).forEach((item, idx) => {
                    const preview = item.cleanExcerpt.length > 100 ? 
                        item.cleanExcerpt.substring(0, 100) + '...' : 
                        item.cleanExcerpt;
                    
                    const dateInfo = item.dateString ? ` [${item.dateString}]` : '';
                    console.log(`      ${idx + 1}. [${item.score.toFixed(1)}] ${item.publication.name}${dateInfo}`);
                    console.log(`         "${preview}"`);
                    console.log(`         ✓ ${item.relevanceFactors.join(', ')}`);
                });
            }
            
            await this.delay(this.rateLimitDelay);
            
            // Stop if we have enough good results
            if (totalUniqueResults >= 10 && uniqueResults[0]?.score > 6) {
                console.log(`      ✨ Found sufficient quality coverage, stopping search`);
                break;
            }
        }
        
        // Get final unique results
        const uniqueResults = Array.from(this.seenItems.values())
            .sort((a, b) => b.score - a.score);
        
        const filmResult = {
            ...filmInfo,
            searchResults,
            uniqueResults,
            totalFound: searchResults.reduce((sum, r) => sum + r.totalCount, 0),
            qualityFound: uniqueResults.length,
            bestResult: uniqueResults[0] || null
        };
        
        this.results.push(filmResult);
        return filmResult;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate report
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 LANTERN RESEARCH REPORT v3');
        console.log('='.repeat(80));

        const totalFilms = this.results.length;
        const filmsWithCoverage = this.results.filter(r => r.qualityFound > 0).length;
        const totalSources = this.results.reduce((sum, r) => sum + r.qualityFound, 0);

        console.log(`\n📈 Summary:`);
        console.log(`   Films researched: ${totalFilms}`);
        console.log(`   Films with quality coverage: ${filmsWithCoverage}`);
        console.log(`   Total unique sources: ${totalSources}`);
        console.log(`   Success rate: ${((filmsWithCoverage / totalFilms) * 100).toFixed(1)}%`);

        // Content type breakdown
        const contentTypes = {};
        this.results.forEach(film => {
            film.uniqueResults?.forEach(result => {
                contentTypes[result.contentType] = (contentTypes[result.contentType] || 0) + 1;
            });
        });

        console.log(`\n📰 Coverage Types:`);
        Object.entries(contentTypes)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                console.log(`   ${type}: ${count} items`);
            });

        // Top films
        const topFilms = this.results
            .filter(r => r.qualityFound > 0)
            .sort((a, b) => b.qualityFound - a.qualityFound)
            .slice(0, 5);

        if (topFilms.length > 0) {
            console.log(`\n🌟 Top Films by Coverage:`);
            topFilms.forEach((film, idx) => {
                console.log(`\n${idx + 1}. "${film.title}" (${film.year})`);
                console.log(`   Unique quality sources: ${film.qualityFound}`);
                
                // Show variety of coverage
                const types = {};
                film.uniqueResults.forEach(r => {
                    types[r.contentType] = (types[r.contentType] || 0) + 1;
                });
                console.log(`   Coverage types: ${Object.entries(types).map(([t, c]) => `${t} (${c})`).join(', ')}`);
                
                if (film.bestResult) {
                    const best = film.bestResult;
                    console.log(`   Best match: [${best.score.toFixed(1)}] ${best.publication.name} (${best.dateString})`);
                    const preview = best.cleanExcerpt.substring(0, 150) + '...';
                    console.log(`   "${preview}"`);
                }
            });
        }

        // UPDATED: Create reports directory structure and save to it
        const reportsDir = path.join('reports', 'lantern-reports');
        if (!fs.existsSync('reports')) {
            fs.mkdirSync('reports');
        }
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Save detailed report
        const report = {
            summary: {
                filmsResearched: totalFilms,
                filmsWithCoverage: filmsWithCoverage,
                totalUniqueSources: totalSources,
                successRate: (filmsWithCoverage / totalFilms) * 100,
                contentTypes,
                generatedAt: new Date().toISOString()
            },
            films: this.results.map(film => ({
                ...film,
                uniqueResults: film.uniqueResults?.map(r => ({
                    id: r.itemId,
                    score: r.score,
                    date: r.dateString,
                    year: r.parsedYear,
                    publication: r.publication,
                    contentType: r.contentType,
                    excerpt: r.cleanExcerpt,
                    relevance: r.relevanceFactors,
                    readUrl: r.readUrl
                }))
            }))
        };

        const reportPath = path.join(reportsDir, 'lantern-report-v3.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Report saved to: ${reportPath}`);

        console.log(`\n🎯 Next Steps:`);
        console.log(`1. Review results for ${contentTypes.review || 0} reviews`);
        console.log(`2. Check ${contentTypes.production || 0} production articles`);
        console.log(`3. Investigate ${contentTypes.box_office || 0} box office reports`);
        console.log(`4. Use readUrl links to view full pages on Internet Archive`);
    }

    // Process films
    async processFilmSubset(maxFilms = 5) {
        const filmsDir = path.join(process.cwd(), 'content', 'films');
        
        if (!fs.existsSync(filmsDir)) {
            console.error(`❌ Films directory not found: ${filmsDir}`);
            return;
        }

        const filmFiles = fs.readdirSync(filmsDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(filmsDir, file))
            .slice(0, maxFilms);

        console.log(`🔬 LANTERN RESEARCH TOOL v3`);
        console.log(`📁 Processing ${filmFiles.length} films`);
        console.log('='.repeat(80));

        for (let i = 0; i < filmFiles.length; i++) {
            const filmInfo = this.parseFilmFile(filmFiles[i]);
            if (filmInfo) {
                await this.processFilm(filmInfo);
            }
        }

        this.generateReport();
    }
}

// Test API
async function testAPI() {
    console.log('🧪 Testing Lantern API v3...\n');
    
    const tool = new LanternResearchToolV3();
    
    // Test with parameters that should definitely return results
    const params = new URLSearchParams({
        keyword: 'variety',  // Remove quotes for broader search
        date_text: '1925',
        search_field: 'advanced',
        commit: 'Search',
        sort: 'score desc',
        per_page: '10'
    });
    
    // Add collections - try without specifying to see if that's the issue
    ['Hollywood Studio System', 'Early Cinema', 'Fan Magazines'].forEach(collection => {
        params.append('f_inclusive[collection][]', collection);
    });
    
    const testUrl = `https://lantern.mediahist.org/catalog.json?${params.toString()}`;
    
    console.log(`Test URL: ${testUrl}\n`);
    
    try {
        const result = await tool.makeRequest(testUrl);
        console.log('✅ API connection working!');
        console.log(`Response structure: ${JSON.stringify(Object.keys(result), null, 2)}`);
        console.log(`Found ${result.meta?.pages?.total_count || 0} total results`);
        console.log(`Returned ${result.data?.length || 0} results in this page`);
        
        if (result.data && result.data.length > 0) {
            const sample = result.data[0];
            console.log(`\nFirst result:`);
            console.log(`  ID: ${sample.id}`);
            console.log(`  Type: ${sample.type}`);
            console.log(`  Date: ${sample.attributes?.dateString?.attributes?.value || 'No date'}`);
            
            // Show what fields are available
            if (sample.attributes) {
                console.log(`  Available fields: ${Object.keys(sample.attributes).join(', ')}`);
            }
        } else {
            console.log('\nNo results returned. Try adjusting search parameters.');
            console.log('Suggestion: Try without collection filters or with different keywords.');
        }
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Main
async function main() {
    console.log('🎬 Hollywood Regionalism - Lantern Research Tool v3\n');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--test-api')) {
        await testAPI();
        return;
    }
    
    const filmCount = args.includes('--all') ? 999 : 5;
    console.log(`Processing ${filmCount === 999 ? 'all' : filmCount} films...\n`);
    
    const tool = new LanternResearchToolV3();
    await tool.processFilmSubset(filmCount);
    
    console.log('\n✨ Complete!');
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
}

module.exports = LanternResearchToolV3;