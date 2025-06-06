# Research Profiles Guide

Research profiles are the heart of Magic Lantern's flexibility. They let you tailor searches to your specific research questions and the historical period you're studying.

## What Are Research Profiles?

Research profiles are configuration files that adjust:
- 📊 **Publication weights** - Which sources are most valuable for your research
- 🔍 **Search strategy priorities** - Which types of searches to run first (or skip entirely)
- 📅 **Date ranges** - How broadly to search around a film's release year
- 📚 **Collection preferences** - Which MHDL collections to prioritize

## Available Profiles

### Default Profile
The balanced, general-purpose profile.

**Best for:** General film history research, getting started
**Key features:**
- Equal weight to all search strategies
- Standard publication weights (Variety = 1.0)
- Moderate date ranges (±2 years)

```bash
node magic-lantern-v5.js films.csv --profile=default
```

### Adaptation Studies Profile
Emphasizes literary sources and author attribution.

**Best for:** Studying film adaptations of literature
**Key features:**
- Prioritizes author + title searches (weight: 2.5)
- Boosts publications that discussed sources (Photoplay: 1.5)
- Searches for novel titles separately from film titles
- Downweights box office and exhibitor searches

```bash
node magic-lantern-v5.js films.csv --profile=adaptation-studies
```

**Example enhanced searches:**
- `"Louisa May Alcott" "Little Women"`
- `"Little Women" "novel"`
- `"Alcott" "RKO"`

### Labor History Profile

Focuses on strikes, unions, and working conditions.

**Best for:** Film industry labor research
**Key features:**
- Adds labor-specific searches (strike, work stoppage, labor dispute)
- Boosts trade papers with good labor coverage (Variety: 1.5)
- Downweights fan magazines (Photoplay: 0.5)
- Wider date ranges to catch pre/post-production labor actions

```bash
node magic-lantern-v5.js films.csv --profile=labor-history
```

**Example unique searches:**
- `"MGM" strike`
- `"The Wizard of Oz" union`
- `"Metro-Goldwyn-Mayer" labor`

### Early Cinema Profile
Optimized for silent era research (1905-1920).

**Best for:** Early film history
**Key features:**
- Prioritizes early trade papers (Moving Picture World: 1.5)
- Emphasizes abbreviated title searches (common in era)
- Wider date ranges (±3 years) for uncertain release dates
- Focuses on Early Cinema collection

```bash
node magic-lantern-v5.js films.csv --profile=early-cinema
```

### Regional Reception Profile
Studies how films played outside major cities.

**Best for:** Reception studies, regional film history
**Key features:**
- Boosts regional publications (BoxOffice Kansas City: 1.8)
- Downweights coastal publications (Variety: 0.8)
- Prioritizes box office and exhibition data
- Searches for regional reception keywords

```bash
node magic-lantern-v5.js films.csv --profile=regional-reception
```

### Studio Era Adaptations Profile
Prestige pictures of the 1930s-1940s.

**Best for:** Classical Hollywood literary adaptations
**Key features:**
- Peak influence of fan magazines discussing sources
- National trade coverage emphasis
- Studio system search patterns
- Focus on prestige production coverage

```bash
node magic-lantern-v5.js films.csv --profile=studio-era-adaptations
```

### 1950s Adaptations Profile
Widescreen era with fewer publications.

**Best for:** Post-war Hollywood research
**Key features:**
- Adjusted for publications that survived to 1950s
- Emphasis on remakes and readaptations
- Regional exhibitor focus (many trades had folded)

```bash
node magic-lantern-v5.js films.csv --profile=50s-adaptations
```

## How Profiles Work

### Publication Weights

Profiles adjust the value of different publications:

```javascript
// In labor-history.profile.js
publications: {
  weights: {
    "variety": 1.5,              // Boosted - good strike coverage
    "hollywood reporter": 1.3,   // Boosted - industry perspective
    "photoplay": 0.5,           // Reduced - rarely discussed labor
  }
}
```

### Search Strategy Weights

Profiles can prioritize or skip certain search types:

```javascript
// In adaptation-studies.profile.js
searchStrategies: {
  weights: {
    'author_title': 2.5,        // Run first, highest priority
    'novel_film_title': 2.0,    // Also prioritized
    'title_box_office': 0,      // Skip entirely
  }
}
```

### Date Range Configuration

Different profiles use different date windows:

```javascript
// Tight range for well-documented era
dateRanges: {
  high: { before: 1, after: 1 },
  medium: { before: 2, after: 2 },
  low: { before: 3, after: 3 }
}

// Wider range for early cinema
dateRange: { before: 3, after: 2 }
```

## Choosing a Profile

Ask yourself:

1. **What's my research question?**
   - Literary adaptations → `adaptation-studies`
   - Labor conditions → `labor-history`
   - Regional reception → `regional-reception`

2. **What era am I studying?**
   - Silent era → `early-cinema`
   - Classical Hollywood → `studio-era-adaptations`
   - 1950s → `50s-adaptations`

3. **What sources matter most?**
   - Trade papers → Most profiles work well
   - Fan magazines → `adaptation-studies` or `studio-era-adaptations`
   - Regional publications → `regional-reception`

## Combining Profiles with Corpus Settings

Profiles work with corpus settings to control search scope:

```bash
# Quick test of labor profile
node magic-lantern-v5.js films.csv --corpus=test --profile=labor-history

# Full labor history research
node magic-lantern-v5.js films.csv --corpus=full --profile=labor-history

# Medium-scale adaptation study
node magic-lantern-v5.js films.csv --corpus=medium --profile=adaptation-studies
```

## Profile Output Differences

Different profiles will find different results for the same film:

### Example: "The Wizard of Oz" (1939)

**Default profile might find:**
- Reviews in Variety
- Box office reports
- General production news

**Adaptation-studies profile emphasizes:**
- Mentions of "L. Frank Baum"
- References to the source novel
- Discussions of adaptation choices

**Labor-history profile highlights:**
- Exhibitor actions against MGM
- Makeup artist union issues
- Production delays from disputes

## Creating Custom Profiles

See [Creating Custom Profiles](./CUSTOM-PROFILES.md) for a detailed guide.

Basic structure:
```javascript
// my-research.profile.js
module.exports = {
  name: "My Research Focus",
  description: "What this profile does",
  publications: {
    weights: {
      // Adjust publication values
    }
  },
  searchStrategies: {
    weights: {
      // Prioritize search types
    }
  }
}
```

## Tips for Using Profiles

1. **Start with the closest match** - Modify an existing profile rather than starting from scratch
2. **Test with small corpus** - Use `--corpus=test` to see how a profile performs
3. **Compare profiles** - Run the same film(s) through different profiles to see variations
4. **Document your choices** - Note why you weighted certain publications or strategies
5. **Share your profiles** - Help other researchers with similar interests!

## Next Steps

- Learn to [Create Custom Profiles](./CUSTOM-PROFILES.md)
- Understand [Search Strategies](./SEARCH-STRATEGIES.md) that profiles control
- See how [Scoring](./SCORING.md) uses profile weights