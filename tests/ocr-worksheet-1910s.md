# 1910s Film Publication OCR Error Pattern Documentation Template

## 📋 Overview Section

### Project Metadata
- **Researcher:** AE
- **Date Started:** 2025-06-12
- **Publications Analyzed:** [ ] Moving Picture World [x] Motography [ ] Photoplay [ ] Motion Picture News [ ] Other: _______
- **Sample Size:** 15 pages analyzed
- **Date Range of Materials:** 1910 - 1919

### OCR Source Information
- **Original OCR Provider:** [x] Lantern/MHDL [ ] Internet Archive [ ] Other: _______
- **OCR Engine (if known):** _______________
- **Image Quality Notes:** _______________

---

## 🔍 Error Pattern Categories

### 1. Character-Level Substitutions

#### Common Single Character Errors
| OCR Reads | Should Be | Frequency | Example Context         | Confidence |
| --------- | --------- | --------- | ----------------------- | ---------- |
| B         | h         | 10        | "tBe" →  "the"          | High       |
| p         | o         | 1         | "Sputhern" → "Southern" |            |
| j         | i         | 1         | "sjck" → "sick"         |            |
| h         | b         | 1         | "hook" → "book"         |            |
| «         | e         | 6         | "stat«s" → "states"     | High       |
| W         | ly        | 1         | "recentW" → "recently"  |            |
| ho        | be        | 1         | "ho" → "be"             |            |
| bv        | by        | 4         | "babv" → "baby"         | Medium     |
| di        | h         | 1         | "wdiich" → "which"      |            |
| D         | R         | 1         | "DAMONA" → "RAMONA"     | 
MAGAZINT



#### Ligature Errors
| OCR Reads | Should Be | Frequency | Example Context    | Notes            |
| --------- | --------- | --------- | ------------------ | ---------------- |
| fi        | fi        | ⬜⬜⬜⬜⬜     | "rst" → "first"    | Missing ligature |
| fl        | fl        | ⬜⬜⬜⬜⬜     | "oor" → "floor"    | Missing ligature |
| ff        | ff        | ⬜⬜⬜⬜⬜     | "o ice" → "office" |                  |
| æ         | ae        | ⬜⬜⬜⬜⬜     |                    |                  |
|           |           |           |                    |                  |

### 2. Word-Level Errors

#### Industry Terminology (1910s specific)
| OCR Reads | Should Be | Frequency | Publication | Notes           |
| --------- | --------- | --------- | ----------- | --------------- |
|           | photoplay |           |             |                 |
|           | moving    |           |             |                 |
|           |           |           |             |                 |
|           |           |           |             |                 |
|           |           |           |             |                 |


#### Company Names
| OCR Reads | Should Be | Frequency | Context | Period Active |
| --------- | --------- | --------- | ------- | ------------- |
| Kalern    | Kalem     |           |         | 1907-1917     |
| Essariay  | Essanay   |           |         | 1907-1918     |
| Vitacraph | Vitagraph | 1         |         | 1897-1925     |
|           | Bluebird  |           |         |               |
| Triaugle  | Triangle  | 1         |         |               |



