import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { colors } from "../themes/colors";
import SvgIcon, { IconName } from "./SvgIcon";

interface EmptyEntityProps {
  icon: IconName;
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const EmptyEntity: React.FC<EmptyEntityProps> = ({
  icon,
  title,
  subtitle,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <SvgIcon name={icon} size={64} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EmptyEntity;
