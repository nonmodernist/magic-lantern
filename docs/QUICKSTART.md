# Getting Started Guide

Get your first Magic Lantern search running in 5 minutes! 🚀

## Prerequisites

- Install [Node.js](https://nodejs.org/en) (v18 or higher)

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
[...more films...]
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
node core/magic-lantern-v5.js films.csv
```

This uses the default `test` corpus profile (1 film, limited searches).

### Example Output

<details><summary>Here's what you'll see in the console after running your search:</summary>

```
✨ MAGIC LANTERN v5.1.0

📚 Research Profile: Default
   Standard Magic Lantern configuration
📊 Corpus Profile: test

🏮 Checking Lantern availability...
✅ Lantern is available!

🎬 Loading films from: films.csv
✨ Found 2 films to research!

🎬 Processing 1 films...

======================================================================
🎭 COMPREHENSIVE SEARCH: The Wizard of Oz (1939)
======================================================================

🎯 Generating search strategies for: The Wizard of Oz
✨ Generated 25 unique search strategies!

🔍 Beginning searches...

🔍 [HIGH] Exact title match
   Weight: 1.0 | Type: exact_title
   Keywords: "The Wizard of Oz"
   ✅ Found 523 results!

🔍 [HIGH] Title without "The"
   Weight: 1.0 | Type: title_no_article
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

</details>

## Step 4: Check Your Results

Look in the `results/` directory for your JSON file:

**search-results_[timestamp].json**
- All search results with metadata
- Shows which search strategies found what
- Includes scoring information
- Ready for full text fetching


## Step 5: Fetch Full Text (Optional)

<details><summary>Get complete OCR text for your best sources:</summary>

```bash
# Fetch top 20 results
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=20

# Or use interactive mode to choose specific sources
node tools/fetch-full-text.js results/search-results_[timestamp].json --interactive
```

</details>

## Step 6: Clean OCR (Optional)

<details><summary>Clean up the OCR of the full text you fetched:</summary>

```bash
# Remove extra spaces and common OCR errors
node tools/clean-ocr.js results/search-results_[timestamp]_with_fulltext_[timestamp].json
```

</details>

---

## Next Steps

### Try Different Corpus Sizes

```bash
# Deep dive into the first film in your csv
node core/magic-lantern-v5.js films.csv --corpus=single

# Process the first 20 films in your csv
node core/magic-lantern-v5.js films.csv --corpus=medium

# Process all films (can take hours!)
node core/magic-lantern-v5.js films.csv --corpus=full
```

### Try Different Research Profiles

```bash
# For literary adaptation research
node core/magic-lantern-v5.js films.csv --profile=adaptation-studies

# For labor history research
node core/magic-lantern-v5.js films.csv --profile=labor-history

# For early cinema (1905-1920)
node core/magic-lantern-v5.js films.csv --profile=early-cinema
```

### List Available Profiles

```bash
node core/magic-lantern-v5.js --list-profiles
```

<details><summary>Sample console output:</summary>

```bash
🔎 Available Research Profiles:

  adaptation-studies:
    Emphasizes author attribution and source materials

  default:
    Standard Magic Lantern configuration

[...more profiles...]
```

</details>


### Try Context-Aware Scoring (Experimental)

```bash
# Use diversity-focused scoring algorithm
node core/magic-lantern-v5.js films.csv --context-aware
```

<details><summary>Sample console output after running a search:</summary>
   
```bash
🔬 Using context-aware scoring algorithm...
📊 Context-aware scoring with limited excerpt data...

🏆 Top 5 results (Context-Aware Scoring):
1. [71.3] motion picture daily via title_review
   Credibility: 50 | Precision: 55 | Diversity: 100 | Relevance: 100
2. [68.5] photoplay via title_review
   Credibility: 50 | Precision: 55 | Diversity: 90 | Relevance: 99
3. [66.1] harrisons reports via title_review
   Credibility: 50 | Precision: 55 | Diversity: 81 | Relevance: 97
4. [63.8] hollywood filmograph via title_review
   Credibility: 50 | Precision: 55 | Diversity: 73 | Relevance: 96
5. [61.8] the motion picture and the family via title_review
   Credibility: 50 | Precision: 55 | Diversity: 66 | Relevance: 94

📈 Top 10 Diversity: 9 publications, 4 search strategies
```

</details>

---

## Complete Research Workflow

```bash
# 1. Run search
node core/magic-lantern-v5.js films.csv --corpus=medium --profile=adaptation-studies

# 2. Fetch full text for top results
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=100

# 3. Clean up fetched full text
node tools/clean-ocr.js results/search-results_[timestamp]_with_fulltext_[timestamp].json

# 4. Add annotations as you read
node tools/annotation-helper.js results/search-results_[timestamp]_with_fulltext_[timestamp]_cleaned.json --interactive

# 5. Export annotations for analysis
node tools/annotation-helper.js results/search-results_[timestamp]_with_fulltext_[timestamp]_cleaned.json --export findings.csv
```

---

## Tips for Success

1. **Start small**: Use `--corpus=test` to verify your setup
2. **Check your data**: Ensure film titles match historical usage
3. **Be patient**: Full corpus searches can take hours but save days of manual work
4. **Review profiles**: Different profiles dramatically change what's found
5. **Save results**: The timestamped files preserve your research
6. **Fetch selectively**: Use score thresholds or interactive mode for full text
7. **Annotate findings**: Build a research database as you work

## Common Issues

**"File not found: films.csv"**
- Make sure your CSV file is in the correct location
- Or provide the full path: `node core/magic-lantern-v5.js /path/to/films.csv`

**No results for a film**
- Check if the title matches historical usage (e.g., "Keeper of the Bees" not "The Keeper of the Bees")
- Try a different year (release dates can vary by source)
- Some films have limited trade paper coverage

**"Lantern appears to be down"**
- Check if https://lantern.mediahist.org/ loads in your browser
- Check your internet connection
- Try again later - the site may be temporarily down

## What's Next?

- Learn about [Research Profiles](./RESEARCH-PROFILES.md) to focus your searches
- Understand [Search Strategies](./SEARCH-STRATEGIES.md) to see how queries are generated
- Use the [Full Text Fetcher](./tools/fetch-full-text.md) for selective retrieval of page text
- Explore the [Annotation Helper](./tools/annotation-helper.md) to structure your findings
- Create [Custom Profiles](./CUSTOM-PROFILES.md) for your specific research needs
