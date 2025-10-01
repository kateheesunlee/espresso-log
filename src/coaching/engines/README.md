# Coaching Engine

A sophisticated rule-based system for analyzing espresso shots and providing actionable coaching suggestions.

## Overview

The coaching engine analyzes taste profiles across **4 dimensions** (bitterness, acidity, body, aftertaste) and generates prioritized suggestions to improve extraction quality.

## Architecture

```
ruleEngine.ts
├── Constants (roast thresholds, deltas, limits)
├── Helper Functions (magnitude, confidence, suggestion creation)
├── Taste Dimension Functions
│   ├── generateBitternessSuggestions()
│   ├── generateAciditySuggestions()
│   ├── generateBodySuggestions()
│   └── generateAftertasteSuggestions()
└── Main Function: ruleCoachShot()
    ├── Generate suggestions per dimension
    ├── Apply roast bias
    ├── Classify extraction (under/balanced/over)
    ├── Apply directional weighting
    ├── Deduplicate conflicts
    ├── Normalize & clamp deltas
    └── Return top 3 suggestions
```

## Key Features

### 🎯 **Roast-Specific Thresholds**
- **Light**: 0.4 (more sensitive to imbalances)
- **Medium**: 0.5 (standard)
- **Dark**: 0.6 (more tolerant)

### 📊 **4 Taste Dimensions**
Each analyzed independently, then combined:
1. **Bitterness** - Primary indicator of over-extraction
2. **Acidity** - Brightness/sourness, indicates under-extraction
3. **Body** - Texture/weight of the coffee
4. **Aftertaste** - Finish quality and length

### ⚙️ **6 Adjustable Parameters**
- `grindStep` - Grind size (±2 steps max)
- `dose_g` - Coffee amount (±0.5g max)
- `ratio` - Brew ratio (1.5-2.6 range)
- `shotTime_s` - Extraction time (±4s max)
- `waterTemp_C` - Temperature (±2°C max)
- `preinfusion_s` - Pre-infusion time

### 🎚️ **Priority System** (Coffee Science Based)
- **Priority 1**: Most impactful changes - **Grind** (always), **Dose** (body), **Ratio** (heavy body)
- **Priority 2**: High impact - **Ratio** (general), **Temperature** (critical), **Grind** (secondary)
- **Priority 3**: Moderate impact - **Dose** (fine-tune), **Temperature** (minor), **Time** (adjust)
- **Priority 4**: Lower impact - **Time** (symptoms), minor tweaks

**Coffee Science Principle**: Grind size has the MOST dramatic effect on extraction and should almost always be Priority 1 for extraction issues.

### 💯 **Confidence Levels**

Confidence is calculated using multiple signals:
```
magnitude = 0.7 × primary + 0.2 × aftertaste + 0.1 × body + 0.1 × ratio_deviation

primary = max(|acidity|, |bitterness|)  // Main taste signal
aftertaste = |aftertaste value|          // Finish quality
body = |body value|                      // Texture signal
ratio_deviation = |ratio - 2.0| / 0.6    // How far from standard 1:2
```

**Thresholds**:
- **High**: magnitude ≥ 0.75 (strong, clear signal)
- **Medium**: magnitude ≥ 0.4 (moderate signal)
- **Low**: magnitude < 0.4 (weak or uncertain signal)

This multi-factor approach reduces false confidence from single-dimension spikes.

### 🎯 **Deadband Classification**

To prevent label flicker when scores hover near boundaries, the system uses hysteresis:

```
DEAD_BAND = 0.05  // Small buffer zone

Classification bands:
  score ≤ -0.6 + 0.05  →  "under"
  score ≤ -0.2 + 0.05  →  "slightly-under"
  score <  0.2 - 0.05  →  "balanced"
  score <  0.6 - 0.05  →  "slightly-over"
  score ≥  0.6 - 0.05  →  "over"
```

**Benefits**:
- Reduces UI flickering when extraction score oscillates
- Provides more stable classification for borderline shots
- Maintains accuracy while improving UX

### ⚖️ **Ratio Weight Boost**

Ratio suggestions receive a 15% priority boost (`w *= 1.15`) in final ranking:
- Reduce conflicts between grind and ratio adjustments
- Emphasize ratio as a fundamental parameter (alongside grind)
- Better balance grind-heavy suggestions

## Usage

```typescript
import { ruleCoachShot } from './ruleEngine';

const shot = {
  roast: "Medium",
  dose_g: 18,
  yield_g: 36,
  shotTime_s: 30,
  waterTemp_C: 93,
  balance: {
    acidity: 0.2,
    bitterness: 0.8,  // High bitterness!
    body: 0,
    aftertaste: 0.3,
  },
};

const suggestions = ruleCoachShot(shot);

// Returns up to 3 prioritized suggestions:
// [
//   {
//     field: "grindStep",
//     delta: 1,
//     reason: "Bitterness high → coarser grind",
//     priority: 1,
//     confidence: "high",
//     source: "rule"
//   },
//   ...
// ]
```

