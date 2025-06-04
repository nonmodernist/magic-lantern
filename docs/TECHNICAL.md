# Magic Lantern Technical Documentation

## Architecture Overview

Magic Lantern v5 is built with a modular architecture:

```
magic-lantern/
├── magic-lantern-v5.js      # Main entry point
├── lib/                     # Core functionality
│   ├── search-strategy-generator.js  # Strategy generation logic
│   └── utils.js             # Configurable data and helpers
├── config/
│   ├── index.js             # Configuration loader
│   ├── scoring.config.js    # Base scoring configuration
│   ├── search.config.js     # API and search settings
│   └── profiles/            # Research profiles
│       ├── index.js         # Profile loader
│       ├── base-patterns.js # Shared publication patterns
│       └── *.profile.js     # Individual profiles
├── fulltext-analyzer.js     # OCR text analysis (experimental)
└── results/                 # Output directory
```

## Core Components

### 1. Main Application (`magic-lantern-v5.js`)

The main file contains the `UnifiedMagicLantern` class that orchestrates the search process.

### 2. Search Strategy Generator (`lib/search-strategy-generator.js`)

Generates 15-30+ search queries per film across multiple strategy types:
- Title variations
- Creator searches (author/director)
- Production searches (studio/business)
- Star searches
- Fuzzy searches (OCR variants)
- Contextual searches (genre/adaptation)

### 3. Utilities (`lib/utils.js`)

Contains configurable data and helper functions:
- **Author name variations** - Common spelling variants
- **Studio abbreviations** - MGM, RKO, etc.
- **Known stars by film** - Pre-configured star lists
- **Known remakes** - Films with multiple versions
- **OCR patterns** - Common scanning errors
- **Genre inference** - Title-based genre detection

### 2. Configuration System

#### Profile Loading
```javascript
// config/index.js
const config = require('./config');
const lantern = new UnifiedMagicLantern('medium', 'adaptation-studies');
```

#### Configuration Merge
Profiles are merged with base configuration:
```javascript
Base Config + Research Profile = Active Configuration
```

#### Corpus Profiles
Control search scope:
- `test`: 1 film, 10 strategies, 3 full texts
- `single`: 1 film, 20 strategies, 5 full texts  
- `medium`: 20 films, 15 strategies, 5 full texts
- `full`: All films, 20 strategies, 7 full texts

### 3. Search Strategy System

#### Strategy Structure
```javascript
{
  query: '"The Wizard of Oz" "MGM"',
  type: 'studio_title',
  confidence: 'high',
  description: 'Studio + title search',
  profileWeight: 1.5  // Added by profile
}
```

#### Keyword Parsing
Converts strategy queries into Lantern API parameters:
```javascript
// Input: '"The Wizard of Oz" "box office"'
// Output:
{
  keyword: '"The Wizard of Oz"',
  second_keyword: '"box office"',
  op: 'AND'
}
```

#### Strategy Execution
1. Generate all strategies for film
2. Apply profile weights and filtering
3. Sort by weight and confidence
4. Execute in order with rate limiting
5. Stop when limits reached

### 4. Scoring Algorithm

#### Position-Based Scoring
```javascript
Position 1-5:   100 to 80 points
Position 6-10:  75 to 55 points
Position 11-20: 50 to 30 points
Position 21+:   30 down to 10 minimum
```

#### Weight Application
```javascript
Final Score = Position Score × Publication Weight × Collection Weight
```

#### Publication Identification
Uses regex patterns to extract publication from item IDs:
```javascript
// variety137-1940-01_0054 → "variety"
// motionpictureher21unse_0123 → "motion picture herald"
```

### 5. API Integration

#### Base Configuration
```javascript
baseUrl: 'https://lantern.mediahist.org'
rateLimitMs: 200  // Respect MHDL's rate limits
maxResultsPerPage: 20
```

#### Search Parameters
- `keyword`, `second_keyword`, `third_keyword`: Search terms
- `search_field`: "advanced"
- `op`: "AND" (operator between keywords)
- `sort`: "score desc, dateStart desc, title asc"
- `f_inclusive[collection][]`: Collection filters
- `f_inclusive[format][]`: "Periodicals"
- `range[year][begin/end]`: Date range filters

