# Magic Lantern 🪄

*Intelligent research toolkit for film historians working with the Media History Digital Library*

Automate your archival research across historical film trade publications with smart search, relevance scoring, and progress tracking.

---

## The Problem

Researching film history in trade publications means:
- Manually searching dozens of magazines across decades  
- Losing track of what you've already found
- Missing relevant coverage because titles vary
- Copying citations and quotes by hand
- No systematic way to prioritize sources

## The Solution

Magic Lantern transforms your research workflow:

**Before Magic Lantern:**
```
📖 Open Lantern website
🔍 Search "Gone with the Wind" 
📝 Manually copy 50+ results
🔍 Search "Mitchell + GWTW"
📝 Copy more results (with duplicates)
😵 Repeat for 121 films...
```

**After Magic Lantern:**
```
⚡ Run: node magic-lantern.js
☕ Get coffee while it searches intelligently
📊 Review interactive dashboard 
📋 Export bibliography with one click
```

## Features

📈 **Progress Dashboard** - Visual research status tracking  
📚 **Bibliography Export** - One-click citation generation  
🔍 **Gap Analysis** - Identifies films needing more research  
⚡ **Batch Processing** - Handles entire film corpora  

### Future Enhancements

✨ **Intelligent Multi-Strategy Search** - Tries multiple search approaches per film  
📊 **Smart Relevance Scoring** - Prioritizes reviews > production news > mentions  
🎯 **Duplicate Detection** - Finds the best version of each source 

## Quick Start

```bash
# 1. Install Node.js (https://nodejs.org)
# 2. Download Magic Lantern
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern

# 3. Add your film data (CSV or JSON)
cp examples/sample-films.csv your-films.csv

# 4. Run the magic
node magic-lantern.js

# 5. Open the dashboard
open reports/research-dashboard.html
```

## Who This Is For

📚 **Film Historians** researching trade publication coverage  
🎓 **Graduate Students** doing systematic archival research  
💻 **Digital Humanists** working with historical periodicals  
🎬 **Film Scholars** studying industry discourse and reception  

## Ideal Example Output

Magic Lantern finds sources like this:

```
📰 Variety - 1939-12-15 [Score: 9.5/10]
"Gone with the Wind surpasses every expectation... Selznick has created 
a picture that will be talked about for years to come."
→ Type: Film review | 📈 Box office data included
→ View: https://archive.org/stream/variety137-1940-01/page/n54

🎬 Motion Picture Herald - 1939-12-16 [Score: 8.8/10]  
"Tremendous advance booking indicates Gone with the Wind will break
all attendance records..."
→ Type: Production news | 📊 Exhibition data
→ View: https://archive.org/stream/motionpictureher...
```

## What Makes It Smart

🧠 **Context-Aware Scoring**: Prioritizes contemporary reviews over mere mentions  
🎯 **Source Quality Detection**: Variety > trade papers > fan magazines  
📅 **Temporal Relevance**: Weighs sources closer to release date higher  
🔄 **Adaptive Search**: Tries multiple search strategies automatically  

---

## Installation & Setup

### Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Film metadata** in CSV, JSON, or markdown format
- **Internet connection** for API calls to MHDL

### Installation

1. **Download Magic Lantern**
   ```bash
   git clone https://github.com/nonmodernist/magic-lantern.git
   cd magic-lantern
   ```

2. **No additional dependencies needed!** Magic Lantern uses only Node.js built-in modules.

