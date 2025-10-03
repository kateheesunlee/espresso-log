import React from "react";
import { TextInput as RNTextInput } from "react-native";
import { inputStyles } from "../styles";
import FormField, { FormFieldProps } from "../FormField";

interface TextFieldProps extends Omit<FormFieldProps, "children"> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  readOnly?: boolean;
  style?: any;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  required = false,
  subtitle,
  value,
  onChangeText,
  placeholder = "",
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  readOnly = false,
  style,
}) => {
  return (
    <FormField label={label} required={required} subtitle={subtitle}>
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
    </FormField>
  );
};

export default TextField;
