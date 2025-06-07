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

### 1. American Cinematographer (Weight: 1.8) - DONE
- Current pattern: `/americancinemato|american|amento/i`
- Concern: Pattern seems too broad ("american" could match many things)
- Search: "american cinematographer" collection:mediahistory

#### Publication: American Cinematographer - 2025-06-06
**Profile Weight:** 1.8 (highest weight found)  
**Current Pattern:** `/americancinemato|american|amento/i`

**IA Search:** https://archive.org/search.php?query="american+cinematographer"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `amri11asch` → URL: https://archive.org/details/amri11asch
2. ID: `americancinematographer10-1929-04` → URL: https://archive.org/details/americancinematographer10-1929-04
3. ID: `americancinemato09amer` → URL: https://archive.org/details/americancinemato09amer
4. ID: `amento04asch` → URL: https://archive.org/details/amento04asch
5. ID: `americancinemato07amer` → URL: https://archive.org/details/americancinemato07amer
6. ID: `america19asch` → URL: https://archive.org/details/america19asch

**Pattern Testing:**
- [ ] All IDs match current pattern
- [x] Some IDs match (list which ones fail): `amri`, `america`
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `am`
- Common variations: americancinemato, americancinematography
- Volume/Year format: [prefix][number][suffix]
- City codes present? no
- Underscores or hyphens? sometimes

**Issues Found:**
- [x] Abbreviations not caught: `america`, `amri`
- [x] False positives (catches wrong publications): `americanmotionpi00chic`
- [ ] Pattern too broad/narrow: ___________________

**Suggested Pattern Update:**
```javascript
// Current:
`/americancinemato|american|amento/i`

// Suggested:
`/^america(?!nmotionpi)|amento|^amri/i`

// Reason for change:
// catch "america" and "amri" without matching those patterns embedded in other words - tested against existing "america" patterns
```

**Notes:**
keep an eye out for other uses of "america" in patterns - haven't seen any so far but just in case

---


### 2. BoxOffice (Weight: 1.8) - DONE
- Current pattern: `/boxoffice(?!digest|baromet)/i`
- Check: Negative lookahead working correctly?
- Search: "boxoffice" collection:mediahistory

#### Publication: BoxOffice
**Profile Weight:** 1.8 (highest weight found)  
**Current Pattern:** `/boxoffice(?!digest|baromet)/i`

**IA Search:** https://archive.org/search.php?query="boxoffice"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `boxofficeaprjun13031unse` → URL: https://archive.org/details/boxofficeaprjun13031unse
2. ID: `boxofficejanmar182boxo` → URL: https://archive.org/details/boxofficejanmar182boxo
3. ID: `boxofficeoctdec180boxo` → URL: https://archive.org/details/boxofficeoctdec180boxo


**Pattern Testing:**
- [x] All IDs match current pattern
- [ ] Some IDs match (list which ones fail): ___________________
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `boxoffice`
- Common variations: n/a
- Volume/Year format: boxoffice[months][1volume][suffix]
- City codes present? n/a
- Underscores or hyphens? no

**Issues Found:**
- [ ] Abbreviations not caught: ___________________
- [x] False positives (catches wrong publications): `boxofficecheckup00quig`
- [ ] Pattern too broad/narrow: ___________________

**Suggested Pattern Update:**
```javascript
// Current:
  'boxoffice': /boxoffice(?!digest|baromet)/i,  // NOT followed by 'digest' or 'baromet'

// Suggested:
  'boxoffice': /boxoffice(?!digest|baromet|checkup)/i,

// Reason for change: 
// add one extra limiter based on actual patterns found
```

**Notes:**
keep an eye out for other uses of "boxoffice" - may need to add ^ as a boundary


### 3. Moving Picture World (Weight: 1.5)
- Current pattern: `/movingpicture|movpict|mopicwor|mowor|moviwor|moviewor|moving|movpicwor|morewor|movingpicwor|movinwor|movwor/i`
- Concern: SO many variants - are they all real?
- Search: "moving picture world" collection:mediahistory

