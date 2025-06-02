# Legacy Lantern Tools

This directory contains the original research tools that inspired Magic Lantern. These were developed for a specific film history research project on Hollywood adaptations of regional literature.

## ⚠️ Important Note

These tools are preserved for reference but are **not recommended for new projects**. Use the main Magic Lantern CLI instead, which provides:
- Flexible configuration for any research domain
- Support for multiple data formats
- Better error handling and user experience

## Legacy Tools Overview

### Search Tools
- `lantern-tool-v3.js` - Original author-focused search strategy
- `lantern-tool-v3.1.js` - Improved publication matching
- `lantern-tool-v4.js` - Title-focused search strategy
- `lantern-tool-v4.5.js` - Hybrid approach combining v3 and v4

### Analysis Tools
- `lantern-report-generator.js` - Creates detailed research reports
- `lantern-research-dashboard.js` - HTML dashboard showing research progress
- `add-to-bibliography.js` - Interactive tool for managing bibliography.toml

## Original Use Case

These tools were designed specifically for:
- Film data stored in Zola static site format
- Research on literary adaptations in Hollywood
- Output to TOML bibliography format
- Specific scoring algorithms for film research

## Migration Guide

To adapt your existing workflow to Magic Lantern:

1. Run `magic-lantern setup` and choose "author-focused" strategy
2. Point to your `content/films/` directory as input
3. Map your frontmatter fields during setup
4. Your existing markdown files will work without modification!

## Features to Potentially Port

Some features from these tools that might be added to Magic Lantern:
- [ ] HTML dashboard generation
- [ ] Bibliography format export
- [ ] Batch review interface
- [ ] Advanced deduplication

If you need any of these features, please open an issue!