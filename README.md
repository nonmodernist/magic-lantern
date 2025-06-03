# Magic Lantern 🪄

*Research automation toolkit for the Media History Digital Library's Lantern search platform*

Transform weeks of manual searching into hours (or minutes) of automated discovery across historical film trade publications. ✨

---

## What Magic Lantern Does

Magic Lantern is a Node.js tool that brings the joy of automation to historical film research! It works with the [Lantern](https://lantern.mediahist.org/) platform to:

1. **Generate 15+ intelligent search queries** per film using configurable strategies
2. **Execute searches gracefully** with proper API rate limiting (respecting MHDL's limits so we can all benefit from the archive)
3. **Deduplicate results** across multiple searches (no more struggling to remember what you've already found!)
4. **Score results** based on publication quality and relevance 
5. **Fetch full text** of the highest-scored results
6. **Output structured JSON** ready for your analysis

## Why I Built It

We've all been there. You're deep in MHDL research when suddenly:
- 😱 **Tab chaos**: 47 browser tabs open, each with different search variations, page results, whole issues on the Internet Archive
- 🤯 **Mental overload**: "Wait, did I already search 'Fannie Hurst' + 'Back Street' or just 'Hurst' + 1932?"
- ☕ **Interruption anxiety**: Every coffee break means losing track of where you were
- 📝 **Note sprawl**: Sticky notes, spreadsheets, and Word docs trying to track what you've found
- 🌲 **Forest for the trees**: 50,000 results but which ones actually matter?
- 😴 **The 3pm slump**: Manually copying promising citaiton #237 while wondering if this is your life now
- 🔄 **Déjà vu**: "I swear I've seen this page three times already..."

Traditional Lantern research means juggling searches, results, and your sanity all at once.

## Comparing Workflows

**The old way:**

- 🔍 Open tab 1: "Little Women"
- 🔍 Open tab 2: "Louisa May Alcott" + "Little Women"  
- 🔍 Open tab 3: "Alcott" + 1933
- 🔍 Open tab 4: "RKO" + "Little Women"
- 📋 Copy interesting results to notes...
- ☕ Coffee break
- 😰 "Wait, which searches did I already do?"
- 🔍 Open tab 5: (accidentally repeat tab 2)
- 💻 Browser crashes from too many tabs
- 😭 Start over...


**The Magic Lantern way (sweet, sweet automation):**
```bash
node magic-lantern-v5.js films.csv --corpus=medium --profile=adaptation-studies

# Then you can:
☕ Take that coffee break without anxiety
📱 Answer that text without losing your place  
🍽️ Go to lunch knowing everything's being captured
🎯 Return to find organized, scored, deduplicated results
😊 Actually READ sources instead of just finding them
```

### What Makes Research Joyful Again

🧠 **Set it and forget it**: Start a search and walk away. Magic Lantern keeps working while you live your life.

📊 **No more tab jungle**: One command replaces dozens of browser tabs. Your RAM will thank you.

🎯 **Smart prioritization**: Instead of drowning in 50,000 results, see the best ones float to the top with intelligent scoring.

🔄 **Perfect memory**: Magic Lantern never forgets which searches it's done or which results it's seen. Unlike us mere mortals.

📁 **Everything in one place**: No more scattered notes. All results land in neat JSON files, timestamped and organized.

⏸️ **Interruption-proof**: Department meeting? An actually busy day of office hours? No problem. Your research waits patiently in those JSON files.

🎉 **Skip to the good part**: Spend time actually *reading* and *analyzing* sources instead of just finding them.

## ✨ Key Features

### 🎯 Research Profiles
Pre-configured search strategies tailored to your research focus:
- **adaptation-studies**: Perfect for tracking down those elusive author mentions!
- **labor-history**: Uncover strike and union coverage during production
- **early-cinema**: Unearth treasures from early trade papers (1905-1920)
- **regional-reception**: Discover how films played in the heartland

With the ability to easily create your own!

### 📊 Smart Scoring System
Watch as Magic Lantern intelligently ranks your results:
- Publication weights (Variety = 1.0, but that rare Motography issue? 1.5!)
- Collection-aware scoring (Fan Magazines vs. Technical Journals)
- Position-based ranking (top results bubble up)
- Temporal relevance (results from the right era score higher)

### 🔍 Search Strategy Magic
Automatically generates clever variations like:
- Title variations ("The Wizard of Oz", "Wizard of Oz", just "Wizard")
- Author + Title combos ("L. Frank Baum" + "Wizard of Oz")
- Director searches (for those auteur studies)
- Studio + production keywords
- Box office terminology
- And so many more combinations!

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern

# No npm install needed - uses only Node.js built-ins! 🎉
```

## 📝 Basic Usage

1. **Create a CSV file** with your films:
```csv
title,year,author,director,studio
"The Wizard of Oz",1939,"L. Frank Baum","Victor Fleming","Metro-Goldwyn-Mayer"
"Little Women",1933,"Louisa May Alcott","George Cukor","RKO Pictures"
```

2. **Run Magic Lantern** and watch the magic happen:
```bash
# Test mode (1 film) - perfect for getting your feet wet!
node magic-lantern-v5.js films.csv

# Ready for the full experience? 
node magic-lantern-v5.js films.csv --corpus=full --profile=adaptation-studies
```

3. **Discover your treasures** in `results/`:
- `comprehensive-search-results_[timestamp].json` - All your search results with metadata
- `full-text-results_[timestamp].json` - Full OCR text of the cream of the crop

## 🎨 Configuration Options

### Corpus Profiles
Choose your adventure size:
- `test` - 1 film, minimal searches (perfect for testing!)
- `single` - 1 film, comprehensive searches (deep dive mode)
- `medium` - 20 films, balanced approach (sweet spot)
- `full` - All films, maximum coverage (grab that coffee!)

### Research Profiles
Choose a pre-made profile or craft your own in `config/profiles/`:
```javascript
// Example: labor-history.profile.js
module.exports = {
  name: "Film Industry Labor History",
  publications: {
    weights: {
      "variety": 1.5,              // They covered strikes well!
      "hollywood reporter": 1.3,
      "photoplay": 0.5,           // Less interested in labor issues
    }
  },
  searchStrategies: {
    weights: {
      "title_strike": 2.5,        // Find those strikes!
      "studio_strike": 1.8,
      "author_title": 0           // Skip the literary stuff
    }
  }
}
```

## 📊 Output Format

### Search Results JSON (The Workhorse)
```json
{
  "film": {
    "title": "The Wizard of Oz",
    "year": "1939"
  },
  "totalUniqueSources": 145,  // Look at all those sources!
  "searchStrategySummary": {
    "exact_title": 45,
    "author_title": 23,
    "studio_title": 12
  },
  "sources": [
    {
      "id": "variety137-1940-01_0054",
      "foundBy": "exact_title",
      "scoring": {
        "finalScore": 95.5,  // A treasure!
        "publication": "variety"
      }
    }
  ]
}
```

### Full Text Results JSON (The Gold Mine)
```json
{
  "treasures": [
    {
      "id": "variety137-1940-01_0054",
      "fullText": "[Complete OCR text - ready for analysis!]",
      "contentTypes": ["review", "box_office"],
      "publication": "variety",
      "year": 1939,
      "finalScore": 95.5
    }
  ]
}
```

## 🛠️ Advanced Features

### Custom Search Strategies
Add your own search patterns to `SearchStrategyGenerator`:

```javascript
myCustomStrategy(film) {
  return [{
    query: `"${film.studio}" "on location"`,
    type: 'studio_location',
    confidence: 'medium',
    description: 'Studio + location shooting'
  }];
}
```

### Publication Scoring
Fine-tune weights in your profile:
```javascript
publications: {
  weights: {
    "variety": 1.0,
    "rare_specialist_publication": 2.0,  // Boost those rare finds!
    "common_trade_rag": 0.5          // We've seen enough of these
  }
}
```

## 🚧 Coming Attractions

Currently, Magic Lantern focuses on search automation and outputs JSON. Future possibilities include:
- 📊 Interactive dashboards 
- 📚 Direct bibliography formatting
- 🔗 Zotero integration

For now, the JSON output plays nicely with your favorite analysis tools!

## 🔧 Troubleshooting

**"No results found"** 😕
- Double-check those historical film titles
- Peek at the date ranges in your profile
- Some films are just camera-shy in the trades!

**"Too many results"** 😅
- Start with `--corpus=test` for just one film
- Tweak those `stopConditions` in config

**Performance notes** ⏱️
- Rate limiting adds 200ms between requests (being good citizens!)
- Full corpus runs can take hours (but think of the time saved!)

## 🗂️ Legacy Tools

Curious about the origins? The `legacy/` directory contains the original tools that inspired Magic Lantern. Built for a specific project (Hollywood Regionalism), they include features like HTML dashboards and interactive bibliography management!

## 🤝 Contributing

I'd love your contributions! Check out existing profiles and search strategies for patterns to follow. Every new profile helps another researcher!

## 🙏 Credits

Created by Alexandra Edwards to enhance the joy of film history research.

Built with love on top of:
- [Media History Digital Library](https://mediahistoryproject.org/) 📚
- [Lantern Search Platform](https://lantern.mediahist.org/) 🔍

## 📄 License

MIT License - Use it for your research adventures!

---

*"The magic lantern, the forerunner of the motion picture projector, used light and lenses to project images. Magic Lantern uses code and APIs to project research insights across decades of film history."*

---

## Quick Links

- 📖 [Full Documentation](./docs/)
- 🚀 [Getting Started Guide](./INSTALL.md)  
- 💡 [Usage Examples](./EXAMPLES.md)
- 🐛 [Report Issues](https://github.com/nonmodernist/magic-lantern/issues)
- 💬 [Discussions](https://github.com/nonmodernist/magic-lantern/discussions)
