import { StyleSheet } from "react-native";
import { colors } from "../../themes/colors";

// Shared input component styles
export const inputStyles = StyleSheet.create({
  // Common container styles
  inputGroup: {
    marginBottom: 20,
  },

  // Label and text styles
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginRight: 8,
    flex: 1,
  },
  unitToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginRight: 4,
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
  numberInputContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 8,
    position: "relative",
  },
  numberInput: {
    padding: 12,
    paddingLeft: 40, // Make room for clear button
    paddingRight: 40, // Make room for unit overlay
    fontSize: 16,
    textAlign: "center",
  },
  unitOverlay: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: "-50%" }], // Half of font size to center vertically
    fontSize: 16,
    color: colors.textMedium,
    pointerEvents: "none", // Don't interfere with input
  },
  clearButtonOverlay: {
    position: "absolute",
    left: 8,
    top: "50%",
    transform: [{ translateY: "-50%" }], // Half of font size to center vertically
    padding: 2,
    borderRadius: "50%",
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgLight,
  },
  clearButtonText: {
    color: colors.textLight,
  },
  arrowButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 0,
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  arrowButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
  },
  arrowButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  arrowIcon: {
    color: colors.primary,
  },
});
