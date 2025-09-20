import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../themes/colors";

interface PickerOption {
  id: string;
  name: string;
}

interface CustomPickerProps {
  label: string;
  value: string;
  options: PickerOption[];
  onValueChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  onCreateNew?: () => void;
  createButtonText?: string;
  compact?: boolean;
  showClearButton?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  options,
  onValueChange,
  required = false,
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
    <View style={styles.container}>
      {compact ? (
        <View style={styles.rowContainer}>
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
        <>
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>

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
        </>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.textMedium} />
              </TouchableOpacity>
            </View>

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
                autoFocus
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
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
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

            {onCreateNew && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateNew}
                >
                  <Ionicons name="add" size={20} color={colors.white} />
                  <Text style={styles.createButtonText}>
                    {createButtonText || `Create ${label}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // Compact styles (for filters)
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  // Original styles (for forms)
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: "100%",
    maxHeight: "80%",
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
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
    paddingHorizontal: 16,
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
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
  },
});

export default CustomPicker;
