import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import SvgIcon, { IconName } from "../SvgIcon";
import Avatar from "../Avatar";
import ConfirmationModal from "../modals/ConfirmationModal";
import SuccessModal from "../modals/SuccessModal";
import ErrorModal from "../modals/ErrorModal";
import { colors } from "../../themes/colors";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export interface CardData {
  id: string;
  imageUri?: string;
  createdAt: string;
  [key: string]: any; // Allow additional properties
}

export interface BaseCardProps {
  showAvatar: boolean;
  data: CardData;
  fallbackIcon: IconName;
  title: string | React.ReactNode;
  // titleBadge?: React.ReactNode;
  subtitle?: string | React.ReactNode;
  subtitle2?: string | React.ReactNode;
  details?: string[];
  additionalContent?: React.ReactNode;
  onDelete?: () => void | Promise<void>;
  onPress?: () => void;
  onEdit?: () => void;
  onFavorite?: () => void | Promise<void>;
  onDuplicate?: () => Promise<string | null>;
  showDeleteGesture?: boolean;
  showDate?: boolean;
  isFavorite?: boolean;
  editScreenName?: keyof RootStackParamList;
}

type BaseCardNavigationProp = StackNavigationProp<RootStackParamList>;

const OPEN = -80;
const CLOSED = 0;

const BaseCard: React.FC<BaseCardProps> = ({
  showAvatar,
  data,
  fallbackIcon,
  title,
  subtitle,
  subtitle2,
  details = [],
  additionalContent,
  onDelete,
  onDuplicate,
  onPress,
  onEdit,
  onFavorite,
  showDeleteGesture = true,
  showDate = false,
  isFavorite = false,
  editScreenName,
}) => {
  const navigation = useNavigation<BaseCardNavigationProp>();
  const translateX = useRef(new Animated.Value(CLOSED));
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  // Modal states
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    newItemId: string | null;
  }>({ visible: false, newItemId: null });
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      translateX.current.stopAnimation();
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hideDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(false);
    Animated.spring(translateX.current, {
      toValue: CLOSED,
      useNativeDriver: Platform.OS !== "web",
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const showDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(true);
    Animated.spring(translateX.current, {
      toValue: OPEN,
      useNativeDriver: Platform.OS !== "web",
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const pan = Gesture.Pan()
    .minDistance(5)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10]) // If the user swipes up or down, the gesture will fail
    .onUpdate((e) => {
      if (e.translationX < 0) {
        showDeleteButtonAnimation();
      } else if (e.translationX > 0 && showDeleteButton) {
        hideDeleteButtonAnimation();
      }
    });

  const handleDelete = () => {
    setDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      if (onDelete) {
        await onDelete();
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        message: "Failed to delete item",
      });
    }
    setDeleteConfirmation(false);
    hideDeleteButtonAnimation();
  };

  const cancelDelete = () => {
    setDeleteConfirmation(false);
  };

  const handleFavorite = async () => {
    try {
      if (onFavorite) {
        await onFavorite();
      }
    } catch (error) {
      setErrorModal({
        visible: true,
        message: "Failed to update favorite",
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      if (onDuplicate) {
        const newItemId = await onDuplicate();
        if (newItemId) {
          setSuccessModal({ visible: true, newItemId });
        }
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to duplicate item" });
    }
  };

  const handleEditDuplicatedItem = () => {
    if (successModal.newItemId && editScreenName) {
      navigation.navigate(editScreenName, {
        duplicateFrom: successModal.newItemId,
      } as any);
    }
    setSuccessModal({ visible: false, newItemId: null });
  };

  const handleCancelSuccess = () => {
    setSuccessModal({ visible: false, newItemId: null });
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
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {subtitle2 && <Text style={styles.subtitle2}>{subtitle2}</Text>}
        {details.length > 0 && (
          <View style={styles.detailsContainer}>
            {details.map((detail, index) => (
              <Text key={index} style={styles.detail}>
                {detail}
              </Text>
            ))}
          </View>
        )}
        {showDate && (
          <Text style={styles.date}>{formatDate(data.createdAt)}</Text>
        )}
      </View>
      {(onEdit || onFavorite) && (
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <SvgIcon name="edit" size={20} />
            </TouchableOpacity>
          )}
          {onFavorite && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavorite}
            >
              <SvgIcon
                name={isFavorite ? "heart_filled" : "heart"}
                size={20}
                color={isFavorite ? colors.heart : colors.primary}
                secondaryColor={
                  isFavorite ? colors.heartLight : colors.primaryLight
                }
              />
            </TouchableOpacity>
          )}
          {onDuplicate && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDuplicate}
            >
              <SvgIcon name="copy" size={20} />
            </TouchableOpacity>
          )}
        </View>
      )}
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
            <SvgIcon name="delete" size={24} color={colors.white} />
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
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        destructive={true}
      />

      <SuccessModal
        visible={successModal.visible}
        title="One More Shot"
        message="Shot duplicated successfully! You can now modify the parameters."
        primaryButtonText="Edit"
        secondaryButtonText="Done"
        onPrimaryPress={handleEditDuplicatedItem}
        onSecondaryPress={handleCancelSuccess}
        icon="add-notes"
      />

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: "" })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
    marginBottom: 12,
  },
  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: colors.error,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
  },
  cardLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 6,
  },
  subtitle2: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 6,
  },
  detailsContainer: {
    marginBottom: 0,
  },
  detail: {
    fontSize: 12,
    color: colors.textMedium,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default BaseCard;
