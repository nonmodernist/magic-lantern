# Magic Lantern Tools

Utility scripts that enhance your Magic Lantern workflow.

## Available Tools

- **`filter-films.js`** - Extract subsets of films from CSV files
- **`fetch-full-text.js'** - Fetch the full text of specific pages from Lantern API
- **'annotation-helper.js** - Annotate search-results.json for future reference and analysis

## Usage

All tools are designed to work with Magic Lantern output and data formats:

```bash
# Filter films by criteria
node tools/filter-films.js core/data/more-films.csv --author="Fannie Hurst" --output="fannie-hurst-films.csv"
