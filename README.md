# Magic Lantern 🪄

![Status](https://img.shields.io/badge/status-beta-yellow)
![Version](https://img.shields.io/badge/version-5.1.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

*Research automation toolkit for the Media History Digital Library's Lantern search platform*

Transform weeks of manual searching into hours of automated discovery across historical film trade publications. ✨

> ⚠️ **Beta Software**: This tool is under active development. 
> Please report issues and backup your data!

---

## What Magic Lantern Does

Magic Lantern is a Node.js tool that brings the speed of automation to historical film research! It works with the [Lantern](https://lantern.mediahist.org/) platform to:

1. **Generate 15-30+ intelligent search queries** per film using configurable strategies
2. **Execute searches gracefully** with proper API rate limiting
3. **Score and rank results** using multiple algorithms
4. **Fetch full text selectively** for your most valuable sources
5. **Build a research database** with structured annotations
6. **Output everything as JSON** for analysis and preservation

## ✨ New in v5.1.0

- **📄 Selective Full Text Fetching** - Choose exactly which sources to retrieve
- **📝 Annotation System** - Transform results into structured research data
- **🔬 Context-Aware Scoring** - Experimental diversity-focused ranking
- **🎯 Strategy Registry** - Easier customization of search patterns
- **🎬 Film Filtering** - Extract corpus subsets for focused research

## Why Use Magic Lantern?

If you've done deep MHDL research, you know the pain of:
- 😱 Managing dozens of browser tabs
- 🤯 Remembering which searches you've already done
- 📝 Tracking results across multiple spreadsheets
- 🔄 Accidentally repeating searches
- ⏰ Losing hours to manual copying

Magic Lantern solves these problems by automating the search process while giving you full control over what to retrieve and annotate.

---

## 🚀 Quick Start

> **Prerequisite:** Make sure [Node.js 18 or newer](https://nodejs.org/) is installed on your system.

### 1. Install

```bash
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern

# No npm install needed - uses only Node.js built-ins! 🎉
```

### 2. Create Your Film List

```csv
title,year,author,director,studio
"The Wizard of Oz",1939,"L. Frank Baum","Victor Fleming","Metro-Goldwyn-Mayer"
"Little Women",1933,"Louisa May Alcott","George Cukor","RKO Pictures"
```

### 3. Run Magic Lantern

```bash
# Quick test with one film
node core/magic-lantern-v5.js core/data/films.csv

# Real research with 20 films
node core/magic-lantern-v5.js core/data/films.csv --corpus=medium --profile=adaptation-studies
```

### 4. Get Full Text

```bash
# Fetch top 100 sources
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=100
```

### 5. Annotate Findings

```bash
# Add structured annotations
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
```

---

## 🎯 Research Profiles

Pre-configured search strategies for different research approaches:

| Profile                    | Best For             | Special Features                 |
| -------------------------- | -------------------- | -------------------------------- |
| `default`                  | General research     | Balanced approach                |
| `adaptation-studies`       | Literary adaptations | Author searches, source material |
| `labor-history`            | Industry labor       | Strike/union terminology         |
| `reviews-and-reception`    | Critical response    | Historical review terms          |
| `early-cinema`             | Pre-1930 films       | Period-specific terminology      |
| `interviews-and-publicity` **(coming soon)** | Star studies         | Personality pieces, quotes       |
| `advertisement-focused` **(coming soon)**   | Marketing history    | Theater ads, playdates           |

```bash
# List all profiles
node core/magic-lantern-v5.js --list-profiles

# Use a specific profile
node core/magic-lantern-v5.js films.csv --profile=labor-history
```

---

## 🛠️ Tool Suite

### 📄 Full Text Fetcher
Selectively retrieve complete OCR text of pages:

```bash
# Interactive selection
node tools/fetch-full-text.js results/search-results_[timestamp].json --interactive

# By score threshold
node tools/fetch-full-text.js results/search-results_[timestamp].json --score-threshold=80

# By publication
node tools/fetch-full-text.js results/search-results_[timestamp].json --publication="variety"
```

### 📝 Annotation Helper
Build a structured research database:

```bash
# Interactive annotation
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive

# View statistics
node tools/annotation-helper.js results/search-results_[timestamp].json --stats

# Export to CSV
node tools/annotation-helper.js results/search-results_[timestamp].json --export findings.csv
```

### 🎬 Film Filter
Extract focused subsets from large film lists:

```bash
# Filter by author
node tools/filter-films.js all-films.csv --author="Fannie Hurst" --output="hurst-films.csv"

# Filter by decade
node tools/filter-films.js all-films.csv --decade=1930 --output="1930s-films.csv"
```

---

## 📊 Scoring Systems

### Original Scoring (Default)
- Position-based (1-100 points)
- Publication weights from profile
- Simple and predictable

### Context-Aware Scoring (Experimental)
Enable with `--context-aware` for:
- Source diversity emphasis (35%)
- Search strategy trust levels (25%)
- Reduced redundancy
- Better for exploratory research

```bash
node core/magic-lantern-v5.js core/data/films.csv --context-aware
```

---

## 🔍 Search Strategies

Magic Lantern generates multiple search types per film:

### Core Strategies
- **Title variations**: Exact, without articles, abbreviated
- **Creator searches**: Authors, directors, with variations
- **Production searches**: Studio, box office, exhibition
- **Star searches**: Actor names and combinations

### Profile-Specific Strategies
- **Labor history**: Strike, picket, union terms
- **Reviews**: Historical criticism terminology
- **Interviews**: "says", "tells", personality pieces
- **Advertisements**: Playdates, bookings, exploitation

### Custom Strategies
Add your own via the strategy registry:

```javascript
// In lib/strategy-registry.js
this.register('my_custom_search', {
    generator: (film) => ({
        keyword: `"${film.title}"`,
        secondKeyword: '"my term"',
        confidence: 'high',
        description: 'What this finds'
    }),
    defaultWeight: 2.0,
    category: 'myCategory'
});
```

---

## 📁 Output Format

Single JSON file with all results:

```json
{
  "film": {
    "title": "The Wizard of Oz",
    "year": "1939"
  },
  "totalUniqueSources": 145,
  "sources": [{
    "id": "variety137-1940-01_0054",
    "scoring": {
      "finalScore": 95.5,
      "publication": "variety"
    },
    "fullText": null,              // Filled by fetch-full-text
    "fullTextFetched": false,
    "annotations": {               // Added by annotation-helper
      "productionDates": [{
        "date": "1939-03-15",
        "dateType": "filming_start",
        "excerpt": "Principal photography commenced"
      }]
    }
  }]
}
```

---

## 🚀 Complete Workflow Example

### Research Project: 1930s Literary Adaptations

```bash
# 1. Filter to 1930s films
node tools/filter-films.js all-films.csv --decade=1930 --output="1930s-films.csv"

# 2. Run focused search
node core/magic-lantern-v5.js 1930s-films.csv \
  --corpus=medium \
  --profile=adaptation-studies \
  --context-aware

# 3. Fetch promising sources
node tools/fetch-full-text.js results/search-results_[timestamp].json \
  --top=200 \
  --score-threshold=70

# 4. Annotate findings
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive

# 5. Export for analysis
node tools/annotation-helper.js results/search-results_[timestamp].json \
  --export 1930s-adaptations.csv
```

---

## ⚙️ Configuration Options

### Corpus Sizes
- `test` - 1 film, quick validation
- `single` - 1 film, comprehensive
- `medium` - 20 films, balanced
- `full` - All films, exhaustive

### Command Line Options
```bash
--corpus=SIZE          # Control scope
--profile=NAME         # Research focus
--context-aware        # Experimental scoring
--list-profiles        # Show available profiles
--help                 # Usage information
```

---

## 🎨 Customization

### Create Custom Profiles

```javascript
// config/profiles/my-research.profile.js
module.exports = {
  name: "My Research Focus",
  description: "Customized for my needs",
  
  searchStrategies: {
    weights: {
      'exact_title': 2.0,        // Prioritize
      'my_custom_strategy': 2.5, // Custom strategy
      'author_title': 0          // Skip
    }
  },
  
  publications: {
    weights: {
      "key_publication": 2.0,    // Boost important sources
      "irrelevant_pub": 0.5      // Downweight
    }
  }
};
```

### Add Data to `lib/utils.js`
- Author name variations
- Studio abbreviations  
- Known stars by film
- Genre detection

---

## 📈 Performance Notes

- **Rate limiting**: 200ms between API calls (respects MHDL)
- **Time estimates**:
  - Single film: 2-5 minutes
  - Medium corpus (20): 40-100 minutes
  - Full corpus (100+): 3-8 hours
- **Memory**: Results stored in memory during search, with periodic interim saves to file
- **Full text**: Fetched separately to save time/bandwidth

---

## 🐛 Troubleshooting

### Common Issues

**No results found**
- Check film title matches historical usage
- Verify year is correct
- Try different profile

**Profile not loading**
- Filename must end with `.profile.js`
- Check for syntax errors
- Verify `module.exports`

**Lantern unavailable**
- Check https://lantern.mediahist.org/
- Verify internet connection
- Try again later

### Debug Mode
Add temporary logging:
```javascript
console.log('🔍 Debug:', {
  searchQuery: strategy.query,
  resultsFound: results.length
});
```

---

## 🤝 Contributing

Contributions welcome! Areas of interest:
- New research profiles
- Additional search strategies
- Tool enhancements
- Documentation improvements

See [Development Guide](./docs/DEVELOPMENT.md) for details.

---

## 📚 Documentation

- [Quick Start Guide](./docs/QUICKSTART.md) - Get running in 5 minutes
- [Research Profiles](./docs/RESEARCH-PROFILES.md) - All available profiles
- [Search Strategies](./docs/SEARCH-STRATEGIES.md) - How queries are generated
- [Scoring System](./docs/SCORING.md) - Result ranking explained
- [Output Formats](./docs/OUTPUT-FORMATS.md) - Understanding the JSON
- [Custom Profiles](./docs/CUSTOM-PROFILES.md) - Create your own
- [Tool Documentation](./docs/tools/) - Detailed tool guides
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues

---

## 🗂️ Legacy Tools

The `legacy/` directory contains the original project-specific tools that inspired Magic Lantern.

---

## 🙏 Acknowledgments

Created to improve film history research workflows.

Built on:
- [Media History Digital Library](https://mediahistoryproject.org/)
- [Lantern Search Platform](https://lantern.mediahist.org/)

---

## 📄 License

MIT License - Use freely for your research!

---

*"The magic lantern, the forerunner of the motion picture projector, used light and lenses to project images. Magic Lantern uses code and APIs to project research insights across decades of film history."*

---

## Quick Links

- 📖 [Full Documentation](./docs/)
- 🚀 [Getting Started Guide](./docs/QUICKSTART.md)  
- 🐛 [Report Issues](https://github.com/nonmodernist/magic-lantern/issues)
- 💬 [Discussions](https://github.com/nonmodernist/magic-lantern/discussions)
