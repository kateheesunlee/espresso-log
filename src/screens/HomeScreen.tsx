import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  PanResponder,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Shot } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
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
  const { beans, machines } = useStore();
  const [translateX] = useState(new Animated.Value(0));
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [initialX, setInitialX] = useState(0);

  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      translateX.stopAnimation();
    };
  }, [translateX]);

  const hideDeleteButton = () => {
    setShowDeleteButton(false);
    translateX.stopAnimation();
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const showDeleteButtonAnimation = () => {
    setShowDeleteButton(true);
    translateX.stopAnimation();
    Animated.spring(translateX, {
      toValue: -80,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const panResponder = PanResponder.create({
    onPanResponderGrant: () => {
      // Store the initial position when gesture starts
      setInitialX(showDeleteButton ? -80 : 0);
    },
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        // Swipe left - show delete button
        translateX.setValue(Math.max(gestureState.dx, -80));
      } else if (gestureState.dx > 0 && showDeleteButton) {
        // Swipe right - hide delete button
        // Start from initial position (-80) and move towards 0
        const newX = Math.min(initialX + gestureState.dx, 0);
        translateX.setValue(newX);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        // Show delete button with bouncy animation
        showDeleteButtonAnimation();
      } else if (gestureState.dx > 20 && showDeleteButton) {
        // Hide delete button with bouncy animation
        hideDeleteButton();
      } else {
        // Snap back to current state with bouncy animation
        if (showDeleteButton) {
          showDeleteButtonAnimation();
        } else {
          hideDeleteButton();
        }
      }
    },
  });

  const bean = beans.find((b) => b.id === shot.beanId);
  const machine = machines.find((m) => m.id === shot.machineId);

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
            hideDeleteButton();
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
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.shotItemContent}
          onPress={() => {
            if (showDeleteButton) {
              hideDeleteButton();
            } else {
              onPress();
            }
          }}
        >
          <View style={styles.shotHeader}>
            <View style={styles.shotInfo}>
              <Text style={styles.shotTitle}>
                {bean?.name || "Unknown Bean"}
              </Text>
              <Text style={styles.shotSubtitle}>
                {machine?.nickname ||
                  `${machine?.brand} ${machine?.model}` ||
                  "Unknown Machine"}
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
    isLoading,
    loadShots,
    toggleBestShot,
    duplicateShot,
    deleteShot,
  } = useStore();

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  const handleShotPress = (shotId: string) => {
    navigation.navigate("ShotDetail", { shotId });
  };

  const handleToggleBest = async (shotId: string) => {
    try {
      await toggleBestShot(shotId);
    } catch (error) {
      Alert.alert("Error", "Failed to update best shot");
    }
  };

  const handleOneMore = async (shotId: string) => {
    try {
      const newShotId = await duplicateShot(shotId);
      if (newShotId) {
        Alert.alert(
          "One More Shot",
          "Shot duplicated successfully! You can now modify the parameters.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Edit",
              onPress: () =>
                navigation.navigate("NewShot", { duplicateFrom: newShotId }),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to duplicate shot");
    }
  };

  const handleDelete = (shotId: string) => {
    Alert.alert(
      "Delete Shot",
      "Are you sure you want to delete this shot? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShot(shotId);
            } catch (error) {
              Alert.alert("Error", "Failed to delete shot");
            }
          },
        },
      ]
    );
  };

  const handleNewShot = () => {
    navigation.navigate("NewShot", {});
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
        <Text style={styles.headerTitle}>Your Shots</Text>
        <TouchableOpacity style={styles.newShotButton} onPress={handleNewShot}>
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {shots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SvgIcon name="coffee" size={64} />
          <Text style={styles.emptyTitle}>No shots yet</Text>
          <Text style={styles.emptySubtitle}>
            Log your first espresso shot and begin your extraction journey.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewShot}>
            <Text style={styles.emptyButtonText}>Record Your First Shot</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === "web" ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.listContainer}
        >
          {shots.map((shot) => (
            <View key={shot.id}>{renderShot({ item: shot })}</View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={shots}
          renderItem={renderShot}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
