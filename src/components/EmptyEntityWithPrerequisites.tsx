import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors } from '../themes/colors';
import SvgIcon, { IconName } from './SvgIcon';

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

  if (!hasBeans) missingPrerequisites.push('bean');
  if (!hasMachines) missingPrerequisites.push('machine');

  const getPrerequisiteText = () => {
    if (missingPrerequisites.length === 0) return '';
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
                <SvgIcon name='bean' size={20} color={colors.primary} />
                <Text style={styles.prerequisiteButtonText}>Add Bean</Text>
              </TouchableOpacity>
            )}

            {!hasMachines && (
              <TouchableOpacity
                style={styles.prerequisiteButton}
                onPress={onAddMachine}
              >
                <SvgIcon name='coffeemaker' size={20} color={colors.primary} />
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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  disabledButtonText: {
    color: colors.textLight,
  },
  prerequisiteButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  prerequisiteButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  prerequisiteButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  prerequisiteContainer: {
    alignItems: 'center',
    backgroundColor: colors.warningBackground,
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    width: '100%',
  },
  prerequisiteText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 200,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMedium,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
});

export default EmptyEntityWithPrerequisites;
