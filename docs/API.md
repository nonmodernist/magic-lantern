# Magic Lantern API Reference

This document details how Magic Lantern integrates with the Media History Digital Library's Lantern API.

## API Endpoints

### Search Endpoint

`GET https://lantern.mediahist.org/catalog.json`

#### Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `keyword` | string | Primary search term | `"The Wizard of Oz"` |
| `second_keyword` | string | Additional search term | `"MGM"` |
| `third_keyword` | string | Third search term | `"production"` |
| `search_field` | string | Must be "advanced" for multi-keyword | `"advanced"` |
| `op` | string | Operator between keywords | `"AND"` |
| `sort` | string | Result ordering | `"score desc, dateStart desc"` |
| `per_page` | integer | Results per page (max 100) | `20` |
| `page` | integer | Page number for pagination | `1` |
| `f_inclusive[collection][]` | array | Collection filters | `["Hollywood Studio System"]` |
| `f_inclusive[format][]` | array | Format filters | `["Periodicals"]` |
| `range[year][begin]` | integer | Start year for date range | `1938` |
| `range[year][end]` | integer | End year for date range | `1940` |

#### Example Request

```
GET https://lantern.mediahist.org/catalog.json?
  keyword="The Wizard of Oz"&
  second_keyword="Judy Garland"&
  search_field=advanced&
  op=AND&
  sort=score desc, dateStart desc&
  per_page=20&
  f_inclusive[collection][]=Hollywood Studio System&
  f_inclusive[collection][]=Fan Magazines&
  f_inclusive[format][]=Periodicals&
  range[year][begin]=1938&
  range[year][end]=1940
```

#### Response Structure

```json
{
  "links": {
    "self": "http://lantern.mediahist.org/catalog.json?q=...",
    "next": "http://lantern.mediahist.org/catalog.json?page=2&q=...",
    "last": "http://lantern.mediahist.org/catalog.json?page=56661&q=..."
  },
  "meta": {
    "pages": {
      "current_page": 1,
      "next_page": 2,
      "prev_page": null,
      "total_pages": 283,
      "limit_value": 20,
      "offset_value": 0,
      "total_count": 5652,
      "first_page?": true,
      "last_page?": false
    }
  },
  "data": [
    {
      "id": "variety137-1940-01_0054",
      "type": "solr_document",
      "attributes": {
        "id": {
          "attributes": {
            "value": "<a href=\"catalog/variety137-1940-01_0054\">Details and Download Information</a>",
            "label": "Item Details"
          }
        },
        "read": {
          "attributes": {
            "value": "<a href=\"http://archive.org/stream/variety137-1940-01#page/n53/\">Read this page in Context</a>",
            "label": "Full Page"
          }
        },
        "body": {
          "attributes": {
            "value": "THE WIZARD OF OZ (MUSICAL) Excellent fantasy...",
            "label": "Excerpt"
          }
        }
      }
    }
  ]
}
```

### Full Text Endpoint

`GET https://lantern.mediahist.org/catalog/{item_id}/raw.json`

Retrieves complete page data including full OCR text.

#### Example Request

```
GET https://lantern.mediahist.org/catalog/variety137-1940-01_0054/raw.json
```

#### Response Structure

```json
{
  "iaPage": "variety137-1940-01_0054",
  "pageID": "5756750",
  "idWork": "variety137-1940-01",
  "title": "Variety",
  "year": 1940,
  "publisher": "Variety Publishing",
  "date": "1940-01-03",
  "dateString": "January 3, 1940",
  "yearStart": "1940-01-01T00:00:00Z",
  "yearEnd": "1940-12-31T23:59:59Z",
  "format": "Periodicals",
  "language": "eng",
  "sponsor": ["Library of Congress, Motion Picture, Broadcasting and Recorded Sound Division"],
  "contributor": "Library of Congress, MBRS, Recorded Sound Section",
  "idAccess": "http://archive.org/details/variety137-1940-01",
  "body": "[Full OCR text of the page - can be thousands of words]",
  "read": "http://archive.org/stream/variety137-1940-01#page/n53/",
  "location": "https://archive.org/download/variety137-1940-01",
  "hires": "https://archive.org/download/variety137-1940-01/page/leaf00054",
  "lowres": "https://archive.org/download/variety137-1940-01/page/leaf00054_s4",
  "description": [""],
  "leafNumber": "00054",
  "collection": ["Hollywood Studio System", "Feature Films"],
  "dbUpdateDate": "2022-04-07T11:19:31.414Z",
  "volume": ["Variety (Jan 1940)"],
  "subject": ["Motion pictures--Periodicals"],
  "id": "variety137-1940-01_0054",
  "_version_": 1733859380350156803,
  "coordinator": "Media History Digital Library"
}
```

## API Integration in Magic Lantern

### Rate Limiting

