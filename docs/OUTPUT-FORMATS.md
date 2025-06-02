# Output Format Documentation

## File: comprehensive-search-results.json
All search results with metadata:
```json
{
  "film": { /* film metadata */ },
  "totalUniqueSources": 45,
  "searchStrategySummary": {
    "exact_title": 12,
    "author_title": 8,
    // ... strategy counts
  },
  "sources": [
    {
      "id": "variety_12345",
      "foundBy": "exact_title",
      "scoring": {
        "finalScore": 95.5,
        "publication": "variety"
      }
    }
  ]
}
```

## File: full-text-results.json
Top scored results with full text:
```json{
  "film": { /* film metadata */ },
  "treasures": [
    {
      "id": "variety_12345",
      "fullText": "Complete OCR text...",
      "contentTypes": ["review", "box_office"],
      "hasPhoto": true,
      "finalScore": 95.5
    }
  ]
}
```