#!/usr/bin/env node

// magic-lantern.js - Fixed to fetch full OCR text
const fs = require('fs');
const path = require('path');
const https = require('https');

class MagicLantern {
    constructor() {
        this.baseUrl = 'https://lantern.mediahist.org';
        this.rateLimitDelay = 200;
        
        // Content type patterns for analysis
        this.contentPatterns = {
            review: /\b(review|reviewed|critique|criticism|notices?)\b/i,
            production: /\b(production|producing|filming|started|completed|announced)\b/i,
            boxOffice: /\b(gross|box[\s-]?office|earnings|receipts|revenue|record)\b/i,
            advertisement: /\b(now showing|coming|opens|playing|at the|theatre|theater)\b/i,
            photo: /\b(photograph|photo|picture|scene from|production still)\b/i,
            interview: /\b(interview|talks about|discusses|says)\b/i
        };
    }

    // Make HTTPS request (reusable)
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON from ${url}`));
                    }
                });
            }).on('error', reject);
        });
    }

    // Fetch the FULL OCR text for a specific page
    async fetchFullPageText(pageId) {
        const url = `${this.baseUrl}/catalog/${pageId}/raw.json`;
        console.log(`   📄 Fetching full text for: ${pageId}`);
        
        try {
            const pageData = await this.makeRequest(url);
            
            // The full OCR text is in the 'body' field
            return {
                id: pageId,
                fullText: pageData.body || '',
                title: pageData.title,
                date: pageData.date || pageData.dateString,
                year: pageData.year,
                publisher: pageData.publisher,
                iaPage: pageData.iaPage,
                readUrl: pageData.idAccess,
                wordCount: (pageData.body || '').split(/\s+/).length
            };
        } catch (error) {
            console.error(`   ❌ Failed to fetch full text for ${pageId}`);
            return null;
        }
    }

    // Load films from CSV
    async loadFilms(filePath) {
        console.log('🎬 Loading films from:', filePath);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        const films = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const film = {};
            headers.forEach((header, i) => {
                film[header] = values[i];
            });
            return film;
        });
        
        console.log(`✨ Found ${films.length} films to research!\n`);
        return films;
    }

    // Initial search to find page IDs
    async searchLantern(query) {
        const params = new URLSearchParams({
            q: query,
            per_page: '10' // Start smaller for testing
        });
        
        const url = `${this.baseUrl}/catalog.json?${params}`;
        console.log(`🔍 Searching for: "${query}"`);
        
        const results = await this.makeRequest(url);
        const count = results.meta?.pages?.total_count || 0;
        console.log(`   ✓ Found ${count} total results!`);
        
        return results;
    }

    // Process search results and fetch full text for interesting ones
    async processSearchResults(searchResults, limit = 3) {
        if (!searchResults.data || searchResults.data.length === 0) {
            return [];
        }

        console.log(`\n📚 Fetching full text for top ${limit} results...`);
        
        const fullTextResults = [];
        
        // Get full text for the most promising results
        for (let i = 0; i < Math.min(limit, searchResults.data.length); i++) {
            const item = searchResults.data[i];
            const pageId = item.id;
            
            // Add delay to respect rate limits
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
            
            const fullPageData = await this.fetchFullPageText(pageId);
            
            if (fullPageData) {
                // Analyze the full text
                fullPageData.contentTypes = this.identifyContentTypes(fullPageData.fullText);
                fullPageData.hasPhoto = this.checkForPhoto(fullPageData.fullText);
                fullPageData.excerpt = fullPageData.fullText.substring(0, 300) + '...';
                
                fullTextResults.push(fullPageData);
            }
        }
        
        return fullTextResults;
    }

    // Identify content types in the full text
    identifyContentTypes(text) {
        const types = [];
        
        for (const [type, pattern] of Object.entries(this.contentPatterns)) {
            if (pattern.test(text)) {
                types.push(type);
            }
        }
        
        return types.length > 0 ? types : ['mention'];
    }

    // Check for photo mentions
    checkForPhoto(text) {
        const photoIndicators = [
            'scene from',
            'production still',
            'photograph',
            'pictured above',
            'shown here',
            'exclusive photo'
        ];
        
        const lowerText = text.toLowerCase();
        return photoIndicators.some(indicator => lowerText.includes(indicator));
    }

    // Analyze and display the treasures
    displayTreasures(fullTextResults) {
        console.log('\n✨ TREASURE ANALYSIS:\n');
        
        fullTextResults.forEach((result, index) => {
            console.log(`📄 FIND #${index + 1}: ${result.id}`);
            console.log(`   Publisher: ${result.publisher || 'Unknown'}`);
            console.log(`   Date: ${result.date || 'Unknown'}`);
            console.log(`   Length: ${result.wordCount} words`);
            console.log(`   Content types: ${result.contentTypes.join(', ')}`);
            
            if (result.hasPhoto) {
                console.log(`   🎉 POSSIBLE PHOTO/STILL FOUND!`);
            }
            
            console.log(`   Preview: "${result.excerpt}"`);
            console.log(`   Full page: ${result.readUrl}\n`);
        });
    }

    // Process one film
    async processFilm(film) {
        const title = film.title || film.Title;
        const year = film.year || film.Year;
        
        console.log(`\n🎭 Researching: ${title} (${year})`);
        
        // Initial search
        const query = `"${title}" ${year}`;
        const searchResults = await this.searchLantern(query);
        
        // Fetch full text for top results
        const fullTextResults = await this.processSearchResults(searchResults, 3);
        
        // Display what we found
        this.displayTreasures(fullTextResults);
        
        return {
            film: film,
            searchQuery: query,
            totalFound: searchResults.meta?.pages?.total_count || 0,
            fullTextAnalyzed: fullTextResults.length,
            treasures: fullTextResults
        };
    }

    async run(filePath) {
        console.log('✨ MAGIC LANTERN - Film Research Discovery Tool ✨\n');
        
        try {
            const films = await this.loadFilms(filePath);
            
            console.log('🧪 Testing with first film...');
            const results = await this.processFilm(films[0]);
            
            // Save results
            fs.writeFileSync('full-text-results.json', 
                JSON.stringify(results, null, 2));
            
            console.log('💾 Full results saved to full-text-results.json');
            console.log('🎉 Full OCR text extraction working!');
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            console.error(error.stack);
        }
    }
}

// Run it!
if (require.main === module) {
    const filePath = process.argv[2] || 'films.csv';
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nUsage: node magic-lantern.js [path-to-csv]');
        process.exit(1);
    }
    
    const lantern = new MagicLantern();
    lantern.run(filePath);
}

module.exports = MagicLantern;