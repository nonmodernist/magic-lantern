# Creating Custom Profiles

This guide walks you through creating research profiles tailored to your specific needs.

## Profile Anatomy

A research profile consists of:

```javascript
module.exports = {
    name: "Profile Name",
    description: "What this profile does",
    
    // 1. Publication scoring adjustments
    publications: {
        weights: { /* ... */ },
        patterns: require('./base-patterns')
    },
    
    // 2. Collection preferences
    collections: {
        weights: { /* ... */ }
    },
    
    // 3. Search strategy configuration
    searchStrategies: {
        enabled: { /* ... */ },
        weights: { /* ... */ }
    },
    
    // 4. Date range settings
    dateRanges: { /* ... */ },
    
    // 5. Optional notes
    notes: "Usage tips"
}
```

## Step-by-Step Guide

### Step 1: Identify Your Research Focus

Ask yourself:
- What kinds of sources are most valuable?
- What search patterns will find them?
- What time period am I studying?
- What's unique about my research question?

### Step 2: Create the Profile File

Create a new file in `config/profiles/`:
```bash
touch config/profiles/my-research.profile.js
```

### Step 3: Set Up Basic Structure

```javascript
const basePatterns = require('./base-patterns');

module.exports = {
    name: "My Research Focus",
    description: "Brief description of the research approach",
    
    publications: {
        weights: {},
        patterns: basePatterns  // Always include this
    }
};
```

### Step 4: Configure Publication Weights

Identify which publications matter most:

```javascript
publications: {
    weights: {
        // Boost valuable sources
        "key_publication": 2.0,      // Double value
        "important_trade": 1.5,      // 50% boost
        "useful_source": 1.2,        // 20% boost
        
        // Standard sources
        "variety": 1.0,              // Baseline
        
        // Downweight less relevant
        "fan_magazine": 0.5,         // Half value
        "irrelevant_source": 0.1     // Nearly ignore
    },
    patterns: basePatterns
}
```

### Step 5: Set Collection Weights

```javascript
collections: {
    weights: {
        "Most Relevant Collection": 1.5,
        "Secondary Collection": 1.0,
        "Less Relevant Collection": 0.7
    }
}
```

### Step 6: Configure Search Strategies

Control which searches run and their priority:

```javascript
searchStrategies: {
    // Enable/disable entire categories
    enabled: {
        titleVariations: true,
        creatorSearches: true,
        productionSearches: false,    // Skip these
        starSearches: false,          // Skip these
        contextualSearches: true
    },
    
    // Fine-tune individual strategies
    weights: {
        // High priority (run first)
        'my_key_strategy': 3.0,
        'important_search': 2.0,
        
        // Standard priority
        'exact_title': 1.0,
        
        // Low priority (run last)
        'broad_search': 0.5,
        
        // Skip entirely
        'irrelevant_strategy': 0
    }
}
```

### Step 7: Set Date Ranges

```javascript
// Option 1: Same range for all confidence levels
dateRange: { before: 2, after: 2 },

// Option 2: Different ranges by confidence
dateRanges: {
    high: { before: 1, after: 1 },    // Tight for confident matches
    medium: { before: 3, after: 2 },  // Wider for medium
    low: { before: 5, after: 3 }      // Broadest for experiments
}
```

## Complete Examples

### Example 1: Regional Theater Exhibition

Research focus: How films played in small-town theaters

