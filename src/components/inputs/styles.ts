import { StyleSheet } from 'react-native';
import { colors } from '../../themes/colors';

// Shared input component styles
export const inputStyles = StyleSheet.create({
  // Common container styles
  inputGroup: {
    marginBottom: 20,
  },

  // Label and text styles
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  label: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  subLabel: {
    color: colors.textMedium,
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unitToggle: {
    alignItems: 'center',
    backgroundColor: colors.bgLight,
    borderColor: colors.borderLight,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unitToggleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  subtitle: {
    color: colors.textMedium,
    fontSize: 14,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },

  // Input field styles
  textInput: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 12,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Number input specific styles
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  numberInputContainer: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  numberInput: {
    padding: 12,
    paddingLeft: 40, // Make room for clear button
    paddingRight: 40, // Make room for unit overlay
    fontSize: 16,
    textAlign: 'center',
  },
  unitOverlay: {
    color: colors.textMedium,
    fontSize: 16,
    pointerEvents: 'none',
    position: 'absolute',
    right: 12,
    top: 12, // Don't interfere with input
  },
  clearButtonOverlay: {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: [{ translateY: -12 }], // Can't use percentage here. Roughly half of clear button height
    padding: 2,
    borderRadius: '50%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgLight,
  },
  clearButtonText: {
    color: colors.textLight,
  },
  arrowButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 0,
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  arrowButtonLeft: {
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  arrowButtonRight: {
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
  },
  arrowIcon: {
    color: colors.primary,
  },
});
