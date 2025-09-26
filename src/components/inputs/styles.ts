import { StyleSheet } from "react-native";
import { colors } from "../../themes/colors";

// Shared input component styles
export const inputStyles = StyleSheet.create({
  // Common container styles
  inputGroup: {
    marginBottom: 16,
  },

  // Label and text styles
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 8,
    fontStyle: "italic",
  },
  required: {
    color: colors.error,
  },

  // Input field styles
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },

  // Number input specific styles
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    fontSize: 16,
  },
  unit: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textMedium,
  },
});
