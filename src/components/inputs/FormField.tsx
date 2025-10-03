import { View, Text } from "react-native";
import { inputStyles } from "./styles";

export interface FormFieldProps {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  subtitle?: string;
  toggleComponent?: React.ReactNode;
}

const FormField = ({
  children,
  label,
  required,
  subtitle,
  toggleComponent,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  subtitle?: string;
  toggleComponent?: React.ReactNode;
}) => {
  return (
    <View style={inputStyles.inputGroup}>
      <View style={inputStyles.labelRow}>
        <Text style={inputStyles.label}>
          {label} {required && <Text style={inputStyles.required}>*</Text>}
        </Text>
        {toggleComponent && toggleComponent}
      </View>
      {subtitle && <Text style={inputStyles.subtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
};

export default FormField;
