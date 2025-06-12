# Creating Custom Profiles

This guide walks you through creating your own research profiles for Magic Lantern, including how to use the new strategy registry system.

## Quick Start

1. Copy an existing profile as a template
2. Modify the configuration to your needs
3. Save in `config/profiles/`
4. Use with `--profile=your-profile-name`

## Profile Structure

A complete profile includes:

```javascript
module.exports = {
    // Basic Information
    name: "Your Profile Name",
    description: "What this profile is designed for",
    
    // Search Strategy Configuration
    searchStrategies: {
        // Enable/disable strategy categories
        enabled: {
            titleVariations: true,
            creatorSearches: true,
            productionSearches: false,
            yourCustomCategory: true  // Custom categories supported
        },
        
        // Control execution order and inclusion
        weights: {
            'exact_title': 2.0,          // Higher = runs earlier
            'author_title': 1.5,         
            'your_custom_strategy': 2.5, // Registry strategies
            'unwanted_strategy': 0       // 0 = skip entirely
        }
    },
    
    // Publication Scoring Weights
    publications: {
        weights: {
            "variety": 1.5,              // Boost scoring
            "motion picture herald": 1.0,
            "your_important_source": 2.0,
            "less_relevant_source": 0.5  // Reduce scoring
        }
    },
    
    // Search Behavior Modifications
    searchBehavior: {
        maxResultsPerSearch: 200,        // Default: 100
        stopOnHighQuality: false,        // Default: true
        dateRange: {                     // Per-confidence date ranges
            high: 2,                     // Default: 1
            medium: 4,                   // Default: 2
            low: 6                       // Default: 3
        }
    },
    
    // Context-Aware Scoring Adjustments (if using --context-aware)
    contextAwareAdjustments: {
        strategyTrustOverrides: {
            'your_custom_strategy': 0.9, // Override trust level
            'broad_search': 0.3          // Lower trust for broad searches
        }
    }
};
```

## Step-by-Step Guide

### Step 1: Identify Your Research Needs

Ask yourself:
- What types of sources do I need?
- Which publications are most valuable?
- What search terms are specific to my research?
- Do I need exhaustive or focused results?

### Step 2: Create Profile File

Create a new file in `config/profiles/`:

```bash
touch config/profiles/my-research.js
```

### Step 3: Define Basic Structure

Start with the essentials:

```javascript
module.exports = {
    name: "My Research Focus",
    description: "Focused on [your specific area]",
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            creatorSearches: true
        }
    },
    
    publications: {
        weights: {}
    }
};
```

### Step 4: Add Custom Strategies (Optional)

#### Method 1: Registry-Based (Recommended)

Add custom strategies to `lib/strategy-registry.js`:

```javascript
// In strategy-registry.js
this.register('my_special_search', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"my special term"',
        confidence: 'high',
        description: 'Searches for my specific terminology'
    }),
    defaultWeight: 1.5,
    category: 'myCustomCategory',
    profileRequired: 'my-research',  // Only runs with your profile
    condition: (film) => film.year >= 1940  // Optional condition
});
```

Then reference in your profile:

```javascript
searchStrategies: {
    enabled: {
        myCustomCategory: true  // Enable your category
    },
    weights: {
        'my_special_search': 2.5  // High priority
    }
}
```

#### Method 2: Configure Existing Strategies

Just adjust weights for existing strategies:

```javascript
searchStrategies: {
    weights: {
        'exact_title': 0.5,       // Lower priority
        'author_title': 3.0,      // Much higher priority
        'title_box_office': 0     // Skip entirely
    }
}
```

### Step 5: Set Publication Weights

Identify valuable publications for your research:

```javascript
publications: {
    weights: {
        // Boost specialized publications
        "cinematography monthly": 2.5,
        "american cinematographer": 2.0,
        
        // Standard weights for general sources
        "variety": 1.0,
        "motion picture herald": 1.0,
        
        // Reduce weight for less relevant sources
        "fan magazine": 0.3,
        "gossip column": 0.2
    }
}
```

### Step 6: Adjust Search Behavior

Fine-tune how searches execute:

```javascript
searchBehavior: {
    // Get more results per search (default: 100)
    maxResultsPerSearch: 300,
    
    // Don't stop early, be exhaustive (default: true)
    stopOnHighQuality: false,
    
    // Expand date ranges for historical uncertainty
    dateRange: {
        high: 3,    // ±3 years for high confidence
        medium: 5,  // ±5 years for medium
        low: 10     // ±10 years for low confidence
    }
}
```

