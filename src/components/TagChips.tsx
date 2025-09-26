// components/TagChips.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import { colors } from "../themes/colors";

type Props = {
  value: string[]; // Selected tags
  onChange: (tags: string[]) => void;
  suggestions?: string[]; // Suggested tags (sorted)
  allowCustom?: boolean; // Default true
  recent?: string[]; // Recent used tags
};

export default function TagChips({
  value,
  onChange,
  suggestions = [],
  allowCustom = true,
  recent = [],
}: Props) {
  const [query, setQuery] = useState("");
  const selected = new Set(value);

  const pool = useMemo(() => {
    const base = [...recent, ...suggestions].filter(Boolean);
    // Remove duplicates & move already selected items to the end
    const seen = new Set<string>();
    const uniq = base.filter(
      (t) => (t = t.trim().toLowerCase()) && !seen.has(t) && seen.add(t)
    );
    return uniq.sort(
      (a, b) => (selected.has(a) ? 1 : 0) - (selected.has(b) ? 1 : 0)
    );
  }, [suggestions, recent, value]);

  const toggle = useCallback(
    (t: string) => {
      const tag = t.trim().toLowerCase();
      if (!tag) return;
      if (selected.has(tag)) onChange(value.filter((v) => v !== tag));
      else onChange([...value, tag]);
    },
    [selected, onChange, value]
  );

  const renderChip = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => toggle(item)}
        style={[styles.chip, selected.has(item) && styles.chipSelected]}
        accessibilityRole="button"
        accessibilityLabel={`tag ${item}`}
        accessibilityState={{ selected: selected.has(item) }}
      >
        <Text
          style={[
            styles.chipText,
            selected.has(item) && styles.chipTextSelected,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    ),
    [toggle, selected]
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
    const tag = query.trim().toLowerCase();
    if (!tag) return;
    setQuery("");
    if (!value.includes(tag)) onChange([...value, tag]);
  };

  const filtered = pool
    .filter((t) => t.includes(query.trim().toLowerCase()))
    .slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Recommended chips */}
      <FlatList
        data={filtered}
        keyExtractor={(t) => t}
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
            placeholder="Add a tag (e.g., clean, chocolate)"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={addCustom}
          />
          <TouchableOpacity onPress={addCustom} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected tags (for editing) */}
      {value.length > 0 && (
        <View style={styles.selectedWrap}>
          {value.map((t) => (
            <TagChipComponent
              key={t}
              tag={t}
              onPress={toggle}
              selected={true}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const TagChipComponent = React.memo(
  ({
    tag,
    onPress,
    selected,
  }: {
    tag: string;
    onPress: (tag: string) => void;
    selected: boolean;
  }) => (
    <TouchableOpacity
      onPress={() => onPress(tag)}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {tag} ×
      </Text>
    </TouchableOpacity>
  )
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: "transparent",
  },
  chipText: { color: colors.textDark, fontWeight: "600" },
  chipTextSelected: { color: colors.textDark },
  inputRow: { flexDirection: "row", marginTop: 12, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  addBtnText: { color: colors.white, fontWeight: "700" },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
});
