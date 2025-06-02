#!/usr/bin/env node

// magic-lantern.js - The main CLI entry point
const fs = require('fs');
const path = require('path');
const https = require('https');

class MagicLantern {
    constructor() {
        this.baseUrl = 'https://lantern.mediahist.org';
        this.rateLimitDelay = 200; // Respect API limits
    }

    // Read CSV file (simplest format to start)
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

    // Make a single test search
    async searchLantern(query) {
        const params = new URLSearchParams({
            q: query,
            per_page: '20'
        });
        
        const url = `${this.baseUrl}/catalog.json?${params}`;
        console.log(`🔍 Searching for: "${query}"`);
        
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const count = json.meta?.pages?.total_count || 0;
                        console.log(`   ✓ Found ${count} total results!\n`);
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    // Process one film as a test
    async processFilm(film) {
        const title = film.title || film.Title;
        const year = film.year || film.Year;
        
        console.log(`🎭 Researching: ${title} (${year})`);
        
        // Just one simple search for now
        const query = `"${title}" ${year}`;
        const results = await this.searchLantern(query);
        
        // Show a sample result
        if (results.data && results.data.length > 0) {
            const first = results.data[0];
            const excerpt = first.attributes?.body?.attributes?.value || '';
            console.log(`   📰 Sample find: "${excerpt.substring(0, 100)}..."`);
        }
        
        return results;
    }

    async run(filePath) {
        console.log('✨ MAGIC LANTERN - Film Research Discovery Tool ✨\n');
        
        try {
            // Load films
            const films = await this.loadFilms(filePath);
            
            // Test with just the first film
            console.log('🧪 Testing with first film...\n');
            const results = await this.processFilm(films[0]);
            
            // Save results to see what we got
            fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
            console.log('\n💾 Test results saved to test-results.json');
            console.log('🎉 Connection successful! Ready to build more features.');
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

// Run it!
if (require.main === module) {
    const filePath = process.argv[2] || 'films.csv';
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        console.log('\nUsage: node magic-lantern.js [path-to-csv]');
        console.log('Example: node magic-lantern.js examples/film-adaptations/films.csv');
        process.exit(1);
    }
    
    const lantern = new MagicLantern();
    lantern.run(filePath);
}

module.exports = MagicLantern;