# Priority System Guide

A visual guide to understanding how the coaching engine prioritizes suggestions based on coffee science.

---

## 🎯 Variable Impact Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                  EXTRACTION IMPACT                  │
│                                                     │
│  ████████████████  GRIND SIZE                      │
│  Priority 1        Highest impact - ALWAYS first   │
│                    Surface area + flow control     │
│                                                     │
│  ████████████      RATIO                      │
│  Priority 1-2      Fundamental change             │
│                    Extraction yield + concentration│
│                                                     │
│  ██████████        DOSE                            │
│  Priority 1-3      High impact on body/structure  │
│                    Total dissolved solids          │
│                                                     │
│  ████████          TEMPERATURE                     │
│  Priority 2-4      Important but secondary        │
│                    Solubility control              │
│                                                     │
│  ████              TIME                            │
│  Priority 3-4      Often a symptom, not cause     │
│                    Result of other variables       │
│                                                     │
│  ██                PREINFUSION                     │
│  Priority 5+       Fine-tuning                    │
│                    Consistency improvement         │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Priority Tiers Explained

### **Tier 1: Highest Impact (Priority 1)**
Variables with the most dramatic and immediate effect on extraction.

**Grind Size**
- Controls extraction rate through surface area and flow resistance
- Small changes (even 1 click) can dramatically shift extraction
- Use for: ANY extraction issue (bitter, sour, channeling)

**Dose** (for body issues)
- Body is primarily determined by concentration/total dissolved solids
- More dose = more body, more resistance, slower flow
- Use for: Thin/watery OR overly thick shots

**Brew Ratio** (for fundamental changes)
- Fundamentally changes extraction yield AND concentration
- Higher ratio = more extraction but lower concentration
- Use for: Major imbalances requiring structural changes

### **Tier 2: High Impact (Priority 2-3)**
Important variables that significantly affect results but are secondary to grind/dose/ratio.

**Temperature**
- ±1°C can change extraction by ~2-3%
- Important but less dramatic than grind changes
- Cannot fix a grind issue
- Use for: Fine-tuning brightness (acidity) or bitterness levels

**Ratio** (general adjustments)
- Balances concentration vs extraction
- Changes the yield without changing grind/dose
- Use for: Adjusting strength while maintaining extraction

**Dose** (secondary adjustments)
- Affects resistance and total extraction
- Use for: Fine-tuning after grind is dialed

### **Tier 3: Moderate Impact (Priority 3-4)**
Variables that help fine-tune but are often symptoms rather than causes.

**Shot Time**
- Time is usually a RESULT of grind/dose/ratio, not a cause
- Changing only time (without grind) gives limited control
- Use for: Minor tweaks when everything else is dialed

### **Tier 4: Lower Impact (Priority 5-6)**
Advanced parameters with subtle effects.

**Preinfusion**
- Subtle effect on taste, more about consistency
- Improves shot consistency, reduces channeling
- Use for: Advanced dialing, consistency improvements

---

## 🔄 How the System Works

### Example: High Bitterness Detection

```
Input: { bitterness: 0.8 }  ← User's taste feedback

      ↓

┌─────────────────────────────────────────┐
│  Generate Suggestions (4 created)       │
├─────────────────────────────────────────┤
│  1. Grind coarser    (P1, High conf)   │
│  2. Higher ratio     (P2, Med conf)    │
│  3. Shorter time     (P3, Low conf)    │
│  4. Lower temp       (P4, Low conf)    │
└─────────────────────────────────────────┘

      ↓

┌─────────────────────────────────────────┐
│  Apply Roast Bias                       │
│  (Dark roast: temp↓ gets priority boost)│
└─────────────────────────────────────────┘

      ↓

┌─────────────────────────────────────────┐
│  Classify Extraction (over-extraction)  │
│  Apply directional weighting            │
│  Coarser grind gets EXTRA boost         │
└─────────────────────────────────────────┘

      ↓

┌─────────────────────────────────────────┐
│  Deduplicate & Sort by Final Priority   │
└─────────────────────────────────────────┘

      ↓

┌─────────────────────────────────────────┐
│  Return Top 3 Suggestions               │
├─────────────────────────────────────────┤
│  ✅ #1: Grind coarser (most effective)  │
│  ✅ #2: Higher ratio  (secondary)       │
│  ✅ #3: Shorter time  (fine-tune)       │
└─────────────────────────────────────────┘
```

---

## 📖 Priority by Scenario

### **High Bitterness (Over-extraction)**
```
Priority 1: Grind coarser     ← Fastest, most effective fix
Priority 2: Increase ratio     ← Dilutes bitterness, reduces extraction
Priority 3: Shorten time      ← Minor effect (symptom management)
Priority 4: Lower temperature ← Fine-tuning only
```
**Why**: Grind is the most powerful lever. Going coarser immediately reduces extraction rate and contact time.

---

### **High Acidity (Sour/Under-extraction)**
```
Priority 1: Grind finer       ← Primary fix for under-extraction
Priority 2: Raise temperature ← Significant for light roasts
Priority 3: Increase dose     ← Structural improvement
Priority 4: Longer time       ← Symptom management
```
**Why**: Finer grind increases extraction dramatically. Temperature is highly effective for sour shots (especially light roasts).

---

