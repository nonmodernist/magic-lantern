# Scoring System Documentation

Magic Lantern uses a sophisticated scoring system to rank search results, ensuring the most valuable sources rise to the top. This guide explains both the original scoring system and the experimental context-aware alternative.

## Overview

Magic Lantern offers two scoring approaches:

### 1. Original Scoring (Default)
Based on two factors:
- **Position Score** (10-100 points) - Where it appeared in search results
- **Publication Weight** (0.5-2.0x multiplier) - The value of the source

**Final Score = Position Score × Publication Weight**

### 2. Context-Aware Scoring (Experimental)
A diversity-focused algorithm that emphasizes:
- **Source Credibility** (30%) - Publication quality and profile weights
- **Search Precision** (25%) - Trust in the search strategy used
- **Diversity** (35%) - Variety bonus to reduce redundancy
- **Lantern Relevance** (10%) - Original position ranking

Enable with: `--context-aware` flag

## Original Scoring System

### Position Scoring

Results are scored based on their position in Lantern's search results:

| Position | Score | Logic |
|----------|-------|-------|
| 1-5 | 100-80 | Top results, -5 points per position |
| 6-10 | 75-55 | Good results, -5 points per position |
| 11-20 | 50-30 | Decent results, -2 points per position |
| 21+ | 30-10 | Lower results, decreasing to minimum 10 |

### Publication Weights

Different publications have different research value:

```javascript
publications: {
  weights: {
    "variety": 1.0,
    "motion picture herald": 1.0,
    "rare_publication": 1.5,
    "fan_magazine": 0.8
  }
}
```

### How Original Scoring Works

Example calculation:
- Variety at position 1: 100 × 1.0 = **100 points**
- Rare publication at position 5: 80 × 1.5 = **120 points**

Result: Rare publication ranks higher despite lower position

## Context-Aware Scoring (Experimental)

### Why Context-Aware?

The original system can lead to:
- Repetitive results from the same publication
- Overemphasis on position (which can be arbitrary)
- Missing diverse perspectives

Context-aware scoring addresses these issues by considering the broader research context.

### How to Enable

```bash
# Add --context-aware flag
node core/magic-lantern-v5.js films.csv --context-aware

# Works with any corpus/profile
node core/magic-lantern-v5.js films.csv --corpus=medium --profile=labor-history --context-aware
```

### Component Breakdown

#### 1. Source Credibility (30%)
Based on publication quality from your profile:
```javascript
// Uses your profile's publication weights
"variety": 1.5 → 75% credibility
"fan_magazine": 0.5 → 25% credibility
```

#### 2. Search Precision (25%)
How much we trust different search strategies:
```javascript
// High precision strategies
'exact_title': 95% trust
'author_title': 92% trust

// Medium precision
'studio_title': 75% trust
'title_box_office': 70% trust

// Lower precision
'abbreviated_title': 50% trust
'keyword_film': 40% trust
```

#### 3. Diversity Score (35%)
Rewards variety, penalizes repetition:
- First result from a publication: 100%
- Second result: 60%
- Third result: 36%
- Duplicate content detected: 20%

#### 4. Lantern Relevance (10%)
Original position, but with less weight:
- Position 1: 100%
- Position 10: ~75%
- Position 50: ~40%

### Understanding Context-Aware Output

When using `--context-aware`, scoring includes additional fields:

```json
"scoring": {
  "position": 1,
  "publication": "variety",
  "finalScore": 87.5,
  "components": {
    "credibility": 75,      // Publication quality
    "precision": 95,        // Search strategy trust
    "diversity": 100,       // Variety bonus
    "relevance": 80         // Position-based
  },
  "breakdown": {
    "credibility": 22.5,    // 75 × 0.30
    "precision": 23.75,     // 95 × 0.25
    "diversity": 35,        // 100 × 0.35
    "relevance": 8          // 80 × 0.10
  }
}
```

### Console Output Comparison

**Original Scoring:**
```
🏆 Top 5 scored results:
1. [Score: 100.0] variety
   Position: 1 (100) × Publication: 1.0
2. [Score: 95.0] variety
   Position: 2 (95) × Publication: 1.0
3. [Score: 90.0] variety
   Position: 3 (90) × Publication: 1.0
```