3. **Prepare your film data** (see [Configuration](#configuration) below)

4. **Run your first search**
   ```bash
   node magic-lantern.js
   ```

## Configuration  

Magic Lantern can work with various film metadata formats:

### CSV Format (Recommended)
```csv
Title,Year,Director,Author
"Gone with the Wind",1939,"Victor Fleming","Margaret Mitchell"
"Giant",1956,"George Stevens","Edna Ferber"
```

### JSON Format
```json
[
  {
    "title": "Gone with the Wind",
    "year": 1939,
    "director": "Victor Fleming", 
    "author": "Margaret Mitchell"
  }
]
```

### Markdown/Zola Format
Magic Lantern can also read from markdown files with frontmatter (perfect for static site generators).

### Advanced Configuration

Create a `config.json` file to customize behavior:

```json
{
  "searchStrategies": ["title_author", "title_year", "title_director"],
  "publicationPriority": {
    "variety": 10,
    "motion picture herald": 9,
    "photoplay": 7
  },
  "dateRange": 3,
  "outputFormat": "chicago"
}
```

## Examples

### Academic Research Project
```bash
# Research 1950s melodramas
node magic-lantern.js --input melodramas.csv --date-range 5
```

### Dissertation Chapter
```bash
# Focus on specific publications
node magic-lantern.js --publications "variety,motion picture herald" 
```

### Quick Faculty Research
```bash
# Test with just a few films first
node magic-lantern.js --limit 5 --verbose
```

## API Reference

### Command Line Options
- `--input <file>` - Specify input file (default: films.csv)
- `--output <dir>` - Output directory (default: reports/)
- `--limit <num>` - Process only first N films (for testing)
- `--date-range <years>` - Search window around release date
- `--publications <list>` - Comma-separated publication filter
- `--verbose` - Detailed logging
- `--help` - Show all options

### File Formats

Magic Lantern exports to multiple formats:
- **HTML Dashboard** - Interactive research overview
- **JSON** - Raw data for further analysis  
- **CSV** - Spreadsheet-compatible results
- **BibTeX** - For citation managers
- **Chicago/MLA** - Formatted citations

## Troubleshooting

### Common Issues

**"No films found"**
- Check your CSV headers match expected format
- Ensure file path is correct
- Try `--verbose` flag for detailed logging

**"API rate limit exceeded"**  
- Magic Lantern automatically respects MHDL's 10-request/second limit
- For large datasets, expect longer run times

**"Empty search results"**
- Some films may have limited trade coverage
- Try broader date ranges with `--date-range 5`
- Check film title spelling against MHDL collection

### Getting Help

1. Check the [Issues page](https://github.com/nonmodernist/magic-lantern/issues)
2. Review the [examples directory](./examples/)
3. Contact the maintainer or file a new issue

## Contributing

Magic Lantern is open source and welcomes contributions from the film history community!

### Ways to Contribute
- 🐛 **Bug reports** - Found something broken?
- 💡 **Feature requests** - Need a new capability?
- 📚 **Documentation** - Help make the guides clearer
- 🔧 **Code contributions** - Add features or fix issues
- 🎓 **Usage examples** - Share your research workflows

### Development Setup
```bash
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern
# No build process needed - pure Node.js!
node magic-lantern.js --test
```

### Code Style
- Use clear, descriptive variable names
- Comment complex algorithms
- Follow existing patterns for consistency
- Add tests for new features

## Roadmap

**Version 2.0** (Planned)
- [ ] Zotero integration
- [ ] Custom publication weighting
- [ ] Batch export to multiple citation formats
- [ ] Integration with other digital archives

**Long-term**
- [ ] Machine learning for better relevance scoring
- [ ] OCR accuracy improvement suggestions
- [ ] Cross-archive search capabilities

## Credits

**Magic Lantern** was created by Alexandra Edwards as part of the [Hollywood Regionalism](https://hollywoodregionalism.com) digital humanities project.

**Powered by:**
- [Media History Digital Library](https://mediahistoryproject.org/) - Providing access to historical film publications
- [Lantern Search Platform](https://lantern.mediahist.org/) - MHDL's full-text search interface
- The film history research community

**Special thanks to:** MHDL staff for creating such an incredible resource for film historians.

## Citation

If Magic Lantern helps your research, please cite it:

```
Alexandra Edwards. Magic Lantern: Research Toolkit for Film Historians. 
Version 1.0. 2025. https://github.com/nonmodernist/magic-lantern
```

## License

MIT License - use it, modify it, share it!

See [LICENSE](LICENSE) for full details.

---

*"The magic lantern, the forerunner of the motion picture projector, used light and lenses to project images. Magic Lantern uses code and APIs to project research insights across decades of film history."*

---

## Quick Links

- 📖 [Full Documentation](./docs/)
- 🚀 [Getting Started Guide](./INSTALL.md)  
- 💡 [Usage Examples](./EXAMPLES.md)
- 🐛 [Report Issues](https://github.com/nonmodernist/magic-lantern/issues)
- 💬 [Discussions](https://github.com/nonmodernist/magic-lantern/discussions)
