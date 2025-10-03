import { View, Text } from "react-native";
import { inputStyles } from "./styles";

export interface FormFieldProps {
  children: React.ReactNode;
  label: string;
  subLabel?: string;
  required?: boolean;
  subtitle?: string;
  toggleComponent?: React.ReactNode;
}

const FormField = ({
  children,
  label,
  subLabel,
  required,
  subtitle,
  toggleComponent,
}: FormFieldProps) => {
  return (
    <View style={inputStyles.inputGroup}>
      <View style={inputStyles.labelRow}>
        <View style={inputStyles.labelContainer}>
          <Text style={inputStyles.label}>
            {label} {required && <Text style={inputStyles.required}>*</Text>}
          </Text>
          {subLabel && <Text style={inputStyles.subLabel}>{subLabel}</Text>}
        </View>
        {toggleComponent && toggleComponent}
      </View>
      {subtitle && <Text style={inputStyles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
};

export default FormField;
