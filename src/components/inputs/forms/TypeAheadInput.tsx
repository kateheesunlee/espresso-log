import Fuse from 'fuse.js';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../themes/colors';
import FormField from '../FormField';

export interface SearchableItem {
  id: string;
  name: string;
  aliases?: string[];
  brandId?: string;
}

interface TypeAheadInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onCreateNewItem?: (name: string) => Promise<void>; // Callback when user creates new item
  placeholder?: string;
  required?: boolean;
  subtitle?: string;
  options: SearchableItem[]; // Pre-loaded seed data from parent
}

const TypeAheadInput: React.FC<TypeAheadInputProps> = ({
  label,
  value,
  onChangeText,
  onCreateNewItem,
  placeholder,
  required = false,
  subtitle,
  options,
}) => {
  const [searchText, setSearchText] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<SearchableItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync searchText with external value changes (for editing existing items)
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Debounced search - only runs when user is typing, not when value is set programmatically
  useEffect(() => {
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }

    // Don't run search immediately when the component first loads with a value
    if (searchText === value && !showDropdown) {
      return;
    }

    searchRef.current = setTimeout(() => {
      if (!searchText.trim()) {
        // Show all options when input is empty and dropdown is active
        setFilteredOptions(options);
        return;
      }

      const fuse = new Fuse(options, {
        keys: ['name', 'aliases'],
        threshold: 0.3, // Lower threshold = more strict matching
        includeScore: true,
      });

      const results = fuse.search(searchText);
      const matches = results.map(result => result.item);

      setFilteredOptions(matches);
      setShowDropdown(true);
      setSelectedIndex(-1);
    }, 200);

    return () => {
      if (searchRef.current) {
        clearTimeout(searchRef.current);
      }
    };
  }, [searchText, options, value, showDropdown]);

  const handleSelect = async (item: SearchableItem) => {
    setSearchText(item.name);
    onChangeText(item.name);
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  const handleCreate = async () => {
    if (!searchText.trim() || !onCreateNewItem) return;

    try {
      await onCreateNewItem(searchText.trim());
      onChangeText(searchText.trim());
      setShowDropdown(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error creating new item:', error);
    }
  };

  const handleKeyPress = (e: {
    nativeEvent?: { key?: string };
    key?: string;
  }) => {
    if (!showDropdown || filteredOptions.length === 0) return;

    const key = e.nativeEvent?.key || e.key;
    if (key === 'ArrowUp') {
      setSelectedIndex(prev =>
        prev <= 0 ? filteredOptions.length - 1 : prev - 1
      );
    } else if (key === 'ArrowDown') {
      setSelectedIndex(prev =>
        prev >= filteredOptions.length - 1 ? 0 : prev + 1
      );
    } else if (key === 'Enter' && selectedIndex >= 0) {
      handleSelect(filteredOptions[selectedIndex]);
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: SearchableItem;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        index === selectedIndex && styles.dropdownItemSelected,
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCreateOption = () => {
    if (!searchText.trim() || !onCreateNewItem) return null;

    // Check both filtered options and all options to see if exact match exists
    const exactMatch =
      filteredOptions.some(
        opt =>
          opt.name.toLowerCase() === searchText.toLowerCase() ||
          opt.aliases?.some(
            alias => alias.toLowerCase() === searchText.toLowerCase()
          )
      ) ||
      options.some(
        opt =>
          opt.name.toLowerCase() === searchText.toLowerCase() ||
          opt.aliases?.some(
            alias => alias.toLowerCase() === searchText.toLowerCase()
          )
      );

    if (exactMatch) return null;

    return (
      <TouchableOpacity
        style={[
          styles.createButton,
          selectedIndex === filteredOptions.length &&
            styles.createButtonSelected,
        ]}
        onPress={handleCreate}
      >
        <Text style={styles.createButtonText}>
          Create &ldquo;{searchText}&rdquo;
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FormField label={label} required={required} subtitle={subtitle}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={text => {
            setSearchText(text);
            if (text.trim()) {
              setShowDropdown(true);
            }
          }}
          onFocus={() => {
            // Always show dropdown when focused
            if (searchText.trim()) {
              // Run search when focusing with existing text
              const fuse = new Fuse(options, {
                keys: ['name', 'aliases'],
                threshold: 0.3,
                includeScore: true,
              });
              const results = fuse.search(searchText);
              const matches = results.map(result => result.item);
              setFilteredOptions(matches);
            } else {
              // Show all options when focused with no text
              setFilteredOptions(options);
            }
            setShowDropdown(true);
          }}
          onBlur={() => {
            // Delay hiding dropdown to allow item selection
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoCapitalize='none'
        />

        {showDropdown && filteredOptions.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView
              style={styles.dropdownList}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps='handled'
            >
              {filteredOptions.length > 0 &&
                filteredOptions.map((item, index) => (
                  <View key={item.id}>{renderItem({ item, index })}</View>
                ))}
              {renderCreateOption()}
            </ScrollView>
          </View>
        )}
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  createButton: {
    backgroundColor: colors.bgLight,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    padding: 12,
  },
  createButtonSelected: {
    backgroundColor: colors.primaryLighter,
  },
  createButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  dropdown: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    marginTop: 4,
    maxHeight: 200,
    position: 'absolute',
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 44,
    width: '100%',
    zIndex: 1000,
  },
  dropdownItem: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    padding: 12,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLighter,
  },
  dropdownItemText: {
    color: colors.textDark,
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 200,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
});

export default TypeAheadInput;
