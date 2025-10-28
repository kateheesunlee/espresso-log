import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import FormField, { FormFieldProps } from '../FormField';
import { inputStyles } from '../styles';

interface RangeNumberFieldProps extends Omit<FormFieldProps, 'children'> {
  minValue: string;
  maxValue: string;
  onMinValueChange: (text: string) => void;
  onMaxValueChange: (text: string) => void;
  placeholder?: string;
  unit?: string;
  style?: any;
  step?: number;
}

const RangeNumberField: React.FC<RangeNumberFieldProps> = ({
  label,
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
  placeholder = '',
  required = false,
  subtitle,
  unit,
  style,
  step = 1,
  toggleComponent,
}) => {
  const [focusedField, setFocusedField] = useState<'min' | 'max' | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const minValueRef = useRef(minValue);
  const maxValueRef = useRef(maxValue);

  // Keep valueRefs in sync with the value props
  useEffect(() => {
    minValueRef.current = minValue;
  }, [minValue]);

  useEffect(() => {
    maxValueRef.current = maxValue;
  }, [maxValue]);

  const triggerHapticFeedback = async () => {
    if (Platform.OS === 'ios') {
      const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
      impactAsync(ImpactFeedbackStyle.Light);
    }
  };

  const validateRange = useCallback((newMin: string, newMax: string) => {
    // Empty values are valid
    if (!newMin || !newMax) return true;

    const minNum = parseFloat(newMin);
    const maxNum = parseFloat(newMax);

    // min cannot be bigger than max
    if (minNum > maxNum) return false;

    return true;
  }, []);

  const updateMinValue = useCallback(
    (increment: boolean) => {
      if (minValueRef.current === '') {
        onMinValueChange(placeholder ?? '0');
        return;
      }

      const currentValue = minValueRef.current
        ? parseFloat(minValueRef.current)
        : 0;
      const newValue = increment ? currentValue + step : currentValue - step;

      const decimals = step.toString().split('.')[1]?.length || 0;
      const formattedValue = newValue.toFixed(decimals);
      const newMin = formattedValue;

      // Validate: min cannot be bigger than max
      if (maxValueRef.current && validateRange(newMin, maxValueRef.current)) {
        onMinValueChange(formattedValue);
        triggerHapticFeedback();
      }
    },
    [step, onMinValueChange, validateRange, placeholder]
  );

  const updateMaxValue = useCallback(
    (increment: boolean) => {
      if (maxValueRef.current === '') {
        onMaxValueChange(placeholder ?? '0');
        return;
      }

      const currentValue = maxValueRef.current
        ? parseFloat(maxValueRef.current)
        : 0;
      const newValue = increment ? currentValue + step : currentValue - step;

      const decimals = step.toString().split('.')[1]?.length || 0;
      const formattedValue = newValue.toFixed(decimals);
      const newMax = formattedValue;

      // Validate: max cannot be smaller than min
      if (minValueRef.current && validateRange(minValueRef.current, newMax)) {
        onMaxValueChange(formattedValue);
        triggerHapticFeedback();
      }
    },
    [step, onMaxValueChange, validateRange, placeholder]
  );

  const updateValue = useCallback(
    (increment: boolean) => {
      if (!focusedField) return;

      if (focusedField === 'min') {
        updateMinValue(increment);
      } else if (focusedField === 'max') {
        updateMaxValue(increment);
      }
    },
    [focusedField, updateMinValue, updateMaxValue]
  );

  const startContinuousUpdate = useCallback(
    (increment: boolean) => {
      if (intervalRef.current) return;

      isPressedRef.current = true;
      const updateInterval = 333;
      const initialDelay = 600;

      const scheduleNext = () => {
        if (!isPressedRef.current) {
          return;
        }

        updateValue(increment);

        intervalRef.current = setTimeout(scheduleNext, updateInterval);
      };

      intervalRef.current = setTimeout(scheduleNext, initialDelay);
    },
    [updateValue]
  );

  const stopContinuousUpdate = useCallback(() => {
    isPressedRef.current = false;

    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleIncrement = () => {
    updateValue(true);
  };

  const handleDecrement = () => {
    updateValue(false);
  };

  const handleReset = (field: 'min' | 'max') => {
    if (field === 'min') {
      onMinValueChange('');
    } else {
      onMaxValueChange('');
    }
  };

  const handleIncrementPressIn = () => {
    startContinuousUpdate(true);
  };

  const handleDecrementPressIn = () => {
    startContinuousUpdate(false);
  };

  const handlePressOut = () => {
    stopContinuousUpdate();
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      stopContinuousUpdate();
    };
  }, [stopContinuousUpdate]);

  const handleMinFocus = () => setFocusedField('min');
  const handleMaxFocus = () => setFocusedField('max');
  const handleBlur = () => setFocusedField(null);

  return (
    <FormField
      label={label}
      required={required}
      subtitle={subtitle}
      toggleComponent={toggleComponent}
    >
      <View style={{ gap: 12 }}>
        {/* Min Value Input */}
        <View style={inputStyles.inputRow}>
          <View style={inputStyles.numberInputContainer}>
            <TextInput
              style={[inputStyles.numberInput, style]}
              value={minValue}
              onChangeText={onMinValueChange}
              placeholder={placeholder}
              keyboardType='numeric'
              onFocus={handleMinFocus}
              onBlur={handleBlur}
            />
            {unit && <Text style={inputStyles.unitOverlay}>{unit}</Text>}
            {minValue && (
              <TouchableOpacity
                style={inputStyles.clearButtonOverlay}
                onPress={() => handleReset('min')}
                activeOpacity={0.5}
              >
                <Ionicons
                  name='close'
                  size={16}
                  color={inputStyles.clearButtonText.color}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={inputStyles.arrowButtons}>
            <TouchableOpacity
              style={[inputStyles.arrowButton, inputStyles.arrowButtonLeft]}
              onPress={handleDecrement}
              onPressIn={handleDecrementPressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.5}
            >
              <Ionicons
                name='remove'
                size={20}
                color={inputStyles.arrowIcon.color}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[inputStyles.arrowButton, inputStyles.arrowButtonRight]}
              onPress={handleIncrement}
              onPressIn={handleIncrementPressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.5}
            >
              <Ionicons
                name='add'
                size={20}
                color={inputStyles.arrowIcon.color}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Max Value Input */}
        <View style={inputStyles.inputRow}>
          <View style={inputStyles.numberInputContainer}>
            <TextInput
              style={[inputStyles.numberInput, style]}
              value={maxValue}
              onChangeText={onMaxValueChange}
              placeholder={placeholder}
              keyboardType='numeric'
              onFocus={handleMaxFocus}
              onBlur={handleBlur}
            />
            {unit && <Text style={inputStyles.unitOverlay}>{unit}</Text>}
            {maxValue && (
              <TouchableOpacity
                style={inputStyles.clearButtonOverlay}
                onPress={() => handleReset('max')}
                activeOpacity={0.5}
              >
                <Ionicons
                  name='close'
                  size={16}
                  color={inputStyles.clearButtonText.color}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={inputStyles.arrowButtons}>
            <TouchableOpacity
              style={[inputStyles.arrowButton, inputStyles.arrowButtonLeft]}
              onPress={handleDecrement}
              onPressIn={handleDecrementPressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.5}
            >
              <Ionicons
                name='remove'
                size={20}
                color={inputStyles.arrowIcon.color}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[inputStyles.arrowButton, inputStyles.arrowButtonRight]}
              onPress={handleIncrement}
              onPressIn={handleIncrementPressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.5}
            >
              <Ionicons
                name='add'
                size={20}
                color={inputStyles.arrowIcon.color}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Range Display */}
        {minValue && maxValue && (
          <Text style={{ fontSize: 12, color: '#666' }}>
            Range: {minValue} - {maxValue} {unit || ''}
          </Text>
        )}
      </View>
    </FormField>
  );
};

export default RangeNumberField;
