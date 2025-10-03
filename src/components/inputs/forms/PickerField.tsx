import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../themes/colors";
import FormField, { FormFieldProps } from "../FormField";
import BaseModal from "../../modals/BaseModal";

interface PickerOption {
  id: string;
  name: string;
}

interface PickerFieldProps extends Omit<FormFieldProps, "children"> {
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
  const [searchText, setSearchText] = useState("");

  const selectedOption = options.find((option) => option.id === value);
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (optionId: string) => {
    onValueChange(optionId);
    setIsVisible(false);
    setSearchText("");
  };

  const handleCreateNew = () => {
    setIsVisible(false);
    setSearchText("");
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
                name="chevron-down"
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
                onPress={() => onValueChange("")}
              >
                <Ionicons
                  name="close-circle"
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
            <Ionicons name="chevron-down" size={20} color={colors.textMedium} />
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
              name="search"
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
            keyExtractor={(item) => item.id}
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
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    marginRight: 12,
    minWidth: 60,
  },
  compactInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  compactPickerButton: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 32,
    flex: 1,
  },
  compactPickerText: {
    fontSize: 14,
    color: colors.textDark,
    flex: 1,
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
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  pickerText: {
    fontSize: 16,
    color: colors.textDark,
    flex: 1,
  },
  placeholderText: {
    color: colors.textLight,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    minHeight: 400,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.textDark,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  selectedOption: {
    backgroundColor: colors.hover,
  },
  optionText: {
    fontSize: 16,
    color: colors.textDark,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMedium,
  },
});

export default PickerField;
