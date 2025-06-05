# Magic Lantern Profile Testing Worksheet

## Profile Information

- **Profile Name:** Labor History
- **Test Date:** 2025-06-05
- **Films Tested:** Wizard of Oz, Duel in the Sun, Gullivers Travels, Butterfield 8, The Mountain Rat
- **Corpus Size:** [ ] Test (1) [x] Small (5) [ ] Medium (10+)

## 1. Strategy Performance Matrix

Track which strategies actually find results:

| Strategy Type       | Films with Results | Avg Results/Film | Best Performing Film | Notes |
| ------------------- | ------------------ | ---------------- | -------------------- | ----- |
| title_strike        | 3/5 films          | 3                | WoZ + Duel           |       |
| title_work_stoppage | 1/5 films          | 1                | Butterfield 8        |       |
| title_picket_line   | 2/5 films          | 6                | Duel                 |       |
| studio_strike       | 5/5 films          | 5                | Gullivers            |       |
| studio_labor        | 5/5 films          | 19.8             | all                  |       |
| title_production    | 5/5 films          | 15               | WoZ + Duel           |       |
| studio_production   | 1/1 films          | 20               | Mountain Rat         | test early film to see what would happen       |
| studio_title        | 1/1 films          | 10               | Mountain Rat         | test early film to see what would happen       |

### Red Flags

- [ ] Strategy with 0 results across all films
- [x] Strategy with <20% success rate
  - [x] title_work_stoppage
- [x] High-weight strategy underperforming
  - [x] title_work_stoppage

## 2. Publication Distribution

Track what sources you're actually finding:

### Top 10 Publications by Frequency

1. Motion Picture Herald 52/280 (18.5%) Weight: 1.1
2. Boxoffice 44/280 (16%) Weight: 1.3
3. The Exhibitor 34/280 (12.5%) Weight: not in profile
4. Motion Picture Daily 29/280 (10%) Weight: not in profile
5. Moving Picture World (8.6%) Weight: not in profile
6. The Film Daily (5%) Weight: 1.2
7. Wids (5%) Weight: not in profile
8. Showmens Trade Review (3%) Weight: 1.4
9. Independent Exhibitors Film Bulletin (3%) Weight: 1.6
10. Motion Picture Magazine (2%) Weight: not in profile

### Publications with HIGH weight but LOW results

- Variety - Weight: 1.5 Found: 0 times
- Hollywood Reporter -  Weight: 1.3 Found: 0 times
- American Cinematographer - Weight: 1.8 Found: 2 times

### Publications with LOW weight but HIGH results

- Photoplay - Weight: .5 Found: 3 times


## 3. Content Type Analysis

What kinds of content is this profile finding?

### Content Types Found (from full text analysis)

- [ ] Production news (___ count) - Quality: High/Med/Low
- [ ] Labor/strikes (___ count) - Quality: High/Med/Low


**Does this match profile intent?** [ ] Yes [ ] No [ ] Partially

## 4. Date Range Effectiveness

WoZ - 57 results
1939: 25
1938: 13
1936-37: 6?
1940: 1?

Gulliver - 53
1939: 18
1938: 9

Duel - 60
1946: 16

Butterfield 8 - 55
1960 - 17

The Mountain Rat - 55
1914 - 14

### Results Distribution by Year Offset

- -3 years: ___% of results
- -2 years: ___% of results  
- -1 year:  ___% of results
- Film year: 32% of results
- +1 year:  ___% of results
- +2 years: ___% of results
- +3 years: ___% of results

**Optimal date range appears to be:** -___ to +___  
**Current profile setting:** -3 to +2

## 5. Treasure Analysis

Examining the highest-value finds:

### Top 5 Treasures Found

Automated analysis isn't working. Manually review results below:

"id": "motionpictureexh63jaye_0_0465"
"The  actors  strike  settled,  production  of  two pictures  halted  by  the  strike,  “Butterfield  8” and  “Go  Naked  In  The  World,”  will  resume promptly."


### Words and Phrases
usher  walk-out
voting
labor board
labor unions
local central labor council
AFL
A.F. of L.
non-union
new contract
union's two-year contract
ratify an agreement
with the union
the union charged
wages
while the strike is on
boycott
strike against [studio]
issues now facing the industry
studio strike of 1937
IATSE
I.A.T.S.E.
strike vote
Theatrical Managers,  Agents  and  Treasurers Union
strike action
mediation  sub-committee
joining the union
union members
labor relations
Screen  Writers Guild
support the strike
break the strike
wage increase
industry unions
Screen  Actors'  Guild
guild's demand
consider striking against
expiring agreement
closed shop
Labor Relations  Board
bargaining  agent
pledge cards



## 6. Problem Identification

### Films with disappointingly few results (<5)

NONE!

### Films with overwhelming results (>100)

- _________________ (___results) **Needs refinement?** Y/N
- _________________ (___results) **Needs refinement?** Y/N

### Search strategies that seem broken

- work stoppage **Problem:** only hits for 1960 - wrong language? BUT it found the most direct and best mention of a film & a strike together.
- 

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
- [ ] Add custom strategy for: ______________

### Date Range Adjustments:
- [ ] Widen to -___ / +___ years
- [ ] Narrow to -___ / +___ years
- [ ] Different ranges by confidence level
- [ ] Special handling for certain years: ______________

### Missing Coverage:
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

### Key differences:
_____________________________________________________
_____________________________________________________
_____________________________________________________

## 9. Action Items

### Changes to implement:
1. ________________________________________________
2. ________________________________________________
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
_____________________________________________________
_____________________________________________________
_____________________________________________________

### Profile works best for:
_____________________________________________________
_____________________________________________________

### Profile struggles with:
_____________________________________________________
_____________________________________________________

### Ideas for new profiles based on findings:
_____________________________________________________
_____________________________________________________

### Overall assessment: 
- [ ] Ready to use 
- [ ] Needs minor adjustments 
- [ ] Needs major revision
- [ ] Fundamentally broken - start over

---

**Date completed:** _______________  
**Time spent on analysis:** _______________  
**Version of Magic Lantern used:** v5 dev