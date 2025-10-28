import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatDate } from 'src/utils/formatDate';
import { colors } from '../../themes/colors';

import { RoastLevel } from '../../types';
import { FormField } from '../inputs';
import SvgIcon from '../SvgIcon';
import ExpirationPeriodSelector from './ExpirationPeriodSelector';

type DateType = 'roasting' | 'opening';

export interface BeanFreshnessFormProps {
  initialDate?: Date;
  initialDateType?: DateType;
  onDateChange: (date: Date) => void;
  onDateTypeChange: (type: DateType) => void;
  expirationPeriodWeeks?: number;
  onExpirationPeriodChange?: (weeks: number) => void;
  roastLevel?: RoastLevel;
}

const BeanFreshnessForm: React.FC<BeanFreshnessFormProps> = ({
  initialDate,
  initialDateType = 'roasting',
  onDateChange,
  onDateTypeChange,
  expirationPeriodWeeks = 2,
  onExpirationPeriodChange,
  roastLevel,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [dateType, setDateType] = useState<'roasting' | 'opening'>(
    initialDateType
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update selected date when initialDate changes (but not while picker is open)
  useEffect(() => {
    if (initialDate && !showDatePicker) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, showDatePicker]);

  // Update date type when initialDateType changes
  useEffect(() => {
    setDateType(initialDateType);
  }, [initialDateType]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };

  const handleDateTypeChange = (type: 'roasting' | 'opening') => {
    setDateType(type);
    onDateTypeChange(type);
  };

  const getDateTypeLabel = (type: 'roasting' | 'opening') => {
    return type === 'roasting' ? 'Roasting Date' : 'Opening Date';
  };

  const getDateTypeDescription = (type: 'roasting' | 'opening') => {
    return type === 'roasting'
      ? 'Best for freshly roasted beans'
      : 'Best for store-bought coffee bags';
  };

  // suggested freshness periods by roast level
  const suggestedFreshnessTextByRoastLevel: Record<
    RoastLevel,
    React.ReactNode
  > = {
    ['Light']: (
      <Text style={styles.suggestedFreshnessPeriods}>
        <Text style={styles.suggestedFreshnessPeriodsBold}>Light roast</Text>{' '}
        beans develop slowly and stay vibrant longer - best enjoyed after about
        4 weeks, and can remain expressive up to 8–12 weeks after roasting.
      </Text>
    ),
    ['Medium Light']: (
      <Text style={styles.suggestedFreshnessPeriods}>
        <Text style={styles.suggestedFreshnessPeriodsBold}>
          Medium-light roast
        </Text>{' '}
        beans reach their ideal balance around 3 weeks after roasting, and stay
        pleasantly bright for up to 6–8 weeks.
      </Text>
    ),
    ['Medium']: (
      <Text style={styles.suggestedFreshnessPeriods}>
        <Text style={styles.suggestedFreshnessPeriodsBold}>Medium roast</Text>{' '}
        beans hit their sweet spot at 2–3 weeks after roasting, maintaining a
        steady flavor profile for up to 6 weeks.
      </Text>
    ),
    ['Medium Dark']: (
      <Text style={styles.suggestedFreshnessPeriods}>
        <Text style={styles.suggestedFreshnessPeriodsBold}>
          Medium-dark roast
        </Text>{' '}
        beans are full and bold early on - best around 2 weeks after roasting,
        with richness starting to fade after 4–5 weeks.
      </Text>
    ),
    ['Dark']: (
      <Text style={styles.suggestedFreshnessPeriods}>
        <Text style={styles.suggestedFreshnessPeriodsBold}>Dark roast</Text>{' '}
        beans show their best character within 1–2 weeks after roasting, as
        flavors tend to mellow quickly over time.
      </Text>
    ),
  };

  // suggested freshness periods by date type
  const suggestedFreshnessPeriods: Record<
    'roasting' | 'opening',
    React.ReactNode
  > = {
    roasting: suggestedFreshnessTextByRoastLevel[roastLevel as RoastLevel] || (
      <Text style={styles.suggestedFreshnessPeriods}>
        No suggested freshness period for this roast level.
      </Text>
    ),
    opening: (
      <Text style={styles.suggestedFreshnessPeriods}>
        Store-bought roasted beans usually stay fresh for about 3–6 months when
        sealed, and taste best within 2–4 weeks once opened.
      </Text>
    ),
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
    >
      {/* Date Type Selection */}
      <FormField label='Track freshness from'>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              dateType === 'roasting' && styles.typeButtonActive,
            ]}
            onPress={() => handleDateTypeChange('roasting')}
          >
            <SvgIcon
              name='roaster'
              size={40}
              color={dateType === 'roasting' ? colors.primary : colors.textDark}
            />
            <Text
              style={[
                styles.typeButtonText,
                dateType === 'roasting' && styles.typeButtonTextActive,
              ]}
            >
              Roasting
            </Text>
            <Text
              style={[
                styles.typeButtonSubtext,
                dateType === 'roasting' && styles.typeButtonSubtextActive,
              ]}
            >
              {getDateTypeDescription('roasting')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              dateType === 'opening' && styles.typeButtonActive,
            ]}
            onPress={() => handleDateTypeChange('opening')}
          >
            <SvgIcon
              name='open_bag'
              size={40}
              color={dateType === 'opening' ? colors.primary : colors.textDark}
            />
            <Text
              style={[
                styles.typeButtonText,
                dateType === 'opening' && styles.typeButtonTextActive,
                {
                  marginTop: 4,
                },
              ]}
            >
              Opening
            </Text>
            <Text
              style={[
                styles.typeButtonSubtext,
                dateType === 'opening' && styles.typeButtonSubtextActive,
              ]}
            >
              {getDateTypeDescription('opening')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.suggestedFreshnessPeriods}>
          {suggestedFreshnessPeriods[dateType]}
        </Text>
      </FormField>

      {/* Expiration Period */}
      {onExpirationPeriodChange && (
        <ExpirationPeriodSelector
          value={expirationPeriodWeeks}
          onValueChange={onExpirationPeriodChange}
          dateType={dateType}
        />
      )}

      {/* Date Selection */}
      <FormField label={getDateTypeLabel(dateType)}>
        <TouchableOpacity
          style={[styles.dateButton, showDatePicker && styles.dateButtonActive]}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Text
            style={[
              styles.dateButtonText,
              showDatePicker && styles.dateButtonTextActive,
            ]}
          >
            {formatDate(selectedDate.toISOString())}
          </Text>
          <Text
            style={[
              styles.dateButtonSubtext,
              showDatePicker && styles.dateButtonSubtextActive,
            ]}
          >
            {showDatePicker ? 'Tap to close' : 'Tap to change'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </FormField>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  dateButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dateButtonSubtext: {
    color: colors.textMedium,
    fontSize: 12,
  },
  dateButtonSubtextActive: {
    color: colors.primary,
  },
  dateButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateButtonTextActive: {
    color: colors.primary,
  },
  suggestedFreshnessPeriods: {
    color: colors.textMedium,
    fontSize: 14,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  suggestedFreshnessPeriodsBold: {
    fontWeight: 'bold',
  },
  typeButton: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    padding: 16,
  },
  typeButtonActive: {
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
  },
  typeButtonSubtext: {
    color: colors.textMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  typeButtonSubtextActive: {
    color: colors.primary,
  },
  typeButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default BeanFreshnessForm;
