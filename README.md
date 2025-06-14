# Magic Lantern 🪄

![Status](https://img.shields.io/badge/status-beta-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

*Research automation toolkit for the Media History Digital Library's Lantern search platform*

Transform weeks of manual searching into hours of automated discovery across historical film trade publications. ✨

Magic Lantern searches the [Media History Digital Library](https://lantern.mediahist.org/) for you, running smart queries, organizing results, and saving everything in clean JSON files.

## 🚀 Quick Start

> **Prerequisite:** Make sure [Node.js 18 or newer](https://nodejs.org/) is installed on your system.

```bash
# 1. Clone the repo
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern

# 2. Create a CSV with your films
echo 'title,year,author,director,studio
"The Wizard of Oz",1939,"L. Frank Baum","Victor Fleming","MGM"' > films.csv

# 3. Run your first search (takes ~2 minutes)
node core/magic-lantern-v5.js films.csv

# 4. Find your results in the results/ folder!
```

<details>
<summary>Click the triangle to see example output!</summary>
    
```bash
✨ MAGIC LANTERN v5.1.0

🎭 Searching for: The Wizard of Oz (1939)
🔍 Running 25 search strategies...

✅ Found 523 results for "The Wizard of Oz"
✅ Found 489 results for "Wizard of Oz"  
✅ Found 234 results for "L. Frank Baum" "The Wizard of Oz"
✅ Found 156 results for "MGM" "The Wizard of Oz"
```

</details>

---

## ✨ What It Does
For each film, Magic Lantern:

- 🔍 Generates 15-30 smart search variations
- 📚 Searches across multiple collections and publications
- 🎯 Scores and ranks results
- 💾 Saves everything to structured JSON

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
node core/magic-lantern-v5.js core/data/films.csv --profile=labor-history
```

---

## 📊 Scoring Systems

**Original Scoring (Default)**
- Position-based (1-100 points)
- Publication weights from profile
- Simple and predictable

**Context-Aware Scoring (Experimental)**
Enable with `--context-aware` for:
- Source diversity emphasis (35%)
- Search strategy trust levels (25%)
- Reduced redundancy
- Better for exploratory research

```bash
node core/magic-lantern-v5.js core/data/films.csv --context-aware
```

---

## 📁 Output Format

<details><summary>Single JSON file with all results</summary>

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

</details>

---

## 🚀 Complete Workflow Example

<details><summary><b>Research Project: 1930s Literary Adaptations</b></summary>

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

</details>

---

## ⚙️ Command Line Options

```bash
--corpus=SIZE          # Control scope
--profile=NAME         # Research focus
--context-aware        # Experimental scoring
--list-profiles        # Show available profiles
--help                 # Usage information
```

---

## 🎨 Customization

<details><summary>Create Custom Profiles</summary>

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

</details>

<details><summary>Add Data to lib/utils.js</summary>
- Author name variations
- Studio abbreviations  
- Known stars by film
- Genre detection
</details>

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

<details><summary><b>Common Issues</b></summary>

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

</details>

---

## 🆕 New in v5.1.0

- **📄 Selective Full Text Fetching** - Choose exactly which sources to retrieve
- **📝 Annotation System** - Transform results into structured research data
- **🔬 Context-Aware Scoring** - Experimental diversity-focused ranking
- **🎯 Strategy Registry** - Easier customization of search patterns
- **🎬 Film Filtering** - Extract corpus subsets for focused research

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

- [Getting Started Guide](./docs/QUICKSTART.md) - Get running in 5 minutes
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

Built with ❤️ for film historians by Alexandra Edwards.

Built on:
- [Media History Digital Library](https://mediahistoryproject.org/)
- [Lantern Search Platform](https://lantern.mediahist.org/)

---

*"The magic lantern, the forerunner of the motion picture projector, used light and lenses to project images. Magic Lantern uses code and APIs to project research insights across decades of film history."*

---

## 🔗 Quick Links

- 📖 [Full Documentation](./docs/)
- 🚀 [Getting Started Guide](./docs/QUICKSTART.md)  
- 🐛 [Report Issues](https://github.com/nonmodernist/magic-lantern/issues)
- 💬 [Discussions](https://github.com/nonmodernist/magic-lantern/discussions)