#### Publication: Moving Picture World
**Profile Weight:** 1.5 (highest weight found)  
**Current Pattern:** `/movingpicture|movpict|mopicwor|mowor|moviwor|moviewor|moving|movpicwor|morewor|movingpicwor|movinwor|movwor/i`

**IA Search:** https://archive.org/search.php?query="moving picture world"+collection:mediahistory

**Sample IA Items Found:**
1. ID:  `movingpicturewor36unse` → URL: https://archive.org/details/movingpicturewor36unse
2. ID:  `movurewor29chal` → URL: https://archive.org/details/movurewor29chal
3. ID:  `MPW01-1907-08` → URL: https://archive.org/details/MPW01-1907-08
4. ID:  `mopicwor40chal` → URL: https://archive.org/details/mopicwor40chal
5. ID:  `moving40chal` → URL: https://archive.org/details/moving40chal
6. ID:  `movwor39chal` → URL: https://archive.org/details/movwor39chal
7. ID:  `movinwor26chal` → URL: https://archive.org/details/movinwor26chal
8. ID:  `movewor34chal` → URL: https://archive.org/details/movewor34chal
9. ID:  `movwor33chal` → URL: https://archive.org/details/movwor33chal 
10. ID: `moviewor28chal` → URL: https://archive.org/details/moviewor28chal
11. ID: `movpicwor26chal` → URL: https://archive.org/details/movpicwor26chal
12. ID: `movpic28chal` → URL: https://archive.org/details/movpic28chal
13. ID: `mopict34chal` → URL: https://archive.org/details/mopict34chal
14. ID: `movpict33chal` → URL: https://archive.org/details/movpict33chal
15. ID: `moviwor29chal` → URL: https://archive.org/details/moviwor29chal
16. ID: `mowor33chal` → URL: https://archive.org/details/mowor33chal
17. ID: `movingor03chal` → URL: https://archive.org/details/movingor03chal
18. ID: `morewor36chal` → URL: https://archive.org/details/morewor36chal
19. ID: `movingwor39chal` → URL: https://archive.org/details/movingwor39chal



**Pattern Testing:**
- [ ] All IDs match current pattern
- [x] Some IDs match (list which ones fail): idk a couple of them
- [ ] No IDs match current pattern

**Pattern Analysis:**

Full variations:

- movingpicturewor36unse - "moving picture wor[ld]"
- MPW01-1907-08 - Acronym! (not caught by current pattern!)

"Moving" variations:

- movingwor39chal - "moving wor[ld]"
- moving40chal - "moving" (but this is too generic!)
- movinwor26chal - "movin[g] wor[ld]"
- movingor03chal - "moving or[ld]?" (OCR error?)

"Movie" variations (different word!):

- moviewor28chal - "movie wor[ld]"
- movewor34chal - "move wor[ld]"
- moviwor29chal - "movi[e] wor[ld]"

"Mo-" abbreviations:

- mopicwor40chal - "mo[ving] pic[ture] wor[ld]"
- mopict34chal - "mo[ving] pict[ure]"
- mowor33chal - "mo[ving] wor[ld]"
- morewor36chal - "more wor[ld]?" (OCR error?)

"Mov-" abbreviations:

- movpicwor26chal - "mov[ing] pic[ture] wor[ld]"
- movpict33chal - "mov[ing] pict[ure]"
- movpic28chal - "mov[ing] pic[ture]"
- movwor39chal - "mov[ing] wor[ld]"
- movwor33chal - "mov[ing] wor[ld]"

Really weird one:

- movurewor29chal - "movure wor[ld]?" (OCR error for "moving"?)

And:
- Volume numbers: 26, 28, 29, 33, 34, 36, 39, 40
- Suffix patterns: chal (Chalmers Publishing Company?)
- Other suffix: unse (unsewn?)
- Years in MPW format: 1907-08

