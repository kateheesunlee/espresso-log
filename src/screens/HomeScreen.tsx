import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { RootStackParamList } from "../navigation/AppNavigator";
import { Shot } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import CustomPicker from "../components/CustomPicker";
import ScrollableListView from "../components/ScrollableListView";
import EmptyEntity from "../components/EmptyEntity";
import ConfirmationModal from "../components/ConfirmationModal";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import { colors } from "../themes/colors";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShotItemProps {
  shot: Shot;
  onPress: () => void;
  onToggleBest: () => void;
  onOneMore: () => void;
  onDelete: () => void;
}

const ShotItem: React.FC<ShotItemProps> = ({
  shot,
  onPress,
  onToggleBest,
  onOneMore,
  onDelete,
}) => {
  const { allBeans, allMachines } = useStore();
  const translateX = useRef(new Animated.Value(0));
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

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

  return (
    <View style={styles.swipeContainer}>
      {/* Delete Button Background */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            onDelete();
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
              onPress();
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
                onPress={onToggleBest}
              >
                <SvgIcon
                  name={shot.isBest ? "star_filled" : "star"}
                  size={20}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onOneMore}>
                <SvgIcon name="copy" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.shotMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Dose</Text>
              <Text style={styles.metricValue}>{shot.dose_g}g</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Yield</Text>
              <Text style={styles.metricValue}>{shot.yield_g}g</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Time</Text>
              <Text style={styles.metricValue}>{shot.shotTime_s}s</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Ratio</Text>
              <Text style={styles.metricValue}>
                {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
              </Text>
            </View>
          </View>

          {shot.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating: </Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <SvgIcon
                    key={star}
                    name={star <= shot.rating! ? "bean_filled" : "bean"}
                    size={16}
                  />
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    shots,
    beans,
    machines,
    isLoading,
    loadShots,
    toggleBestShot,
    duplicateShot,
    deleteShot,
  } = useStore();

  // Filter state
  const [selectedBeanId, setSelectedBeanId] = useState<string>("");
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    shotId: string | null;
  }>({ visible: false, shotId: null });

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    newShotId: string | null;
  }>({ visible: false, newShotId: null });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  // Pre-select filters based on last shot (only if user hasn't interacted)
  useEffect(() => {
    if (
      shots.length > 0 &&
      beans.length > 0 &&
      machines.length > 0 &&
      !hasUserInteracted
    ) {
      const lastShot = shots[0]; // Shots are sorted by creation date desc

      // Pre-select bean from last shot
      if (lastShot.beanId && !selectedBeanId) {
        setSelectedBeanId(lastShot.beanId);
      }

      // Pre-select machine from last shot
      if (lastShot.machineId && !selectedMachineId) {
        setSelectedMachineId(lastShot.machineId);
      }
    }
  }, [
    shots,
    beans,
    machines,
    selectedBeanId,
    selectedMachineId,
    hasUserInteracted,
  ]);

  // Wrapper functions to track user interaction
  const handleBeanChange = (beanId: string) => {
    setSelectedBeanId(beanId);
    setHasUserInteracted(true);
  };

  const handleMachineChange = (machineId: string) => {
    setSelectedMachineId(machineId);
    setHasUserInteracted(true);
  };

  // Filter shots based on selected filters
  const filteredShots = shots.filter((shot) => {
    const beanMatch = !selectedBeanId || shot.beanId === selectedBeanId;
    const machineMatch =
      !selectedMachineId || shot.machineId === selectedMachineId;
    return beanMatch && machineMatch;
  });

  const handleShotPress = (shotId: string) => {
    navigation.navigate("ShotDetail", { shotId });
  };

  const handleToggleBest = async (shotId: string) => {
    try {
      await toggleBestShot(shotId);
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to update best shot" });
    }
  };

  const handleOneMore = async (shotId: string) => {
    try {
      const newShotId = await duplicateShot(shotId);
      if (newShotId) {
        setSuccessModal({ visible: true, newShotId });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to duplicate shot" });
    }
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

  const handleDelete = (shotId: string) => {
    setDeleteConfirmation({ visible: true, shotId });
  };

  const confirmDeleteShot = async () => {
    if (deleteConfirmation.shotId) {
      try {
        await deleteShot(deleteConfirmation.shotId);
      } catch (error) {
        setErrorModal({ visible: true, message: "Failed to delete shot" });
      }
    }
    setDeleteConfirmation({ visible: false, shotId: null });
  };

  const cancelDeleteShot = () => {
    setDeleteConfirmation({ visible: false, shotId: null });
  };

  const handleNewShot = () => {
    navigation.navigate("NewShot", {
      selectedBeanId: selectedBeanId || undefined,
      selectedMachineId: selectedMachineId || undefined,
    });
  };

  const renderShot = ({ item }: { item: Shot }) => (
    <ShotItem
      shot={item}
      onPress={() => handleShotPress(item.id)}
      onToggleBest={() => handleToggleBest(item.id)}
      onOneMore={() => handleOneMore(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  // Prepare picker options
  const beanOptions = beans.map((bean) => ({
    id: bean.id,
    name: bean.name,
  }));

  const machineOptions = machines.map((machine) => ({
    id: machine.id,
    name: machine.nickname || `${machine.brand} ${machine.model}`,
  }));

  // Check if we should show filters
  const showBeanFilter = beans.length > 1;
  const showMachineFilter = machines.length > 1;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Shots</Text>
        <TouchableOpacity style={styles.newShotButton} onPress={handleNewShot}>
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {(showBeanFilter || showMachineFilter) && (
        <View style={styles.filtersContainer}>
          {showBeanFilter && (
            <CustomPicker
              label="Bean"
              value={selectedBeanId}
              options={beanOptions}
              onValueChange={handleBeanChange}
              placeholder="All beans"
              compact={true}
              showClearButton={true}
            />
          )}
          {showMachineFilter && (
            <CustomPicker
              label="Machine"
              value={selectedMachineId}
              options={machineOptions}
              onValueChange={handleMachineChange}
              placeholder="All machines"
              compact={true}
              showClearButton={true}
            />
          )}
        </View>
      )}

      <ScrollableListView
        data={filteredShots}
        renderItem={renderShot}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon="coffee"
            title={
              shots.length === 0 ? "No shots yet" : "No shots match filters"
            }
            subtitle={
              shots.length === 0
                ? "Log your first espresso shot and begin your extraction journey."
                : "Try adjusting your filter selections to see more shots."
            }
            buttonText={
              shots.length === 0 ? "Record Your First Shot" : undefined
            }
            onButtonPress={shots.length === 0 ? handleNewShot : undefined}
          />
        }
      />

      <ConfirmationModal
        visible={deleteConfirmation.visible}
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
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMedium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  newShotButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
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
  bestBadge: {
    backgroundColor: colors.warningBackground,
    borderRadius: 12,
    padding: 4,
    marginRight: 8,
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
  metricLabel: {
    fontSize: 12,
    color: colors.textMedium,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
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
    gap: 2,
  },
});

export default HomeScreen;
