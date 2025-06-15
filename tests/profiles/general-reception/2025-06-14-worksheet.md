# Magic Lantern Profile Testing Worksheet

## Profile Information

- **Profile Name:** General Reception
- **Test Date:** June 14, 2025
- **Films Tested:** King Kong, Snow White, Citizen Kane, The Best Years of Our Lives, Gentlemen's Agreement
- **Corpus Size:** [ ] Test (1) [x] Small (5) [ ] Medium (10+)

## 1. Strategy Performance Matrix

Track which strategies actually find results:

| Strategy Type       | Films with Results | Avg Results/Film | Best Performing Film | Notes                     |
| ------------------- | ------------------ | ---------------- | -------------------- | ------------------------- |
| title_review 2.1    | 5/5 films          | 176              | Citizen Kane         | 32 + 81 + 312 + 231 + 227 |
| title_notices 2.0   | 5/5 films          | 9                | The Best Years       | 6 + 5 + 7 + 18 + 8        |
| title_exhibitor 1.6 | 4/4 films          | 190              | Citizen Kane         | 84 + 207 + 295 + - + 173  |
| title_comment 1.8   | 5/5 films          | 56               | The Best Years       | 28 + 52 + 67 + 81 + 53    |

### Red Flags

- [ ] Strategy with 0 results across all films
- [ ] Strategy with <20% success rate
- [ ] High-weight strategy underperforming

## 2. Publication Distribution

Track what sources you're actually finding:

293 total sources
new york state exhibitor - 6
motion picture herald - 70
new movie magazine - 2
hollywood reporter - 6
motion picture daily - 26
showmens trade review - 38
independent exhibitors film bulletin - 13
the exhibitor - 12
boxoffice - 29
the film daily - 53
harrisons reports - 6
photoplay - 4
american cinematographer - 2


### Top 10 Publications by Frequency

1. Motion Picture Herald (24%) Weight: 1.3
2. The Film Daily (18%) Weight: 1.0
3. Showmens Trade Review (13%) Weight: 1.2
4. Boxoffice (10%) Weight: not weighted
5. Motion Picture Daily (9%) Weight: not weighted


### Publications with HIGH weight but LOW results

- Motion Picture Reviews - Weight: 1.4 - Found: 0 times
- American Cinematographer - Weight: 1.2 - Found: 2 times
- Exhibitors Trade Review - Weight: 1.2 - Found: 0 times

### Publications with LOW weight but HIGH results

N/A

## 3. Date Range Effectiveness

### Results Distribution by Year Offset

- -3 years: ___% of results
- -2 years: ___% of results  
- -1 year:  ___% of results
- Film year: ___% of results
- +1 year:  ___% of results
- +2 years: ___% of results
- +3 years: ___% of results

**Optimal date range appears to be:** -___ to +___  
**Current profile setting:** -___ to +___

## 4. Treasure Analysis

Examining the highest-value finds:

### Top 5 Treasures Found

1. **Film:** Citizen Kane **Type:** feature article/awards coverage **Score:** 57 **Why valuable:** Article about Oscar snub
2. **Film:** King Kong **Type:** review **Score:** 60 **Why valuable:** a review found by the reviews profile!!
3. **Film:** __________ **Type:** ________ **Score:** ___ **Why valuable:** ______________
4. **Film:** __________ **Type:** ________ **Score:** ___ **Why valuable:** ______________
5. **Film:** __________ **Type:** ________ **Score:** ___ **Why valuable:** ______________

### Common patterns in treasures

- **Publication:** _________________
- **Strategy that found them:** _________________
- **Content type:** _________________
- **Year offset from release:** _________________

## 5. Problem Identification

### Films with disappointingly few results (<5)

None!

### Films with overwhelming results (>100)

- _________________ (___results) **Needs refinement?** Y/N
- _________________ (___results) **Needs refinement?** Y/N

### Search strategies that seem broken

- _________________ **Problem:** ______________
- _________________ **Problem:** ______________

## 7. Improvement Hypotheses

Based on this test, what changes might improve the profile?

### Weight Adjustments Needed

- [ ] Increase ______________ from ___ to ___ (because: ___________)
- [ ] Decrease ______________ from ___ to ___ (because: ___________)
- [ ] Add new publication: ______________ weight: ___
- [ ] Remove publication: ______________ (never found)

### Strategy Adjustments

- [ ] Disable strategy: ______________ (0% success rate)
- [ ] Boost strategy: ______________ to weight: ___
- [ ] Reduce strategy: ______________ to weight: ___
- [ ] Add custom strategy for: "opening day business" "reviewed"

### Date Range Adjustments

- [ ] Widen to -___ / +___ years
- [ ] Narrow to -___ / +___ years
- [ ] Different ranges by confidence level
- [ ] Special handling for certain years: ______________

### Missing Coverage

- [ ] Profile misses this type of content: ______________
- [ ] Profile misses this publication: ______________
- [ ] Profile misses this time period: ______________
- [ ] Profile needs this search pattern: ______________

## 8. Comparative Analysis

If testing multiple profiles:

**Compared to** _____________ **profile:**
- More results? [ ] Yes [ ] No - By how much: ___%
- Better treasures? [ ] Yes [ ] No
- More relevant? [ ] Yes [ ] No
- Faster to complete? [ ] Yes [ ] No

### Key differences

_____________________________________________________
_____________________________________________________
_____________________________________________________

## 9. Action Items

### Changes to implement

1. Add "Radio" as variation of RKO
2. Add "reviewed" as a search strategy - DONE
3. ________________________________________________
4. ________________________________________________
5. ________________________________________________

### Next test should include:
- [ ] Different era films (years: _________)
- [ ] Different genre: ______________
- [ ] Larger corpus size
- [ ] Specific problematic films: ______________
- [ ] Films with known good coverage: ______________

## 10. General Notes

### Surprises:
it basically works!!

### Profile works best for:
surfacing different responses to a set of films

### Profile struggles with:
locating all reviews for a movie or specific reviews from specific magazines

### Ideas for new profiles based on findings:
_____________________________________________________
_____________________________________________________

### Overall assessment
 
- [ ] Ready to use 
- [x] Needs minor adjustments 
- [ ] Needs major revision
- [ ] Fundamentally broken - start over

---

**Date completed:** _______________  
**Time spent on analysis:** _______________  
**Version of Magic Lantern used:** _______________