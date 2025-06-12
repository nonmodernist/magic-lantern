# Search Strategy Documentation

Magic Lantern generates multiple intelligent search queries for each film, maximizing the chances of finding relevant historical materials. This document explains all search strategies and how they work.

## Overview

For each film, Magic Lantern can generate 15-30+ different search queries across six strategy categories:

1. **Title Variations** - Different ways the film title might appear
2. **Creator Searches** - Author and director focused queries
3. **Production Searches** - Studio and business angle queries
4. **Star Searches** - Actor-based queries
5. **Fuzzy Searches** - Handle OCR errors and variations
6. **Contextual Searches** - Theme, genre, and adaptation queries

## 🆕 Strategy Registry System

Magic Lantern is transitioning to a centralized strategy registry system. This allows for easier customization and profile-specific strategies.

### How the Registry Works

Strategies are registered in `lib/strategy-registry.js`:

```javascript
// Example registration
this.register('title_strike', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"picketed"',
        confidence: 'high',
        description: 'Film title + picketed'
    }),
    defaultWeight: 2.5,
    category: 'labor',
    profileRequired: 'labor'  // Only runs with labor profile
});
```

### Registry Components

Each strategy registration includes:
- **generator**: Function that creates the search keywords
- **defaultWeight**: Base importance (can be overridden by profiles)
- **category**: Grouping for related strategies
- **profileRequired**: Optional - restricts to specific profiles
- **condition**: Optional - function to check if strategy should run

### Current Implementation Status

⚠️ **Mixed Implementation**: Not all strategies have been migrated to the registry yet. Currently:
- New profile-specific strategies use the registry
- Core strategies still use the legacy system
- Both systems work together seamlessly

## Strategy Categories

### 1. Title Variations (HIGH-MEDIUM confidence)

These strategies handle the many ways a film title might appear in historical texts.

#### Exact Title
- **Query:** `"The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Find exact title matches
- **Registry:** ✅ Migrated

#### Title Without Article
- **Query:** `"Wizard of Oz"` (removes The/A/An)
- **Confidence:** HIGH
- **Purpose:** Handles inconsistent article usage
- **Registry:** ✅ Migrated
- **Also generates:** Broad version without quotes

#### Abbreviated Title
- **Query:** `"Wizard Oz"` (first 2-3 significant words)
- **Confidence:** MEDIUM
- **Purpose:** Catches shortened references
- **Legacy:** Still in original system

#### Possessive Form
- **Query:** `"The Wizard of Oz's"`
- **Confidence:** LOW
- **Purpose:** Finds possessive uses
- **Legacy:** Still in original system

#### Keyword + Film
- **Query:** `"Wizard" film`
- **Confidence:** LOW
- **Purpose:** Broadest search
- **Legacy:** Still in original system

### 2. Creator Searches (HIGH-MEDIUM confidence)

Focus on authors (for adaptations) and directors.

#### Author + Title
- **Query:** `"L. Frank Baum" "The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Links author to film adaptation
- **Registry:** ✅ Migrated

#### Author Variations
- **Configurable in:** `lib/utils.js`
- **Known variations:**
  - Fannie/Fanny Hurst
  - Gene Stratton-Porter/Gene Stratton Porter
  - Harriet Comstock/Harriet T. Comstock

### 3. Production Searches (MEDIUM confidence)

Studio and business-focused queries.

#### Title + Box Office
- **Query:** `"The Wizard of Oz" "box office"`
- **Confidence:** MEDIUM
- **Registry:** ✅ Migrated
- **Uses:** Keyword stacking

### 4. Profile-Specific Strategies (Registry-Based)

These strategies only run with specific research profiles.

#### Labor History Strategies
```javascript
// In registry - only with labor profile
'title_strike': '"Film Title" "picketed"'
'title_work_stoppage': '"Film Title" "work stoppage"'
'studio_labor': '"Studio Name" "labor dispute"'
'studio_boycott': '"Studio Name" boycott'
```

#### Review Strategies
```javascript
// Historical terminology for reviews
'title_notices': '"Film Title" "notices"'
'title_comment': '"Film Title" "comment"'
```

#### Interview/Publicity Strategies
```javascript
// Period-specific terminology
'director_says': '"Director Name" "says"'
'star_tells': '"Star Name" "tells"'
'personality_sketch': '"Star Name" "personality"'
```

#### Advertisement Strategies
```javascript
'title_playdate': '"Film Title" "playdate"'
'title_booking': '"Film Title" "booking"'
'title_exploitation': '"Film Title" "exploitation"'
```

#### Early Cinema Strategies
```javascript
'photoplay_version': '"Title" "photoplay"' // pre-1930
'picture_play': '"Title" "picture play"' // pre-1920
```

## Adding New Strategies

### Method 1: Registry (Recommended)

Add to `lib/strategy-registry.js`:

