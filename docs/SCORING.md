# Scoring System Documentation

Magic Lantern uses a sophisticated scoring system to rank search results, ensuring the most valuable sources rise to the top. This guide explains how scoring works and how to customize it.

## Overview

Each search result receives a score based on three factors:

1. **Position Score** (10-100 points) - Where it appeared in search results
2. **Publication Weight** (0.5-2.0x multiplier) - The value of the source
3. **Collection Weight** (0.7-1.5x multiplier) - Which MHDL collection it's from

**Final Score = Position Score × Publication Weight × Collection Weight**

## Position Scoring

Results are scored based on their position in Lantern's search results:

| Position | Score | Logic |
|----------|-------|-------|
| 1-5 | 100-80 | Top results, -5 points per position |
| 6-10 | 75-55 | Good results, -5 points per position |
| 11-20 | 50-30 | Decent results, -2 points per position |
| 21+ | 30-10 | Lower results, decreasing to minimum 10 |

```javascript
// Position 1 = 100 points
// Position 5 = 80 points
// Position 10 = 55 points
// Position 20 = 30 points
// Position 50 = 10 points
```

## Publication Weights

Different publications have different research value. Weights are configured in profiles:

### Default Weights

```javascript
  publications: {
    weights: {
      // sample publications, all scored the same for default
      "variety": 1.0,
      "motion picture herald": 1.0,
      "film daily": 1.0,
      "exhibitors herald": 1.0,
      "moving picture world": 1.0,
      "photoplay": 1.0,
      "modern screen": 1.0,
      "silver screen": 1.0,
      "screenland": 1.0,
      "motography": 1.0,
    },
```

### How Weights Work

A result from *Motography* weighted 1.5 scores 50% higher than the same position in Variety (weight: 1.0):

- Variety at position 1: 100 × 1.0 = **100 points**
- Motography at position 1: 100 × 1.5 = **150 points**

### Profile-Specific Weights

Different research profiles adjust these weights:

**Labor History Profile:**
```javascript
"variety": 1.5,                 // Excellent strike coverage
"motion picture herald": 1.3,   // Somewhere in between
"photoplay": 0.5,               // Rarely discussed labor
```

**Regional Reception Profile:**
```javascript
"boxoffice": 1.8,           // Kansas City perspective
"variety": 0.8,             // NYC/LA bias downweighted
"harrisons reports": 1.5    // Small-town focus
```

## Collection Weights

MHDL organizes materials into collections. These also affect scoring (but only for the top set of results):

### Default Collection Weights

```javascript
collections: {
  weights: {
    "Hollywood Studio System": 1.0,
    "Early Cinema": 1.0,
    "Fan Magazines": 0.8,
    "Broadcasting & Recorded Sound": 0.8,
    "Theatre and Vaudeville": 0.8,
    "Year Book": 0.7
  }
}
```

### Collection Weight Application

Collection weights are applied during full-text fetching:
- Multiple collections? The highest weight is used

## Publication Identification

Magic Lantern identifies publications from Lantern item IDs using regex patterns:

```javascript
// Examples:
"variety137-1940-01_0054" → "variety"
"motionpictureher21unse_0123" → "motion picture herald"
"photoplay11chic_0456" → "photoplay"
```

### Pattern Matching

Located in `base-patterns.js`:
```javascript
'variety': /variety/,
'motion picture world': /motionpicture?wor|mopicwor/i, //case-insensitive
'moving picture world': /movingpicture|movpict/i,
'pictures and the picturegoer': /\bpicture(?!n)/i, // Avoid false matches
```

## Scoring in Action

### Example 1: Basic Scoring

**Search:** "The Wizard of Oz"

| Publication | Position | Position Score | Pub Weight | Final Score |
|-------------|----------|----------------|------------|-------------|
| Variety | 1 | 100 | 1.0 | 100.0 |
| Photoplay | 2 | 95 | 1.2 | 114.0 |
| Fan Scrapbook | 3 | 90 | 0.7 | 63.0 |

