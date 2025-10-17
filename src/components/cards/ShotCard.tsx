import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";

import { Shot } from "@types";
import { useStore } from "../../store/useStore";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { colors } from "../../themes/colors";

import BaseCard, { ActionConfig } from "./BaseCard";
import SvgIcon from "../SvgIcon";
import CoachingModal from "../modals/CoachingModal";
import RatingSlider from "../inputs/sliders/RatingSlider";
import RoastingIndicator from "../RoastingIndicator";
import ConfirmationModal from "../modals/ConfirmationModal";
import { formatDateTime } from "../../utils/formatDate";

type ShotCardNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShotCardProps {
  shot: Shot;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const navigation = useNavigation<ShotCardNavigationProp>();
  const { allBeans, allMachines, toggleFavoriteShot, deleteShot } = useStore();

  const bean = allBeans.find((b) => b.id === shot.beanId);
  const machine = allMachines.find((m) => m.id === shot.machineId);

  const [oneMoreModalVisible, setOneMoreModalVisible] = useState(false);

  // Coaching modal state
  const [coachingModalVisible, setCoachingModalVisible] = useState(false);

  // Format extraction class for display
  const formatExtractionClass = (label: string) => {
    switch (label) {
      case "under":
        return "Under-extracted";
      case "slightly-under":
        return "Slightly under";
      case "balanced":
        return "Balanced";
      case "slightly-over":
        return "Slightly over";
      case "over":
        return "Over-extracted";
      default:
        return label;
    }
  };

  // Get color for extraction class
  const getExtractionColor = (label: string) => {
    switch (label) {
      case "under":
        return colors.roastingLight;
      case "slightly-under":
        return colors.roastingMediumLight;
      case "balanced":
        return colors.roastingMedium;
      case "slightly-over":
        return colors.roastingMediumDark;
      case "over":
        return colors.roastingDark;
      default:
        return colors.primary;
    }
  };

  // Handler functions
  const handleShotPress = () => {
    navigation.navigate("ShotDetail", { shotId: shot.id });
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
    navigation.navigate("NewShot", { duplicateFrom: shot.id });
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
        <View style={styles.shotMetrics}>
          <View style={styles.metric}>
            <SvgIcon name="dial" size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.grindSetting || "N/A"}</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name="scale" size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.dose_g}g</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name="water" size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>{shot.yield_g}g</Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name="ratio" size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>
              {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
            </Text>
          </View>
          <View style={styles.metric}>
            <SvgIcon name="timer" size={20} color={colors.textSecondary} />
            <Text style={styles.metricValue}>
              {shot.shotTime_s ? `${shot.shotTime_s}s` : "N/A"}
            </Text>
          </View>
        </View>

        {/* Extraction Class */}
        {shot.extractionSnapshot && (
          <Text
            style={[
              styles.extractionClass,
              {
                backgroundColor: getExtractionColor(
                  shot.extractionSnapshot.label
                ),
              },
            ]}
          >
            {formatExtractionClass(shot.extractionSnapshot.label)}
          </Text>
        )}

        {shot.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Overall Rating:</Text>
            <RatingSlider
              value={shot.rating}
              onValueChange={() => {}} // No-op for readonly mode
              readonly={true}
              iconType="star"
              size={24}
              fullWidth={false}
            />
          </View>
        )}
      </View>
    );
  };

  const subtitle =
    bean?.name || "Unknown Bean" + (bean?.deleted ? " (deleted)" : "");

  const renderSubtitle = () => {
    return (
      <Text>
        {subtitle}{" "}
        <RoastingIndicator roastLevel={bean?.roastLevel!} size="sm" compact />
      </Text>
    );
  };

  const subtitle2 =
    machine?.nickname ||
    `${machine?.brand} ${machine?.model}${
      machine?.grinder ? ` + ${machine?.grinder}` : ""
    }` ||
    "Unknown Machine" + (machine?.deleted ? " (deleted)" : "");

  const showCoachingButton =
    bean &&
    (shot.acidity !== undefined ||
      shot.bitterness !== undefined ||
      shot.body !== undefined ||
      shot.aftertaste !== undefined);

  const coachingButtonConfig: ActionConfig = {
    icon: "magic_hat",
    onPress: handleCoaching,
  };

  return (
    <>
      <BaseCard
        showAvatar={false}
        data={shot as any}
        title={formatDateTime(shot.createdAt)}
        subtitle={renderSubtitle()}
        subtitle2={subtitle2}
        details={[]}
        additionalContent={additionalContent()}
        fallbackIcon="coffee"
        onDelete={handleDelete}
        onPress={handleShotPress}
        showDeleteGesture={true}
        actionConfigs={[
          {
            icon: "add-notes",
            onPress: handleOneMore,
          },
          {
            icon: shot.isFavorite ? "heart_filled" : "heart",
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
        title="One More Shot"
        message="This will open a new shot form pre-filled with the current shot's parameters. You can modify any values before saving."
        confirmText="One More"
        cancelText="Cancel"
        onConfirm={handleOneMoreConfirm}
        onCancel={() => setOneMoreModalVisible(false)}
        icon="add-notes"
      />
    </>
  );
};

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  additionalContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    marginTop: 12,
    paddingTop: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  extractionClass: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  shotMetrics: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 4, // slight adjustment for visual balance
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
});

export default ShotCard;
