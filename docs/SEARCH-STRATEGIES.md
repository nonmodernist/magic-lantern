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

## Strategy Categories

### 1. Title Variations (HIGH-MEDIUM confidence)

These strategies handle the many ways a film title might appear in historical texts.

#### Exact Title
- **Query:** `"The Wizard of Oz"`
- **Confidence:** MEDIUM
- **Purpose:** Find exact title matches
- **When useful:** Film titles that are unique and unlikely to have false positives, films that don't have extensive media coverage (e.g., that rare short from 1910)

#### Title Without Article
- **Query:** `"Wizard of Oz"` (removes The/A/An)
- **Confidence:** HIGH
- **Purpose:** Handles inconsistent article usage in trade papers
- **When useful:** Most films starting with articles
- **Also generates:** Broad version without quotes for wider matching

#### Abbreviated Title
- **Query:** `"Wizard Oz"` (first 2-3 significant words)
- **Confidence:** MEDIUM
- **Purpose:** Catches shortened references common in trade papers
- **When useful:** Long titles often abbreviated in period sources

#### Possessive Form
- **Query:** `"The Wizard of Oz's"`
- **Confidence:** LOW
- **Purpose:** Finds possessive uses ("The film's success...")
- **When useful:** Reviews and commentary

#### Keyword + Film
- **Query:** `"Wizard" film`
- **Confidence:** LOW
- **Purpose:** Broadest search using most distinctive word
- **When useful:** When other searches fail

### 2. Creator Searches (HIGH-MEDIUM confidence)

Focus on authors (for adaptations) and directors.

#### Author + Title
- **Query:** `"L. Frank Baum" "The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Links author to film adaptation
- **When useful:** Literary adaptations where author is credited

#### Author Only
- **Query:** `"L. Frank Baum"`
- **Confidence:** MEDIUM
- **Purpose:** Finds all author mentions in date range
- **When useful:** Tracking author's Hollywood presence

#### Author Last Name + Title
- **Query:** `"Baum" "The Wizard of Oz"`
- **Confidence:** MEDIUM
- **Purpose:** Catches informal references
- **When useful:** Reviews and news items

#### Author Variations
- **Query:** `"Fannie Hurst"` OR `"Fanny Hurst"`
- **Confidence:** MEDIUM
- **Purpose:** Handles spelling variations
- **Known variations:**
  - Fannie/Fanny Hurst
  - Gene Stratton-Porter/Gene Stratton Porter
  - Harriet Comstock/Harriet T. Comstock

#### Director Searches
- **Similar patterns for directors**
- **Additional query:** `"Fleming" director "The Wizard of Oz"`

### 3. Production Searches (MEDIUM confidence)

Studio and business-focused queries using keyword stacking.

#### Studio + Title
- **Query:** `"MGM" "The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Links studio to specific production
- **Uses:** Keyword stacking (2 terms)

#### Studio Abbreviations
- **Query:** `"Metro-Goldwyn-Mayer"` → `"MGM"`
- **Known abbreviations:**
  - Metro-Goldwyn-Mayer → MGM
  - Radio-Keith-Orpheum → RKO
  - 20th Century Fox → Fox
  - United Artists → UA

#### Box Office Searches
- **Query:** `"The Wizard of Oz" "box office"`
- **Confidence:** MEDIUM
- **Purpose:** Financial performance data
- **Stacks:** Title + box office terminology

#### Production News
- **Query:** `"The Wizard of Oz" production filming`
- **Confidence:** MEDIUM
- **Purpose:** Behind-the-scenes coverage
- **Uses:** 3-keyword stacking

#### Exhibitor Searches
- **Query:** `"The Wizard of Oz" exhibitor`
- **Confidence:** MEDIUM
- **Purpose:** Theater owner perspectives

### 4. Star Searches (HIGH-MEDIUM confidence)

Actor-focused queries, especially for star vehicles.