```javascript
this.register('my_new_strategy', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"my search term"',
        confidence: 'high',
        description: 'What this finds'
    }),
    defaultWeight: 1.5,
    category: 'myCategory',
    condition: (film) => film.year > 1930  // Optional condition
});
```

### Method 2: Legacy System

Add to `lib/search-strategy-generator.js`:

```javascript
myNewSearches(film) {
    const strategies = [];
    strategies.push({
        query: `"${film.title}" "search term"`,
        type: 'my_search_type',
        confidence: 'medium',
        description: 'Description'
    });
    return strategies;
}
```

Then add to `generateAllStrategies()`.

## Configurable Data

Many aspects are configurable without code changes:

### In `lib/utils.js`:

#### Author Name Variations
```javascript
const knownVariations = {
    'Fannie Hurst': ['Fanny Hurst'],
    'Your Author': ['Alternate Spelling'],
    // Add more as needed
};
```

#### Studio Abbreviations
```javascript
const abbreviations = {
    'Metro-Goldwyn-Mayer': 'MGM',
    'Your Studio Name': 'YSN',
    // Add more as needed
};
```

#### Known Stars by Film
```javascript
const starsByFilm = {
    'The Wizard of Oz': ['Judy Garland', 'Ray Bolger'],
    'Your Film': ['Star 1', 'Star 2'],
    // Add more as needed
};
```

## Confidence Levels & Date Ranges

Confidence affects date range filtering:

- **HIGH**: ±1 year from release
- **MEDIUM**: ±2 years from release  
- **LOW**: ±3 years from release

These ranges can be customized per profile.

## Keyword Stacking

Lantern's API supports up to 3 keywords with AND operator:

```javascript
// Registry format
generator: (film) => ({
    keyword: `"${film.title}"`,
    secondKeyword: '"box office"',
    thirdKeyword: 'earnings'  // Optional third keyword
})
```

## Strategy Execution

### Order Determination

1. **Profile weights** determine order (highest first)
2. **Registry defaultWeight** used if no profile weight
3. **Confidence** as tiebreaker (HIGH → MEDIUM → LOW)
4. **Weight 0** strategies are skipped entirely

### Stop Conditions

Execution stops when:
- Maximum results reached (configurable)
- High-quality threshold met
- All strategies executed

## Profile Integration

Profiles control which strategies run:

```javascript
// In profile file
searchStrategies: {
    enabled: {
        titleVariations: true,
        creatorSearches: false,    // Skip all author searches
        laborSearches: true        // Custom category
    },
    
    weights: {
        'title_strike': 2.5,       // Run first
        'exact_title': 0.3,        // Run last
        'author_title': 0          // Skip entirely
    }
}
```

## Debugging Strategies

### View Generated Strategies

Temporarily add logging:

```javascript
// In generateAllStrategies()
console.log('📋 All strategies:', strategies.map(s => ({
    type: s.type,
    query: s.query,
    weight: s.profileWeight || s.defaultWeight || 1.0
})));
```

### Test Specific Strategies

```javascript
// Only run registry strategies
const registeredStrategies = strategyRegistry.getByCategory('labor');
```

### Check Strategy Execution

The console shows execution order:

```
📊 Strategy execution order (by profile weight):
   1. [2.5] title_strike - Film title + picketed
   2. [2.0] title_work_stoppage - Film title + work stoppage
   3. [1.0] exact_title - Exact title match
```

## Best Practices

1. **Use the Registry** for new strategies - it's more flexible
2. **Set meaningful weights** - 2.0+ for priority, 0.5 for low priority
3. **Choose appropriate confidence** - affects date filtering
4. **Add to utils.js** for configurable data (stars, variants, etc.)
5. **Test with small corpus** before running full searches
6. **Document your strategies** with clear descriptions

## Examples

### Creating a Genre-Specific Strategy

```javascript
// In strategy-registry.js
this.register('musical_songs', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"songs"',
        thirdKeyword: '"musical numbers"'
    }),
    defaultWeight: 2.0,
    category: 'genre',
    condition: (film) => film.genre === 'musical',
    description: 'Musical film songs and numbers'
});
```

### Creating a Time-Period Strategy

```javascript
this.register('silent_era_variant', {
    generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"photo play"'
    }),
    defaultWeight: 1.5,
    category: 'early',
    condition: (film) => parseInt(film.year) < 1930,
    description: 'Common two-word variant in silent era'
});
```

## Future Development

The goal is to migrate all strategies to the registry system, which will enable:
- Easier profile customization
- Dynamic strategy loading
- Better strategy organization
- Simpler testing and debugging

## Next Steps

- Learn about [Scoring](./SCORING.md) to see how results are ranked
- Explore [Research Profiles](./RESEARCH-PROFILES.md) to customize strategy priorities
- Read [Custom Profiles](./CUSTOM-PROFILES.md) to add your own strategies
- Check [Development Guide](./DEVELOPMENT.md) for contributing