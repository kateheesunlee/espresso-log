import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Shot } from '@types';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useStore } from '../../store/useStore';
import { colors } from '../../themes/colors';

import { formatBeanName } from '../../utils/formatBeanName';
import { formatShotTime } from '../../utils/formatDate';
import Avatar from '../Avatar';
import RoastingIndicator from '../RoastingIndicator';
import SvgIcon from '../SvgIcon';
import CoachingModal from '../modals/CoachingModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import BaseCard, { ActionConfig } from './BaseCard';

type ShotCardNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShotCardProps {
  shot: Shot;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const navigation = useNavigation<ShotCardNavigationProp>();
  const { allBeans, allMachines, toggleFavoriteShot, deleteShot } = useStore();

  const bean = allBeans.find(b => b.id === shot.beanId);
  const machine = allMachines.find(m => m.id === shot.machineId);

  const [oneMoreModalVisible, setOneMoreModalVisible] = useState(false);

  // Coaching modal state
  const [coachingModalVisible, setCoachingModalVisible] = useState(false);

  // Format extraction class for display
  const formatExtractionClass = (label: string) => {
    switch (label) {
      case 'under':
        return 'Under-extracted';
      case 'slightly-under':
        return 'Slightly under';
      case 'balanced':
        return 'Balanced';
      case 'slightly-over':
        return 'Slightly over';
      case 'over':
        return 'Over-extracted';
      default:
        return label;
    }
  };

  // Get color for extraction class
  const getExtractionColor = (label: string) => {
    switch (label) {
      case 'under':
        return colors.roastingLight;
      case 'slightly-under':
        return colors.roastingMediumLight;
      case 'balanced':
        return colors.roastingMedium;
      case 'slightly-over':
        return colors.roastingMediumDark;
      case 'over':
        return colors.roastingDark;
      default:
        return colors.primary;
    }
  };

  // Handler functions
  const handleShotPress = () => {
    navigation.navigate('ShotDetail', { shotId: shot.id });
  };

  const handleToggleFavorite = async () => {
    await toggleFavoriteShot(shot.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleOneMore = () => {
    setOneMoreModalVisible(true);
  };

  const handleOneMoreConfirm = () => {
    setOneMoreModalVisible(false);
    navigation.navigate('NewShot', { duplicateFrom: shot.id });
  };

  const handleDelete = async () => {
    await deleteShot(shot.id);
  };

  const handleCoaching = () => {
    // Only show coaching if we have bean info with roast level and taste data
    if (!bean || !bean.roastLevel) {
      return;
    }

    if (
      shot.acidity === undefined &&
      shot.bitterness === undefined &&
      shot.body === undefined &&
      shot.aftertaste === undefined
    ) {
      return;
    }

    setCoachingModalVisible(true);
  };

  const additionalContent = () => {
    return (
      <View style={styles.additionalContent}>
        {/* Bean and Machine Info with Avatar */}
        <View style={styles.beanMachineInfo}>
          <Avatar
            imageUri={getAvatarImageUri()}
            fallbackIcon='coffee'
            size={60}
          />
          <View style={styles.beanMachineDetails}>
            <View>
              <Text style={styles.infoValue}>
                {formatBeanName(bean)}{' '}
                <RoastingIndicator
                  roastLevel={bean?.roastLevel ?? 'Medium'}
                  size='sm'
                  compact
                />
              </Text>
            </View>
            <View>
              <Text style={styles.infoValue}>{getMachineDisplayName()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.shotMetrics}>
          <View style={styles.metric}>
            <SvgIcon name='dial' size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.grindSetting || 'N/A'}</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name='scale' size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.dose_g}g</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name='water' size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.yield_g}g</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name='ratio' size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>
              {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name='timer' size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>
              {shot.shotTime_s ? `${shot.shotTime_s}s` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Shot Summary */}
        <View style={styles.summaryContainer}>
          <Text
            style={[
              styles.extractionClass,
              {
                backgroundColor: getExtractionColor(
                  shot.extractionSnapshot?.label ?? ''
                ),
              },
            ]}
          >
            {formatExtractionClass(shot.extractionSnapshot?.label ?? '')}
          </Text>

          {shot.overallScore !== undefined && shot.overallScore !== null && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Overall Score:</Text>
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreValue}>{shot.overallScore}</Text>
                <Text style={styles.scoreMax}>/10</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getMachineDisplayName = () => {
    if (!machine) {
      return 'Unknown Machine';
    }
    const name =
      machine.nickname ||
      `${machine.brand} ${machine.model}${
        machine.grinder ? ` + ${machine.grinder}` : ''
      }`;
    return machine.deleted ? `${name} (deleted)` : name;
  };

  const showCoachingButton =
    bean &&
    (shot.acidity !== undefined ||
      shot.bitterness !== undefined ||
      shot.body !== undefined ||
      shot.aftertaste !== undefined);

  const coachingButtonConfig: ActionConfig = {
    icon: 'magic_hat',
    onPress: handleCoaching,
  };

  // Get image URI for avatar: first shot photo or bean photo
  const getAvatarImageUri = (): string | undefined => {
    if (shot.imageUris && shot.imageUris.length > 0) {
      return shot.imageUris[0];
    }
    return bean?.imageUri;
  };

  // Create shot data with computed imageUri for avatar display
  const shotDataWithImage = {
    ...shot,
    imageUri: getAvatarImageUri(),
  };

  return (
    <>
      <BaseCard
        showAvatar={false}
        data={shotDataWithImage as any}
        title={formatShotTime(shot.createdAt)}
        subtitle=''
        additionalContent={additionalContent()}
        fallbackIcon='coffee'
        onDelete={handleDelete}
        onPress={handleShotPress}
        showDeleteGesture={true}
        actionConfigs={[
          {
            icon: 'add-notes',
            onPress: handleOneMore,
          },
          {
            icon: shot.isFavorite ? 'heart_filled' : 'heart',
            useContentColor: true,
            onPress: handleToggleFavorite,
          },
          ...(showCoachingButton ? [coachingButtonConfig] : []),
        ]}
      />

      <CoachingModal
        visible={coachingModalVisible}
        shot={shot}
        onClose={() => setCoachingModalVisible(false)}
      />

      <ConfirmationModal
        visible={oneMoreModalVisible}
        title='One More Shot'
        message="This will open a new shot form pre-filled with the current shot's parameters. You can modify any values before saving."
        confirmText='One More'
        cancelText='Cancel'
        onConfirm={handleOneMoreConfirm}
        onCancel={() => setOneMoreModalVisible(false)}
        icon='add-notes'
      />
    </>
  );
};

const styles = StyleSheet.create({
  additionalContent: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  beanMachineDetails: {
    flex: 1,
    gap: 4,
  },
  beanMachineInfo: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    width: '100%',
  },
  extractionClass: {
    borderRadius: 12,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoValue: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ratingLabel: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreDisplay: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  scoreMax: {
    color: colors.textMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  shotMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
    width: '100%', // slight adjustment for visual balance
  },
  summaryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    width: '100%',
  },
});

export default ShotCard;