**Context-Aware Scoring:**
```
🏆 Top 5 results (Context-Aware Scoring):
1. [87.5] variety via exact_title
   Credibility: 75 | Precision: 95 | Diversity: 100 | Relevance: 100
2. [72.3] motion picture herald via author_title
   Credibility: 65 | Precision: 92 | Diversity: 100 | Relevance: 85
3. [58.1] photoplay via title_production
   Credibility: 60 | Precision: 68 | Diversity: 100 | Relevance: 70

📈 Top 10 Diversity: 5 publications, 7 search strategies
⚠️  3 potential duplicate/redundant results detected
```

## Comparing the Systems

### Original Scoring Strengths
- Simple and predictable
- Fast computation
- Position-focused (good when Lantern's ranking is reliable)
- Stable across runs

### Context-Aware Strengths
- Promotes source diversity
- Reduces redundant results
- Considers search quality
- Better for exploratory research

### When to Use Each

**Use Original Scoring when:**
- You trust Lantern's relevance ranking
- You want consistent, reproducible results
- You're focusing on a specific publication
- Speed is important

**Use Context-Aware when:**
- You want diverse perspectives
- You're doing exploratory research
- You see too many similar results
- You want to discover unexpected sources

## Customizing Context-Aware Scoring

### Adjust Component Weights

In `config/scoring.config.js`:

```javascript
module.exports.contextAwareWeights = {
    sourceCredibility: 0.30,    // Reduce to rely less on publication weights
    searchPrecision: 0.25,      // Increase to trust strategy quality more
    diversity: 0.35,            // Increase for more variety
    lanternRelevance: 0.10      // Increase to trust position more
};
```

### Modify Trust Levels

In `lib/context-aware-scoring.js`:

```javascript
this.strategyTrust = {
    // Adjust trust levels for your research
    'exact_title': 0.95,
    'your_custom_strategy': 0.85,
    'broad_keyword': 0.30
};
```

### Change Diversity Decay

```javascript
// In getDiversityScore()
// Current: 60% decay per occurrence
score *= Math.pow(0.6, pubCount);

// More aggressive: 50% decay
score *= Math.pow(0.5, pubCount);

// Gentler: 80% decay
score *= Math.pow(0.8, pubCount);
```

## Debugging Scores

### For Original Scoring

Check the scoring object:
```json
"scoring": {
    "position": 3,
    "positionScore": 90,
    "publication": "variety",
    "publicationWeight": 1.5,
    "finalScore": 135
}
```

### For Context-Aware

Look at the components breakdown:
```json
"components": {
    "credibility": 75,  // Is publication recognized?
    "precision": 95,    // Is strategy trusted?
    "diversity": 36,    // Third occurrence = penalty
    "relevance": 85     // Position 5 = good
}
```

Low diversity score? Check if:
- Multiple results from same publication
- Same publication + strategy combo
- Potential duplicate content

## Performance Considerations

Context-aware scoring:
- Takes slightly longer (processes all results twice)
- Uses more memory (tracks seen publications/strategies)
- May produce different rankings between runs (due to encounter order)

## Best Practices

### For Original Scoring
1. Set publication weights carefully
2. Consider position reliability
3. Use consistent weights across similar publications

### For Context-Aware
1. Start with default weights
2. Review diversity statistics
3. Adjust weights based on your needs
4. Check for duplicate detection

### General Tips
1. Try both systems on a test corpus
2. Compare top 20 results from each
3. Choose based on your research goals
4. Document which system you used

## Future Development

Context-aware scoring may become the default if testing proves successful. Potential enhancements:
- Time-based diversity (prefer different dates)
- Topic modeling for semantic diversity
- Adjustable duplicate detection sensitivity
- Profile-specific trust levels

## Examples

### Research Scenario: Comprehensive Coverage

```bash
# Use context-aware for maximum diversity
node core/magic-lantern-v5.js films.csv --corpus=medium --context-aware
```

Result: Top results include variety of publications and perspectives

### Research Scenario: Publication Focus

```bash
# Use original scoring with targeted profile
node core/magic-lantern-v5.js films.csv --profile=trade-papers-only
```

Result: Consistent ranking based on position and configured weights

## Next Steps

- Try both scoring systems with `--corpus=test`
- Review [Research Profiles](./RESEARCH-PROFILES.md) to understand weight configurations
- Learn to [Create Custom Profiles](./CUSTOM-PROFILES.md) with scoring preferences
- See [Output Formats](./OUTPUT-FORMATS.md) for scoring field details