### **Low Body (Thin/Watery)**
```
Priority 1: Increase dose     ← Body = concentration, dose is key
Priority 2: Grind finer       ← Increases extraction, improves texture
Priority 3: Lower ratio       ← Increases concentration
```
**Why**: Body is primarily about total dissolved solids (TDS). Dose is the most direct way to increase TDS.

---

### **Heavy Body (Too Thick)**
```
Priority 1: Increase ratio    ← Dilutes, reduces concentration
Priority 2: Grind coarser     ← Reduces extraction
Priority 3: Decrease dose     ← Less coffee = lighter body
```
**Why**: Too much body means too much concentration. Opening the ratio (higher yield) is the fastest fix.

---

### **Harsh Aftertaste**
```
Priority 1: Grind coarser     ← Reduces over-extraction compounds
Priority 2: Increase ratio     ← Cleans up finish
Priority 3: Lower temperature ← Reduces harsh extraction
```
**Why**: Harsh aftertaste is often from over-extraction. Grind is primary fix. Ratio helps dilute harsh compounds.

---

## 🎓 Coffee Science Principles

### **Rule #1: Grind is King**

```
┌────────────────────────────────────────────┐
│  Grind Size Impact                         │
│                                            │
│  -2 clicks: ████████████  (Over-extract)   │
│  -1 click:  ██████████    (Slightly over)  │
│   0 clicks: ████████      (Balanced) ✅     │
│  +1 click:  ██████        (Slightly under) │
│  +2 clicks: ████          (Under-extract)  │
│                                            │
│  Notice: Just 1 click = HUGE change!       │
└────────────────────────────────────────────┘

Temperature Impact (for comparison):
┌────────────────────────────────────────────┐
│  -2°C: ███████     (Minor change)          │
│  -1°C: ████████    (Small change)          │
│   0°C: ████████    (Baseline) ✅            │
│  +1°C: ████████    (Small change)          │
│  +2°C: ███████     (Minor change)          │
│                                            │
│  Notice: ±2°C = smaller impact than grind  │
└────────────────────────────────────────────┘
```

**Key Points**:
- Grind size has the MOST dramatic effect on extraction
- Even 1-2 clicks can shift from sour to bitter
- Should almost ALWAYS be priority 1 for extraction issues

---

### **Rule #2: Dose Determines Body**

- Body = Total Dissolved Solids (TDS)
- More coffee = more TDS = more body
- Dose is the PRIMARY tool for body issues

---

### **Rule #3: Ratio Balances Extraction vs Concentration**

- Lower ratio (1:1.5): Higher concentration, less extraction
- Higher ratio (1:3): Lower concentration, more extraction
- Fundamental parameter, should be priority 1-2

---

### **Rule #4: Temperature is Secondary**

- ±2°C changes extraction by ~4-6%
- Important but can't fix fundamental grind/ratio issues
- Best for fine-tuning once grind is dialed

---

### **Rule #5: Time is a Symptom**

```
WRONG THINKING ❌:
"My shot runs too fast (20s) → I'll increase time"
  ↓
Tries to force longer shot without changing grind
  ↓
Still under-extracted, just slower


CORRECT THINKING ✅:
"My shot runs too fast (20s) → Grind is too coarse"
  ↓
Adjusts grind finer
  ↓
Shot naturally slows to 28s AND extracts properly
```

**Key Points**:
- Time is usually a RESULT of grind/dose/ratio
- Changing only time (not grind) has limited effect
- Should be priority 3-4, not primary adjustment

---

### **Rule #6: Fix the Cause, Not the Symptom**

```
SYMPTOMS          CAUSE              FIX
───────────────────────────────────────────
Sour taste    →   Under-extraction → GRIND FINER
Fast time     →   Grind too coarse → GRIND FINER
Thin body     →   Low TDS          → MORE DOSE

Bitter taste  →   Over-extraction  → GRIND COARSER
Slow time     →   Grind too fine   → GRIND COARSER
Heavy body    →   Too much TDS     → HIGHER RATIO
```

---

## 💡 Professional Barista Workflow

The system's priorities align with how expert baristas dial in espresso:

```
🏆 PROFESSIONAL DIALING PROCESS:

Step 1: Adjust GRIND      ← 80% of the work
Step 2: Adjust RATIO      ← 15% of the work  
Step 3: Fine-tune TEMP    ← 4% of the work
Step 4: Tweak TIME        ← 1% of the work
```

**System Priority Distribution**:
```
Priority 1: GRIND         ← Most suggestions
Priority 2: RATIO/TEMP    ← Secondary  
Priority 3-4: TIME/etc    ← Fine-tuning
```

This alignment ensures suggestions match real-world expertise.

---

## 🧪 Expected Behavior

Test these scenarios to understand the system:

### **Scenario 1: Sour Shot**
Expected suggestions:
1. Grind finer (P1)
2. Raise temp (P2)
3. Other tweaks

### **Scenario 2: Bitter Shot**
Expected suggestions:
1. Grind coarser (P1)
2. Increase ratio (P2)

### **Scenario 3: Thin Body**
Expected suggestions:
1. Increase dose (P1)
2. Grind finer (P2)

---

## 📚 References

- **Barista Hustle**: Coffee Extraction & Solubility
- **Scott Rao**: "The Coffee Refractometer Book"
- **SCA**: Brewing Control Chart standards
- **Matt Perger**: Grind distribution and extraction theory