```javascript
const basePatterns = require('./base-patterns');

module.exports = {
    name: "Regional Theater Exhibition",
    description: "Small-town and neighborhood theater coverage",
    
    publications: {
        weights: {
            // Regional focus
            "boxoffice": 2.0,              // Kansas City, regional focus
            "motion picture herald": 1.5,   // Good regional sections
            "exhibitors herald": 1.5,       // Exhibitor perspective
            
            // Downweight coastal bias
            "variety": 0.7,                // NYC-centric
            "hollywood reporter": 0.5,      // LA-centric
            
            // Exhibitor reports valuable
            "harrisons reports": 1.8,       // Independent exhibitor focus
            "motion picture daily": 1.0
        },
        patterns: basePatterns
    },
    
    collections: {
        weights: {
            "Hollywood Studio System": 1.0,
            "Early Cinema": 0.8,
            "Fan Magazines": 0.5           // Less relevant
        }
    },
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            creatorSearches: false,         // Not relevant
            productionSearches: true,       // For release patterns
            starSearches: false
        },
        
        weights: {
            // Prioritize exhibition searches
            'title_exhibitor': 2.5,
            'title_box_office': 2.0,
            'studio_title': 1.5,
            
            // Standard title searches
            'exact_title': 1.0,
            
            // Skip literary searches
            'author_title': 0,
            'novel_film_title': 0
        }
    },
    
    dateRanges: {
        high: { before: 1, after: 2 },     // Often delayed release
        medium: { before: 2, after: 3 },
        low: { before: 3, after: 4 }
    },
    
    notes: "Focuses on exhibition patterns outside major cities"
};
```

### Example 2: Genre Studies - Musicals

Research focus: Musical films and their marketing

```javascript
const basePatterns = require('./base-patterns');

module.exports = {
    name: "Musical Genre Studies",
    description: "Musical films, songs, and performance coverage",
    
    publications: {
        weights: {
            // Music/entertainment focus
            "variety": 1.5,                // Strong music coverage
            "motion picture herald": 1.0,
            
            // Fan magazines covered musicals well
            "photoplay": 1.5,
            "modern screen": 1.3,
            "screenland": 1.2,
            
            // Technical interest in sound
            "american cinematographer": 1.3,
            
            // General trade papers
            "film daily": 1.0
        },
        patterns: basePatterns
    },
    
    searchStrategies: {
        weights: {
            // Music-specific searches
            'title_musical': 3.0,          // Custom strategy
            'title_songs': 2.5,            // Custom strategy
            
            // Star searches important for musicals
            'star_title': 2.0,
            'known_star': 1.8,
            
            // Standard searches
            'exact_title': 1.0,
            
            // Less relevant
            'author_title': 0              // Few musical adaptations
        }
    },
    
    // Add custom search terms
    searchFeatures: {
        additionalKeywords: [
            "musical", "songs", "singing", "dancing",
            "soundtrack", "score", "orchestra"
        ]
    }
};
```

### Example 3: Comparative Studies

Research focus: Comparing multiple versions/remakes

```javascript
const basePatterns = require('./base-patterns');

module.exports = {
    name: "Remake and Version Studies",
    description: "Comparing multiple adaptations of same source",
    
    publications: {
        weights: {
            // Long-running publications for comparison
            "variety": 1.2,
            "motion picture world": 1.3,   // Early versions
            "motion picture herald": 1.2,  // Later versions
            
            // Reviews important for comparison
            "harrisons reports": 1.5,
            "film daily": 1.3
        },
        patterns: basePatterns
    },
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            creatorSearches: true,         // Source material important
            contextualSearches: true       // Includes remake searches
        },
        
        weights: {
            // Prioritize comparative searches
            'source_adaptation': 2.0,
            'novel_film_title': 2.0,
            'remake_search': 1.8,          // If detected as remake
            
            // Different years crucial
            'exact_title': 1.5,            // Will search each version's year
            
            // Author searches help link versions
            'author_title': 1.5,
            'author_only': 1.2
        }
    },
    
    // Wider date ranges for finding all versions
    dateRanges: {
        high: { before: 2, after: 2 },
        medium: { before: 5, after: 3 },
        low: { before: 10, after: 5 }      // Very wide for remakes
    },
    
    notes: "Use with films that have multiple versions across decades"
};
```

## Advanced Techniques

### Dynamic Weight Functions

For complex logic, use functions instead of static weights:

```javascript
publications: {
    weights: film => {
        const year = parseInt(film.year);
        
        // Different weights by era
        if (year < 1920) {
            return {
                "moving picture world": 2.0,
                "motion picture news": 1.8,
                "variety": 0.8  // Less film coverage early
            };
        } else if (year >= 1950) {
            return {
                "variety": 1.5,
                "hollywood reporter": 1.3,
                "boxoffice": 1.8  // Stronger in 1950s
            };
        }
        
        // Default weights for 1920-1949
        return {
            "variety": 1.2,
            "motion picture herald": 1.3,
            "photoplay": 1.4
        };
    }
}
```

