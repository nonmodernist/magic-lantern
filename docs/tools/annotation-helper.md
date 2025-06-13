# Annotation Helper

Add structured annotations to your Magic Lantern search results, creating a single source of truth for your research findings.

## Overview

The Annotation Helper lets you add typed, structured annotations to specific sources in your search results. This transforms your JSON results into a research database where you can track production dates, locations, labor incidents, and any other findings.

## Why Use This Tool?

- **Structured data**: Annotations follow schemas with required/optional fields
- **Research database**: Transform search results into queryable research data
- **Export capabilities**: Export all annotations to CSV for analysis
- **Validation**: Ensures consistent data entry across your research
- **Single source of truth**: All findings stay connected to their sources

## Basic Usage

```bash
# Interactive mode (recommended for starting)
node tools/annotation-helper.js results/search-results_20240615_143022.json --interactive

# View annotation statistics
node tools/annotation-helper.js results/search-results_20240615_143022.json --stats

# Export annotations to CSV
node tools/annotation-helper.js results/search-results_20240615_143022.json --export annotations.csv
```

## Annotation Types

### Production Dates
Track specific dates in film production:
- **Required**: date, dateType, excerpt
- **Optional**: confidence, pageContext, tags
- **Date Types**: filming_start, filming_end, production_start, wrap, reshoot, location_shoot, studio_shoot, other

### Locations
Document where films were made:
- **Required**: location, locationType, excerpt
- **Optional**: specificArea, dateReference, coordinates
- **Location Types**: studio, backlot, on_location, city, country, indoor_set, outdoor_set, other

### People
Track cast and crew mentions:
- **Required**: name, role, excerpt
- **Optional**: note, date, department
- **Roles**: director, actor, producer, writer, cinematographer, editor, composer, production_designer, costume_designer, crew, executive, other

### Labor
Document labor history:
- **Required**: type, excerpt
- **Optional**: interpretation, date, participants, outcome
- **Types**: strike, working_conditions, wages, hours, union_action, safety_incident, labor_dispute, contract_negotiation, other

### Technical
Film technology and processes:
- **Required**: aspect, excerpt
- **Optional**: issue, impact, resolution, date
- **Aspects**: cinematography, sound, color, special_effects, editing, equipment, process, innovation, other

### General
Catch-all for other findings:
- **Required**: category, note, excerpt
- **Optional**: significance, date, relatedTo
- **Categories**: budget, schedule, reception, censorship, marketing, distribution, accident, trivia, other

## Interactive Mode

The recommended way to add annotations:

```bash
node tools/annotation-helper.js results/search-results_20240615_143022.json --interactive
```

Steps:
1. **Select film** from your results
2. **Browse sources** with excerpts and scores
3. **Choose source** to annotate
4. **Pick annotation type**
5. **Fill required fields** (with hints for valid options)
6. **Add optional fields** as needed
7. **Save** immediately or continue adding

## Programmatic Mode

Add annotations via command line:

```bash
node tools/annotation-helper.js results/search-results_20240615_143022.json --add \
  --film "The Wizard of Oz" \
  --source "variety137-1940-01_0054" \
  --type "productionDates" \
  --date "1939-03-15" \
  --dateType "filming_start" \
  --excerpt "Principal photography commenced yesterday" \
  --confidence "explicit"
```

## Batch Import

Import annotations from CSV:

```bash
node tools/annotation-helper.js results/search-results_20240615_143022.json --batch annotations.csv
```

CSV format:
```csv
film_title,source_id,annotation_type,date,dateType,excerpt,confidence
"The Wizard of Oz",variety137-1940-01_0054,productionDates,1939-03-15,filming_start,"Principal photography commenced",explicit
```

## Viewing Annotations

### Statistics
See annotation summary:
```bash
node tools/annotation-helper.js results/search-results_20240615_143022.json --stats
```

Shows:
- Total annotations by type
- Annotations per film
- Coverage statistics

### In JSON
Annotations appear nested in sources:
```json
{
  "id": "variety137-1940-01_0054",
  "annotations": {
    "productionDates": [
      {
        "date": "1939-03-15",
        "dateType": "filming_start",
        "excerpt": "Principal photography commenced yesterday",
        "confidence": "explicit",
        "addedAt": "2024-06-15T10:30:00.000Z"
      }
    ],
    "locations": [
      {
        "location": "MGM Studios",
        "locationType": "studio",
        "excerpt": "shooting on the Culver City lot"
      }
    ]
  }
}
```

## Export Options

Export all annotations to CSV for analysis:

```bash
node tools/annotation-helper.js results/search-results_20240615_143022.json --export my-annotations.csv
```

The CSV includes:
- Film information (title, year)
- Source information (ID, publication)
- All annotation fields
- Metadata (when added)

## Research Workflows

### Workflow 1: Production History
```bash
# 1. Search for production-related terms
node core/magic-lantern-v5.js films.csv --profile=production-history

# 2. Fetch promising sources
node tools/fetch-full-text.js results/search-results_[timestamp].json --top=200

# 3. Read and annotate production dates
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
# Select: productionDates, locations, technical

# 4. Export for timeline analysis
node tools/annotation-helper.js results/search-results_[timestamp].json --export production-timeline.csv
```

### Workflow 2: Labor History
```bash
# 1. Run labor-focused search
node core/magic-lantern-v5.js films.csv --profile=labor-history

# 2. Fetch texts mentioning strikes/unions
node tools/fetch-full-text.js results/search-results_[timestamp].json --strategy="title_strike"

# 3. Annotate labor incidents
node tools/annotation-helper.js results/search-results_[timestamp].json --interactive
# Focus on: labor type annotations

# 4. Export for analysis
node tools/annotation-helper.js results/search-results_[timestamp].json --export labor-incidents.csv
```

## Best Practices

1. **Always include excerpt**: Copy the exact relevant text
2. **Be consistent**: Use the same date formats (YYYY-MM-DD recommended)
3. **Use controlled vocabulary**: Stick to the predefined types when possible
4. **Add context**: Use optional fields to clarify ambiguous information
5. **Regular exports**: Export to CSV periodically as backup

## Tips

- Start with high-scoring sources that have full text
- Use the stats view to track annotation progress
- Export regularly to analyze patterns across films
- Consider creating annotation guidelines for consistency
- The excerpt field is searchable - include key phrases

## Integration with Other Tools

The annotated JSON file remains compatible with all Magic Lantern tools:
- Fetch more full text without losing annotations
- Run additional searches and merge results
- Filter and analyze annotated sources