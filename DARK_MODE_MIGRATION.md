# Dark Mode Migration Guide

## What's Been Done

Dark mode support has been implemented with the following changes:

### Core Infrastructure

1. **Color Palette** (`src/themes/colorPalette.json`)
   - Restructured to support both `light` and `dark` themes
   - Each theme has matching color keys for consistency

2. **Theme Context** (`src/themes/ThemeContext.tsx`)
   - Created React context for managing theme state
   - Supports three modes: `light`, `dark`, and `auto` (follows system)
   - Persists user preference to AsyncStorage
   - Provides `useTheme()` hook for accessing theme state

3. **Colors Module** (`src/themes/colors.ts`)
   - Added `getColors(theme)` function for theme-aware color retrieval
   - Added `useColors()` hook for components
   - Maintained backward compatibility with static `colors` export

4. **App Integration** (`App.tsx`)
   - Wrapped app in `ThemeProvider`
   - Updated StatusBar to respond to theme changes

5. **Theme Toggle** (`src/components/ThemeToggle.tsx`)
   - Created reusable theme toggle button
   - Added to navigation header

6. **Navigation** (`src/navigation/AppNavigator.tsx`)
   - Updated to use dynamic colors
   - Added theme toggle to tab headers

### Updated Components

The following components have been migrated to use dynamic theming:
- `App.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/screens/HomeScreen.tsx`
- `src/components/cards/BaseCard.tsx`

## Migration Steps for Remaining Components

To update a component to support dark mode, follow these steps:

### Step 1: Update Imports

**Before:**
```typescript
import { colors } from '../themes/colors';
```

**After:**
```typescript
import { useColors } from '../themes/colors';
```

### Step 2: Use the Hook

Add the `useColors()` hook at the top of your component:

```typescript
const MyComponent: React.FC = () => {
  const colors = useColors();
  // ... rest of component
```

### Step 3: Move Styles Inside Component

If styles are defined outside the component using `StyleSheet.create()`, they need to be moved inside and wrapped in `useMemo`:

**Before:**
```typescript
const MyComponent: React.FC = () => {
  // component code
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
```

**After:**
```typescript
const MyComponent: React.FC = () => {
  const colors = useColors();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
  }), [colors]);

  return <View style={styles.container} />;
};
```

### Step 4: Import useMemo if Needed

Don't forget to import `useMemo` from React:

```typescript
import React, { useMemo } from 'react';
```

## Components Still Needing Migration

The following components still use static colors and need to be migrated:

### Screens
- `src/screens/BeansScreen.tsx`
- `src/screens/MachinesScreen.tsx`
- `src/screens/NewBeanScreen.tsx`
- `src/screens/NewMachineScreen.tsx`
- `src/screens/NewShotScreen.tsx`
- `src/screens/ShotDetailScreen.tsx`
- `src/screens/ShotSharePreviewScreen.tsx`

### Components
- All components in `src/components/cards/`
  - `ShotCard.tsx`
  - `BeanCard.tsx`
  - `MachineCard.tsx`
- All components in `src/components/inputs/`
- All components in `src/components/modals/`
- Other components:
  - `EmptyEntity.tsx`
  - `EmptyEntityWithPrerequisites.tsx`
  - `ScrollableListView.tsx`
  - `Avatar.tsx`
  - `PhotoGallery.tsx`
  - And others...

## Testing Dark Mode

1. Run the app: `npm start`
2. Look for the sun/moon icon in the header
3. Tap it to toggle between light and dark modes
4. The preference is saved and will persist across app restarts
5. Set to "auto" mode to follow the system theme

## Notes

- Components that haven't been migrated yet will still work - they'll use the light theme colors
- The migration can be done incrementally
- All new components should use `useColors()` from the start
