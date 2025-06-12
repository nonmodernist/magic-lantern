# Full Text Fetcher

Selectively fetch complete OCR text for search results from the Lantern API.

## Overview

The Full Text Fetcher allows you to retrieve the complete page text for specific search results. This gives you control over which sources get full text, saving time and API calls while focusing on the most relevant materials.

## Why Use This Tool?

- **Selective fetching**: Only get full text for high-scoring or specific sources
- **Interactive selection**: Browse and choose exactly which sources to fetch
- **Batch operations**: Fetch top N results or filter by publication/score
- **Resume capability**: Skip already-fetched texts (unless using `--refetch`)
- **Single source of truth**: Updates your existing results file

## Basic Usage

```bash
# Fetch top 50 results by score
node tools/fetch-full-text.js results/search-results_20240615_143022.json --top=50

# Interactive selection mode
node tools/fetch-full-text.js results/search-results_20240615_143022.json --interactive

# Fetch only high-scoring Variety articles
node tools/fetch-full-text.js results/search-results_20240615_143022.json --publication="variety" --score-threshold=80
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--top=N` | Fetch top N results by score | `--top=100` |
| `--score-threshold=N` | Only fetch results with score ≥ N | `--score-threshold=75` |
| `--publication=NAME` | Fetch only from specific publication | `--publication="variety"` |
| `--film=TITLE` | Fetch only for specific film | `--film="The Wizard of Oz"` |
| `--strategy=TYPE` | Fetch only results from specific search strategy | `--strategy="exact_title"` |
| `--interactive` | Interactive selection mode | `--interactive` |
| `--refetch` | Re-fetch already fetched texts | `--refetch` |
| `--in-place` | Overwrite original file (default: create new) | `--in-place` |
| `--output=PATH` | Specify output file path | `--output=results/updated.json` |
| `--verbose` | Show detailed progress | `--verbose` |
| `--rate-limit=MS` | API rate limit delay (default: 200ms) | `--rate-limit=500` |

## Interactive Mode

The interactive mode lets you browse results and select specific sources:

```bash
node tools/fetch-full-text.js results/search-results_20240615_143022.json --interactive
```

You'll see:
1. List of films with source counts
2. Select a film or "all"
3. View sources with scores and excerpts
4. Select using:
   - Individual numbers: `1,3,5`
   - Ranges: `1-10,15-20`
   - Top N: `top20`
   - All unfetched: `unfetched`
   - All: `all`

## Understanding the Output

When full text is fetched, each source is updated with:

```json
{
  "id": "variety137-1940-01_0054",
  "fullText": "[Complete OCR text of the page]",
  "fullTextFetched": true,
  "fullTextFetchedAt": "2024-06-15T14:30:22.000Z",
  "fullTextMetadata": {
    "wordCount": 1247,
    "collections": ["Hollywood Studio System"],
    "title": "Variety",
    "volume": ["Variety (Jan 1940)"],
    "date": "1940-01-03",
    "year": 1940,
    "creator": "Variety Publishing",
    "iaPage": "variety137-1940-01_0054",
    "readUrl": "http://archive.org/stream/variety137-1940-01#page/n53/",
    "contentTypes": ["review", "news"]
  }
}
```

## Workflow Examples

### Research Workflow 1: Top Results
```bash
# 1. Run Magic Lantern search
node core/magic-lantern-v5.js films.csv --corpus=medium

# 2. Fetch full text for top 100 results
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=100

# 3. Annotate interesting findings
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
```

### Research Workflow 2: Publication Focus
```bash
# Fetch all high-scoring trade paper results
node tools/fetch-full-text.js results/search-results_[timestamp].json \
  --publication="variety" --score-threshold=70

node tools/fetch-full-text.js results/search-results_[timestamp].json \
  --publication="motion picture herald" --score-threshold=70
```

### Research Workflow 3: Incremental Fetching
```bash
# Day 1: Fetch top 50
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=50

# Day 2: Review, then fetch next batch interactively
node tools/fetch-full-text.js results/search-results_[timestamp].json --interactive
```

## Tips

1. **Start small**: Fetch top 20-50 first to assess quality
2. **Use thresholds**: Set score thresholds based on your scoring profile
3. **Save versions**: Use default behavior (creates new file) to preserve stages
4. **Check excerpts**: The excerpt often reveals if full text is needed
5. **Monitor failures**: Check for failed fetches in the summary

## Performance Notes

- Respects MHDL rate limits (200ms default delay)
- Failed fetches are logged but don't stop the process
- Progress indicator shows completion percentage
- Use `--verbose` to see each fetch attempt