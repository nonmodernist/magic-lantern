# Development Notes

## Adding New Search Strategies

1. Add method to `SearchStrategyGenerator`:
```javascript
myNewStrategy(film) {
    return [{
        query: `"${film.title}" "my search term"`,
        type: 'my_strategy_type',
        confidence: 'medium',
        description: 'My new strategy'
    }];
}
```

2. Include in `generateAllStrategies()`:

```javascript
...this.myNewStrategy(film)
```


## Adjusting Scoring
### Add New Publication
In `scoringConfig.publicationWeights`:

```javascript
"new publication name": 1.2  // Higher = more valuable
```

### Publication ID Patterns
In `extractPublication()`:

```javascript
'my publication': /mypattern/,
```

## Debugging Tips
### Enable Verbose Logging

```javascript// Add to any method
console.log('🔍 Debug:', {
    searchQuery: strategy.query,
    resultsFound: results.length,
    topScore: results[0]?.scoring
});
```

### Test Single Strategy

```javascript
// In comprehensiveSearch(), limit strategies:
const strategies = this.strategyGenerator
    .generateAllStrategies(film)
    .filter(s => s.type === 'exact_title');
```

## Performance Optimization

### Reduce API Calls

- Increase result count: `per_page: '50'`
- Stop early if enough high-quality results
- Cache results between runs

### Memory Management

- Process films in batches
- Clear `seenIds` between films
- Limit full text fetches