# Quick Start Guide

Get your first Magic Lantern search running in 5 minutes! 🚀

## Prerequisites

- Node.js installed (v14 or higher)
- A CSV file with film data

## Step 1: Get Magic Lantern

```bash
git clone https://github.com/nonmodernist/magic-lantern.git
cd magic-lantern
```

No `npm install` needed - Magic Lantern uses only Node.js built-in modules! 🎉

## Step 2: Create Your Film Data

Create a file called `films.csv` with your films:

```csv
title,year,author,director,studio
"The Wizard of Oz",1939,"L. Frank Baum","Victor Fleming","Metro-Goldwyn-Mayer"
"Little Women",1933,"Louisa May Alcott","George Cukor","RKO Pictures"
```

**Required fields:**
- `title` - Film title
- `year` - Release year

**Optional but recommended:**
- `author` - For literary adaptations
- `director` - Helps with production searches
- `studio` - Enables studio-specific searches

## Step 3: Run Your First Search

For a quick test with just one film:

```bash
node magic-lantern-v5.js films.csv
```

This uses the default `test` corpus profile (1 film, limited searches).

## Step 4: Check Your Results

Look in the `results/` directory for two JSON files:

1. **comprehensive-search-results_[timestamp].json**
   - All search results with metadata
   - Shows which search strategies found what
   - Includes scoring information

2. **full-text-results_[timestamp].json**
   - Full OCR text of top-scored results
   - Ready for close reading and analysis
   - Includes publication metadata

## Example Output

Here's what you'll see in the console:

```
✨ MAGIC LANTERN v5
   Corpus: test
   Research Profile: default

🎬 Loading films from: films.csv
✨ Found 2 films to research!

🎬 Processing 1 films...

======================================================================
🎭 COMPREHENSIVE SEARCH: The Wizard of Oz (1939)
======================================================================

🎯 Generating search strategies for: The Wizard of Oz
✨ Generated 25 unique search strategies!

🔍 Beginning searches...

🔍 [MEDIUM] Exact title match
   Keywords: "The Wizard of Oz"
   ✅ Found 523 results!

🔍 [HIGH] Title without "The"
   Keywords: "Wizard of Oz"
   ✅ Found 489 results!

[... more searches ...]

📊 Scoring and ranking results...

🏆 Top 5 scored results:
1. [Score: 95.5] variety
   Position: 1 (100) × Publication: 1.0
2. [Score: 90.0] motion picture herald
   Position: 2 (95) × Publication: 1.0
```

## Next Steps

### Try Different Corpus Sizes

```bash
# Deep dive into one film
node magic-lantern-v5.js films.csv --corpus=single

# Process 20 films
node magic-lantern-v5.js films.csv --corpus=medium

# Process all films (can take hours!)
node magic-lantern-v5.js films.csv --corpus=full
```

### Try Different Research Profiles

```bash
# For literary adaptation research
node magic-lantern-v5.js films.csv --profile=adaptation-studies

# For labor history research
node magic-lantern-v5.js films.csv --profile=labor-history

# For early cinema (1905-1920)
node magic-lantern-v5.js films.csv --profile=early-cinema
```

### List Available Profiles

```bash
node magic-lantern-v5.js --list-profiles
```

### Combine Options

```bash
# Medium corpus with adaptation focus
node magic-lantern-v5.js films.csv --corpus=medium --profile=adaptation-studies
```

## Tips for Success

1. **Start small**: Use `--corpus=test` to verify your setup
2. **Check your data**: Ensure film titles match historical usage
3. **Be patient**: Full corpus searches can take hours but save days of manual work
4. **Review profiles**: Different profiles dramatically change what's found
5. **Save results**: The timestamped files preserve your research

## Common Issues

**"File not found: films.csv"**
- Make sure your CSV file is in the same directory
- Or provide the full path: `node magic-lantern-v5.js /path/to/films.csv`

**No results for a film**
- Check if the title matches historical usage (e.g., "Keeper of the Bees" not "The Keeper of the Bees")
- Try a different year (release dates can vary by source)
- Some films have limited trade paper coverage

## What's Next?

- Learn about [Research Profiles](./PROFILES.md) to focus your searches
- Understand [Search Strategies](./SEARCH-STRATEGIES.md) to see how queries are generated
- Explore [Analyzing Results](./ANALYZING-RESULTS.md) to work with the JSON output
- Create [Custom Profiles](./CUSTOM-PROFILES.md) for your specific research needs