**Issues Found:**
all of them

**Suggested Pattern Update:**
```javascript
// Current:
'moving picture world': /movingpicture|movpict|mopicwor|mowor|moviwor|moviewor|moving|movpicwor|morewor|movingpicwor|movinwor|movwor/i,

// Suggested:
'moving picture world': /^(MPW\d|moving(?:picture)?wor|moving(?:\d|$)|movin(?:g)?(?:or|wor)|movie?wor|mo(?:v)?(?:pic|wor)|more?wor|move?wor|movure)/i,

// Reason for change:
// catching newly logged patterns and trying our best to not overmatch 
```

**Notes:**
lmao this was a struggle


### 4. Harrison's Reports (Weight: 1.6)
- Current pattern: `/harrison/i`
- Check: Too simple? Might catch unrelated items
- Search: "harrison's reports" OR "harrisons reports" collection:mediahistory

#### Publication: Harrison's Reports 
**Profile Weight:** 1.6 (highest weight found)  
**Current Pattern:** `/harrison/i`

**IA Search:** https://archive.org/search.php?query="harrisons"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `harrisonsreports17harr` → URL: https://archive.org/details/harrisonsreports17harr
2. ID: `harrisonsreports00harr_8` → URL: https://archive.org/details/harrisonsreports00harr_8

**Pattern Testing:**
- [x] All IDs match current pattern
- [ ] Some IDs match (list which ones fail): ___________________
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `harrisonsreports`
- Common variations: n/a
- Volume/Year format: harrisonsreports[volume]harr[suffix]
- City codes present? n/a
- Underscores or hyphens? on ids with same volume

**Issues Found:**
- [ ] OCR variants (list): ___________________
- [ ] Abbreviations not caught: ___________________
- [ ] False positives (catches wrong publications): ___________________
- [ ] Pattern too broad/narrow: ___________________

**Suggested Pattern Update:**
```javascript
// Current:
  'harrisons reports': /harrison/i,

// Suggested:
  'harrisons reports': /harrisons/i,


// Reason for change:
// simple add to prevent overmatching, though it shouldn't be a problem
```

**Notes:**
currently no other "harrison" patterns in mhdl



### 5. The Exhibitor (Weight: 1.6)
- Current pattern: `/\bexhibitor|motionpictureexh/i`
- Concern: Confusion with other exhibitor publications
- Search: "the exhibitor" collection:mediahistory

#### Publication: The Exhibitor
**Profile Weight:** 1.6 (highest weight found)  
**Current Pattern:** `/\bexhibitor|motionpictureexh/i`

**IA Search:** https://archive.org/search.php?query="exhibitor"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `exhibitoroctober00exhi` → URL: https://archive.org/details/exhibitoroctober00exhi
2. ID: `exhibitormayjul144jaye` → URL: https://archive.org/details/exhibitormayjul144jaye


**Pattern Testing:**
- [x] All IDs match current pattern
- [ ] Some IDs match (list which ones fail): ___________________
- [ ] No IDs match current pattern

**Pattern Analysis:**
- Common prefix: `exhibitor`
- Common variations: n/a
- Volume/Year format: exhibitor[month][volume][suffix]
- City codes present? n/a
- Underscores or hyphens? no

**Issues Found:**
- [ ] OCR variants (list): ___________________
- [ ] Abbreviations not caught: ___________________
- [x] False positives (catches wrong publications): motion picture exhibitor accidentally included
- [ ] Pattern too broad/narrow: ___________________

**Suggested Pattern Update:**
```javascript
// Current:
'the exhibitor': /\bexhibitor|motionpictureexh/i,

// Suggested:
'the exhibitor': /\bexhibitor/i,

// Reason for change:
// remove conflation between two different pubs
```