### Step 7: Test Your Profile

Always test with a small corpus first:

```bash
# Test with single film
node core/magic-lantern-v5.js test-film.csv --corpus=test --profile=my-research

# Check strategy execution
# Look for: "📊 Strategy execution order"

# Verify publication weights in results
# Check the scoring.publicationWeight field
```

## Complete Examples

### Example 1: Technical Innovation Research

```javascript
// config/profiles/technical-innovation.js
module.exports = {
    name: "Technical Innovation",
    description: "Research focused on cinematography and film technology",
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            technicalSearches: true,  // Custom category
            creatorSearches: false    // Not needed
        },
        
        weights: {
            // Prioritize technical searches
            'title_cinematography': 3.0,
            'title_technicolor': 2.5,
            'cinematographer_name': 2.0,
            'title_camera': 2.0,
            
            // Still want basic title matches
            'exact_title': 1.0,
            
            // Skip irrelevant strategies
            'author_title': 0,
            'title_box_office': 0
        }
    },
    
    publications: {
        weights: {
            "american cinematographer": 3.0,
            "international photographer": 2.5,
            "variety": 1.0,  // Still useful
            "motion picture herald": 0.8,
            "photoplay": 0.3  // Less technical
        }
    },
    
    searchBehavior: {
        maxResultsPerSearch: 150,
        stopOnHighQuality: false  // Want comprehensive results
    }
};
```

With custom registry strategies:

```javascript
// In lib/strategy-registry.js
this.register('title_cinematography', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: 'cinematography',
        confidence: 'medium',
        description: 'Film title + cinematography'
    }),
    defaultWeight: 1.5,
    category: 'technicalSearches',
    profileRequired: 'technical-innovation'
});

this.register('cinematographer_name', {
    generator: (film) => {
        const cinematographer = film.cinematographer || film.dp;
        if (!cinematographer) return null;
        
        return {
            keyword: `"${cinematographer}"`,
            secondKeyword: `"${film.title || film.Title}"`,
            confidence: 'high',
            description: 'Cinematographer + film title'
        };
    },
    defaultWeight: 2.0,
    category: 'technicalSearches',
    condition: (film) => !!(film.cinematographer || film.dp)
});
```

### Example 2: Regional Exhibition Research

```javascript
// config/profiles/regional-exhibition.js
module.exports = {
    name: "Regional Exhibition",
    description: "Theater and exhibition patterns in specific regions",
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            exhibitionSearches: true,
            regionalSearches: true
        },
        
        weights: {
            'title_playdate': 3.0,
            'title_theater_chain': 2.5,
            'title_booking': 2.0,
            'title_region': 2.0,
            'exact_title': 0.5  // Lower priority
        }
    },
    
    publications: {
        weights: {
            "motion picture herald": 2.0,  // Exhibition focus
            "boxoffice": 2.5,
            "variety": 1.0,
            "local_newspaper": 1.5  // If in your corpus
        }
    },
    
    searchBehavior: {
        maxResultsPerSearch: 250,  // Need many theater listings
        dateRange: {
            high: 1,    // Playdates are precise
            medium: 2,
            low: 3
        }
    },
    
    // Custom context-aware scoring adjustments
    contextAwareAdjustments: {
        strategyTrustOverrides: {
            'title_playdate': 0.95,    // Very precise
            'title_booking': 0.85,     // Pretty good
            'title_region': 0.60       // Broader, less precise
        }
    }
};
```

### Example 3: Star System Research

```javascript
// config/profiles/star-system.js
module.exports = {
    name: "Star System",
    description: "Research on star personas and publicity",
    
    searchStrategies: {
        enabled: {
            titleVariations: true,
            starSearches: true,
            publicitySearches: true,
            creatorSearches: false  // Not needed
        },
        
        weights: {
            'star_personality': 3.0,
            'star_tells': 2.5,
            'star_interview': 2.5,
            'star_film': 2.0,
            'exact_title': 0.8,
            'author_title': 0  // Skip
        }
    },
    
    publications: {
        weights: {
            "photoplay": 2.5,          // Star focus
            "motion picture magazine": 2.5,
            "screenland": 2.0,
            "variety": 1.0,            // Still useful
            "motion picture herald": 0.7  // Less star content
        }
    },
    
    searchBehavior: {
        maxResultsPerSearch: 200,
        // Wider date ranges for publicity
        dateRange: {
            high: 2,
            medium: 4,
            low: 6
        }
    }
};
```

