import React from "react";
import { View, Text, TextInput as RNTextInput } from "react-native";
import { inputStyles } from "./styles";

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  subtitle?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  readOnly?: boolean;
  style?: any;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  multiline = false,
  numberOfLines = 1,
  required = false,
  subtitle,
  keyboardType = "default",
  autoCapitalize = "sentences",
  readOnly = false,
  style,
}) => {
  return (
    <View style={inputStyles.inputGroup}>
      <Text style={[inputStyles.label, inputStyles.labelRow]}>
        {label} {required && <Text style={inputStyles.required}>*</Text>}
      </Text>
      {subtitle && <Text style={inputStyles.subtitle}>{subtitle}</Text>}
      <RNTextInput
        style={[
          inputStyles.textInput,
          multiline && inputStyles.multilineInput,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        readOnly={readOnly}
      />
    </View>
  );
};

export default TextInput;