## Testing

### Run all tests:
```bash
npm test
```

### Run only rule engine tests:
```bash
npm test ruleEngine.test.ts
```

### Watch mode (for development):
```bash
npm run test:watch
```

### Coverage report:
```bash
npm run test:coverage
```

See [TEST_SETUP.md](../../TEST_SETUP.md) for detailed testing instructions.

## Customization

All tunable parameters are centralized in `../constants.ts` for easy adjustment.

### Adjust Sensitivity
Edit `ROAST_THRESHOLDS` in `constants.ts` to change when suggestions trigger:

```typescript
const ROAST_THRESHOLDS = {
  "Light": { imbalanceThreshold: 0.35 },  // More sensitive
  // ...
};
```

### Modify Adjustment Amounts
Edit `DEFAULT_DELTAS` in `constants.ts` to change suggestion magnitudes:

```typescript
const DEFAULT_DELTAS = {
  grindStep: 2,        // Bigger grind steps
  waterTemp_C: 2,      // Larger temp changes
  // ...
};
```

### Change Safety Limits
Edit `MAX_DELTAS` in `constants.ts` to adjust clamping:

```typescript
const MAX_DELTAS = {
  waterTemp_C: 3,      // Allow ±3°C
  shotTime_s: 5,       // Allow ±5s
  // ...
};
```

### Adjust Extraction Bands
Edit `EXTRACTION_BANDS` in `constants.ts` to change classification boundaries:

```typescript
const EXTRACTION_BANDS = {
  under: -0.7,          // Narrower under band
  slightlyUnder: -0.15, // Tighter classification
  slightlyOver: 0.15,   // Tighter classification
  over: 0.7,            // Narrower over band
};
```

### Adjust Deadband
Edit `DEAD_BAND` in `constants.ts` to change label stability:

```typescript
const DEAD_BAND = 0.1;  // Larger buffer (more stable, less sensitive)
// or
const DEAD_BAND = 0.02; // Smaller buffer (less stable, more sensitive)
```

## Common Patterns (Optimized Priorities)

### High Bitterness (Over-extraction)
```
Priority 1: Coarser grind     ← THE most effective fix
Priority 2: Higher ratio      ← Dilutes, reduces extraction
Priority 3: Shorter time      ← Symptom management
Priority 4: Lower temperature ← Fine-tuning
```
**Why**: Grind is the most powerful lever for controlling extraction rate.

### High Acidity (Under-extraction / Sour)
```
Priority 1: Finer grind       ← PRIMARY fix for sourness
Priority 2: Higher temperature ← Especially important for light roasts
Priority 3: More dose         ← Improves structure
Priority 4: Longer time       ← Minor adjustment
```
**Why**: Sourness means under-extraction. Finer grind increases extraction dramatically. Temperature is secondary but important.

### Low Body (Thin/Watery)
```
Priority 1: Increase dose     ← Body = TDS, dose is direct
Priority 2: Finer grind       ← Extracts more compounds
Priority 3: Lower ratio       ← Increases concentration
```
**Why**: Body is total dissolved solids. More coffee (dose) = more body.

### Heavy Body (Too Thick)
```
Priority 1: Increase ratio    ← Dilutes, most direct fix
Priority 2: Coarser grind     ← Reduces extraction
Priority 3: Decrease dose     ← Less coffee = lighter
```
**Why**: Too much concentration. Opening ratio (more water) is fastest fix.

### Harsh Aftertaste
```
Priority 1: Coarser grind     ← Reduces over-extraction
Priority 2: Higher ratio      ← Cleans up finish
Priority 3: Lower temperature ← Fine-tuning
```
**Why**: Harsh finish = over-extracted compounds. Grind is primary solution.

## Coffee Science

The rules are based on established espresso science:

- **Grind size** controls extraction rate (surface area)
- **Temperature** affects solubility (hotter = more extraction)
- **Time** determines contact duration (longer = more extraction)
- **Ratio** balances concentration vs extraction
- **Dose** affects flow resistance and total solubles

## Contributing

When adding new rules:

1. Add to appropriate taste dimension function
2. Write tests in `ruleEngine.test.ts`
3. Document in this README
4. Verify coffee science rationale
5. Test with real shot data

## References

- **Extraction Science**: [Coffee Science](https://www.baristahustle.com/)
- **Taste Balance**: Specialty Coffee Association standards
- **Roast Levels**: SCAA/SCA color scale

---

**Test Coverage**: ~95%
