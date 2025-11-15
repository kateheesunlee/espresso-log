import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import ShotShareCard from '../components/ShotShareCard';
import SvgIcon from '../components/SvgIcon';
import ErrorModal from '../components/modals/ErrorModal';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { colors } from '../themes/colors';
import { formatBeanName } from '../utils/formatBeanName';
import { captureAndShareShot } from '../utils/shotSharingUtils';

type ShotSharePreviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShotSharePreview'
>;
type ShotSharePreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'ShotSharePreview'
>;

const ShotSharePreviewScreen: React.FC = () => {
  const navigation = useNavigation<ShotSharePreviewScreenNavigationProp>();
  const route = useRoute<ShotSharePreviewScreenRouteProp>();
  const { shots, beans, machines } = useStore();
  const [showBeanInfo, setShowBeanInfo] = useState(true);
  const [showMachineInfo, setShowMachineInfo] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  const shot = shots.find(s => s.id === route.params.shotId);
  const bean = beans.find(b => b.id === route.params.beanId);
  const machine = machines.find(m => m.id === route.params.machineId);

  const [isSharing, setIsSharing] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const shotShareCardRef = useRef<View>(null);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  const photos = [
    ...(shot?.imageUris || []),
    ...(bean?.imageUri ? [bean.imageUri] : []),
    ...(machine?.imageUri ? [machine.imageUri] : []),
  ];
  const photoCount = photos.length;
  const hasMultiplePhotos = photoCount > 1;

  const handlePreviousPhoto = () => {
    setSelectedPhotoIndex(prev => (prev === 0 ? photoCount - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex(prev => (prev === photoCount - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    if (!shot) return;

    setIsSharing(true);
    try {
      console.log('Starting shot image capture...');

      await captureAndShareShot(shotShareCardRef, {
        saveToLibrary: true,
        shareTitle: formatBeanName(bean),
        shareMessage: `Just logged an espresso shot! ${shot.overallScore}/10 - EspressoLog 📸☕`,
      });

      // On successful share, go back to detail screen
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing:', error);
      setErrorModal({
        visible: true,
        message: `Failed to share shot image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!shot || !bean) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading preview...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preview Content */}
      <View style={styles.previewContainer}>
        <View style={styles.shotShareCardContainer}>
          <View ref={shotShareCardRef} collapsable={false}>
            <ShotShareCard
              shot={shot}
              bean={bean}
              machine={machine}
              showMetrics={showMetrics}
              showBeanInfo={showBeanInfo}
              showMachineInfo={showMachineInfo}
              photoUri={photos[selectedPhotoIndex]}
            />
          </View>
        </View>
        {/* controls */}
        <View style={styles.controlsContainer}>
          {/* Photo Selection */}
          {hasMultiplePhotos && (
            <View style={styles.photoControlRow}>
              <TouchableOpacity
                style={styles.photoNavigationButton}
                onPress={handlePreviousPhoto}
              >
                <Ionicons
                  name='chevron-back'
                  size={20}
                  color={colors.textDark}
                />
              </TouchableOpacity>
              <Text style={styles.photoIndicator}>
                {selectedPhotoIndex + 1} / {photoCount}
              </Text>
              <TouchableOpacity
                style={styles.photoNavigationButton}
                onPress={handleNextPhoto}
              >
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color={colors.textDark}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Toggles for show/hide details */}
          <View style={styles.toggleContainer}>
            <Switch
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              value={showMetrics}
              onValueChange={setShowMetrics}
              style={styles.toggleMetricsSwitch}
            />
            <Text style={styles.toggleDetailsText}>
              Show extraction parameters
            </Text>
          </View>
          <View style={styles.toggleContainer}>
            <Switch
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              value={showBeanInfo}
              onValueChange={setShowBeanInfo}
              style={styles.toggleBeanAndMachineInfoSwitch}
            />
            <Text style={styles.toggleBeanAndMachineInfoText}>
              Show Bean Info
            </Text>
          </View>
          <View style={styles.toggleContainer}>
            <Switch
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              value={showMachineInfo}
              onValueChange={setShowMachineInfo}
              style={styles.toggleBeanAndMachineInfoSwitch}
            />
            <Text style={styles.toggleBeanAndMachineInfoText}>
              Show Machine Info
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={isSharing}
        >
          <SvgIcon name='close' size={24} color={colors.textDark} />
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.shareButton,
            isSharing && styles.disabledButton,
          ]}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size='small' color={colors.white} />
          ) : (
            <>
              <SvgIcon name='share' size={24} color={colors.white} />
              <Text style={styles.shareButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderWidth: 1,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  controlsContainer: {
    backgroundColor: colors.white,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 16,
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
  photoControlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoIndicator: {
    color: colors.textMedium,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  photoNavigationButton: {
    backgroundColor: colors.hover,
    borderRadius: 8,
    padding: 8,
  },
  previewContainer: {
    flex: 1,
    overflow: 'hidden',
    padding: 12,
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shotShareCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleBeanAndMachineInfoSwitch: {
    marginRight: 8,
  },
  toggleBeanAndMachineInfoText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toggleDetailsText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  toggleMetricsSwitch: {
    marginRight: 8,
  },
});

export default ShotSharePreviewScreen;
