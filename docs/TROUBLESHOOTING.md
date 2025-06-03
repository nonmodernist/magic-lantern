# Troubleshooting Guide

This guide helps you resolve common issues with Magic Lantern.

## Common Issues

### "File not found: films.csv"

**Error:**
```
❌ File not found: films.csv
```

**Solutions:**

1. Check file location:
```bash
ls *.csv
# Make sure your CSV is in the current directory
```

2. Provide full path:
```bash
node magic-lantern-v5.js /full/path/to/films.csv
```

3. Check file extension (must be .csv):
```bash
# Wrong
node magic-lantern-v5.js films.txt

# Right  
node magic-lantern-v5.js films.csv
```

### No Results for a Film

**Symptom:** 
```
Total unique results: 0
```

**Common Causes & Solutions:**

1. **Title mismatch with historical usage:**
```csv
# Your CSV has:
"The Keeper of the Bees",1947

# But historical sources used:
"Keeper of the Bees",1947
```

2. **Wrong or missing year:**
```csv
# Check release year - can vary by source
"The Grapes of Wrath",1940  # Not 1939
```

3. **Limited trade coverage:**
- Some films had minimal trade paper coverage
- Try wider date ranges:
```javascript
// In your profile
dateRanges: {
    high: { before: 2, after: 2 },    // Wider
    medium: { before: 3, after: 3 },
    low: { before: 5, after: 5 }
}
```

4. **Author name variations:**
```csv
# Try different forms
"Gene Stratton-Porter" vs "Gene Stratton Porter"
"Fannie Hurst" vs "Fanny Hurst"
```

### Profile Not Loading

**Error:**
```
⚠️  Profile "my-profile" not found, using default
```

**Solutions:**

1. Check filename:
```bash
ls config/profiles/
# Must end with .profile.js
# my-research.profile.js ✓
# my-research.js ✗
```

2. Verify export:
```javascript
// Must have module.exports
module.exports = {
    name: "My Profile",
    // ...
}
```

3. Check for syntax errors:
```bash
node -c config/profiles/my-research.profile.js
# Should output nothing if valid
```

### API Connection Issues

**Error:**
```
❌ Search failed: Network timeout
```

**Solutions:**

1. Test API connection:
```bash
node magic-lantern-v5.js --test-api
```

2. Check internet connection:
```bash
curl https://lantern.mediahist.org
```

3. Temporary MHDL outage:
- Wait and retry
- Check MHDL website for updates

### Scoring Issues

**Symptom:** Results not ranking as expected

**Debug Steps:**

1. Check if publication was identified:
```json
// In results JSON
"scoring": {
    "publication": "unknown"  // Problem!
}
```

2. Add publication pattern:
```javascript
// config/profiles/base-patterns.js
'my_publication': /mypub|my_pub/,
```

3. Verify weights in profile:
```javascript
publications: {
    weights: {
        "my_publication": 1.5  // Must match pattern name
    }
}
```

### Memory Issues with Large Corpus

**Error:**
```
FATAL ERROR: JavaScript heap out of memory
```

**Solutions:**

1. Increase Node memory:
```bash
node --max-old-space-size=4096 magic-lantern-v5.js films.csv --corpus=full
```

2. Process in smaller batches:
```bash
# Split your CSV
head -50 films.csv > films-batch1.csv
tail -50 films.csv > films-batch2.csv
```

3. Use medium corpus setting:
```bash
node magic-lantern-v5.js films.csv --corpus=medium
```

### Rate Limiting Issues

**Symptom:** Searches timeout or return errors

**Solutions:**

1. Increase delay between requests:
```javascript
// config/search.config.js
api: {
    rateLimitMs: 500  // Increase from 200
}
```

2. Reduce concurrent searches:
```javascript
// Modify stop conditions
stopConditions: {
    maxResultsPerFilm: 30  // Reduce from 50
}
```

## Debugging Techniques

### Enable Verbose Logging

Add debug statements to track execution:

```javascript
// At the start of searchWithStrategy()
console.log('🔍 DEBUG: Full search URL:', url);

// After receiving results
console.log('🔍 DEBUG: Results received:', {
    count: results.meta?.pages?.total_count,
    firstResult: results.data?.[0]?.id
});
```

### Save Raw API Responses

```javascript
// In makeRequest() method
const response = await this.makeRequest(url);

// Save for debugging
fs.writeFileSync(
    `debug_${Date.now()}.json`,
    JSON.stringify(response, null, 2)
);
```

