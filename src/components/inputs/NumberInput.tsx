import React from "react";
import { View, Text, TextInput } from "react-native";
import { inputStyles } from "./styles";

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  subtitle?: string;
  unit?: string;
  style?: any;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  required = false,
  subtitle,
  unit,
  style,
}) => {
  return (
    <View style={inputStyles.inputGroup}>
      <Text style={inputStyles.label}>
        {label} {required && <Text style={inputStyles.required}>*</Text>}
      </Text>
      {subtitle && <Text style={inputStyles.subtitle}>{subtitle}</Text>}
      <View style={inputStyles.inputRow}>
        <TextInput
          style={[inputStyles.numberInput, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numeric"
        />
        {unit && <Text style={inputStyles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

export default NumberInput;
