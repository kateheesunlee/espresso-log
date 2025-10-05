import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { colors } from "../themes/colors";
import SvgIcon, { IconName } from "./SvgIcon";

interface EmptyEntityWithPrerequisitesProps {
  icon: IconName;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  onPrimaryPress: () => void;
  hasBeans: boolean;
  hasMachines: boolean;
  onAddBean: () => void;
  onAddMachine: () => void;
}

const EmptyEntityWithPrerequisites: React.FC<
  EmptyEntityWithPrerequisitesProps
> = ({
  icon,
  title,
  subtitle,
  primaryButtonText,
  onPrimaryPress,
  hasBeans,
  hasMachines,
  onAddBean,
  onAddMachine,
}) => {
  const canCreateShot = hasBeans && hasMachines;
  const missingPrerequisites: string[] = [];

  if (!hasBeans) missingPrerequisites.push("bean");
  if (!hasMachines) missingPrerequisites.push("machine");

  const getPrerequisiteText = () => {
    if (missingPrerequisites.length === 0) return "";
    if (missingPrerequisites.length === 1) {
      return `You'll need to add a ${missingPrerequisites[0]} first.`;
    }
    return "You'll need to add beans and machines first.";
  };

  return (
    <View style={styles.container}>
      <SvgIcon name={icon} size={64} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {!canCreateShot && (
        <View style={styles.prerequisiteContainer}>
          <Text style={styles.prerequisiteText}>{getPrerequisiteText()}</Text>

          <View style={styles.prerequisiteButtons}>
            {!hasBeans && (
              <TouchableOpacity
                style={styles.prerequisiteButton}
                onPress={onAddBean}
              >
                <SvgIcon name="bean" size={20} color={colors.primary} />
                <Text style={styles.prerequisiteButtonText}>Add Bean</Text>
              </TouchableOpacity>
            )}

            {!hasMachines && (
              <TouchableOpacity
                style={styles.prerequisiteButton}
                onPress={onAddMachine}
              >
                <SvgIcon name="coffeemaker" size={20} color={colors.primary} />
                <Text style={styles.prerequisiteButtonText}>Add Machine</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, !canCreateShot && styles.disabledButton]}
        onPress={onPrimaryPress}
        disabled={!canCreateShot}
      >
        <Text
          style={[
            styles.primaryButtonText,
            !canCreateShot && styles.disabledButtonText,
          ]}
        >
          {primaryButtonText}
        </Text>
      </TouchableOpacity>
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
  prerequisiteContainer: {
    backgroundColor: colors.warningBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
    alignItems: "center",
  },
  prerequisiteText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  prerequisiteButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  prerequisiteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  prerequisiteButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: colors.textLight,
  },
});

export default EmptyEntityWithPrerequisites;