## Advanced Configuration

### Dynamic Strategy Generation

Create strategies based on film data:

```javascript
// In strategy-registry.js
this.register('all_stars_search', {
    generator: (film) => {
        // Get stars from film data or known stars list
        const stars = getStarsForFilm(film.title);
        if (!stars || stars.length === 0) return null;
        
        // Search for any star name
        return {
            keyword: stars.map(s => `"${s}"`).join(' OR '),
            confidence: 'low',
            description: `Any star from ${film.title}`
        };
    },
    defaultWeight: 1.0,
    category: 'starSearches'
});
```

### Conditional Strategies

Run strategies only under certain conditions:

```javascript
this.register('remake_comparison', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"remake"',
        thirdKeyword: `"${film.originalYear || ''}"`,
        confidence: 'medium',
        description: 'Remake comparisons'
    }),
    defaultWeight: 2.0,
    category: 'adaptationSearches',
    condition: (film) => film.isRemake === true
});
```

### Profile Inheritance

Base one profile on another:

```javascript
// config/profiles/labor-extended.js
const baseLabor = require('./labor-history');

module.exports = {
    ...baseLabor,  // Inherit all settings
    
    name: "Extended Labor History",
    description: "Labor history with additional union focus",
    
    searchStrategies: {
        ...baseLabor.searchStrategies,
        weights: {
            ...baseLabor.searchStrategies.weights,
            'union_specific_search': 3.0,  // Add new
            'exact_title': 0.2  // Override base
        }
    }
};
```

## Testing and Debugging

### 1. Verify Profile Loading

```bash
node core/magic-lantern-v5.js films.csv --profile=my-research
```

Look for:
```
📚 Research Profile: My Research Focus
   Focused on [your specific area]
```

### 2. Check Strategy Execution

Add temporary logging:

```javascript
// In your profile
searchStrategies: {
    weights: {
        'my_strategy': 2.5
    },
    // Add debug flag
    debug: true
}
```

### 3. Validate Publication Weights

Check results JSON:
```json
"scoring": {
    "publication": "american cinematographer",
    "publicationWeight": 3.0,  // Your custom weight
    "finalScore": 300
}
```

### 4. Test with Small Corpus

```bash
# Create test file with 1-2 films
echo "title,year,author" > test.csv
echo '"Test Film",1940,"Test Author"' >> test.csv

# Run with your profile
node core/magic-lantern-v5.js test.csv --profile=my-research --corpus=test
```

## Best Practices

1. **Start Simple**: Begin with weight adjustments before adding custom strategies
2. **Document Purpose**: Clear description helps others (and future you)
3. **Test Incrementally**: Add features one at a time
4. **Use Registry**: New strategies should use the registry system
5. **Version Control**: Track profile changes in git
6. **Share Profiles**: Consider contributing useful profiles back

## Common Patterns

### Pattern 1: Boost Specific Publications

```javascript
publications: {
    weights: {
        "target_publication": 3.0,
        "*": 1.0  // All others (not yet implemented)
    }
}
```

### Pattern 2: Time Period Specific

```javascript
searchBehavior: {
    dateRange: {
        high: 5,    // Historical uncertainty
        medium: 8,
        low: 12
    }
},
// In strategy registry
condition: (film) => parseInt(film.year) < 1920
```

### Pattern 3: Exhaustive Research

```javascript
searchBehavior: {
    maxResultsPerSearch: 500,
    stopOnHighQuality: false,
    includeAllStrategies: true  // Even low-weight ones
}
```

## Troubleshooting

**Profile not loading?**
- Check file name matches `--profile=` argument
- Verify `module.exports` syntax
- Look for JavaScript errors

**Strategies not running?**
- Check weight is > 0
- Verify category is enabled
- Check `profileRequired` matches

**Wrong publication weights?**
- Publication name must match exactly
- Check for typos or variants
- Look at scoring object in results

## Future Features

Planned enhancements:
- Profile composition (combine multiple)
- GUI profile builder
- Profile validation tool
- Performance analytics per profile

## Next Steps

- Test your profile with [small corpus](./QUICKSTART.md)
- Understand [strategy registry](./SEARCH-STRATEGIES.md) for custom searches
- Learn about [scoring](./SCORING.md) and weight effects
- See [example profiles](../core/config/profiles/) for inspiration