Magic Lantern respects MHDL's rate limits:
- 200ms delay between all API calls
- Approximately 5 requests per second maximum
- Configurable in `config/search.config.js`

```javascript
api: {
  baseUrl: 'https://lantern.mediahist.org',
  rateLimitMs: 200,
  maxResultsPerPage: 20
}
```

### Search Strategy

1. **Keyword Stacking**: Up to 3 keywords per search
2. **AND Operator**: All keywords must appear
3. **Date Filtering**: Based on confidence level
4. **Collection Filtering**: Multiple collections searched
5. **Format Filtering**: "Periodicals" for trade papers

### Error Handling

Magic Lantern handles API errors gracefully:
- Network timeouts: Skip and continue
- Invalid responses: Log and move on
- Rate limit errors: Automatic retry with backoff
- No results: Normal, continues with next strategy

### Collections

Available MHDL collections:
- Hollywood Studio System
- Early Cinema
- Fan Magazines
- Broadcasting & Recorded Sound
- Theatre and Vaudeville
- Advertising
- Animation
- Annuals
- Books
- Cinema Technology

### Common Item ID Patterns

Understanding Lantern item IDs helps with debugging:

```
variety137-1940-01_0054
│       │    │    │  └─ Page number
│       │    │    └─ Issue indicator
│       │    └─ Year and month
│       └─ Volume number
└─ Publication name

Other patterns:
motionpictureher21unse_0123  (Motion Picture Herald)
photoplay11chic_0456          (Photoplay Chicago)
boxoffice25kans_0789          (BoxOffice Kansas)
```

## Search Implementation

### Query Building

Magic Lantern converts search strategies to API parameters:

```javascript
// Strategy object
{
  query: '"The Wizard of Oz" "box office"',
  type: 'title_box_office',
  confidence: 'medium'
}

// Becomes API parameters
{
  keyword: '"The Wizard of Oz"',
  second_keyword: '"box office"',
  search_field: 'advanced',
  op: 'AND'
}
```

### Date Range Filtering

Based on strategy confidence:

```javascript
// High confidence: ±1 year
range[year][begin] = 1938  // For 1939 film
range[year][end] = 1940

// Medium confidence: ±2 years
range[year][begin] = 1937
range[year][end] = 1941

// Low confidence: ±3 years
range[year][begin] = 1936
range[year][end] = 1942
```

### Pagination Handling

Magic Lantern currently fetches only the first page of results:
- Default: 20 results per search
- Maximum: 100 results per search (API limit)
- Future enhancement: Follow pagination for exhaustive searches

## Best Practices

### 1. Respect Rate Limits

Always include delays between requests:
```javascript
await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
```

### 2. Handle Network Errors

```javascript
try {
  const results = await this.makeRequest(url);
  // Process results
} catch (error) {
  console.log(`❌ Search failed: ${error.message}`);
  // Continue with next search
}
```

### 3. Validate Responses

Check for expected structure:
```javascript
if (response.data && Array.isArray(response.data)) {
  // Process results
} else {
  console.warn('Unexpected response structure');
}
```

### 4. Use Meaningful User Agent

While not currently implemented, consider adding:
```javascript
headers: {
  'User-Agent': 'Magic-Lantern/5.0 (Research-Tool)'
}
```

## API Limitations

1. **Search Complexity**: No nested boolean queries (OR within AND)
2. **Result Limit**: Maximum 100 results per page
3. **Date Precision**: Year-level only, not month/day
4. **Full Text**: Separate request required for each page
5. **Collections**: Must match exact collection names

## Debugging API Calls

### Enable Request Logging

```javascript
console.log('🔍 API Request:', url);
console.log('📊 Response Meta:', response.meta);
```

### Save Raw Responses

```javascript
fs.writeFileSync(
  `debug/api_${Date.now()}.json`,
  JSON.stringify(response, null, 2)
);
```

### Test Specific Queries

Use curl to test API directly:
```bash
curl "https://lantern.mediahist.org/catalog.json?keyword=%22The%20Wizard%20of%20Oz%22&per_page=5"
```

## Future API Enhancements

Potential improvements for Magic Lantern:

1. **Pagination Support**: Fetch all pages of results
2. **Parallel Requests**: Multiple searches simultaneously
3. **Caching**: Store results to avoid duplicate API calls
4. **Retry Logic**: Automatic retry with exponential backoff
5. **Request Queuing**: Better rate limit management

## MHDL Guidelines

Per Media History Digital Library:
- Limit requests to 10/second (Magic Lantern uses ~5/second)
- For intensive research, contact: mhdl@commarts.wisc.edu
- Respect copyright in using materials
- Credit MHDL in publications

## Related Documentation

- [Search Strategies](./SEARCH-STRATEGIES.md) - How queries are generated
- [Technical Documentation](./TECHNICAL.md) - Implementation details
- [Troubleshooting](./TROUBLESHOOTING.md) - Common API issues