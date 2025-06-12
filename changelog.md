## [5.1.0] - 2025-06-11

### Changed
- Added user-initiated full-text fetching
- Added CLI annotation helper
- Added experimental context-aware scoring
- Updated docs to reflect changes


## [5.0.2] - 2025-06-09

### Changed
- Removed automatic full text fetching during search to improve performance and flexibility
- Consolidated results into single `search-results_[timestamp].json` file
- Simplified result structure to prepare for future selective full text fetching

### Removed
- `full-text-results_[timestamp].json` output file
- Automatic fetching of full text for top N results
- `fullText` configuration options

### Notes
- Full text fetching will be reimplemented as a user-initiated feature in a future version
- This allows researchers to selectively fetch OCR text only for sources they want to analyze
- Existing results files remain compatible, but full text data will show as empty