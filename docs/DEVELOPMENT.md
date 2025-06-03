# Development Guide

This guide helps you extend and customize Magic Lantern for your research needs.

## Project Structure

```
magic-lantern/
├── magic-lantern-v5.js      # Main application
├── config/
│   ├── index.js             # Configuration loader
│   ├── scoring.config.js    # Base scoring settings
│   ├── search.config.js     # API and search settings
│   └── profiles/            # Research profiles
│       ├── index.js         # Profile loader
│       ├── base-patterns.js # Shared regex patterns
│       └── *.profile.js     # Individual profiles
├── fulltext-analyzer.js     # Experimental text analysis
├── legacy/                  # Original project-specific tools
├── docs/                    # Documentation
└── results/                 # Output directory (created on run)
```

## Adding New Search Strategies

### 1. Create the Strategy Method

Add to `SearchStrategyGenerator` class in `magic-lantern-v5.js`:

```javascript
// Example: Search for films screening at specific theaters
theaterSearches(film) {
    const strategies = [];
    const title = film.title || film.Title;
    
    // Major theater chains
    const theaters = ['Loews', 'RKO', 'Paramount'];
    
    theaters.forEach(theater => {
        strategies.push({
            query: `"${title}" "${theater} Theatre"`,
            type: 'title_theater',
            confidence: 'low',
            description: `Film at ${theater} theaters`
        });
    });
    
    return strategies;
}
```

### 2. Include in Strategy Generation

Add to `generateAllStrategies()` method:

```javascript
generateAllStrategies(film) {
    const strategies = [];
    
    // Existing strategies...
    strategies.push(...this.titleVariations(film));
    strategies.push(...this.creatorSearches(film));
    
    // Add your new strategy
    strategies.push(...this.theaterSearches(film));
    
    return this.deduplicateStrategies(strategies);
}
```

### 3. Add Keyword Parsing (if needed)

If your strategy uses special keyword stacking, add to `parseStrategyKeywords()`:

```javascript
case 'title_theater':
    keywords.keyword = quotedPhrases[0];      // Film title
    keywords.second_keyword = quotedPhrases[1]; // Theater name
    break;
```

## Creating New Research Profiles

### 1. Create Profile File

Create `config/profiles/my-research.profile.js`:

```javascript
const basePatterns = require('./base-patterns');

module.exports = {
    name: "My Research Focus",
    description: "Description of what this profile emphasizes",
    
    publications: {
        weights: {
            // Boost valuable publications
            "variety": 1.5,
            "my_key_publication": 2.0,
            
            // Downweight less relevant ones
            "fan_magazine": 0.5
        },
        
        // Include base patterns
        patterns: basePatterns
    },
    
    collections: {
        weights: {
            "Hollywood Studio System": 1.2,
            "My Preferred Collection": 1.5
        }
    },
    
    searchStrategies: {
        // Enable/disable strategy categories
        enabled: {
            titleVariations: true,
            creatorSearches: false,  // Skip if not relevant
            theaterSearches: true    // Your custom strategy
        },
        
        // Prioritize specific strategies
        weights: {
            'title_theater': 2.0,    // Run first
            'exact_title': 0.5,      // Lower priority
            'author_title': 0        // Skip entirely
        }
    },
    
    // Date range configuration
    dateRanges: {
        high: { before: 1, after: 1 },
        medium: { before: 3, after: 2 },
        low: { before: 5, after: 3 }
    },
    
    notes: "Use for researching theater exhibition patterns"
};
```

### 2. Test Your Profile

```bash
# Test with single film
node magic-lantern-v5.js films.csv --corpus=test --profile=my-research

# Check which strategies run
# Verify weights are applied correctly
```

## Adding Publication Patterns

### 1. Add to Base Patterns

Edit `config/profiles/base-patterns.js`:

```javascript
module.exports = {
    // Existing patterns...
    'variety': /variety/,
    
    // Add new publication
    'my_publication': /mypub|my_publication|myjournal/,
    'regional_paper': /regionalp|region_paper/
};
```

### 2. Add Weights in Profiles

Include in relevant profiles:

```javascript
publications: {
    weights: {
        "my_publication": 1.8,    // High value
        "regional_paper": 1.2
    }
}
```

## Customizing Scoring

### Modify Position Scoring

Edit `getPositionScore()` in `magic-lantern-v5.js`:

```javascript
getPositionScore(position) {
    // Custom algorithm example: Top 3 equal weight
    if (position <= 3) return 100;
    if (position <= 10) return 80;
    if (position <= 25) return 60;
    return Math.max(20, 40 - position);
}
```

### Add New Scoring Factors

Extend `scoreAndRankResults()`:

```javascript
scoreAndRankResults() {
    this.allResults = this.allResults.map((result, index) => {
        // Existing scoring...
        const positionScore = this.getPositionScore(index + 1);
        const publicationWeight = // ...
        
        // Add new factor
        const yearProximityBonus = this.calculateYearBonus(result, this.currentFilm);
        
        const finalScore = positionScore * publicationWeight * yearProximityBonus;
        
        return {
            ...result,
            scoring: {
                // Include new factor in breakdown
                yearProximityBonus,
                finalScore
            }
        };
    });
}
```

## Performance Optimization

