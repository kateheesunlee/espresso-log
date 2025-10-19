import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../themes/colors';
import FormField from '../inputs/FormField';

export interface ExpirationPeriodSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  dateType?: 'roasting' | 'opening';
  label?: string;
  subtitle?: string;
}

const ExpirationPeriodSelector: React.FC<ExpirationPeriodSelectorProps> = ({
  value,
  onValueChange,
  dateType = 'roasting',
  label = 'Freshness Period',
  subtitle,
}) => {
  const defaultSubtitle = `How long do these beans stay fresh after ${
    dateType === 'roasting' ? 'roasting' : 'opening'
  }?`;
  const displaySubtitle = subtitle || defaultSubtitle;
  const options = [1, 2, 3, 4];

  const getOptionLabel = (weeks: number) => {
    switch (weeks) {
      case 1:
        return '1 week';
      case 2:
        return '2 weeks';
      case 3:
        return '3 weeks';
      case 4:
        return '4 weeks';
      default:
        return `${weeks} weeks`;
    }
  };

  const getOptionDescription = (weeks: number) => {
    switch (weeks) {
      case 1:
        return 'Ultra fresh';
      case 2:
        return 'Fresh';
      case 3:
        return 'Good';
      case 4:
        return 'Extended';
      default:
        return '';
    }
  };

  return (
    <FormField label={label} subtitle={displaySubtitle}>
      <View style={styles.optionsContainer}>
        {options.map(weeks => (
          <TouchableOpacity
            key={weeks}
            style={[styles.option, value === weeks && styles.optionSelected]}
            onPress={() => onValueChange(weeks)}
          >
            <Text
              style={[
                styles.optionLabel,
                value === weeks && styles.optionLabelSelected,
              ]}
            >
              {weeks}w
            </Text>
            <Text
              style={[
                styles.optionDescription,
                value === weeks && styles.optionDescriptionSelected,
              ]}
            >
              {getOptionDescription(weeks)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </FormField>
  );
};

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  optionDescription: {
    color: colors.textMedium,
    fontSize: 10,
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: colors.primary,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default ExpirationPeriodSelector;
