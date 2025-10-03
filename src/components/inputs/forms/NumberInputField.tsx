import React, { useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { inputStyles } from "../styles";
import FormField, { FormFieldProps } from "../FormField";

interface NumberInputFieldProps extends Omit<FormFieldProps, "children"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  unit?: string;
  style?: any;
  step?: number;
  minValue?: number;
  maxValue?: number;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  required = false,
  subtitle,
  unit,
  style,
  step = 1,
  minValue,
  maxValue,
  toggleComponent,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const valueRef = useRef(value);

  // Keep valueRef in sync with the value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const triggerHapticFeedback = async () => {
    if (Platform.OS === "ios") {
      try {
        const { impactAsync, ImpactFeedbackStyle } = await import(
          "expo-haptics"
        );
        impactAsync(ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptic feedback not available, continue silently
      }
    }
  };

  const updateValue = useCallback(
    (increment: boolean) => {
      // if value is empty, set placeholder value if it exists, otherwise use 0
      if (valueRef.current === "") {
        onChangeText(placeholder ?? "0");
        return;
      }

      // Use placeholder value if current value is empty, otherwise use current value or 0
      const currentValue = valueRef.current ? parseFloat(valueRef.current) : 0;

      const newValue = increment ? currentValue + step : currentValue - step;

      // Apply min/max constraints
      const constrainedValue = Math.max(
        minValue ?? -Infinity,
        Math.min(maxValue ?? Infinity, newValue)
      );

      // Only update if the value actually changed (not constrained)
      if (constrainedValue !== currentValue) {
        // Preserve the precision based on step
        const decimals = step.toString().split(".")[1]?.length || 0;
        const formattedValue = constrainedValue.toFixed(decimals);

        onChangeText(formattedValue);
        triggerHapticFeedback();
      }
    },
    [step, onChangeText, minValue, maxValue]
  );

  const startContinuousUpdate = useCallback(
    (increment: boolean) => {
      if (intervalRef.current) return; // Already running

      isPressedRef.current = true;

      // Start continuous updates at consistent speed (3 updates per second)
      const updateInterval = 333; // 1000ms / 3 = 333ms per update
      const initialDelay = 600; // Delay before first update

      const scheduleNext = () => {
        if (!isPressedRef.current) {
          return;
        }

        updateValue(increment);

        intervalRef.current = setTimeout(scheduleNext, updateInterval);
      };

      // Start the first update after initial delay
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

  const handleReset = () => {
    onChangeText("");
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

  return (
    <FormField
      label={label}
      required={required}
      subtitle={subtitle}
      toggleComponent={toggleComponent}
    >
      <View style={inputStyles.inputRow}>
        <View style={inputStyles.numberInputContainer}>
          <TextInput
            style={[inputStyles.numberInput, style]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType="numeric"
          />
          {unit && <Text style={inputStyles.unitOverlay}>{unit}</Text>}
          {value && (
            <TouchableOpacity
              style={inputStyles.clearButtonOverlay}
              onPress={handleReset}
              activeOpacity={0.5}
            >
              <Ionicons
                name="close"
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
              name="remove"
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
              name="add"
              size={20}
              color={inputStyles.arrowIcon.color}
            />
          </TouchableOpacity>
        </View>
      </View>
    </FormField>
  );
};

export default NumberInputField;
