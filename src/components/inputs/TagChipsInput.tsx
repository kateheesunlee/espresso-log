import React from "react";
import { View, Text } from "react-native";
import TagChips from "../TagChips";
import { inputStyles } from "./styles";

interface TagChipsInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  allowCustom?: boolean;
  recent?: string[];
  subtitle?: string;
  required?: boolean;
}

const TagChipsInput: React.FC<TagChipsInputProps> = ({
  label,
  value,
  onChange,
  suggestions = [],
  allowCustom = true,
  recent = [],
  subtitle,
  required = false,
}) => {
  return (
    <View style={inputStyles.inputGroup}>
      <Text style={inputStyles.label}>
        {label} {required && <Text style={inputStyles.required}>*</Text>}
      </Text>
      {subtitle && <Text style={inputStyles.subtitle}>{subtitle}</Text>}
      <TagChips
        value={value}
        onChange={onChange}
        suggestions={suggestions}
        allowCustom={allowCustom}
        recent={recent}
      />
    </View>
  );
};

export default TagChipsInput;