**Notes:**
this is the easiest of the "exhibitor" titles - i still have a mess to untangle with the rest of them. also this might be rated too high - need to figure out which "exhibitor" title(s) most valuable


### 6. Motion Picture News (Weight: 1.4)
- Current pattern: `/motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i`
- Check: Complex negative lookaheads
- Search: "motion picture news" collection:mediahistory

#### Publication: Motion Picture News
**Profile Weight:** 1.4 (highest weight found)  
**Current Pattern:** `/motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i`

**IA Search:** https://archive.org/search.php?query="motion picture news"+collection:mediahistory

**Sample IA Items Found:**
1. ID: `motionpicturenew00moti_21` → URL: https://archive.org/details/motionpicturenew00moti_21
2. ID: `motionpicturenew152unse` → URL: https://archive.org/details/motionpicturenew152unse
3. ID: `motionnew34moti` → URL: https://archive.org/details/motionnew34moti
4. ID: `motionpi35moti` → URL: https://archive.org/details/motionpi35moti
5. ID: `motion36moti` → URL: https://archive.org/details/motion36moti
6. ID: `motionpic39moti` → URL: https://archive.org/details/motionpic39moti
7. ID: `motionp09moti` → URL: https://archive.org/details/motionp09moti
8. ID: `motion35moti` → URL: https://archive.org/details/motion35moti
9. ID: `motionnews33moti` → URL: https://archive.org/details/motionnews33moti
10. ID: `picturen09moti` → URL: https://archive.org/details/picturen09moti

**Pattern Testing:**
- [ ] All IDs match current pattern
- [x] Some IDs match (list which ones fail): `picturen`, `motion`
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
'Motion Picture News': /motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i,

// Suggested:
'Motion Picture News': /motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!icture|lay)|motion(?!picture|play)|picturen/i,

// Reason for change:
// match outliers but adjust to not match motion picture family of fan magazines

// WARNING: "motionpicture" prefix is used by multiple publications:
// - Motion Picture Story Magazine - usually `motionpicturesto`
// - Motion Picture Classic - usually `motionpicturecla`
// - Motion Picture - 30s-40s fan magazine - primarily `motionpicture`
// - Motion Picture Magazine - 10s-20s fan magazine
// - Motion Picture News - trade mag - when "new" is truncated
// - Moving Picture Weekly - `motionpicturewee00movi`

// WARNING: "motion" prefix is used by multiple publications
// - Motion Play - `motionplay-1920-11-14-washington`

// WARNING: `motion picture` patterns may generate false positives - always check Lantern for the real metadata

// Order matters - most specific patterns first!
```

**Notes:**
a little detective story. we settled on not worrying if a couple of volumes get false positives, but trying to keep fan mags and trade mags separate since they will be useful to different researchers for different reasons. 


---

## 📊 SUMMARY TRACKING TABLE

| Publication              | Priority   | Audited | Pattern Works | Needs Update | Notes |
| ------------------------ | ---------- | ------- | ------------- | ------------ | ----- |
| American Cinematographer | HIGH (1.8) | x       | ☐             | x            |       |
| BoxOffice                | HIGH (1.8) | x       | ☐             | x            |       |
| Moving Picture World     | HIGH (1.5) | x       | ☐             | x            |       |
| Harrison's Reports       | HIGH (1.6) | x       | ☐             | x            |       |
| The Exhibitor            | HIGH (1.6) | x       | ☐             | x            | profiles using this need updates to ensure they're getting the correct pub |
| Reel Life                | HIGH (1.8) | ☐       | ☐             | ☐            |       |
| Variety                  | HIGH (1.5) | ☐       | ☐             | ☐            |       |
| Photoplay                | HIGH (1.5) | ☐       | ☐             | ☐            |       |
| Motion Picture Herald    | MED (1.4)  | ☐       | ☐             | ☐            |       |
| Modern Screen            | MED (1.3)  | ☐       | ☐             | ☐            |       |

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