#### Stop Conditions
```javascript
stopConditions: {
  maxResultsPerFilm: 50,      // Hard limit
  highQualityThreshold: 25,   // Stop if enough good results
  minResultsBeforeMedium: 15  // Switch to medium confidence
}
```

### 6. Full Text Fetching

Each full text fetch is an additional API call to Lantern, so we limit how many full text results we fetch. 

#### Selection Criteria
- Top N results based on score
- Minimum score threshold (default: 50)
- Number fetched based on corpus profile

#### Full Text Enhancement
For each fetched page:
- Extract full OCR text
- Identify content types (review, production, etc.)
- Check for photo indicators
- Calculate collection weight
- Preserve all metadata

### 7. Output System

#### File Naming
```javascript
// Timestamp format: YYYYMMDD_HHMMSS
comprehensive-search-results_20241215_143022.json
full-text-results_20241215_143022.json
```

#### Intermediate Saves

> **⚠️ Warning:**  
> Intermediate saves have not been fully tested and may not work as intended. 

Every 10 films, saves interim results to prevent data loss.

## Data Flow

1. **Load Film Data** → CSV parsed into film objects
2. **Generate Strategies** → 15-30+ queries per film
3. **Execute Searches** → Rate-limited API calls
4. **Collect Results** → Deduplicated across strategies
5. **Score & Rank** → Apply publication/position weights
6. **Fetch Full Text** → Top N results only
7. **Output JSON** → Structured for analysis

## Performance Considerations

### Memory Management
- Results stored in memory during search
- Cleared between films to prevent buildup
- Intermediate saves prevent loss

### API Rate Limiting
- 200ms between all API calls
- Includes both search and full-text fetches
- Approximately 5 requests per second max

### Time Estimates
- Single film: 2-5 minutes
- Medium corpus (20 films): 40-100 minutes
- Full corpus (100+ films): 3-8 hours

## Error Handling

### Network Errors
- Graceful failure on individual searches
- Continues with remaining strategies
- Logs errors but doesn't stop execution

### Data Validation
- Checks for required fields (title, year)
- Handles missing optional fields gracefully
- Validates API responses before parsing

## Extensibility Points

### Adding Search Strategies
1. Add method to `SearchStrategyGenerator`
2. Include in `generateAllStrategies()`
3. Add keyword parsing logic if needed

### Custom Scoring
1. Modify `getPositionScore()` for position weights
2. Update publication weights in profiles
3. Adjust `scoreAndRankResults()` for new factors

### New Output Formats
1. Add method to `UnifiedMagicLantern`
2. Call from `saveResults()`
3. Follow timestamp naming convention

## Debug Mode

Enable verbose logging:
```javascript
// Add to any method
console.log('🔍 Debug:', {
  searchQuery: strategy.query,
  resultsFound: results.length,
  topScore: results[0]?.scoring
});
```

## Testing

### Test Single Strategy
```javascript
// In comprehensiveSearch()
const strategies = this.strategyGenerator
  .generateAllStrategies(film)
  .filter(s => s.type === 'exact_title');
```

### Test API Connection

> **Warning**: Legacy functionality that needs to be moved over to v5.

```bash
# Built-in API test
node magic-lantern-v5.js --test-api
```

### Profile Testing
```bash
# Test profile with single film
node magic-lantern-v5.js films.csv --corpus=test --profile=my-profile
```

## Common Customizations

### Adjust Stop Conditions
```javascript
// config/search.config.js
stopConditions: {
  maxResultsPerFilm: 100,  // More results
  highQualityThreshold: 50  // Higher threshold
}
```

### Change Date Ranges
```javascript
// In profile
dateRanges: {
  high: { before: 2, after: 2 },    // Wider
  medium: { before: 3, after: 3 },
  low: { before: 5, after: 5 }
}
```

### Skip Strategies
```javascript
// In profile
searchStrategies: {
  weights: {
    'title_box_office': 0,  // Skip entirely
    'author_title': 2.5     // Prioritize
  }
}
```

## Next Steps

- See [Development Guide](./DEVELOPMENT.md) for contributing
- Check [Custom Profiles](./CUSTOM-PROFILES.md) for research customization
- Review [Troubleshooting](./TROUBLESHOOTING.md) for common issues