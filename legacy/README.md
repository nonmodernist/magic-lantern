# Lantern Research Tools for Hollywood Regionalism

A suite of Node.js tools for researching film adaptations of American women's regional literature (1910-1961) using the Media History Digital Library's Lantern search API.

## Overview

These tools automate the process of searching historical film industry publications for mentions of specific films, helping researchers gather evidence about production, reception, and distribution from trade papers and fan magazines. The suite includes search tools, report generators, and a visual research dashboard to track progress across a corpus of films.
## Prerequisites

- Node.js (tested with v22.11.0, but should work with most recent versions)
- No additional dependencies required - uses only Node.js built-in modules
- A [Zola](https://www.getzola.org/) static site project with film data (or similar markdown-based structure)

## Installation

1. Clone or download these files to your project directory
2. Ensure your film data is organized in markdown files within `content/films/` (standard Zola content structure)
3. Create the output directory structure: `reports/lantern-reports/`

## File Structure

```
your-project/
├── content/                    # Zola content directory
│   └── films/                  # Film pages for your Zola site
│       ├── film-title-year.md
│       └── ... (your film markdown files)
├── reports/                    # Research outputs (not part of Zola site)
│   └── lantern-reports/
│       └── (generated reports will appear here)
├── tools/
│   └── lantern/
│       ├── lantern-tool-v3.js
│       ├── lantern-report-generator.js
│       ├── lantern-research-dashboard.js
│       └── add-to-bibliography.js
```

## Film Markdown Format

Your film files should include Zola-style frontmatter with these fields:

```markdown
+++
title = "Film Title"
weight = 1925  # Used for sorting in Zola

[taxonomies]
authors = ["Author Name"]
directors = ["Director Name"]
studios = ["Studio Name"]

[extra]
year = 1925
director = "Director Name"
studio = "Studio Name"
original_story = "Source Novel/Story"
story_author = "Author Name"
+++

Film content for your Zola site...
```

## Usage

### Step 1: Search and Collect Data

Run the search tool to query Lantern for your films:

```bash
# Search first 5 films (for testing)
node lantern-tool-v3.js

# Search all films in your directory
node lantern-tool-v3.js --all

# Test API connection
node lantern-tool-v3.js --test-api
```

This generates: `reports/lantern-reports/lantern-report-v3.json`

### Step 2: Generate Research Reports

Convert the raw data into formatted research reports:

```bash
node tools/lantern/lantern-report-generator.js
```

This creates:
- Individual film reports: `reports/lantern-reports/film-title-year.md`
- Combined report: `reports/lantern-reports/combined-report.md`

### Step 3: View Research Dashboard

Generate an interactive dashboard to track your research progress:

```bash
node tools/lantern/lantern-research-dashboard.js
```

This creates:
- `reports/lantern-reports/research-dashboard.html` - Open in your browser for interactive dashboard
- `reports/lantern-reports/research-status.json` - Raw data for further analysis

### Step 4: Add Sources to Bibliography

Use the interactive tool to add selected Lantern sources to your bibliography.toml:

```bash
node tools/lantern/add-to-bibliography.js
```

This tool:
- Shows all sources for each film with scores and excerpts
- Lets you select which sources to add (by number, "all", or "none")
- Automatically generates citation IDs
- Tracks which sources you've reviewed/rejected
- Updates the Lantern report with review status

## What the Tools Do

### lantern-tool-v3.js
- Searches for each film using multiple query strategies (title + author, title + year, etc.)
- Identifies publication sources and content types (reviews, production news, advertisements)
- Scores results based on relevance and source quality
- Deduplicates results across searches
- Respects API rate limits (200ms between requests)

### lantern-report-generator.js
- Processes the JSON data into readable markdown reports
- Analyzes coverage patterns across films and authors
- Identifies high-priority sources for further research
- Provides research recommendations and next steps

### lantern-research-dashboard.js
- Creates an interactive HTML dashboard showing research progress
- Generates smart recommendations for which films to research next
- Visualizes coverage with heatmaps and progress bars
- Identifies gaps in your research (missing reviews, production news, etc.)

### add-to-bibliography.js
- Interactive command-line tool for reviewing Lantern results
- Displays sources for each film with scores and excerpts
- Allows selective addition of sources to bibliography.toml
- Automatically generates proper citation IDs following your naming conventions
- Tracks review decisions (added/rejected) in the Lantern report
- Creates backups before modifying bibliography.toml

## Understanding the Dashboard

The research dashboard provides several key views:

### Overview Statistics
- Total films in your project
- Number fully researched, partially researched, and not started
- Total Lantern sources found
- Average sources per film

### Smart Recommendations
- **High-Value Films**: Films with good sources (3+) that aren't fully researched
- **Quick Wins**: Films with 1-2 excellent sources for rapid processing
- **Deep Dive Candidates**: Films with 15+ sources worth comprehensive review

### Coverage Heatmap
- Visual grid of all films color-coded by number of sources
- Click any film to see details
- Quickly identify which films have rich documentation

### Gap Analysis
- Films with sources but no reviews
- Films with sources but no production news
- Films with no Lantern coverage at all

## Example Output

A high-scoring result might look like:
```
1. Variety - 1934-11-27 [Score: 9.5]
"Imitation of Life" (Universal) Excellent drama. Fannie Hurst's novel makes 
strong screen material...
- Type: Film review
- Significance: Contemporary critical reception
- IA Link: [View Full Page](https://archive.org/stream/...)
```

## Research Workflow

1. **Initial Search**: Run `lantern-tool-v3.js` to find all available sources
2. **Review Dashboard**: Open the HTML dashboard to see overall progress
3. **Pick Next Film**: Use smart recommendations to choose high-value targets
4. **Deep Dive**: Read the individual film report for your chosen film
5. **Add to Bibliography**: Use `add-to-bibliography.js` to selectively add sources
6. **Update Film Page**: Add citations and notes to your Zola content
7. **Repeat**: Dashboard will reflect your progress on next run

## Key Features of the Bibliography Tool

The `add-to-bibliography.js` tool helps manage the crucial step of converting research findings into citable sources:

- **Review Status Tracking**: Remembers which sources you've already reviewed/rejected
- **Smart ID Generation**: Creates consistent citation IDs like `variety_imitation_of_life_1934`
- **Batch Processing**: Review all films or select specific ones to work through
- **Safe Editing**: Creates automatic backups before modifying bibliography.toml
- **Progress Persistence**: Updates the Lantern JSON report with review decisions

## API Limits and Etiquette

Per Media History Digital Library guidelines:
- Limit requests to 10 per second (the tool enforces 200ms delays)
- For projects exceeding this limit, contact: mhdl@commarts.wisc.edu

## Integration with Your Zola Site

The generated reports are research materials, not intended for direct publication on your Zola site. However, you can:
- Reference findings when writing film page content
- Copy relevant quotes and citations into your film markdown files
- Use the data to populate bibliographies or source notes
- Track which films have been fully researched vs. need attention

## Customization

To adapt these tools for other research:
1. Modify the search query generation in `generateSearchQueries()`
2. Adjust the scoring algorithm in `calculateScore()`
3. Update content patterns in `contentPatterns` for your research focus
4. Customize report generation in `lantern-report-generator.js`
5. Adjust dashboard categories in `lantern-research-dashboard.js`

## Troubleshooting

**No results found?**
- Verify film titles match historical usage (check AFI Catalog)
- Try broader date ranges (the tool searches ±3 years by default)
- Some films may have limited trade coverage

**API errors?**
- Run `node lantern-tool-v3.js --test-api` to verify connection
- Check your internet connection
- Ensure you're not exceeding rate limits

**Can't find film files?**
- Ensure you're running the script from your Zola project root
- Check that your films are in `content/films/`
- Verify files have `.md` extension

**Dashboard not updating?**
- Make sure you've run the search tool first
- Check that `lantern-report-v3.json` exists
- Verify your film files have proper frontmatter

## Credits

These tools utilize the [Lantern](https://lantern.mediahist.org/) search platform provided by the Media History Digital Library. The MHDL is a collaborative initiative between leading libraries and archives to digitize and make accessible historical media materials.

## Future Enhancements

- Direct integration with Zola content files
- Export to CSV for spreadsheet analysis
- Integration with other film databases?
- Visualization of coverage patterns over time
- Batch processing improvements
- Cross-reference detection between films

## Notes for Future Me

- The tools search progressively (title+author first, then broader searches)
- Deduplication tracks the highest-scoring version of each result
- Score calculation prioritizes: publication quality > content type > title match > author mention
- The 3-year window for date filtering can be adjusted in `isValidResult()`
- Reports are saved separately from Zola content to avoid cluttering the site build
- Dashboard determines "fully researched" by checking for both Lantern data AND citations in the film file

---

*Created for the Hollywood Regionalism project, documenting film adaptations of American women's regional literature*