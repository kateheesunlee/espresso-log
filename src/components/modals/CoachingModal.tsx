import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Shot, Suggestion } from '@types';
import { colors } from '../../themes/colors';

import BaseModal, { ButtonConfig } from './BaseModal';

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

  const getConfidenceColor = (confidence: 'low' | 'med' | 'high') => {
    switch (confidence) {
      case 'high':
        return colors.success;
      case 'med':
        return colors.warning;
      case 'low':
        return colors.textLight;
      default:
        return colors.textLight;
    }
  };

  const getConfidenceText = (confidence: 'low' | 'med' | 'high') => {
    switch (confidence) {
      case 'high':
        return 'High Confidence';
      case 'med':
        return 'Medium Confidence';
      case 'low':
        return 'Low Confidence';
      default:
        return 'Unknown';
    }
  };

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case 'grindStep':
        return 'Grind Setting';
      case 'dose_g':
        return 'Dose';
      case 'ratio':
        return 'Ratio';
      case 'shotTime_s':
        return 'Shot Time';
      case 'waterTemp_C':
        return 'Water Temperature';
      case 'preinfusion_s':
        return 'Preinfusion Time';
      default:
        return field;
    }
  };

  const getFieldUnit = (field: string, delta?: number) => {
    switch (field) {
      case 'grindStep':
        if (delta === 1 || delta === -1) {
          return ' step';
        }
        return ' steps';
      case 'dose_g':
        return 'g';
      case 'ratio':
        return '';
      case 'shotTime_s':
        return 's';
      case 'waterTemp_C':
        return '°C';
      case 'preinfusion_s':
        return 's';
      default:
        return '';
    }
  };

  const formatSuggestionValue = (suggestion: Suggestion) => {
    const unit = getFieldUnit(suggestion.field, suggestion.delta || 0);
    if (suggestion.target !== undefined) {
      if (suggestion.field === 'ratio') {
        return `1:${suggestion.target.toFixed(1)}`;
      }
      return `${suggestion.target}${unit}`;
    } else if (suggestion.delta !== undefined) {
      const sign = suggestion.delta > 0 ? '+' : '';
      if (suggestion.field === 'ratio') {
        return `${sign}${suggestion.delta.toFixed(1)}`;
      }
      return `${sign}${suggestion.delta}${unit}`;
    }
    return '';
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
      text: 'Got it!',
      onPress: onClose,
      variant: 'primary',
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onClose}
      animationType='fade'
      headerTitle='Espresso Coaching'
      headerIcon='magic_hat'
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
  closeButton: {
    padding: 4,
  },
  confidenceBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flexShrink: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySubtitle: {
    color: colors.textMedium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldContainer: {
    flex: 1,
    marginRight: 12,
  },
  fieldName: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingSubtitle: {
    color: colors.textMedium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  loadingTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalContainer: {
    flexDirection: 'column',
    maxHeight: '85%',
    width: '100%',
  },
  reasonText: {
    color: colors.textMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContent: {
    maxHeight: 600, // Set a reasonable max height for scrolling
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  subtitle: {
    color: colors.textMedium,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  suggestionCard: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  suggestionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  valueContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  valueText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CoachingModal;
