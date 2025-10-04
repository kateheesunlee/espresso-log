import { View, Text, StyleSheet, ScrollView } from "react-native";

import { Shot, Suggestion } from "@types";
import { colors } from "../../themes/colors";

import BaseModal, { ButtonConfig } from "./BaseModal";

interface CoachingModalProps {
  visible: boolean;
  shot: Shot | null;
  onClose: () => void;
}

const CoachingModal: React.FC<CoachingModalProps> = ({
  visible,
  shot,
  onClose,
}) => {
  const suggestions = shot?.coachingSnapshot?.suggestions ?? [];

  const getConfidenceColor = (confidence: "low" | "med" | "high") => {
    switch (confidence) {
      case "high":
        return colors.success;
      case "med":
        return colors.warning;
      case "low":
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  const getConfidenceText = (confidence: "low" | "med" | "high") => {
    switch (confidence) {
      case "high":
        return "High Confidence";
      case "med":
        return "Medium Confidence";
      case "low":
        return "Low Confidence";
      default:
        return "Unknown";
    }
  };

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case "grindStep":
        return "Grind Setting";
      case "dose_g":
        return "Dose";
      case "ratio":
        return "Ratio";
      case "shotTime_s":
        return "Shot Time";
      case "waterTemp_C":
        return "Water Temperature";
      case "preinfusion_s":
        return "Preinfusion Time";
      default:
        return field;
    }
  };

  const getFieldUnit = (field: string, delta?: number) => {
    switch (field) {
      case "grindStep":
        if (delta === 1 || delta === -1) {
          return " step";
        }
        return " steps";
      case "dose_g":
        return "g";
      case "ratio":
        return "";
      case "shotTime_s":
        return "s";
      case "waterTemp_C":
        return "°C";
      case "preinfusion_s":
        return "s";
      default:
        return "";
    }
  };

  const formatSuggestionValue = (suggestion: Suggestion) => {
    const unit = getFieldUnit(suggestion.field, suggestion.delta || 0);
    if (suggestion.target !== undefined) {
      if (suggestion.field === "ratio") {
        return `1:${suggestion.target.toFixed(1)}`;
      }
      return `${suggestion.target}${unit}`;
    } else if (suggestion.delta !== undefined) {
      const sign = suggestion.delta > 0 ? "+" : "";
      if (suggestion.field === "ratio") {
        return `${sign}${suggestion.delta.toFixed(1)}`;
      }
      return `${sign}${suggestion.delta}${unit}`;
    }
    return "";
  };

  const renderSuggestion = (suggestion: Suggestion, index: number) => (
    <View key={index} style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldName}>
            {getFieldDisplayName(suggestion.field)}
          </Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {formatSuggestionValue(suggestion)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(suggestion.confidence) },
          ]}
        >
          <Text style={styles.confidenceText}>
            {getConfidenceText(suggestion.confidence)}
          </Text>
        </View>
      </View>
      <Text style={styles.reasonText}>{suggestion.reason}</Text>
    </View>
  );

  const buttonConfigs: ButtonConfig[] = [
    {
      text: "Got it!",
      onPress: onClose,
      variant: "primary",
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      headerTitle="Espresso Coaching"
      headerIcon="magic_hat"
      modalStyle={styles.modalContainer}
      buttonConfigs={buttonConfigs}
    >
      <View style={styles.content}>
        {suggestions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Suggestions Available</Text>
            <Text style={styles.emptySubtitle}>
              Your shot parameters look great! No adjustments needed.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <Text style={styles.subtitle}>
              Based on your shot parameters, here are some suggestions to
              improve your extraction:
            </Text>
            {suggestions.map((suggestion, index) =>
              renderSuggestion(suggestion, index)
            )}
          </ScrollView>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    maxHeight: "85%",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flexShrink: 1,
  },
  scrollContent: {
    maxHeight: 600, // Set a reasonable max height for scrolling
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMedium,
    marginBottom: 16,
    lineHeight: 22,
  },
  suggestionCard: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  fieldContainer: {
    flex: 1,
    marginRight: 12,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  valueContainer: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  reasonText: {
    fontSize: 14,
    color: colors.textMedium,
    lineHeight: 20,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default CoachingModal;
