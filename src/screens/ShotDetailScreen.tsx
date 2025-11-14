import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';
import { formatBeanName } from '../utils/formatBeanName';
import { formatDateLong } from '../utils/formatDate';

import { FormField } from '../components/inputs';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import ErrorModal from '../components/modals/ErrorModal';
import PhotoGallery from '../components/PhotoGallery';
import RoastingIndicator from '../components/RoastingIndicator';
import SvgIcon from '../components/SvgIcon';
import TastingNotes from '../components/TastingNotes';

type ShotDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShotDetail'
>;
type ShotDetailScreenRouteProp = RouteProp<RootStackParamList, 'ShotDetail'>;

const ShotDetailScreen: React.FC = () => {
  const navigation = useNavigation<ShotDetailScreenNavigationProp>();
  const route = useRoute<ShotDetailScreenRouteProp>();
  const { shots, beans, machines, toggleFavoriteShot, deleteShot } = useStore();

  const shot = useMemo(() => {
    return shots.find(s => s.id === route.params.shotId);
  }, [shots, route.params.shotId]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [oneMoreModalVisible, setOneMoreModalVisible] = useState(false);

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  const handleToggleFavorite = async () => {
    if (!shot) return;

    try {
      await toggleFavoriteShot(shot.id);
    } catch (error) {
      console.error(error);
      setErrorModal({
        visible: true,
        message: 'Failed to update favorite shot',
      });
    }
  };

  const handleOneMore = () => {
    if (!shot) return;
    setOneMoreModalVisible(true);
  };

  const handleOneMoreConfirm = () => {
    setOneMoreModalVisible(false);
    if (!shot) return;
    navigation.navigate('NewShot', { duplicateFrom: shot.id });
  };

  const handleDelete = () => {
    if (!shot) return;
    setDeleteConfirmation(true);
  };

  const confirmDeleteShot = async () => {
    if (!shot) return;
    try {
      await deleteShot(shot.id);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setErrorModal({ visible: true, message: 'Failed to delete shot' });
    }
    setDeleteConfirmation(false);
  };

  const cancelDeleteShot = () => {
    setDeleteConfirmation(false);
  };

  const handleShare = async () => {
    if (!shot) return;

    const bean = beans.find(b => b.id === shot.beanId);
    const machine = machines.find(m => m.id === shot.machineId);

    const shareText = `Espresso Shot Details:
Bean: ${bean?.name || 'Unknown'}
Machine: ${
      machine?.nickname || `${machine?.brand} ${machine?.model}` || 'Unknown'
    }
Grind: ${shot.grindSetting}
Dose: ${shot.dose_g}g
Yield: ${shot.yield_g}g
Ratio: ${shot.ratio ? `1:${shot.ratio.toFixed(1)}` : 'N/A'}
Time: ${shot.shotTime_s ? `${shot.shotTime_s}s` : 'N/A'}
Temperature: ${shot.waterTemp_C ? `${shot.waterTemp_C}°C` : 'N/A'}
Overall Score: ${
      shot.overallScore !== undefined && shot.overallScore !== null
        ? `${shot.overallScore}/10`
        : 'N/A'
    }
${shot.notes ? `Notes: ${shot.notes}` : ''}`;

    try {
      await Share.share({
        message: shareText,
        title: 'Espresso Shot Details',
      });
    } catch (error) {
      console.error(error);
      setErrorModal({ visible: true, message: 'Failed to share shot details' });
    }
  };

  if (!shot) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shot details...</Text>
      </View>
    );
  }

  const bean = beans.find(b => b.id === shot.beanId);
  const machine = machines.find(m => m.id === shot.machineId);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.shotTitleContainer}>
              <Text style={styles.shotTitle}>{formatBeanName(bean)}</Text>
              <RoastingIndicator
                roastLevel={bean?.roastLevel || 'Medium'}
                size='md'
              />
            </View>

            <Text style={styles.shotSubtitle}>
              {machine?.nickname ||
                `${machine?.brand} ${machine?.model}` ||
                'Unknown Machine'}
            </Text>
            <Text style={styles.shotDate}>
              {formatDateLong(shot.createdAt)}
            </Text>
          </View>
          {shot.isFavorite && (
            <SvgIcon
              name='heart_filled'
              size={24}
              color={shot.isFavorite ? colors.heart : colors.primary}
              secondaryColor={
                shot.isFavorite ? colors.heartLight : colors.primaryLight
              }
            />
          )}
        </View>

        {/* Photo Gallery - Display shot photos or fallback to bean photo */}
        {(shot.imageUris?.length || bean?.imageUri) && (
          <View style={styles.photoSection}>
            <PhotoGallery
              imageUris={shot.imageUris}
              fallbackImageUri={bean?.imageUri}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extraction Parameters</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <SvgIcon name='dial' size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Grind</Text>
                <Text style={styles.metricValue}>
                  {shot.grindSetting || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name='scale' size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Dose</Text>
                <Text style={styles.metricValue}>{shot.dose_g}g</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name='water' size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Yield</Text>
                <Text style={styles.metricValue}>{shot.yield_g}g</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name='ratio' size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Ratio</Text>
                <Text style={styles.metricValue}>
                  {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {(shot.shotTime_s || shot.waterTemp_C) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advanced Parameters</Text>
            <View style={styles.metricsGrid}>
              {shot.shotTime_s && (
                <View style={styles.metricCard}>
                  <SvgIcon name='timer' size={36} color={colors.textMedium} />
                  <View style={styles.metricTextContainer}>
                    <Text style={styles.metricLabel}>Time</Text>
                    <Text style={styles.metricValue}>
                      {shot.shotTime_s ? `${shot.shotTime_s}s` : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
              {shot.waterTemp_C && (
                <View style={styles.metricCard}>
                  <SvgIcon name='temp' size={36} color={colors.textMedium} />
                  <View style={styles.metricTextContainer}>
                    <Text style={styles.metricLabel}>Temperature</Text>
                    <Text style={styles.metricValue}>
                      {shot.waterTemp_C ? `${shot.waterTemp_C}°C` : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {shot.overallScore !== undefined && shot.overallScore !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasting Notes</Text>
            <View style={styles.ratingSection}>
              <TastingNotes
                formData={{
                  acidity: shot.acidity || 0,
                  bitterness: shot.bitterness || 0,
                  body: shot.body || 0,
                  aftertaste: shot.aftertaste || 0,
                }}
                readOnly={true}
              />

              <FormField label='Overall Score'>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreValue}>
                    {shot.overallScore}
                    <Text style={styles.scoreBase}>/10</Text>
                  </Text>
                </View>
              </FormField>
            </View>
          </View>
        )}

        {shot.tastingTags && shot.tastingTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasting Tags</Text>
            <View style={styles.tagsContainer}>
              {shot.tastingTags
                .filter(tag => tag && typeof tag === 'string')
                .map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {shot.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{shot.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleFavorite}
          >
            <SvgIcon
              name={shot.isFavorite ? 'heart_filled' : 'heart'}
              size={24}
            />
            <Text style={styles.actionButtonText}>
              {shot.isFavorite ? 'Remove from Favorites' : 'Mark as Favorite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOneMore}>
            <SvgIcon name='add-notes' size={24} />
            <Text style={styles.actionButtonText}>One More</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <SvgIcon name='share' size={24} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <SvgIcon name='delete' size={24} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={deleteConfirmation}
        title='Delete Shot'
        message='Are you sure you want to delete this shot? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        onConfirm={confirmDeleteShot}
        onCancel={cancelDeleteShot}
        destructive={true}
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

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 16,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actions: {
    padding: 20,
  },
  header: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerInfo: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMedium,
    fontSize: 16,
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: colors.hover,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    width: '48%',
  },
  metricLabel: {
    color: colors.textMedium,
    fontSize: 12,
    opacity: 0.8,
  },
  metricTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  metricValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  notesText: {
    color: colors.textDark,
    fontSize: 16,
    lineHeight: 24,
  },
  photoSection: {
    backgroundColor: colors.white,
    marginTop: 8,
    padding: 20,
  },
  ratingSection: {
    marginTop: 8,
  },
  scoreBase: {
    alignItems: 'baseline',
    color: colors.textSecondary,
    flexDirection: 'row',
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shotDate: {
    color: colors.textLight,
    fontSize: 14,
  },
  shotSubtitle: {
    color: colors.textMedium,
    fontSize: 16,
    marginBottom: 4,
  },
  shotTitle: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    marginRight: 8,
  },
  shotTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  tagChip: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ShotDetailScreen;
