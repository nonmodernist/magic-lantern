# Magic Lantern Tools

Utility scripts that enhance your Magic Lantern workflow.

## Available Tools

### 📄 Full Text Fetcher (`fetch-full-text.js`)
Selectively retrieve complete OCR text for search results.

**Key Features:**
- Fetch by score threshold, publication, or film
- Interactive selection mode
- Resume capability (skip already fetched)
- Preserves all existing data

**Quick Usage:**
```bash
# Fetch top 50 by score
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=50

# Interactive selection
node tools/fetch-full-text.js results/search-results_[timestamp].json --interactive
```

[Full Documentation](../docs/tools/fetch-full-text.md)

---

### 📝 Annotation Helper (`annotation-helper.js`)
Transform search results into a structured research database.

**Key Features:**
- 6 annotation types (dates, locations, people, labor, technical, general)
- Validated data entry with schemas
- Export to CSV for analysis
- Statistics and progress tracking

**Quick Usage:**
```bash
# Interactive annotation
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive

# Export findings
node tools/annotation-helper.js results/search-results_[timestamp].json --export findings.csv
```

[Full Documentation](../docs/tools/annotation-helper.md)

---

### 🎬 Film Filter (`filter-films.js`)
Extract subsets of films from CSV files for focused searches.

**Key Features:**
- Filter by author, decade, studio, director
- Combine multiple filters
- Preview before saving
- List unique values

**Quick Usage:**
```bash
# Filter by author
node tools/filter-films.js core/data/more-films.csv --author="Fannie Hurst"

# Filter by decade
node tools/filter-films.js core/data/more-films.csv --decade=1930 --output="1930s-films.csv"

# List all authors
node tools/filter-films.js core/data/more-films.csv --list-authors
```

---

## Typical Research Workflow

### 1. Prepare Your Data
```bash
# Optional: Filter your corpus
node tools/filter-films.js all-films.csv --decade=1930 --output="1930s-films.csv"
```

### 2. Run Magic Lantern
```bash
# Search with appropriate profile
node core/magic-lantern-v5.js 1930s-films.csv --corpus=medium --profile=adaptation-studies
```

### 3. Fetch Full Text Selectively
```bash
# Get top results
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=100

# Or choose interactively
node tools/fetch-full-text.js results/search-results_[timestamp].json --interactive
```

### 4. Annotate Your Findings
```bash
# Add structured annotations
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
```

### 5. Export for Analysis
```bash
# Export all annotations
node tools/annotation-helper.js results/search-results_[timestamp].json --export research-findings.csv
```

## Design Philosophy

These tools follow Magic Lantern's core principles:

- **Single source of truth**: All data lives in one JSON file
- **Incremental enhancement**: Add data without losing existing work
- **Researcher control**: You decide what to fetch and annotate
- **Structured flexibility**: Schemas guide but don't constrain

## Tips

1. **Work incrementally**: Fetch and annotate in batches
2. **Use score thresholds**: Focus on high-quality sources first
3. **Export regularly**: CSV backups protect your annotations
4. **Combine filters**: Target specific research questions
5. **Preserve stages**: Default behavior creates new files

## Future Tools

Potential additions to the toolkit:
- Merge tool for combining multiple search runs
- Visualization generator for findings
- Citation formatter for bibliographies
- Duplicate detector for cross-film analysis

## Contributing

Have ideas for new tools? Check the main [Development Guide](../docs/DEVELOPMENT.md) for guidelines.