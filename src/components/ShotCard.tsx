import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../store/useStore";
import { Shot } from "../database/UniversalDatabase";
import { RootStackParamList } from "../navigation/AppNavigator";
import SvgIcon from "./SvgIcon";
import ConfirmationModal from "./modals/ConfirmationModal";
import SuccessModal from "./modals/SuccessModal";
import ErrorModal from "./modals/ErrorModal";
import { colors } from "../themes/colors";

type ShotItemNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShotCardProps {
  shot: Shot;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const navigation = useNavigation<ShotItemNavigationProp>();
  const {
    allBeans,
    allMachines,
    toggleFavoriteShot,
    duplicateShot,
    deleteShot,
  } = useStore();
  const translateX = useRef(new Animated.Value(0));
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Modal states
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    newShotId: string | null;
  }>({ visible: false, newShotId: null });
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      translateX.current.stopAnimation();
    };
  }, [translateX]);

  const hideDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(false);
    Animated.spring(translateX.current, {
      toValue: 0,
      useNativeDriver: Platform.OS !== "web",
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const showDeleteButtonAnimation = useCallback(() => {
    setShowDeleteButton(true);
    Animated.spring(translateX.current, {
      toValue: -80,
      useNativeDriver: Platform.OS !== "web",
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const threshold = 5;
      const shouldPan = Math.abs(gestureState.dx) > threshold;
      if (shouldPan) {
        setIsPanning(true);
      }
      return shouldPan;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        // Swipe left - show delete button
        showDeleteButtonAnimation();
      } else if (gestureState.dx > 0 && showDeleteButton) {
        // Swipe right - hide delete button
        hideDeleteButtonAnimation();
      }
    },
    onPanResponderRelease: () => {
      // Reset panning state after a short delay to prevent onPress from firing
      setTimeout(() => {
        setIsPanning(false);
      }, 100);
    },
  });

  const bean = allBeans.find((b) => b.id === shot.beanId);
  const machine = allMachines.find((m) => m.id === shot.machineId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handler functions
  const handleShotPress = () => {
    navigation.navigate("ShotDetail", { shotId: shot.id });
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteShot(shot.id);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: "Failed to update favorite shot",
      });
    }
  };

  const handleOneMore = async () => {
    try {
      const newShotId = await duplicateShot(shot.id);
      if (newShotId) {
        setSuccessModal({ visible: true, newShotId });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to duplicate shot" });
    }
  };

  const handleDelete = () => {
    setDeleteConfirmation(true);
  };

  const confirmDeleteShot = async () => {
    try {
      await deleteShot(shot.id);
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to delete shot" });
    }
    setDeleteConfirmation(false);
  };

  const cancelDeleteShot = () => {
    setDeleteConfirmation(false);
  };

  const handleEditDuplicatedShot = () => {
    if (successModal.newShotId) {
      navigation.navigate("NewShot", { duplicateFrom: successModal.newShotId });
    }
    setSuccessModal({ visible: false, newShotId: null });
  };

  const handleCancelSuccess = () => {
    setSuccessModal({ visible: false, newShotId: null });
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Button Background */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            handleDelete();
            hideDeleteButtonAnimation();
          }}
        >
          <SvgIcon name="delete" size={24} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <Animated.View
        style={[
          styles.shotItem,
          {
            transform: [{ translateX: translateX.current }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.shotItemContent}
          onPress={() => {
            // Don't trigger onPress if we were panning
            if (isPanning) {
              return;
            }

            if (showDeleteButton) {
              hideDeleteButtonAnimation();
            } else {
              handleShotPress();
            }
          }}
        >
          <View style={styles.shotHeader}>
            <View style={styles.shotInfo}>
              <Text style={styles.shotTitle}>
                {bean?.name || "Unknown Bean"}
                {bean?.deleted && " (deleted)"}
              </Text>
              <Text style={styles.shotSubtitle}>
                {machine?.nickname ||
                  `${machine?.brand} ${machine?.model}` ||
                  "Unknown Machine"}
                {machine?.deleted && " (deleted)"}
              </Text>
              <Text style={styles.shotDate}>{formatDate(shot.createdAt)}</Text>
            </View>
            <View style={styles.shotActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleToggleFavorite}
              >
                <SvgIcon
                  name={shot.isFavorite ? "heart_filled" : "heart"}
                  size={20}
                  color={shot.isFavorite ? colors.heart : colors.primary}
                  secondaryColor={
                    shot.isFavorite ? colors.heartLight : colors.primaryLight
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOneMore}
              >
                <SvgIcon name="copy" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.shotMetrics}>
            <View style={styles.metric}>
              <SvgIcon name="scale" size={20} color={colors.textSecondary} />
              <Text style={styles.metricValue}>{shot.dose_g}g</Text>
            </View>
            <View style={styles.metric}>
              <SvgIcon name="water" size={20} color={colors.textSecondary} />
              <Text style={styles.metricValue}>{shot.yield_g}g</Text>
            </View>
            <View style={styles.metric}>
              <SvgIcon name="timer" size={20} color={colors.textSecondary} />
              <Text style={styles.metricValue}>{shot.shotTime_s}s</Text>
            </View>
            <View style={styles.metric}>
              <SvgIcon name="ratio" size={20} color={colors.textSecondary} />
              <Text style={styles.metricValue}>
                {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
              </Text>
            </View>
            {shot.grindSetting && (
              <View style={styles.metric}>
                <SvgIcon name="dial" size={20} color={colors.textSecondary} />
                <Text style={styles.metricValue}>{shot.grindSetting}</Text>
              </View>
            )}
          </View>

          {shot.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating: </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= shot.rating!;
                  const isHalfFilled =
                    star - 0.5 <= shot.rating! && shot.rating! < star;

                  return (
                    <View key={star} style={styles.beanContainer}>
                      <SvgIcon
                        name={isFilled ? "bean_filled" : "bean"}
                        size={20}
                      />
                      {isHalfFilled && (
                        <View style={styles.halfBeanOverlay}>
                          <SvgIcon name="bean_filled" size={20} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Modals */}
      <ConfirmationModal
        visible={deleteConfirmation}
        title="Delete Shot"
        message="Are you sure you want to delete this shot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteShot}
        onCancel={cancelDeleteShot}
        destructive={true}
      />

      <SuccessModal
        visible={successModal.visible}
        title="One More Shot"
        message="Shot duplicated successfully! You can now modify the parameters."
        primaryButtonText="Edit"
        secondaryButtonText="Cancel"
        onPrimaryPress={handleEditDuplicatedShot}
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
  shotItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 0,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shotItemContent: {
    padding: 16,
  },
  shotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  shotInfo: {
    flex: 1,
  },
  shotTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  shotSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 4,
  },
  shotDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  shotActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  shotMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  metric: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.textMedium,
    marginRight: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  beanContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  halfBeanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    overflow: "hidden",
  },
});

export default ShotCard;
