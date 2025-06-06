# Magic Lantern Results Reprocessor

The `reprocess-results.js` script allows you to reprocess existing Magic Lantern JSON results with updated Content Type Enhancer patterns without running a full search. This is useful for applying improved content analysis to previously collected data.

## Quick Start

```bash
# Show help
node reprocess-results.js --help

# Reprocess full-text results (auto-generates output filename)
node reprocess-results.js results/full-text-results_20250606_002042.json

# Reprocess treasures file with custom output
node reprocess-results.js results/treasures_20250606_002042.json --output enhanced-treasures.json

# Show statistics only (no file output)
node reprocess-results.js results/full-text-results_20250606_002042.json --stats-only
```

## What It Does

1. **Reads existing results**: Works with both `full-text-results_*.json` and `treasures_*.json` files
2. **Applies updated Content Type Enhancer**: Uses the latest content analysis patterns and algorithms
3. **Generates before/after statistics**: Shows improvements in content scoring, treasure identification, and content type detection
4. **Saves enhanced results**: Preserves original file structure with enhanced analysis data

## Output Files

When reprocessing (not in `--stats-only` mode), the script creates:

- **Enhanced results file**: Original filename with `_reprocessed_TIMESTAMP.json` suffix
- **Statistics file**: Same name with `_stats.json` suffix containing detailed before/after comparison

## Key Improvements You'll See

The updated Content Type Enhancer typically provides:

- **Better treasure identification**: More accurate detection of high-value content
- **Improved content scoring**: Better numerical assessment of content value
- **Enhanced content types**: More precise categorization (review, production, interview, etc.)
- **Richer metadata**: Additional themes, entities, and significance indicators

## Command Options

| Option | Description |
|--------|-------------|
| `--output, -o <file>` | Custom output file path |
| `--config <json>` | Content enhancer configuration as JSON string |
| `--stats-only` | Show statistics without saving reprocessed results |
| `--verbose, -v` | Show detailed processing information |
| `--help, -h` | Display help information |

## Configuration Examples

```bash
# Use medium confidence threshold and disable evidence collection
node reprocess-results.js results.json --config '{"minConfidence":"medium","includeEvidence":false}'

# Enable enhanced excerpts with high confidence threshold
node reprocess-results.js results.json --config '{"enhanceExcerpts":true,"minConfidence":"high"}'
```

## Supported Input Formats

- **full-text-results files**: Standard Magic Lantern output with full text analysis
- **treasures files**: Treasure-only exports from Magic Lantern searches
- **Any Magic Lantern JSON**: Files following the expected result structure

## Example Output

```
📊 REPROCESSING STATISTICS
==================================================

🔄 Processing Summary:
   Original results: 25
   Reprocessed: 25

📈 Content Analysis Comparison:
   Results with content analysis:
     Before: 25/25 (100%)
     After:  25/25 (100%)

   Average content score:
     Before: 4.9
     After:  8.0

   Treasures identified:
     Before: 1
     After:  25

📚 Content Type Distribution (After):
   production: 11 (44%)
   review: 6 (24%)
   photo: 4 (16%)
   mention: 3 (12%)
   industry_news: 1 (4%)
```

## When to Use This Tool

- **After updating Magic Lantern**: Apply new content analysis patterns to old results
- **Research validation**: Compare different analysis approaches on the same data
- **Data enhancement**: Improve existing research datasets without re-searching
- **Performance testing**: Evaluate Content Type Enhancer improvements

## Technical Notes

- The script preserves all original metadata and structure
- Processing is done entirely locally (no API calls)
- Enhanced results maintain compatibility with Magic Lantern reporting tools
- The script handles errors gracefully and reports any processing issues

## Integration with Magic Lantern Workflow

The reprocessed results can be used with other Magic Lantern tools:

```bash
# Generate reports from reprocessed results
node magic-lantern-v5.js --report-only enhanced-results.json

# Compare different enhancement approaches
node reprocess-results.js old-results.json --config '{"minConfidence":"low"}' --output low-confidence.json
node reprocess-results.js old-results.json --config '{"minConfidence":"high"}' --output high-confidence.json
```

This tool is particularly valuable for researchers who want to apply the latest Magic Lantern improvements to their existing research datasets without the time and computational cost of re-running full searches.