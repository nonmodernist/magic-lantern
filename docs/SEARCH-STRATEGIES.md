# Search Strategy Documentation

## Strategy Types & Examples

### 1. Title Variations (HIGH confidence)
- **Exact Title**: `"The Wizard of Oz"`
- **No Article**: `"Wizard of Oz"` (removes The/A/An)
- **Abbreviated**: First 2-3 significant words
- **Possessive**: `"The Wizard of Oz's"`

### 2. Creator Searches (HIGH-MEDIUM confidence)
- **Author + Title**: `"L. Frank Baum" "The Wizard of Oz"`
- **Director + Title**: `"Victor Fleming" "The Wizard of Oz"`
- **Last Name Only**: `"Baum" "Wizard of Oz"`
- **Author Variants**: Handles "Fannie/Fanny Hurst" etc.

### 3. Production Searches (MEDIUM confidence)
- **Studio + Title**: `"MGM" "The Wizard of Oz"`
- **Title + Box Office**: Uses keyword stacking
- **Title + Production**: Three-keyword stack

### 4. Contextual Searches (LOW confidence)
- **Source Material**: `"Wonderful Wizard of Oz" adaptation`
- **Genre Searches**: Title + inferred genre
- **Remake Detection**: For known remakes

## Confidence Levels & Date Ranges

- **HIGH**: ±1 year from release
- **MEDIUM**: ±2 years from release  
- **LOW**: ±3 years from release

## Keyword Stacking

Lantern supports up to 3 keywords:

- keyword="The Wizard of Oz"
- second_keyword="MGM"
- third_keyword="production"