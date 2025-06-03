# Output Format Documentation

Magic Lantern generates two JSON files containing your research results. This guide explains the structure and contents of each file.

## File Naming Convention

Files are timestamped to preserve your research history:
```
comprehensive-search-results_YYYYMMDD_HHMMSS.json
full-text-results_YYYYMMDD_HHMMSS.json
```

Example:
```
comprehensive-search-results_20241215_143022.json
full-text-results_20241215_143022.json
```

## File 1: Comprehensive Search Results

This file contains ALL search results with complete metadata.

### Structure

```json
[
  {
    "film": {
      "title": "The Wizard of Oz",
      "year": "1939",
      "author": "L. Frank Baum",
      "director": "Victor Fleming",
      "studio": "Metro-Goldwyn-Mayer"
    },
    "totalUniqueSources": 145,
    "searchStrategySummary": {
      "exact_title": 45,
      "author_title": 23,
      "studio_title": 12,
      "director_title": 15,
      "title_box_office": 8
    },
    "sources": [
      {
        "id": "variety137-1940-01_0054",
        "type": "solr_document",
        "attributes": {
          "id": { /* ... */ },
          "read": {
            "attributes": {
              "value": "<a href=\"http://archive.org/stream/variety137-1940-01#page/n53/\">Read this page in Context</a>"
            }
          },
          "body": {
            "attributes": {
              "value": "THE WIZARD OF OZ (MUSICAL) Excellent fantasy..."
            }
          }
        },
        "foundBy": "exact_title",
        "searchQuery": "\"The Wizard of Oz\"",
        "strategyConfidence": "medium",
        "keywords": {
          "keyword": "\"The Wizard of Oz\""
        },
        "scoring": {
          "position": 1,
          "positionScore": 100,
          "collectionWeight": 1,
          "publicationWeight": 1,
          "publication": "variety",
          "finalScore": 100
        }
      }
    ]
  }
]
```

### Key Fields Explained

#### Film Object
- Complete metadata from your CSV
- All fields preserved as provided

#### totalUniqueSources
- Count of deduplicated results across all searches
- One article found by multiple strategies counts once

#### searchStrategySummary
- Shows which strategies were most effective
- Key: strategy type, Value: number of results found
- Helps identify which approaches work for your corpus

#### Sources Array
Each source contains:

**id**: Lantern's unique identifier

**attributes**: Raw data from Lantern API
- `read`: Link to Internet Archive page
- `body`: Text excerpt (usually ~200 characters)

**foundBy**: Which search strategy discovered this
- Useful for understanding what searches work

**searchQuery**: The exact query used

**strategyConfidence**: high/medium/low
- Affects date range filtering

**keywords**: How the query was parsed for API
- Shows keyword stacking in action

**scoring**: Complete scoring breakdown
- `position`: Where in search results (1-based)
- `positionScore`: Points for that position
- `publication`: Identified publication name
- `publicationWeight`: Profile-based weight
- `finalScore`: Combined score

### Use Cases

1. **Analyze search effectiveness**
   - Which strategies find the most results?
   - Which find the highest-quality results?

2. **Deduplicated corpus analysis**
   - Total unique sources per film
   - Coverage patterns across your corpus

3. **Debugging searches**
   - See exactly what queries were run
   - Understand why items scored as they did

4. **Further processing**
   - Extract Internet Archive URLs
   - Build bibliography entries
   - Create visualization data

## File 2: Full-Text Results

Contains complete OCR text for the highest-scored results.

### Structure

```json
[
  {
    "film": {
      "title": "The Wizard of Oz",
      "year": "1939",
      "author": "L. Frank Baum",
      "director": "Victor Fleming",
      "studio": "Metro-Goldwyn-Mayer"
    },
    "totalFound": 145,
    "fullTextAnalyzed": 7,
    "treasures": [
      {
        "id": "variety137-1940-01_0054",
        "fullText": "[Complete OCR text of the page - can be 1000s of words]",
        "title": "Variety",
        "volume": ["Variety (Jan 1940)"],
        "date": "1940-01-03",
        "year": 1940,
        "creator": null,
        "collection": ["Hollywood Studio System", "Feature Films"],
        "collectionWeight": 1,
        "iaPage": "variety137-1940-01_0054",
        "readUrl": "http://archive.org/stream/variety137-1940-01#page/n53/",
        "wordCount": 1247,
        "contentTypes": ["review", "box_office"],
        "hasPhoto": false,
        "excerpt": "THE WIZARD OF OZ (MUSICAL) Excellent fantasy...",
        "foundBy": "exact_title",
        "searchQuery": "\"The Wizard of Oz\"",
        "strategyConfidence": "medium",
        "finalScore": 100,
        "publication": "variety"
      }
    ]
  }
]
```