### Test Single Film

Create a test CSV with just one problematic film:

```csv
title,year,author,director,studio
"Problem Film",1935,"Author Name","Director","Studio"
```

Run with maximum verbosity:
```bash
node magic-lantern-v5.js test-film.csv --corpus=single
```

### Inspect Strategy Generation

```javascript
// In generateAllStrategies()
const strategies = [
    ...this.titleVariations(film),
    // etc.
];

console.log('📋 All strategies:', strategies.map(s => ({
    type: s.type,
    query: s.query,
    weight: s.profileWeight || 1.0
})));
```

## Performance Issues

### Searches Taking Too Long

**Optimize by:**

1. Limiting strategies:
```javascript
// In profile
searchStrategies: {
    weights: {
        // Only essential searches
        'exact_title': 1.0,
        'author_title': 1.0,
        // Set others to 0
    }
}
```

2. Reducing results per film:
```javascript
stopConditions: {
    maxResultsPerFilm: 25,  // Lower limit
    highQualityThreshold: 10
}
```

3. Limiting full text fetches:
```javascript
// In corpus settings
fullTextFetches: 3  // Reduce from 7
```

### Browser/Terminal Hanging

Large outputs can overwhelm terminals:

1. Redirect output:
```bash
node magic-lantern-v5.js films.csv > output.log 2>&1
```

2. Reduce console logging:
```javascript
// Comment out progress logs
// console.log(`Progress: ${i}/${total}`);
```

## CSV Format Issues

### Common CSV Problems

1. **Missing headers:**
```csv
# Wrong - no headers
"The Wizard of Oz",1939,"L. Frank Baum"

# Right - headers required
title,year,author
"The Wizard of Oz",1939,"L. Frank Baum"
```

2. **Inconsistent quotes:**
```csv
# Be consistent
"The Wizard of Oz",1939  # Quoted title
The Maltese Falcon,1941   # Unquoted title
```

3. **Special characters:**
```csv
# Escape quotes in titles
"The Shop Around the Corner",1940  # Good
"The "Shop" Around the Corner",1940  # Bad
"The ""Shop"" Around the Corner",1940  # Good (escaped)
```

4. **Extra columns:**
```csv
# All rows must have same number of columns
title,year,author,director,studio
"Film 1",1940,"Author",,  # Two empty columns OK
"Film 2",1941  # Wrong - missing columns
```

## Profile-Specific Issues

### Weights Not Applied

**Check profile loading:**
```javascript
// Add to top of run() method
console.log('Profile loaded:', this.config.profileInfo);
console.log('Publication weights:', this.config.scoring.publications.weights);
```

### Strategies Not Running

**Verify strategy weights:**
```javascript
// Check for weight = 0
searchStrategies: {
    weights: {
        'author_title': 0  // This won't run!
    }
}
```

### Wrong Date Ranges

**Debug date filtering:**
```javascript
// In searchWithStrategy()
console.log(`Date range: ${year - range.before} to ${year + range.after}`);
```

## Getting Help

### Before Asking for Help

1. Check error messages carefully
2. Try with a single film first
3. Test with default profile
4. Verify CSV format
5. Check API with `--test-api`

### Information to Provide

When reporting issues, include:

1. **Command used:**
```bash
node magic-lantern-v5.js films.csv --corpus=medium --profile=custom
```

2. **Error message:**
```
Full error output
```

3. **Sample of your CSV:**
```csv
First few lines of your films.csv
```

4. **Profile (if custom):**
```javascript
Key parts of your profile
```

5. **Node version:**
```bash
node --version
```

### Where to Get Help

- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions

## Quick Fixes Checklist

- [ ] CSV file exists and is properly formatted
- [ ] Film titles match historical usage
- [ ] Years are correct (check multiple sources)
- [ ] Profile file ends with `.profile.js`
- [ ] Profile exports with `module.exports = {}`
- [ ] Base patterns included in profile
- [ ] Publication patterns match weight keys
- [ ] No conflicting strategy settings
- [ ] Reasonable weight values (0.5-2.0 range)
- [ ] Internet connection working
- [ ] MHDL/Lantern accessible

## Still Stuck?

Try the minimal test:

```bash
# Create test.csv with known good film
echo 'title,year\n"Variety",1940' > test.csv

# Run with defaults
node magic-lantern-v5.js test.csv

# Should find results for Variety publication
```

If this doesn't work, there may be an installation or connection issue.