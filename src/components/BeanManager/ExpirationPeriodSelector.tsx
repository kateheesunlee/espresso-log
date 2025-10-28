import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const defaultSubtitle = `What freshness period fits these beans best after ${
    dateType === 'roasting' ? 'roasting' : 'opening'
  }?`;
  const displaySubtitle = subtitle || defaultSubtitle;
  const options = [1, 2, 3, 4];

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
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default ExpirationPeriodSelector;
