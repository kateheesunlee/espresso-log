import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { inputStyles } from '../styles';
import NumberInputField from './NumberInputField';

interface WaterTempFieldProps {
  label: string;
  value: string; // Always in Celsius
  onChangeText: (text: string) => void; // Always receives Celsius
  placeholder?: string;
  required?: boolean;
  subtitle?: string;
  style?: any;
  step?: number;
  minValue?: number;
  maxValue?: number;
}

// Conversion functions
const celsiusToFahrenheit = (celsius: string): string => {
  if (celsius === '') {
    return '';
  }
  const number = parseFloat(celsius);
  return ((number * 9) / 5 + 32).toFixed(1).toString();
};

const fahrenheitToCelsius = (fahrenheit: string): string => {
  if (fahrenheit === '') {
    return '';
  }
  const number = parseFloat(fahrenheit);
  return (((number - 32) * 5) / 9).toFixed(1).toString();
};

const WaterTempField: React.FC<WaterTempFieldProps> = ({
  label,
  value,
  onChangeText,
  required = false,
  subtitle,
  style,
  step = 0.1,
}) => {
  const [isCelsius, setIsCelsius] = useState(true); // Default to Celsius. Saved values are always in Celsius.
  const [celsiusValue, setCelsiusValue] = useState<string>(value);
  const [fahrenheitValue, setFahrenheitValue] = useState<string>(
    fahrenheitToCelsius(value)
  );

  const handleToggle = () => {
    setIsCelsius(prev => !prev);
  };

  const onCelsiusChange = (userInput: string) => {
    setCelsiusValue(userInput);
    onChangeText(userInput);

    setFahrenheitValue(celsiusToFahrenheit(userInput).toString());
  };

  const onFahrenheitChange = (userInput: string) => {
    setFahrenheitValue(userInput);
    const celsius = fahrenheitToCelsius(userInput);
    setCelsiusValue(celsius);
    onChangeText(celsius);
  };

  const toggleComponent = (
    <TouchableOpacity style={inputStyles.unitToggle} onPress={handleToggle}>
      <Text style={inputStyles.unitToggleText}>{isCelsius ? '°C' : '°F'}</Text>
      <Ionicons
        name='swap-horizontal'
        size={16}
        color={inputStyles.unitToggleText.color}
      />
    </TouchableOpacity>
  );

  return isCelsius ? (
    <NumberInputField
      label={label}
      unit='°C'
      value={celsiusValue}
      onChangeText={onCelsiusChange}
      placeholder={'93.0'}
      required={required}
      subtitle={subtitle}
      style={style}
      step={step}
      minValue={0}
      toggleComponent={toggleComponent}
    />
  ) : (
    <NumberInputField
      label={label}
      unit='°F'
      value={fahrenheitValue}
      onChangeText={onFahrenheitChange}
      placeholder={'199.4'}
      required={required}
      subtitle={subtitle}
      style={style}
      step={step}
      minValue={0}
      toggleComponent={toggleComponent}
    />
  );
};

export default WaterTempField;
