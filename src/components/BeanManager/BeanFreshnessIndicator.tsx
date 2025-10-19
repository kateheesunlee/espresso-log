import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bean, getBeanFreshnessStatus } from '@types';
import { colors } from '../../themes/colors';
import SvgIcon, { IconName } from '../SvgIcon';

export interface BeanFreshnessIndicatorProps {
  bean: Bean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDaysRemaining?: boolean;
}

type StatusConfig = {
  label: string;
  icon: IconName;
};

const BeanFreshnessIndicator: React.FC<BeanFreshnessIndicatorProps> = ({
  bean,
  size = 'md',
  showLabel = true,
  showDaysRemaining = true,
}) => {
  const freshness = getBeanFreshnessStatus(bean);

  const getStatusConfig = (): StatusConfig => {
    switch (freshness.status) {
      case 'fresh':
        return {
          label: 'Fresh as Morning',
          icon: 'sun',
        };
      case 'still-okay':
        return {
          label: 'Still Tasty',
          icon: 'thumb-up',
        };
      case 'past-prime':
        return {
          label: 'Past Prime',
          icon: 'warning',
        };
      case 'too old':
        return {
          label: 'Time to Toss',
          icon: 'delete',
        };
      default:
        return {
          label: 'Fresh as Morning',
          icon: 'sun',
        };
    }
  };

  const config = getStatusConfig();

  const sizeStyles = {
    sm: {
      container: styles.containerSm,
      progressBar: styles.progressBarSm,
      label: styles.labelSm,
      daysText: styles.daysTextSm,
    },
    md: {
      container: styles.containerMd,
      progressBar: styles.progressBarMd,
      label: styles.labelMd,
      daysText: styles.daysTextMd,
    },
    lg: {
      container: styles.containerLg,
      progressBar: styles.progressBarLg,
      label: styles.labelLg,
      daysText: styles.daysTextLg,
    },
  };

  const currentSizeStyles = sizeStyles[size];

  return (
    <View style={[styles.wrapper, currentSizeStyles.container]}>
      {/* Progress Bar */}
      <View style={[styles.progressContainer, currentSizeStyles.progressBar]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${freshness.progress * 100}%`,
            },
          ]}
        />
      </View>

      {/* Label and Days */}
      <View style={styles.textContainer}>
        {showLabel && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SvgIcon name={config.icon} size={16} color={colors.primary} />
            <Text style={[currentSizeStyles.label, { color: colors.primary }]}>
              {config.label}
            </Text>
          </View>
        )}
        {showDaysRemaining && freshness.daysRemaining > 0 && (
          <Text style={[currentSizeStyles.daysText, { color: colors.primary }]}>
            {freshness.daysRemaining} /{bean.expirationPeriodWeeks * 7} day
            {freshness.daysRemaining !== 1 ? 's' : ''} left
          </Text>
        )}
        {showDaysRemaining &&
          freshness.daysRemaining === 0 &&
          freshness.status !== 'fresh' && (
            <Text
              style={[currentSizeStyles.daysText, { color: colors.primary }]}
            >
              Too old
            </Text>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLg: {
    minWidth: 100,
  },
  containerMd: {
    minWidth: 80,
  },
  containerSm: {
    minWidth: 60,
  },
  daysTextLg: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  daysTextMd: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  daysTextSm: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  labelLg: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelMd: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelSm: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBarLg: {
    height: 14,
  },
  progressBarMd: {
    height: 12,
  },
  progressBarSm: {
    height: 10,
  },
  progressContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'space-between',
    width: '100%',
  },
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
});

export default BeanFreshnessIndicator;
