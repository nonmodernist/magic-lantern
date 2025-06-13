# Output Format Documentation

Magic Lantern generates a single JSON file containing your research results. This guide explains the structure and contents of this file.

## File Naming Convention

Files are timestamped to preserve your research history:
```
search-results_YYYYMMDD_HHMMSS.json
```

Example:
```
search-results_20241215_143022.json
```

## File Structure

The single output file contains ALL search results with metadata and placeholders for full text.

### Overall Structure

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
        },
        "fullText": null,
        "fullTextFetched": false,
        "fullTextFetchedAt": null
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

**Core Fields:**

**id**: Lantern's unique identifier

**attributes**: Raw data from Lantern API
- `read`: Link to Internet Archive page
- `body`: Text excerpt (usually ~200 characters)

**Search Context:**

**foundBy**: Which search strategy discovered this
- Useful for understanding what searches work

**searchQuery**: The exact query used

**strategyConfidence**: high/medium/low
- Affects date range filtering

**keywords**: How the query was parsed for API
- Shows keyword stacking in action

**Scoring Information:**

**scoring**: Complete scoring breakdown
- `position`: Where in search results (1-based)
- `positionScore`: Points for that position
- `publication`: Identified publication name
- `publicationWeight`: Profile-based weight
- `finalScore`: Combined score

**Full Text Fields (User-Initiated):**

**fullText**: `null` by default, filled when fetched
- Complete OCR text of the page when retrieved

**fullTextFetched**: `false` by default
- Boolean indicating if full text has been retrieved

**fullTextFetchedAt**: `null` by default
- Timestamp when full text was fetched

**fullTextMetadata**: Added when full text is fetched
- `wordCount`: Length of full text
- `collections`: MHDL collections containing this item
- `title`: Publication title
- `volume`: Volume information
- `date`: Publication date
- `year`: Publication year
- `creator`: Publisher/creator
- `iaPage`: Internet Archive page identifier
- `readUrl`: Direct link to view on Internet Archive
- `contentTypes`: Detected types (review, production, etc.)

**annotations**: Added by annotation helper (optional)
- Structured research findings
- Multiple annotation types per source
- Each annotation timestamped

## Full Text Fetching

Full text is fetched separately using the fetch-full-text tool:

```bash
# Fetch top 100 sources
node tools/fetch-full-text.js search-results_20241215_143022.json --top=100
```

After fetching, sources are updated:

```json
{
  "id": "variety137-1940-01_0054",
  "fullText": "[Complete OCR text - can be thousands of words]",
  "fullTextFetched": true,
  "fullTextFetchedAt": "2024-12-15T16:45:30.000Z",
  "fullTextMetadata": {
    "wordCount": 1247,
    "collections": ["Hollywood Studio System", "Feature Films"],
    "title": "Variety",
    "volume": ["Variety (Jan 1940)"],
    "date": "1940-01-03",
    "year": 1940,
    "contentTypes": ["review", "box_office"]
  }
}
```

## Annotations

When using the annotation helper, sources gain an annotations field:

```json
{
  "id": "variety137-1940-01_0054",
  "annotations": {
    "productionDates": [
      {
        "date": "1939-03-15",
        "dateType": "filming_start",
        "excerpt": "Principal photography on the Oz picture began yesterday",
        "confidence": "explicit",
        "addedAt": "2024-12-16T10:30:00.000Z"
      }
    ],
    "locations": [
      {
        "location": "MGM Studios, Culver City",
        "locationType": "studio",
        "excerpt": "on the Metro lot",
        "addedAt": "2024-12-16T10:32:00.000Z"
      }
    ]
  }
}
```

## Context-Aware Scoring (Experimental)

When using `--context-aware`, the scoring object includes additional fields:

```json
"scoring": {
  "position": 1,
  "positionScore": 100,
  "publication": "variety",
  "publicationWeight": 1.0,
  "finalScore": 87.5,
  "components": {
    "credibility": 75,
    "precision": 95,
    "diversity": 100,
    "relevance": 80
  },
  "breakdown": {
    "credibility": 22.5,
    "precision": 23.75,
    "diversity": 35,
    "relevance": 8
  }
}
```

## Working with the Output

### Basic Analysis with jq

Count total sources:
```bash
jq '.[].totalUniqueSources' search-results_*.json | paste -sd+ | bc
```

List all publications found:
```bash
jq -r '.[].sources[].scoring.publication' search-results_*.json | sort | uniq -c
```

Find sources with full text:
```bash
jq '.[] | .sources[] | select(.fullTextFetched == true) | {film: .film.title, id: .id}' search-results_*.json
```

Extract annotations:
```bash
jq '.[] | .sources[] | select(.annotations != null) | .annotations' search-results_*.json
```

### Python Analysis Example

```python
import json
import pandas as pd

# Load results
with open('search-results_20241215_143022.json') as f:
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
            'strategy': source['foundBy'],
            'has_fulltext': source['fullTextFetched'],
            'has_annotations': 'annotations' in source
        })

df = pd.DataFrame(sources)

# Analyze by publication
print(df.groupby('publication')['score'].agg(['count', 'mean']).sort_values('count', ascending=False))

# Check full text coverage
print(f"Full text fetched: {df['has_fulltext'].sum()} / {len(df)}")
```

## Use Cases

1. **Analyze search effectiveness**
   - Which strategies find the most results?
   - Which find the highest-quality results?

2. **Selective full text retrieval**
   - Fetch only high-scoring sources
   - Focus on specific publications or films

3. **Research database building**
   - Add structured annotations
   - Export to CSV for analysis

4. **Further processing**
   - Extract Internet Archive URLs
   - Build bibliography entries
   - Create visualization data

## Tips for Using Output

1. **Start with search results**
   - Review scores and excerpts
   - Identify promising sources

2. **Fetch full text selectively**
   - Use score thresholds
   - Target specific publications
   - Work incrementally

3. **Annotate as you read**
   - Structure your findings
   - Maintain single source of truth
   - Export regularly

4. **Preserve your files**
   - Timestamps prevent overwriting
   - Keep for reproducibility
   - Build corpus over time

5. **Check OCR quality**
   - Historical texts may have errors
   - "rn" might be "m", "1" might be "l"
   - Context usually clarifies

## Next Steps

- Use [Full Text Fetcher](./tools/fetch-full-text.md) to retrieve page text
- Add annotations with [Annotation Helper](./tools/annotation-helper.md)
- Understand [Scoring](./SCORING.md) to know why items ranked highly
- See [Research Profiles](./RESEARCH-PROFILES.md) to generate different result sets
- Explore [Custom Profiles](./CUSTOM-PROFILES.md) to tailor output to your needs