import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../themes/colors';

type Props = {
  value: string | string[]; // Selected value (supports both string and array for backward compatibility)
  onChange: (value: string) => void;
  suggestions?: string[];
  allowCustom?: boolean;
  recent?: string[];
};

export default function SingleSelectChips({
  value,
  onChange,
  suggestions = [],
  allowCustom = true,
  recent = [],
}: Props) {
  const [query, setQuery] = useState('');

  // Normalize value to handle both string and array formats
  const selectedValue = Array.isArray(value)
    ? value.length > 0
      ? value[0]
      : ''
    : value;

  const pool = useMemo(() => {
    const base = [...recent, ...suggestions].filter(Boolean);
    // Remove duplicates
    const seen = new Set<string>();
    const uniq = base.filter(
      t => (t = t.trim().toLowerCase()) && !seen.has(t) && seen.add(t)
    );
    return uniq;
  }, [suggestions, recent]);

  const selectValue = useCallback(
    (val: string) => {
      const normalizedVal = val.trim();
      if (!normalizedVal) return;

      // Light haptic feedback when selecting
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      onChange(normalizedVal);
    },
    [onChange]
  );

  const renderChip = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => selectValue(item)}
        style={[styles.chip, selectedValue === item && styles.chipSelected]}
        accessibilityRole='button'
        accessibilityLabel={`select ${item}`}
        accessibilityState={{ selected: selectedValue === item }}
      >
        <Text
          style={[
            styles.chipText,
            selectedValue === item && styles.chipTextSelected,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ),
    [selectValue, selectedValue]
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 100, // Estimated chip width
      offset: 100 * index + 8 * index, // width + gap
      index,
    }),
    []
  );

  const addCustom = () => {
    const val = query.trim().toLowerCase();
    if (!val) return;

    // Light haptic feedback when adding custom value
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setQuery('');
    selectValue(val);
  };

  const filtered = pool
    .filter(t => t.includes(query.trim().toLowerCase()))
    .slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Recommended chips */}
      <FlatList
        data={filtered}
        keyExtractor={t => t}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        renderItem={renderChip}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
      />

      {/* Custom input */}
      {allowCustom && (
        <View style={styles.inputRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder='Add custom process'
            style={styles.input}
            returnKeyType='done'
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity onPress={addCustom} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show selected value */}
      {selectedValue && (
        <View style={styles.selectedWrap}>
          <Text style={styles.selectedLabel}>Selected:</Text>
          <TouchableOpacity
            style={styles.selectedChip}
            onPress={() => onChange('')}
            accessibilityRole='button'
            accessibilityLabel='clear selection'
          >
            <Text style={styles.selectedChipText}>{selectedValue} ×</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  addBtnText: { color: colors.white, fontWeight: '700' },
  chip: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
  chipText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  container: {},
  input: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  selectedChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedChipText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.textMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});
