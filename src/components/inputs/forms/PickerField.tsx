import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../themes/colors';
import FormField, { FormFieldProps } from '../FormField';
import BaseModal from '../../modals/BaseModal';

interface PickerOption {
  id: string;
  name: string;
}

interface PickerFieldProps extends Omit<FormFieldProps, 'children'> {
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  onCreateNew?: () => void;
  createButtonText?: string;
  compact?: boolean;
  showClearButton?: boolean;
}

const PickerField: React.FC<PickerFieldProps> = ({
  label,
  subtitle,
  required = false,
  value,
  options,
  onValueChange,
  placeholder = `Select ${label}`,
  onCreateNew,
  createButtonText,
  compact = false,
  showClearButton = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedOption = options.find(option => option.id === value);
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (optionId: string) => {
    onValueChange(optionId);
    setIsVisible(false);
    setSearchText('');
  };

  const handleCreateNew = () => {
    setIsVisible(false);
    setSearchText('');
    onCreateNew?.();
  };

  return (
    <>
      {compact ? (
        <View style={styles.compactRowContainer}>
          <Text style={styles.compactLabel}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>

          <View style={styles.compactInputContainer}>
            <TouchableOpacity
              style={styles.compactPickerButton}
              onPress={() => setIsVisible(true)}
            >
              <Text
                style={[
                  styles.compactPickerText,
                  !selectedOption && styles.placeholderText,
                ]}
              >
                {selectedOption ? selectedOption.name : placeholder}
              </Text>
              <Ionicons
                name='chevron-down'
                size={16}
                color={colors.textMedium}
              />
            </TouchableOpacity>

            {showClearButton && (
              <TouchableOpacity
                disabled={!value}
                style={[
                  styles.clearButton,
                  !value && styles.clearButtonDisabled,
                ]}
                onPress={() => onValueChange('')}
              >
                <Ionicons
                  name='close-circle'
                  size={18}
                  color={!value ? colors.textLight : colors.textMedium}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <FormField label={label} required={required} subtitle={subtitle}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setIsVisible(true)}
          >
            <Text
              style={[
                styles.pickerText,
                !selectedOption && styles.placeholderText,
              ]}
            >
              {selectedOption ? selectedOption.name : placeholder}
            </Text>
            <Ionicons name='chevron-down' size={20} color={colors.textMedium} />
          </TouchableOpacity>
        </FormField>
      )}

      <BaseModal
        headerTitle={`Select ${label}`}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        buttonConfigs={
          onCreateNew
            ? [
                {
                  text: createButtonText || `Create ${label}`,
                  onPress: handleCreateNew,
                },
              ]
            : []
        }
      >
        <View style={styles.modalContent}>
          <View style={styles.searchContainer}>
            <Ionicons
              name='search'
              size={20}
              color={colors.textMedium}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={item => item.id}
            style={styles.optionsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  item.id === value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(item.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    item.id === value && styles.selectedOptionText,
                  ]}
                >
                  {item.name}
                </Text>
                {item.id === value && (
                  <Ionicons name='checkmark' size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No {label.toLowerCase()} found
                </Text>
              </View>
            }
          />
        </View>
      </BaseModal>
    </>
  );
};

const styles = StyleSheet.create({
  // Compact styles (for filters)
  compactRowContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  compactLabel: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 60,
  },
  compactInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  compactPickerButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  compactPickerText: {
    color: colors.textDark,
    flex: 1,
    fontSize: 14,
  },
  clearButton: {
    marginLeft: 6,
    padding: 2,
  },
  clearButtonDisabled: {
    opacity: 0.3,
  },
  required: {
    color: colors.error,
  },
  pickerButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    padding: 12,
  },
  pickerText: {
    color: colors.textDark,
    flex: 1,
    fontSize: 16,
  },
  placeholderText: {
    color: colors.textLight,
  },
  modalContent: {
    maxHeight: '80%',
    minHeight: 400,
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    color: colors.textDark,
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedOption: {
    backgroundColor: colors.hover,
  },
  optionText: {
    color: colors.textDark,
    flex: 1,
    fontSize: 16,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.textMedium,
    fontSize: 16,
  },
});

export default PickerField;
