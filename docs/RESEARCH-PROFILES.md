# Research Profiles

Research profiles let you tailor Magic Lantern's behavior to your specific research needs. Each profile adjusts search strategies, scoring weights, and output characteristics.

## Quick Start

```bash
# List all available profiles
node core/magic-lantern-v5.js --list-profiles

# Use a specific profile
node core/magic-lantern-v5.js films.csv --profile=adaptation-studies

# Combine with corpus size and other options
node core/magic-lantern-v5.js films.csv --profile=labor-history --corpus=medium --context-aware
```

## Available Profiles

### Default Profile
The standard Magic Lantern configuration that works well for most research.

**Best for:** General film history research
**Search strategies:** All standard strategies
**Scoring:** Balanced weights for major publications

```bash
node core/magic-lantern-v5.js films.csv
```

### 📚 Adaptation Studies
Optimized for researching film adaptations of literary works.

**Best for:** Literature-to-film research
**Emphasis:** Author searches, adaptation terminology, source material
**Special strategies:** 
- Author name variations (Fannie/Fanny Hurst)
- "adapted from" queries
- Publisher and book review searches

```bash
node core/magic-lantern-v5.js films.csv --profile=adaptation-studies
```

### ⚒️ Labor History
Focused on finding labor disputes, strikes, and working conditions.

**Best for:** Film industry labor research
**Emphasis:** Strike coverage, union activities, working conditions
**Special strategies:**
- `title_strike` - Film + "strike"/"picketed"
- `title_work_stoppage` - Film + "work stoppage"
- `studio_labor` - Studio + "labor dispute"
- `studio_boycott` - Studio + "boycott"
**Higher weights:** Labor-focused publications

```bash
node core/magic-lantern-v5.js films.csv --profile=labor-history
```

### 🎨 Production History
Deep dive into the making of films.

**Best for:** Behind-the-scenes research, production details
**Emphasis:** Technical details, crew, production challenges
**Special strategies:**
- Cinematography searches
- Production designer queries
- "making of" terminology
**Higher weights:** Technical publications, American Cinematographer

```bash
node core/magic-lantern-v5.js films.csv --profile=production-history
```

### 📰 Reviews and Reception
Focused on critical and audience response.

**Best for:** Reception studies, critical analysis
**Emphasis:** Reviews, criticism, audience reaction
**Special strategies:**
- Historical review terminology ("notices", "comment")
- Critics by name
- Box office performance
**Higher weights:** Review-heavy publications

```bash
node core/magic-lantern-v5.js films.csv --profile=reviews-and-reception
```

### 🎬 Early Cinema
Optimized for pre-1930 film research.

**Best for:** Silent era, early sound films
**Special terminology:** 
- "photoplay" instead of "film"
- "picture play" variants
- Early studio names
**Date ranges:** Expanded to ±5 years
**Special handling:** Pre-1920 terminology

```bash
node core/magic-lantern-v5.js films.csv --profile=early-cinema
```

### 🏭 Studio System
Research focused on the business of Hollywood's Golden Age.

**Best for:** Studio operations, contracts, business deals
**Emphasis:** Studio searches, executive names, financial data
**Special strategies:**
- Studio abbreviations (MGM, RKO)
- Contract terminology
- Distribution searches
**Higher weights:** Trade publications

```bash
node core/magic-lantern-v5.js films.csv --profile=studio-system
```

### 📻 Interviews and Publicity
Find period interviews and publicity materials.

**Best for:** Star studies, publicity campaigns
**Emphasis:** Direct quotes, personality pieces
**Special strategies:**
- `director_says` - Director + "says"
- `star_tells` - Star + "tells"
- `personality_sketch` - Star + "personality"
**Period-aware:** Different terms for different eras

```bash
node core/magic-lantern-v5.js films.csv --profile=interviews-and-publicity
```

### 📺 Advertisement Focused
Locate historical film advertisements and marketing.

**Best for:** Marketing history, exhibition studies
**Emphasis:** Theater ads, promotional materials
**Special strategies:**
- `title_playdate` - Film + "playdate"
- `title_booking` - Film + "booking"
- `title_exploitation` - Film + "exploitation"
- Theater chain searches

```bash
node core/magic-lantern-v5.js films.csv --profile=advertisement-focused
```

## How Profiles Work

### Profile Structure

Each profile configures:

```javascript
{
  // Basic metadata
  name: "Labor History",
  description: "Focused on film industry labor",
  
  // Search strategy configuration
  searchStrategies: {
    enabled: {
      titleVariations: true,
      laborSearches: true,    // Profile-specific category
      creatorSearches: false  // Disabled for this profile
    },
    
    // Strategy-specific weights (execution order)
    weights: {
      'title_strike': 2.5,      // Run first (highest weight)
      'exact_title': 0.3,       // Run last (low weight)
      'author_title': 0         // Skip entirely (zero weight)
    }
  },
  
  // Publication scoring weights
  publications: {
    weights: {
      "variety": 1.5,           // Boost labor coverage
      "motion picture herald": 1.2,
      "daily worker": 2.0       // Heavily boost labor papers
    }
  },
  
  // Search behavior
  searchBehavior: {
    dateRange: 3,               // ±3 years instead of default
    maxResultsPerSearch: 200,   // More results per query
    stopOnHighQuality: false    // Search exhaustively
  }
}
```

