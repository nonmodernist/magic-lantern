#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class FilmFilter {
    constructor() {
        this.films = [];
        this.headers = [];
    }

    loadCSV(filePath) {
        console.log(`📚 Loading films from: ${filePath}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        // Parse headers
        this.headers = lines[0].split(',').map(h => h.trim());
        
        // Parse films
        this.films = lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const film = {};
            this.headers.forEach((header, i) => {
                film[header] = values[i] || '';
            });
            return film;
        });
        
        console.log(`✨ Loaded ${this.films.length} films`);
        return this;
    }

    // Handle quoted CSV values properly
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        return values.map(v => v.replace(/^"|"$/g, '')); // Remove surrounding quotes
    }

    // Filter by author
    filterByAuthor(authorName) {
        const filtered = this.films.filter(film => 
            film.author && film.author.toLowerCase().includes(authorName.toLowerCase())
        );
        
        console.log(`🎭 Found ${filtered.length} films by "${authorName}"`);
        return new FilmCollection(filtered, this.headers);
    }

    // Filter by decade  
    filterByDecade(decade) {
        const startYear = decade;
        const endYear = decade + 9;
        
        const filtered = this.films.filter(film => {
            const year = parseInt(film.year);
            return year >= startYear && year <= endYear;
        });
        
        console.log(`📅 Found ${filtered.length} films from the ${decade}s`);
        return new FilmCollection(filtered, this.headers);
    }

    // Filter by year range
    filterByYearRange(startYear, endYear) {
        const filtered = this.films.filter(film => {
            const year = parseInt(film.year);
            return year >= startYear && year <= endYear;
        });
        
        console.log(`📅 Found ${filtered.length} films from ${startYear}-${endYear}`);
        return new FilmCollection(filtered, this.headers);
    }

    // Filter by studio
    filterByStudio(studioName) {
        const filtered = this.films.filter(film => 
            film.studio && film.studio.toLowerCase().includes(studioName.toLowerCase())
        );
        
        console.log(`🎬 Found ${filtered.length} films from "${studioName}"`);
        return new FilmCollection(filtered, this.headers);
    }

    // Filter by director
    filterByDirector(directorName) {
        const filtered = this.films.filter(film => 
            film.director && film.director.toLowerCase().includes(directorName.toLowerCase())
        );
        
        console.log(`🎬 Found ${filtered.length} films by director "${directorName}"`);
        return new FilmCollection(filtered, this.headers);
    }

    // Multiple filters
    filterBy(filters) {
        let filtered = [...this.films];
        
        if (filters.author) {
            filtered = filtered.filter(film => 
                film.author && film.author.toLowerCase().includes(filters.author.toLowerCase())
            );
        }
        
        if (filters.decade) {
            const startYear = filters.decade;
            const endYear = filters.decade + 9;
            filtered = filtered.filter(film => {
                const year = parseInt(film.year);
                return year >= startYear && year <= endYear;
            });
        }
        
        if (filters.studio) {
            filtered = filtered.filter(film => 
                film.studio && film.studio.toLowerCase().includes(filters.studio.toLowerCase())
            );
        }
        
        console.log(`🔍 Found ${filtered.length} films matching filters`);
        return new FilmCollection(filtered, this.headers);
    }

    // Get all unique authors
    getAuthors() {
        const authors = [...new Set(this.films.map(f => f.author).filter(a => a && a !== '-'))];
        return authors.sort();
    }

    // Get all unique studios
    getStudios() {
        const studios = [...new Set(this.films.map(f => f.studio).filter(s => s && s !== '-'))];
        return studios.sort();
    }

    // Get all unique directors
    getDirectors() {
        const directors = [...new Set(this.films.map(f => f.director).filter(d => d && d !== '-'))];
        return directors.sort();
    }
}

class FilmCollection {
    constructor(films, headers) {
        this.films = films;
        this.headers = headers;
    }

    saveToCSV(filename) {
        const csvContent = [
            this.headers.join(','),
            ...this.films.map(film => 
                this.headers.map(header => {
                    const value = film[header] || '';
                    // Quote values that contain commas
                    return value.includes(',') ? `"${value}"` : value;
                }).join(',')
            )
        ].join('\n');
        
        fs.writeFileSync(filename, csvContent);
        console.log(`💾 Saved ${this.films.length} films to: ${filename}`);
        return this;
    }

    // Show summary
    summary() {
        console.log(`\n📊 Collection Summary:`);
        console.log(`   Total films: ${this.films.length}`);
        
        if (this.films.length > 0) {
            const years = this.films.map(f => parseInt(f.year)).filter(y => !isNaN(y));
            if (years.length > 0) {
                console.log(`   Year range: ${Math.min(...years)} - ${Math.max(...years)}`);
            }
            
            const authors = [...new Set(this.films.map(f => f.author).filter(a => a && a !== '-'))];
            if (authors.length > 0) {
                console.log(`   Authors: ${authors.slice(0, 5).join(', ')}${authors.length > 5 ? '...' : ''}`);
            }
        }
        
        return this;
    }

    // Preview first few films
    preview(count = 5) {
        console.log(`\n👀 First ${Math.min(count, this.films.length)} films:`);
        this.films.slice(0, count).forEach((film, i) => {
            console.log(`   ${i + 1}. "${film.title}" (${film.year}) - ${film.author || 'Unknown author'}`);
        });
        return this;
    }
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
🎬 Film CSV Filter Tool

Usage: node filter-films.js <input.csv> [options]

Options:
  --author="Name"       Filter by author name
  --decade=1930         Filter by decade (1930, 1940, etc.)
  --studio="Studio"     Filter by studio name  
  --director="Name"     Filter by director name
  --year-range=1930-1945  Filter by year range
  --output="file.csv"   Output filename (default: filtered-films.csv)
  --list-authors        Show all unique authors
  --list-studios        Show all unique studios
  --preview             Show preview without saving

Examples:
  node filter-films.js core/data/more-films.csv --author="Fannie Hurst"
  node filter-films.js core/data/more-films.csv --decade=1930 --output="1930s-films.csv"
  node filter-films.js core/data/more-films.csv --studio="MGM" --year-range=1935-1945
        `);
        process.exit(0);
    }
    
    const inputFile = args[0];
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ File not found: ${inputFile}`);
        process.exit(1);
    }
    
    const filter = new FilmFilter().loadCSV(inputFile);
    
    // Handle list commands
    if (args.includes('--list-authors')) {
        console.log('\n📚 All Authors:');
        filter.getAuthors().forEach(author => console.log(`  - ${author}`));
        process.exit(0);
    }
    
    if (args.includes('--list-studios')) {
        console.log('\n🎬 All Studios:');
        filter.getStudios().forEach(studio => console.log(`  - ${studio}`));
        process.exit(0);
    }
    
    // Parse filters
    const filters = {};
    
    const authorArg = args.find(arg => arg.startsWith('--author='));
    if (authorArg) filters.author = authorArg.split('=')[1].replace(/"/g, '');
    
    const decadeArg = args.find(arg => arg.startsWith('--decade='));
    if (decadeArg) filters.decade = parseInt(decadeArg.split('=')[1]);
    
    const studioArg = args.find(arg => arg.startsWith('--studio='));
    if (studioArg) filters.studio = studioArg.split('=')[1].replace(/"/g, '');
    
    const directorArg = args.find(arg => arg.startsWith('--director='));
    if (directorArg) filters.director = directorArg.split('=')[1].replace(/"/g, '');
    
    const yearRangeArg = args.find(arg => arg.startsWith('--year-range='));
    if (yearRangeArg) {
        const [start, end] = yearRangeArg.split('=')[1].split('-').map(y => parseInt(y));
        filters.yearRange = { start, end };
    }
    
    // Apply filters
    let result;
    
    if (filters.author) {
        result = filter.filterByAuthor(filters.author);
    } else if (filters.decade) {
        result = filter.filterByDecade(filters.decade);
    } else if (filters.studio) {
        result = filter.filterByStudio(filters.studio);
    } else if (filters.director) {
        result = filter.filterByDirector(filters.director);
    } else if (filters.yearRange) {
        result = filter.filterByYearRange(filters.yearRange.start, filters.yearRange.end);
    } else {
        console.log('❌ No filter specified. Use --help for options.');
        process.exit(1);
    }
    
    // Show results
    result.summary().preview();
    
    // Save unless preview-only
    if (!args.includes('--preview')) {
        const outputArg = args.find(arg => arg.startsWith('--output='));
        const outputFile = outputArg ? outputArg.split('=')[1].replace(/"/g, '') : 'filtered-films.csv';
        result.saveToCSV(outputFile);
    }
}

module.exports = { FilmFilter, FilmCollection };