### Key Fields Explained

#### Summary Fields
- `totalFound`: Total results before full-text fetch
- `fullTextAnalyzed`: How many got full text (based on score/limit)

#### Treasures Array
Each treasure contains:

**fullText**: Complete OCR text
- Full page content
- May include other articles/ads on same page
- Check for OCR errors in historical texts

**Metadata Fields**:
- `title`: Publication title
- `volume`: Volume information
- `date`: Publication date (if available)
- `year`: Publication year
- `creator`: Publisher/creator
- `collection`: MHDL collections containing this item
- `collectionWeight`: Highest weight from collections

**Internet Archive Access**:
- `iaPage`: Page identifier
- `readUrl`: Direct link to view on Internet Archive

**Content Analysis**:
- `wordCount`: Length of full text
- `contentTypes`: Detected types (review, production, etc.)
- `hasPhoto`: Whether photo indicators found
- `excerpt`: Beginning of full text

**Search Context**:
- `foundBy`: Strategy that found this
- `searchQuery`: Original query
- `finalScore`: Why this ranked high enough for full text
- `publication`: Identified publication

### Content Type Detection

Magic Lantern identifies these content types:

- **review**: Film reviews and criticism
- **production**: Behind-the-scenes, filming news
- **boxOffice**: Financial performance, earnings
- **advertisement**: Theater ads, showings
- **photo**: Production stills, photo captions
- **interview**: Discussions with cast/crew
- **listing**: Calendars, release schedules

### Use Cases

1. **Close reading**
   - Full text for detailed analysis
   - Context around your search terms

2. **Content analysis**
   - What types of coverage did films receive?
   - How did coverage differ by publication?

3. **Historical research**
   - Contemporary reception
   - Production histories
   - Box office performance

4. **Citation building**
   - All metadata needed for citations
   - Direct links to Internet Archive

## Working with the Output

### Basic Analysis with jq

Count total sources:
```bash
jq '.[].totalUniqueSources' comprehensive-search-results_*.json | paste -sd+ | bc
```

List all publications found:
```bash
jq -r '.[].sources[].scoring.publication' comprehensive-search-results_*.json | sort | uniq -c
```

Extract high-scoring reviews:
```bash
jq '.[] | .treasures[] | select(.contentTypes | contains(["review"])) | {film: .film.title, score: .finalScore, text: .excerpt}' full-text-results_*.json
```

### Python Analysis Example

```python
import json
import pandas as pd

# Load results
with open('comprehensive-search-results_20241215_143022.json') as f:
    results = json.load(f)

# Create DataFrame of all sources
sources = []
for film_result in results:
    film_title = film_result['film']['title']
    for source in film_result['sources']:
        sources.append({
            'film': film_title,
            'publication': source['scoring']['publication'],
            'score': source['scoring']['finalScore'],
            'strategy': source['foundBy']
        })

df = pd.DataFrame(sources)

# Analyze by publication
print(df.groupby('publication')['score'].agg(['count', 'mean']).sort_values('count', ascending=False))

# Most effective strategies
print(df['strategy'].value_counts())
```

### Creating a Bibliography

```python
# Extract citation data
for film_result in full_text:
    for treasure in film_result['treasures']:
        citation = {
            'title': f"{film_result['film']['title']} - {treasure['contentTypes'][0]}",
            'publication': treasure['publication'],
            'date': treasure['date'],
            'url': treasure['readUrl'],
            'accessed': datetime.now().strftime('%Y-%m-%d')
        }
        print(format_citation(citation))
```

## Tips for Using Output

1. **Start with full-text results**
   - These are your highest-quality sources
   - Already have complete text for analysis

2. **Use comprehensive results for patterns**
   - Which strategies work best?
   - What publications cover your films?
   - Coverage gaps in your corpus

3. **Preserve your files**
   - Timestamps prevent overwriting
   - Keep for reproducibility
   - Build corpus over time

4. **Check OCR quality**
   - Historical texts may have errors
   - "rn" might be "m", "1" might be "l"
   - Context usually clarifies

5. **Follow the links**
   - readUrl goes to Internet Archive
   - Often can see full page/issue
   - May find related articles nearby

## Next Steps

- Learn about [Analyzing Results](./ANALYZING-RESULTS.md) for research workflows
- Understand [Scoring](./SCORING.md) to know why items ranked highly
- See [Research Profiles](./PROFILES.md) to generate different result sets
- Explore [Custom Profiles](./CUSTOM-PROFILES.md) to tailor output to your needs