### Strategy Execution

Profiles control:
1. **Which strategies run** - Enable/disable categories
2. **What order they run** - Higher weights run first
3. **Whether they run** - Zero weight skips entirely

### Integration with New Features

#### With Context-Aware Scoring
Profiles work seamlessly with the experimental scoring:

```bash
# Labor profile + context-aware = diverse labor sources
node core/magic-lantern-v5.js films.csv --profile=labor-history --context-aware
```

Publication weights in profiles affect the "credibility" component of context-aware scoring.

#### With Strategy Registry
New profile-specific strategies are defined in the registry:

```javascript
// Only runs with labor-history profile
this.register('title_strike', {
    profileRequired: 'labor',
    // ... strategy definition
});
```

## Creating Custom Profiles

See [CUSTOM-PROFILES.md](./CUSTOM-PROFILES.md) for detailed instructions on creating your own profiles.

Quick example:

```javascript
// config/profiles/my-research.js
module.exports = {
  name: "My Research Focus",
  description: "Customized for my specific needs",
  
  searchStrategies: {
    weights: {
      'exact_title': 2.0,        // Prioritize exact matches
      'my_custom_strategy': 1.5  // Custom strategy
    }
  },
  
  publications: {
    weights: {
      "special_publication": 3.0  // Heavily weight this source
    }
  }
};
```

## Profile Selection Guide

### By Research Question

**"How was this film made?"**
→ Use `production-history`

**"What did critics think?"**
→ Use `reviews-and-reception`

**"How was the book adapted?"**
→ Use `adaptation-studies`

**"Were there labor issues?"**
→ Use `labor-history`

**"How was it marketed?"**
→ Use `advertisement-focused`

### By Time Period

**Silent era (pre-1930)**
→ Use `early-cinema`

**Studio system (1930-1960)**
→ Use `studio-system` or `default`

**Any period**
→ Start with `default`

### By Source Type Needed

**Trade papers only**
→ Modify weights in any profile

**Fan magazines**
→ Use `interviews-and-publicity`

**Technical journals**
→ Use `production-history`

## Combining Profiles with Other Features

### Full Workflow Example

```bash
# 1. Run focused search with labor profile
node core/magic-lantern-v5.js films.csv --profile=labor-history --corpus=medium

# 2. Fetch full text for high-scoring labor sources
node tools/fetch-full-text.js results/search-results_[timestamp].json --score-threshold=80

# 3. Annotate labor incidents
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
# Focus on: labor type annotations

# 4. Export findings
node tools/annotation-helper.js results/search-results_[timestamp].json --export labor-findings.csv
```

### Testing Profiles

Compare profile effectiveness:

```bash
# Test 1: Default profile
node core/magic-lantern-v5.js test-films.csv --corpus=test

# Test 2: Specialized profile
node core/magic-lantern-v5.js test-films.csv --corpus=test --profile=labor-history

# Compare results counts and top sources
```

## Profile Limitations

1. **One profile at a time** - Cannot combine profiles
2. **Fixed categories** - Some strategies always run
3. **Publication weights** - Only affect scoring, not search

## Tips for Profile Selection

1. **Start with default** - Get baseline results first
2. **Try relevant profiles** - Test 2-3 that match your research
3. **Compare outputs** - See which finds most useful sources
4. **Consider custom** - Create your own for repeated research
5. **Document choice** - Note which profile you used

## Profile Development

Profiles are actively maintained and expanded. Recent additions:
- Registry-based strategies for profile-specific searches
- Better weight configurations
- More granular control

Future plans:
- Composite profiles (combine multiple)
- Time-period auto-detection
- Profile recommendation engine

## Debugging Profiles

### See Active Profile

The console shows which profile is loaded:

```
✨ MAGIC LANTERN v5.0.3

📚 Research Profile: Labor History
   Focused on film industry labor and working conditions
```

### Check Strategy Weights

Temporarily add logging to see execution order:

```
📊 Strategy execution order (by profile weight):
   1. [2.5] title_strike - Film title + strike/picketed
   2. [2.0] studio_labor - Studio + labor dispute
   3. [1.0] exact_title - Exact title match
```

### Verify Publication Weights

Check the scoring breakdown in results:

```json
"scoring": {
    "publication": "daily worker",
    "publicationWeight": 2.0,  // Labor profile boost
    "finalScore": 180
}
```

## Next Steps

- Review [Custom Profiles](./CUSTOM-PROFILES.md) to create your own
- Understand [Search Strategies](./SEARCH-STRATEGIES.md) that profiles control
- Learn about [Scoring](./SCORING.md) and how profiles affect it