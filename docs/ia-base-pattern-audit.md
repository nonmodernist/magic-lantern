# Publication Pattern Audit Checklist

## 🎯 Priority Publications to Check

### High Priority (Weight ≥ 1.5 in any profile)

#### From labor-history.profile.js
- [ ] **american cinematographer** (1.8) - Pattern exists: `/americancinemato|american|amento/i`
- [ ] **harrisons reports** (1.6) - Pattern exists: `/harrison/i`
- [ ] **independent exhibitors film bulletin** (1.6) - Pattern exists: `/independentexhibitorsfilm|filmbulletin|\bindepe/i`
- [ ] **variety** (1.5) - Pattern exists: `/variety/i` ✓

#### From adaptation-studies.profile.js
- [ ] **moving picture world** (1.5) - Pattern exists: `/movingpicture|movpict|mopicwor|.../i`
- [ ] **photoplay** (1.5) - Pattern exists: `/photoplay|photo|pho/i`

#### From regional-reception.profile.js
- [ ] **boxoffice** (1.8) - Pattern exists: `/boxoffice(?!digest|baromet)/i`
- [ ] **the exhibitor** (1.6) - Pattern exists: `/\bexhibitor|motionpictureexh/i`
- [ ] **harrisons reports** (1.5) - Already checked above
- [ ] **showmens trade review** (1.5) - Pattern exists: `/showmen/i`

#### From early-cinema.profile.js
- [ ] **moving picture world** (1.5) - Already checked above
- [ ] **reel life** (1.8) - Pattern exists: `/reellife/i`
- [ ] **motion picture story magazine** (1.5) - Pattern exists: `/motionpicturesto|motionpicture(?!rev|fam|dai|her|mag|new|exh)/i`
- [ ] **cinemundial** (1.6) - Pattern exists: `/cinemundial/i`
- [ ] **motography** (1.5) - Pattern exists: `/motography/i`
- [ ] **wids** (1.5) - Pattern exists: `/wids/i`
- [ ] **the film daily** (1.3) - Pattern exists: `/filmdaily/i`
- [ ] **motion picture news** (1.4) - Pattern exists: `/motionpicturenew|motionnew|.../i`
- [ ] **exhibitors herald** (1.5) - Pattern exists: `/exhibher|exhibitorsh/i`
- [ ] **exhibitors trade review** (1.5) - Pattern exists: `/exhibitorstrade|exhibitorstra|.../i`
- [ ] **picture play** (1.5) - Pattern exists: `/pictureplay/i`

### Medium Priority (Weight 1.3-1.49)

#### Various profiles
- [ ] **motion picture herald** (1.3-1.4) - Pattern exists: `/motionpictureher/i`
- [ ] **modern screen** (1.3) - Pattern exists: `/modernscreen/i`
- [ ] **motion picture daily** (1.3) - Pattern exists: `/motionpicturedai/i`
- [ ] **hollywood reporter** (1.3) - Pattern exists: `/hollywoodreport/i`
- [ ] **motion picture magazine** (1.4) - Pattern exists: `/motionpicturemag/i`
- [ ] **new movie magazine** (1.4) - Pattern exists: `/newmoviemag/i`
- [ ] **exhibitors herald** (1.3-1.4) - Already checked above
- [ ] **film daily** (1.2-1.3) - Different from "the film daily"? - Pattern exists: `/filmdaily/i`

### 🚨 Publications Referenced But NO Pattern Found

These are mentioned in profiles but missing from base-patterns.js:

- [ ] **independent exhibitors film bulletin** - Wait, this does exist as `/independentexhibitorsfilm|filmbulletin|\bindepe/i`

Actually, it looks like all referenced publications have patterns! But we should verify they work correctly.

## 📋 Audit Worksheet Template

For each publication, record:

```
Publication: [Name]
Profile Weight: [highest weight across all profiles]
Current Pattern: [regex from base-patterns.js]

IA Search URL: https://archive.org/search.php?query="[search term]"+collection:mediahistory

Found IDs:
1. [actual ID from IA]
2. [another ID]
3. [another ID]

Pattern Analysis:
- Common prefix: 
- Variations noted:
- OCR errors seen:

✅ Pattern works correctly
❌ Pattern needs update: [suggested new pattern]
⚠️  Edge cases found: [description]

Notes: [any special observations]
```

## 🔍 Search Strategy for Each Publication

### 1. Variety
- Search: "variety" collection:mediahistory
- Known pattern: `variety137-1940-01_0054`
- Check for: variety + volume + date variations

### 2. Motion Picture Herald
- Search: "motion picture herald" collection:mediahistory
- Expected: motionpictureher*
- Check for: abbreviations, "herald" alone

### 3. Photoplay
- Search: "photoplay" collection:mediahistory
- Check for: photoplay with city codes (photoplay11chic)

### 4. BoxOffice
- Search: "boxoffice" collection:mediahistory
- Note: Must NOT match "boxoffice digest" or "boxoffice barometer"
- Check Kansas City editions specifically

### 5. The Exhibitor
- Search: "exhibitor" collection:mediahistory
- Confusion with "Exhibitors Herald" - check carefully
- Philadelphia editions noted in profiles

### 6. Harrison's Reports
- Search: "harrison" collection:mediahistory
- May appear as "harrisonsreports" or "harrison's"

### 7. American Cinematographer
- Search: "american cinematographer" collection:mediahistory
- Current pattern includes "amento" - verify this is real

### 8. Moving Picture World
- Search: "moving picture world" collection:mediahistory
- Has MANY variants in current pattern - verify each

### 9. Showmen's Trade Review
- Search: "showmen" collection:mediahistory
- Check apostrophe variations

### 10. Motion Picture News
- Search: "motion picture news" collection:mediahistory
- Distinguish from other "motion picture" titles

## 📊 Tracking Progress

Create a spreadsheet or use this markdown table:

| Publication | Weight | Pattern Exists | IA Items Found | Pattern Verified | Notes |
|------------|--------|----------------|----------------|------------------|-------|
| variety | 1.5 | ✅ | | | |
| harrisons reports | 1.6 | ✅ | | | |
| american cinematographer | 1.8 | ✅ | | | |
| boxoffice | 1.8 | ✅ | | | |
| ... | | | | | |

## 🎯 Quick Wins to Start

1. **Start with the highest-weight publications** that are most critical to the labor history and adaptation studies profiles
2. **Focus on publications with complex patterns** like Motion Picture World with all its variants
3. **Check publications that seem to have variants** (e.g., "The Film Daily" vs "Film Daily")
4. **Verify the "negative lookahead" patterns** work correctly (like boxoffice)

## 📝 Final Checklist Format

When complete, create a report like:

```markdown
## Verified Patterns

### ✅ Working Correctly
- variety: /variety/i
  - Tested with: variety137-1940-01_0054, variety138-1940-04_0012
  
### ❌ Needs Update  
- [publication]: current pattern → suggested pattern
  - Issue: [what's wrong]
  - Test cases: [IDs that fail]

### ⚠️ Edge Cases Found
- [publication]: [description of edge case]

### 🆕 Missing Publications Found
- [New publication found on IA not in our patterns]
  - Sample IDs: 
  - Suggested pattern:
```