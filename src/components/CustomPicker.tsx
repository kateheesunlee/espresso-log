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
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  options,
  onValueChange,
  required = false,
  placeholder = `Select ${label}`,
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

  const handleClear = () => {
    onValueChange("");
    setIsVisible(false);
    setSearchText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setIsVisible(true)}
      >
        <Text
          style={[styles.pickerText, !selectedOption && styles.placeholderText]}
        >
          {selectedOption ? selectedOption.name : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMedium} />
      </TouchableOpacity>

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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear Selection</Text>
              </TouchableOpacity>
            </View>
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
    minHeight: 300,
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
  clearButton: {
    backgroundColor: colors.bgLight,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.textMedium,
  },
});

export default CustomPicker;