**Result:** Photoplay ranks #1 despite being position #2

### Example 2: Profile Impact

**Film:** "The Wizard of Oz" with Labor History Profile

| Publication | Position | Base Score | Labor Weight | Final Score |
|-------------|----------|------------|--------------|-------------|
| Variety | 5 | 80 | 1.5 | 120.0 |
| Photoplay | 1 | 100 | 0.5 | 50.0 |
| Hollywood Reporter | 8 | 65 | 1.3 | 84.5 |

**Result:** Variety ranks #1 due to labor history boost

## Customizing Scoring

### Adjusting Publication Weights

In your profile:
```javascript
publications: {
  weights: {
    "rare_publication": 2.0,    // Double value
    "common_publication": 0.5,  // Half value
    "new_publication": 1.3      // 30% boost
  }
}
```

### Adding New Publications

Because the Lantern API returns an item ID that abbreviates the magazine title, Magic Lantern uses pattern matching to attempt to correctly identify result titles. See [API](./API.md) for more. 

1. Add pattern to `base-patterns.js`:
```javascript
'my publication': /mypub|my_publication/,
```

2. Add weight in profile:
```javascript
"my publication": 1.5,
```

### Changing Position Scoring

Edit `getPositionScore()` in `magic-lantern-v5.js`:
```javascript
getPositionScore(position) {
  // Custom scoring algorithm
  if (position === 1) return 150;  // Boost first result
  if (position <= 3) return 100;   // Top 3 equal weight
  // etc.
}
```

## Score Thresholds

### Full Text Fetching

Only results above minimum score get full text:
```javascript
fullText: {
  minScoreForFetch: 50  // Default threshold
}
```

### Quality Assessment

General score ranges:
- **150+**: Exceptional (targeted publication at top position)
- **100-150**: Excellent (good publication, high position)
- **75-100**: Very good (decent publication or position)
- **50-75**: Good (worth examining)
- **Below 50**: Lower priority

## Understanding Your Results

In the output JSON:
```json
{
  "scoring": {
    "position": 3,
    "positionScore": 90,
    "publication": "photoplay",
    "publicationWeight": 1.2,
    "collectionWeight": 1.0,
    "finalScore": 108.0
  }
}
```

This tells you:
- Found at position 3 in search results
- Base score of 90 for that position
- From Photoplay (weight: 1.2)
- Final score: 90 × 1.2 = 108

## Strategic Considerations

### For Comprehensive Coverage
Use balanced weights to avoid missing sources:
```javascript
// Don't over-weight too extremely
"variety": 1.2,      // Not 3.0
"fan_mag": 0.8,      // Not 0.1
```

### For Focused Research
Aggressively weight your key sources:
```javascript
// Labor history example
"variety": 2.0,              // Strong labor coverage
"harrisons reports": 2.0,    // Pro-worker stance
"photoplay": 0.3,           // Rarely useful
```

### For Rare Materials
Boost hard-to-find publications:
```javascript
"motography": 2.0,           // Rare technical journal
"early_trade": 1.8,          // Limited surviving issues
```

## Debugging Scores

To see why results ranked as they did:

1. Check position in results:
```json
"scoring": { "position": 15 }
```

2. Verify publication was identified:
```json
"scoring": { "publication": "variety" }
```

3. Confirm weights applied:
```json
"scoring": { "publicationWeight": 1.5 }
```

Common issues:
- Publication not recognized → Add pattern
- Publication matched wrong → Check the regular expression used for matching 
- Wrong weight applied → Check profile loading
- Unexpected ranking → Review all three factors

## Next Steps

- Explore [Research Profiles](./RESEARCH-PROFILES.md) to see scoring in context
- Learn to [Create Custom Profiles](./CUSTOM-PROFILES.md) with your own weights
- Understand [Search Strategies](./SEARCH-STRATEGIES.md) that generate the results