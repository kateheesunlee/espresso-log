import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../../themes/colors';

import Avatar from '../Avatar';
import ConfirmationModal from '../modals/ConfirmationModal';
import ErrorModal from '../modals/ErrorModal';
import SvgIcon, { IconName } from '../SvgIcon';

export interface CardData {
  id: string;
  imageUri?: string;
  createdAt: string;
  [key: string]: any; // Allow additional properties
}

export interface ActionConfig {
  icon: IconName;
  useContentColor?: boolean;
  onPress: () => void | Promise<void>;
}

export interface BaseCardProps {
  showAvatar: boolean;
  data: CardData;
  fallbackIcon: IconName;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  subtitle2?: string | React.ReactNode;
  additionalContent?: React.ReactNode;
  actionConfigs?: ActionConfig[]; // other than onPress and onDelete
  onDelete?: () => void | Promise<void>;
  onPress?: () => void;
  showDeleteGesture?: boolean;
}

const OPEN = -80;
const CLOSED = 0;

const BaseCard: React.FC<BaseCardProps> = ({
  showAvatar,
  data,
  fallbackIcon,
  title,
  subtitle,
  subtitle2,
  additionalContent,
  actionConfigs,
  onDelete,
  onPress,
  showDeleteGesture = true,
}) => {
  const translateX = useRef(new Animated.Value(CLOSED));
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  // Modal states
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      translateX.current.stopAnimation();
    };
  }, []);

  const hideDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(false);
    Animated.spring(translateX.current, {
      toValue: CLOSED,
      useNativeDriver: Platform.OS !== 'web',
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const showDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(true);
    Animated.spring(translateX.current, {
      toValue: OPEN,
      useNativeDriver: Platform.OS !== 'web',
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const pan = Gesture.Pan()
    .minDistance(5)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10]) // If the user swipes up or down, the gesture will fail
    .onUpdate(e => {
      if (e.translationX < 0) {
        showDeleteButtonAnimation();
      } else if (e.translationX > 0 && showDeleteButton) {
        hideDeleteButtonAnimation();
      }
    })
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    });

  const handleDelete = () => {
    // Add haptic feedback when delete button is clicked
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      if (onDelete) {
        await onDelete();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setErrorModal({
        visible: true,
        message: 'Failed to delete item',
      });
    }
    setDeleteConfirmation(false);
    hideDeleteButtonAnimation();
  };

  const cancelDelete = () => {
    setDeleteConfirmation(false);
  };

  const cardContent = (
    <View style={styles.cardLayout}>
      {showAvatar && (
        <View style={styles.imageContainer}>
          <Avatar
            imageUri={data.imageUri}
            fallbackIcon={fallbackIcon}
            size={60}
          />
        </View>
      )}
      <View style={styles.contentContainer}>
        {/* Title row with action buttons */}
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
          {actionConfigs && actionConfigs.length > 0 && (
            <View style={styles.actionsContainer}>
              {actionConfigs.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={action.onPress}
                >
                  <SvgIcon
                    name={action.icon}
                    size={20}
                    useContentColor={action.useContentColor}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Subtitle rows */}
        {subtitle ? (
          <View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : null}
        {subtitle2 ? (
          <View>
            <Text style={styles.subtitle2}>{subtitle2}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const handleCardPress = () => {
    if (showDeleteButton) {
      hideDeleteButtonAnimation();
      return;
    }
    if (onPress) {
      onPress();
    }
  };

  const wrappedContent = onPress ? (
    <TouchableOpacity
      style={styles.cardContent}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {cardContent}
      {additionalContent && additionalContent}
    </TouchableOpacity>
  ) : (
    <View style={styles.cardContent}>{cardContent}</View>
  );

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Button Background */}
      {showDeleteGesture && onDelete && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              handleDelete();
              hideDeleteButtonAnimation();
            }}
          >
            <SvgIcon name='delete' size={24} color={colors.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Card */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.card,
            showDeleteGesture &&
              onDelete && {
                transform: [{ translateX: translateX.current }],
              },
          ]}
        >
          {wrappedContent}
        </Animated.View>
      </GestureDetector>

      {/* Modals */}
      <ConfirmationModal
        visible={deleteConfirmation}
        title='Delete Item'
        message='Are you sure you want to delete this item? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        destructive={true}
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
    marginLeft: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 16,
  },
  cardLayout: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  deleteButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 12,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 80,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  imageContainer: {
    marginRight: 16,
  },
  subtitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  subtitle2: {
    color: colors.textMedium,
    fontSize: 14,
    marginBottom: 6,
  },
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  title: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});

export default BaseCard;
