# Magic Lantern Technical Documentation

## Core Concepts

### Search Strategies
Magic Lantern doesn't just search once - it generates multiple intelligent queries:

```javascript
// Example: "Little Women" by Louisa May Alcott generates:
"Little Women"                    // Exact title
"Little Women" "Louisa May Alcott" // Title + Author
"Alcott" "Little Women"           // Author last name + Title
"Little Women" "RKO"              // Title + Studio
"Little Women" "box office"      // Title + Commercial data
// ... and 20+ more variations
```

### Scoring Algorithm

Each result gets scored based on:

1. Position Score (100-10 points based on search ranking)
2. Publication Weight (Variety = 1.0, Motography = 1.5, etc.)
3. Collection Weight (Hollywood Studio System = 1.0, Fan Magazines = 0.8)
4. Strategy Confidence (High/Medium/Low affects date range filtering)

Final Score = Position Score × Publication Weight × Collection Weight

### API Integration

- Base URL: https://lantern.mediahist.org/catalog.json
- Rate limit: 200ms between requests (respecting MHDL's guidelines)
- Advanced search with keyword stacking (up to 3 keywords)
- Date range filtering based on confidence level


## Configuration

### Scoring Weights

Edit `scoringConfig` in magic-lantern-v4.js:

```javascript
scoringConfig: {
    publicationWeights: {
        "variety": 1.0,
        "motography": 1.5,  // Higher weight for rare/valuable source
        // Add custom weights
    },
    collectionWeights: {
        "Hollywood Studio System": 1.0,
        "Fan Magazines": 0.8,
        // Adjust based on research focus
    }
}
```

### Search Strategies

Customize in `SearchStrategyGenerator`:

- `titleVariations()` - Title-based searches
- `creatorSearches()` - Author/Director focused
- `productionSearches()` - Studio/business angle
- `starSearches()` - Actor-based queries
- `contextualSearches()` - Genre/adaptation searches



## Troubleshooting

### Common Issues

#### "No results found"

- Check date ranges in confidence levels
- Verify film metadata (especially year)
- Try broader search strategies

#### "Too many results"

- Increase confidence thresholds
- Adjust date range windows
- Filter by publication quality

#### "Duplicate results"

- Check `seenIds` Set is properly tracking
- Verify deduplication logic