### Conditional Strategy Enabling

```javascript
searchStrategies: {
    enabled: film => {
        // Enable different strategies based on film
        const hasAuthor = film.author && film.author !== '-';
        const isMusical = film.genre === 'musical';
        
        return {
            titleVariations: true,
            creatorSearches: hasAuthor,
            musicalSearches: isMusical,
            starSearches: true
        };
    }
}
```

### Custom Strategy Injection

Add new strategies for your profile by modifying `lib/search-strategy-generator.js`:

```javascript
// In lib/search-strategy-generator.js
myNewStrategy(film) {
  return [{
    query: `"${film.title}" "road show"`,
    type: 'roadshow_exhibition',
    confidence: 'medium',
    description: 'Roadshow exhibition pattern'
  }];
}
```

For configurable data like known stars or studio abbreviations, see `lib/utils.js`.


## Testing Your Profile

### 1. Start Small

```bash
# Test with single film
node magic-lantern-v5.js test-film.csv --corpus=test --profile=my-research
```

### 2. Verify Weights Applied

Check the console output:
```
📊 Strategy execution order (by profile weight):
   1. [3.0] my_key_strategy - Description
   2. [2.0] important_search - Description
```

### 3. Analyze Results

Look at the JSON output:
- Which strategies found results?
- Are publications weighted correctly?
- Is the date range appropriate?

### 4. Iterate and Refine

Common adjustments:
- Weights too extreme? (2.0 vs 0.1 might be too much)
- Missing key publications?
- Need wider date ranges?
- Some strategies finding nothing?

## Best Practices

### 1. Document Your Choices

```javascript
notes: "Weights based on preliminary research showing Variety had best labor coverage. " +
       "Photoplay downweighted due to avoiding controversy. " +
       "Date ranges wide because strikes often preceded release dates."
```

### 2. Start from Existing Profiles

Don't start from scratch:
```bash
cp config/profiles/adaptation-studies.profile.js config/profiles/my-adaptation-variant.profile.js
# Then modify
```

### 3. Balance Specificity and Coverage

- Too focused = miss relevant materials
- Too broad = noise in results
- Aim for targeted but comprehensive

### 4. Consider Publication Survival

Some publications have better archival coverage:
- Variety: Excellent across decades
- Regional papers: Spotty coverage
- Fan magazines: Varies by title

### 5. Test Across Your Corpus

A profile that works for 1930s films might not work for 1950s:
```bash
# Test different eras
node magic-lantern-v5.js 1930s-films.csv --profile=my-research
node magic-lantern-v5.js 1950s-films.csv --profile=my-research
```

## Sharing Your Profile

Help other researchers by sharing well-tested profiles:

1. Clean up and document thoroughly
2. Add examples of what it finds
3. Include sample use cases
4. Submit as pull request or share in discussions

## Common Pitfalls

### Over-weighting

```javascript
// Too extreme
"my_favorite": 10.0,  // Drowns out everything else
"everything_else": 0.1

// Better
"my_favorite": 1.8,   // Strong preference
"everything_else": 0.7 // Still considered
```

### Forgetting Base Patterns

```javascript
// Wrong - breaks publication identification
publications: {
    weights: { /* ... */ }
    // Missing: patterns: basePatterns
}

// Correct
publications: {
    weights: { /* ... */ },
    patterns: basePatterns  // Always include!
}
```

### Conflicting Settings

```javascript
// Contradiction
enabled: {
    creatorSearches: false  // Disabled
},
weights: {
    'author_title': 2.0     // But weighted high?
}
```

## Next Steps

- Test your profile with [Quick Start](./QUICKSTART.md)
- Understand [Scoring](./SCORING.md) to refine weights
- Review [Search Strategies](./SEARCH-STRATEGIES.md) to customize searches
- Check [Troubleshooting](./TROUBLESHOOTING.md) if issues arise
- Share your profile to help others!