### 1. Adjust Stop Conditions

Edit `config/search.config.js`:

```javascript
stopConditions: {
    maxResultsPerFilm: 30,        // Fewer results per film
    highQualityThreshold: 15,     // Stop earlier if good results
    minResultsBeforeMedium: 10    // Switch strategy confidence
}
```

### 2. Limit Strategy Execution

In profiles, reduce strategies:

```javascript
// Only run high-value strategies
weights: {
    'exact_title': 1.0,
    'author_title': 1.0,
    'everything_else': 0  // Skip
}
```

### 3. Batch Processing

For large corpora, modify the main loop:

```javascript
// Process in batches of 10
const batchSize = 10;
for (let i = 0; i < films.length; i += batchSize) {
    const batch = films.slice(i, i + batchSize);
    
    // Process batch
    for (const film of batch) {
        await this.comprehensiveSearch(film);
    }
    
    // Save intermediate results
    this.saveResults(allResults, outputDir, `batch_${i}_${timestamp}`);
    
    // Optional: Longer pause between batches
    await new Promise(resolve => setTimeout(resolve, 5000));
}
```

## Debugging Tools

### 1. Enable Verbose Logging

Add debug statements:

```javascript
// In searchWithStrategy()
console.log('🔍 Debug - Full URL:', url);
console.log('🔍 Debug - Response:', JSON.stringify(results.meta, null, 2));

// In scoreAndRankResults()
console.log('📊 Debug - Score breakdown:', {
    id: result.id,
    position: result.scoring.position,
    weights: {
        position: result.scoring.positionScore,
        publication: result.scoring.publicationWeight
    }
});
```

### 2. Test Specific Strategies

```javascript
// Temporarily filter strategies
const strategies = this.strategyGenerator
    .generateAllStrategies(film)
    .filter(s => s.type === 'title_theater'); // Test only your new strategy
```

### 3. API Response Inspector

```javascript
// Save raw API responses for debugging
const debugDir = path.join(__dirname, 'debug');
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir);
}

// In makeRequest()
const response = await this.makeRequest(url);
fs.writeFileSync(
    path.join(debugDir, `api_${Date.now()}.json`),
    JSON.stringify(response, null, 2)
);
```

## Testing

### Unit Test Example

Create `test/search-strategies.test.js`:

```javascript
const SearchStrategyGenerator = require('../magic-lantern-v5').SearchStrategyGenerator;

describe('SearchStrategyGenerator', () => {
    const generator = new SearchStrategyGenerator();
    
    test('generates title variations', () => {
        const film = {
            title: 'The Wizard of Oz',
            year: '1939'
        };
        
        const strategies = generator.titleVariations(film);
        
        expect(strategies).toContainEqual(
            expect.objectContaining({
                query: '"The Wizard of Oz"',
                type: 'exact_title'
            })
        );
        
        expect(strategies).toContainEqual(
            expect.objectContaining({
                query: '"Wizard of Oz"',
                type: 'title_no_article'
            })
        );
    });
});
```

### Integration Test

```javascript
// Test profile loading
const config = require('./config');
const testConfig = config.load('test', 'my-research');

console.assert(testConfig.profileInfo.research === 'my-research');
console.assert(testConfig.scoring.publications.weights['my_publication'] === 2.0);
```

## Contributing

### Code Style

- Use descriptive variable names
- Comment complex logic
- Keep methods focused (single responsibility)
- Handle errors gracefully

### Documentation

When adding features:
1. Update relevant `/docs` files
2. Add JSDoc comments to methods
3. Include usage examples
4. Document configuration options

### Sharing Profiles

Great profiles help other researchers! To share:

1. Document the research focus clearly
2. Explain weight choices
3. Include example use cases
4. Add to `config/profiles/`
5. Submit pull request

## Common Patterns

### Adding Time Period Logic

```javascript
// In strategy generator
if (parseInt(film.year) < 1920) {
    // Silent era strategies
    strategies.push({
        query: `"${film.title}" "photo play"`,
        type: 'silent_era_variant',
        confidence: 'high',
        description: 'Common two-word variant'
    });
}
```

### Conditional Publication Weights

```javascript
// In profile
publications: {
    weights: film => {
        // Dynamic weights based on film
        if (film.year < 1920) {
            return {
                "moving picture world": 2.0,
                "variety": 0.8  // Less film coverage early
            };
        }
        return {
            "variety": 1.5,
            "moving picture world": 1.0
        };
    }
}
```

### Custom Output Processing

```javascript
// Add to saveResults()
// Generate CSV summary
const csvData = results.map(r => ({
    film: r.film.title,
    year: r.film.year,
    sources: r.totalUniqueSources,
    topPublication: r.fullTextAnalysis[0]?.publication || 'none'
}));

const csv = this.convertToCSV(csvData);
fs.writeFileSync(
    path.join(outputDir, `summary_${timestamp}.csv`),
    csv
);
```

## Next Steps

- Review [Technical Documentation](./TECHNICAL.md) for architecture details
- See [Custom Profiles](./CUSTOM-PROFILES.md) for profile examples
- Check [Troubleshooting](./TROUBLESHOOTING.md) when things go wrong
- Explore the `legacy/` folder for additional inspiration