#### People Names (directors, stars, writers)
| OCR Reads           | Should Be           | Frequency | Role     | Notes                |
| ------------------- | ------------------- | --------- | -------- | -------------------- |
| Griflith            | Griffith            |           | Director | D.W. Griffith        |
| Mary Pickford       | Mary Pickford       |           | Star     | Watch for "Plckford" |
| Riehard             | Richard             | 1         | author   |                      |
| E«llth  Storey      | Edith Storey        | 1         | star     | "The Panther Woman"  |
| Bditk  Storey       | Edith Storey        | 1         | star     |                      |
| aTtherine MacDonald | Katherine MacDonald | 1         | star     |                      |
| (dune              | Clune                 | 1         | star   |    | 



### 3. Formatting & Structure Errors

#### Column Bleeding
- **Problem Description:** columns intermixed
- **Typical Pattern:** _______________
- **Example:** 
```
# full sentences/passages stay together but are out of order in ocr
Red Feather A Romance of Billy Goat Hill — (Five Reels) — Red Feather — October 9. — Myrtle Gonzales, Val Paul and Fred Church are featured in this Sputhern love story of unusual charm and sweetness. ' Based on the famous novel by Alice Hegan Rice. George Hernandez, Thos. Jefferson, Frankie Lee, Jack Connolly and Jack Curtis complete the cast. Lynn Reynolds produced the picture. Victor Roedelsheim, who helps Kuh round 'em in at the E. L. K. plant over in the Mailers building, was home sjck with some sort of throat trouble during the entire week ending September 30. asked the manager of Hyde's exclusive confectionery shop to put on his menu an\"Iron Claw\". sundae and a\"Laughing Mask\"sundae.
```
- **Potential Fix:** _______________

#### Header/Footer Intrusions
- **Publication Title in Text:** [x] Yes [ ] No
- **Page Numbers in Text:** [x] Yes [ ] No  
- **Running Headers:** _______________
- **Examples:** 
  - `268 MOTOGRAPHY Vol. XVIII, No. 5.`
  - `rj;|\"\";;;•■■;; Si PTEMBER 12, 1914. MOTOGRAPHY`
  - `October,14,. 1916. MOTOGRAPHY 899`

#### Advertisement Confusion
- **Ad Text Mixed with Articles:** [ ] Common [ ] Occasional [ ] Rare
- **Typical Markers:** _______________
- **Example:** _______________

### 4. Punctuation & Special Characters

| Character | OCR Variations | Frequency | Context         |
| --------- | -------------- | --------- | --------------- |
| " "       | ,, '' " "      | ⬜⬜⬜⬜⬜     | Quotation marks |
| —         | -- - —         | ⬜⬜⬜⬜⬜     | Em dash         |
| '         | ' ' `          | ⬜⬜⬜⬜⬜     | Apostrophe      |
| $         | S 8            | ⬜⬜⬜⬜⬜     | Dollar sign     |
|            | ■               |           | can't tell                |

### 5. Number Errors

| OCR Reads | Should Be | Frequency | Common Context     |
| --------- | --------- | --------- | ------------------ |
| 1910      | 1910      | ⬜⬜⬜⬜⬜     | Years (check 191O) |
| 5         | $         | ⬜⬜⬜⬜⬜     | Prices             |
| 0         | O         | ⬜⬜⬜⬜⬜     | In text            |
| 1         | I/l       | ⬜⬜⬜⬜⬜     | Mixed contexts     |
| I          | 1          | 1          |                    |

---

## 📊 Pattern Analysis

### Publication-Specific Patterns

#### Moving Picture World
- **Unique Challenges:** _______________
- **Most Common Errors:** _______________
- **Quality Assessment:** [ ] Good [ ] Fair [ ] Poor [ ] Variable

#### Motography  
- **Unique Challenges:** _______________
- **Most Common Errors:** _______________
- **Quality Assessment:** [ ] Good [ ] Fair [ ] Poor [ ] Variable

#### Photoplay
- **Unique Challenges:** _______________
- **Most Common Errors:** _______________
- **Quality Assessment:** [ ] Good [ ] Fair [ ] Poor [ ] Variable

### Temporal Patterns
- **Early 1910s (1910-1913) Issues:** _______________
- **Mid 1910s (1914-1916) Issues:** _______________
- **Late 1910s (1917-1919) Issues:** _______________

### Genre/Section Patterns
- **Reviews:** _______________
- **News:** _______________
- **Advertisements:** _______________
- **Feature Articles:** _______________

---

## 🔧 Correction Strategies

### High-Confidence Rules
Rules that can be applied automatically:

1. **Rule:** _______________
   - **Pattern:** _______________
   - **Confidence:** _____ %
   - **False Positive Risk:** _______________

2. **Rule:** _______________
   - **Pattern:** _______________
   - **Confidence:** _____ %
   - **False Positive Risk:** _______________

### Medium-Confidence Rules
Rules that need context checking:

1. **Rule:** _______________
   - **Context Required:** _______________
   - **Validation Method:** _______________

### Low-Confidence Patterns
Patterns that need human review:

1. **Pattern:** _______________
   - **Why Uncertain:** _______________
   - **Research Needed:** _______________

---

## 📈 Frequency Tracking

### Error Frequency Key
- ⬜ = 0-20% of pages
- ⬜⬜ = 21-40% of pages  
- ⬜⬜⬜ = 41-60% of pages
- ⬜⬜⬜⬜ = 61-80% of pages
- ⬜⬜⬜⬜⬜ = 81-100% of pages

### Impact Assessment
Rate each error type's impact on research:

| Error Type              | Frequency | Research Impact             | Priority |
| ----------------------- | --------- | --------------------------- | -------- |
| Character substitutions | ⬜⬜⬜⬜⬜     | [ ] High [ ] Medium [ ] Low |          |
| Name errors             | ⬜⬜⬜⬜⬜     | [ ] High [ ] Medium [ ] Low |          |
| Formatting issues       | ⬜⬜⬜⬜⬜     | [ ] High [ ] Medium [ ] Low |          |
|                         |           |                             |          |

---

## 🎯 Women Writers Focus

### Gendered Term Errors
| OCR Reads     | Should Be     | Frequency | Context |
| ------------- | ------------- | --------- | ------- |
| autboress     | authoress     | ⬜⬜⬜⬜⬜     |         |
| lady novellst | lady novelist | ⬜⬜⬜⬜⬜     |         |
|               |               |           |         |

### Common Women Writers' Names (1910s)
| Name                  | Common OCR Errors | Frequency |
| --------------------- | ----------------- | --------- |
| Mary Roberts Rinehart |                   |           |
| Gene Stratton-Porter  |                   |           |
| Eleanor H. Porter     |                   |           |
|                       |                   |           |

---

## 📝 Notes & Observations

### Surprising Discoveries
- 
- 
- 

### Patterns Requiring Further Investigation
- 
- 
- 

### Implications for Automated Cleaning
- 
- 
- 

---

## 🔄 Version History
| Date | What Changed          | By Whom |
| ---- | --------------------- | ------- |
|      | Initial documentation |         |
|      |                       |         |

---

## 📊 Summary Statistics

- **Total Error Patterns Documented:** _____
- **High-Confidence Corrections:** _____
- **Patterns Needing Human Review:** _____
- **Estimated Improvement Potential:** _____%

**Next Steps:**
1. 
2. 
3.