# Publication Pattern Audit Worksheet

## How to Use This Worksheet

1. Copy this template for each publication you audit
2. Search Internet Archive using the provided search URL format
3. Click on 3-5 different volumes/issues to get variety
4. Record the identifiers (the part before .pdf in the URL)
5. Test if the current pattern matches
6. Note any issues or improvements needed

---

## 🔍 PUBLICATION AUDIT TEMPLATE

### Publication: 
**Profile Weight:** _____ (highest weight found)  
**Current Pattern:** `___________________`

**IA Search:** https://archive.org/search.php?query="___________"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `_______________________` → URL: https://archive.org/details/____________
2. ID: `_______________________` → URL: https://archive.org/details/____________
3. ID: `_______________________` → URL: https://archive.org/details/____________
4. ID: `_______________________` → URL: https://archive.org/details/____________
5. ID: `_______________________` → URL: https://archive.org/details/____________

**Pattern Testing:**
- [ ] All IDs match current pattern
- [ ] Some IDs match (list which ones fail): ___________________
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `___________________`
- Common variations: ___________________
- Volume/Year format: ___________________
- City codes present? ___________________
- Underscores or hyphens? ___________________

**Issues Found:**
- [ ] OCR variants (list): ___________________
- [ ] Abbreviations not caught: ___________________
- [ ] False positives (catches wrong publications): ___________________
- [ ] Pattern too broad/narrow: ___________________

**Suggested Pattern Update:**
```javascript
// Current:
'publication_name': /current_pattern/,

// Suggested:
'publication_name': /suggested_pattern/,

// Reason for change:
```

**Notes:**
_________________________________
_________________________________
_________________________________

---

## 🎯 HIGH PRIORITY PUBLICATIONS TO AUDIT FIRST

Copy the template above for each of these:

### 1. American Cinematographer (Weight: 1.8)
- Current pattern: `/americancinemato|american|amento/i`
- Concern: Pattern seems too broad ("american" could match many things)
- Search: "american cinematographer" collection:mediahistory

### 2. BoxOffice (Weight: 1.8)
- Current pattern: `/boxoffice(?!digest|baromet)/i`
- Check: Negative lookahead working correctly?
- Search: "boxoffice" collection:mediahistory

### 3. Moving Picture World (Weight: 1.5)
- Current pattern: `/movingpicture|movpict|mopicwor|mowor|moviwor|moviewor|moving|movpicwor|morewor|movingpicwor|movinwor|movwor/i`
- Concern: SO many variants - are they all real?
- Search: "moving picture world" collection:mediahistory

### 4. Harrison's Reports (Weight: 1.6)
- Current pattern: `/harrison/i`
- Check: Too simple? Might catch unrelated items
- Search: "harrison's reports" OR "harrisons reports" collection:mediahistory

### 5. The Exhibitor (Weight: 1.6)
- Current pattern: `/\bexhibitor|motionpictureexh/i`
- Concern: Confusion with other exhibitor publications
- Search: "the exhibitor" collection:mediahistory

### 6. Motion Picture News (Weight: 1.4)
- Current pattern: `/motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i`
- Check: Complex negative lookaheads
- Search: "motion picture news" collection:mediahistory

---

## 📊 SUMMARY TRACKING TABLE

| Publication | Priority | Audited | Pattern Works | Needs Update | Notes |
|-------------|----------|---------|---------------|--------------|-------|
| American Cinematographer | HIGH (1.8) | ☐ | ☐ | ☐ | |
| BoxOffice | HIGH (1.8) | ☐ | ☐ | ☐ | |
| Moving Picture World | HIGH (1.5) | ☐ | ☐ | ☐ | |
| Harrison's Reports | HIGH (1.6) | ☐ | ☐ | ☐ | |
| The Exhibitor | HIGH (1.6) | ☐ | ☐ | ☐ | |
| Reel Life | HIGH (1.8) | ☐ | ☐ | ☐ | |
| Variety | HIGH (1.5) | ☐ | ☐ | ☐ | |
| Photoplay | HIGH (1.5) | ☐ | ☐ | ☐ | |
| Motion Picture Herald | MED (1.4) | ☐ | ☐ | ☐ | |
| Modern Screen | MED (1.3) | ☐ | ☐ | ☐ | |

---

## 🚀 Quick Start Steps

1. **Open this worksheet** in your editor
2. **Open Internet Archive** in your browser
3. **Start with American Cinematographer** (highest weight, potentially problematic pattern)
4. **Search IA** using: https://archive.org/search.php?query="american+cinematographer"+collection:mediahistory
5. **Click on 5 different issues** spread across different years
6. **Record the identifiers** from each URL
7. **Test** if `/americancinemato|american|amento/i` matches them
8. **Fill out** the worksheet for this publication
9. **Move to the next** high-priority publication

---

## 📝 Example Completed Entry

### Publication: Variety
**Profile Weight:** 1.5 (labor-history.profile.js)  
**Current Pattern:** `/variety/i`

**IA Search:** https://archive.org/search.php?query="variety"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `variety127-1937-07_0211` → URL: https://archive.org/details/variety127-1937-07
2. ID: `variety208-1957-10_0626` → URL: https://archive.org/details/variety208-1957-10
3. ID: `variety74-1924-04_1162` → URL: https://archive.org/details/variety74-1924-04
4. ID: `variety-1953-01-07` → URL: https://archive.org/details/variety-1953-01-07
5. ID: `varietyradio1938-39` → URL: https://archive.org/details/varietyradio1938-39

**Pattern Testing:**
- [X] All IDs match current pattern
- [ ] Some IDs match (list which ones fail): ___________________
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `variety`
- Common variations: with/without hyphens, "varietyradio"
- Volume/Year format: variety[volume]-[year]-[month] OR variety-[yyyy-mm-dd]
- City codes present? No
- Underscores or hyphens? Both used

**Issues Found:**
- [ ] OCR variants (list): ___________________
- [ ] Abbreviations not caught: ___________________
- [ ] False positives (catches wrong publications): ___________________
- [X] Pattern too broad/narrow: Could be more specific

**Suggested Pattern Update:**
```javascript
// Current:
'variety': /variety/i,

// Suggested:
'variety': /^variety/i,  // Add start anchor to avoid matching "photoplayvariety"

// Reason for change:
// More precise matching while still catching all variety formats
```

**Notes:**
Pattern works well but could be more precise. Found "varietyradio" variant which is still Variety publication. Date formats vary between older (volume-based) and newer (date-based) naming.