#### Star + Title
- **Query:** `"Judy Garland" "The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Star-film connection

#### Star Only
- **Query:** `"Judy Garland"`
- **Confidence:** MEDIUM
- **Purpose:** All star mentions in date range

#### Known Stars by Film
- Pre-configured star lists for major films:
  - *The Wizard of Oz*: Judy Garland, Ray Bolger, Bert Lahr
  - *Gone with the Wind*: Clark Gable, Vivien Leigh
  - *The Maltese Falcon*: Humphrey Bogart, Mary Astor

Add your own!

### 5. Fuzzy Searches (LOW confidence)

Handle OCR errors and title variations.

#### OCR Variants
- **Common substitutions:**
  - l → 1, i
  - I → l, 1
  - 0 → O
  - S → 5
- **Example:** "W1zard of 0z" for OCR errors

#### Partial Titles
- **For long titles:** First half only
- **Example:** "Gone with the" (for "Gone with the Wind")
- **When useful:** Very long titles often truncated

### 6. Contextual Searches (LOW-MEDIUM confidence)

Theme and adaptation-focused searches.

#### Source Material
- **Query:** `"Wonderful Wizard of Oz" adaptation`
- **Confidence:** MEDIUM
- **Purpose:** Links to source novel
- **When useful:** Title differs from film

#### Novel + Film Title
- **Query:** `"Wonderful Wizard of Oz" "The Wizard of Oz"`
- **Confidence:** HIGH
- **Purpose:** Explicit adaptation discussion

#### Genre Searches
- **Query:** `"The Wizard of Oz" musical`
- **Confidence:** LOW
- **Purpose:** Genre-specific coverage
- **Inferred from:** Title keywords and metadata

#### Remake Searches
- **Query:** `"The Wizard of Oz" remake 1939`
- **Confidence:** LOW
- **Purpose:** For films with multiple versions

### Profile-Specific Strategies

Some strategies only activate with certain profiles:

#### Labor History Profile
- `"The Wizard of Oz" walk out`
- `"MGM" labor dispute`
- `"MGM" work stoppage`
- `"The Wizard of Oz" picketing`

#### Adaptation Studies Profile
- Prioritizes author searches
- Adds novel title searches
- Skips box office searches

## Confidence Levels & Date Ranges

Confidence affects date range filtering:

- **HIGH**: ±1 year from release
- **MEDIUM**: ±2 years from release  
- **LOW**: ±3 years from release

## Keyword Stacking

Lantern's advanced search supports up to 3 keywords:

```
keyword="The Wizard of Oz"
second_keyword="MGM"
third_keyword="production"
```

All keywords use AND operator for precise results.

## Strategy Execution Order

1. Profile weights determine order (highest weight first)
2. Within same weight, confidence determines order (HIGH → MEDIUM → LOW)
3. Execution stops when sufficient results found (configurable)

## Deduplication

- Each unique item ID tracked across all searches
- Highest scoring version kept if found multiple times
- Prevents counting same article multiple times

## Examples in Action

### Film: "Little Women" (1933) by Louisa May Alcott

**Generated searches include:**
1. `"Little Women"` - Exact title
2. `"Louisa May Alcott" "Little Women"` - Author + title
3. `"Alcott" "Little Women"` - Last name + title
4. `"RKO" "Little Women"` - Studio + title
5. `"Little Women" "box office"` - Commercial data
6. `"George Cukor" "Little Women"` - Director + title
7. `"Little Women" adaptation` - Adaptation angle
8. `"Katharine Hepburn" "Little Women"` - Star + title

### Film with Labor History Profile

Additional searches for any film:
1. `"[Film Title]" picketing`
2. `"[Film Title]" work stoppage`
3. `"[Studio]" labor dispute`
4. `"strike against [Studio]"`

## Customizing Strategies

To add new strategies, edit `lib/strategy-registery.js`:

```javascript
// In lib/strategy-registry.js
  this.register('my_Custom_Search', {
    generator: (film) => ({
      keyword: `"${film.title || film.Title}"`,
      secondKeyword: '"on location"',
      confidence: 'high',
      description: 'Film title + "on location"'
    }),
      defaultWeight: 2.5,
      category: 'myCategory',
      profileRequired: 'myProfile'
  });
```

### Finding Configurable Data

Many aspects of search strategies are configurable in `lib/utils.js`:

- **Author name variations**: See `getAuthorVariations()` 
  - Add your own author spelling variants
- **Studio abbreviations**: See `getStudioAbbreviation()`
  - Map full studio names to common abbreviations  
- **Known stars by film**: See `getKnownStars()`
  - Pre-populate star searches for specific films
- **Known remakes**: See `isKnownRemake()`
  - Films that have multiple versions
- **OCR error patterns**: See `generateOCRVariants()`
  - Common character substitutions in historical OCR

This means you can keep your input CSV simple!

## Best Practices

1. **Start broad, get specific** - Exact matches first, then variations
2. **Use confidence appropriately** - HIGH for precise matches, LOW for experimental
3. **Consider the era** - Abbreviations more common in early cinema
4. **Think about OCR** - Historical texts often have scanning errors
5. **Profile appropriately** - Different research questions need different strategies

## Next Steps

- Learn about [Scoring](./SCORING.md) to see how results are ranked
- Explore [Research Profiles](./RESEARCH-PROFILES.md) to customize strategy priorities
- Read [Custom Profiles](./CUSTOM-PROFILES.md) to add your own strategies