import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../../store/useStore";
import { Shot } from "../../database/UniversalDatabase";
import { RootStackParamList } from "../../navigation/AppNavigator";
import BaseCard from "./BaseCard";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SvgIcon from "../SvgIcon";
import { colors } from "../../themes/colors";
import CoachingModal from "../modals/CoachingModal";
import { CoachingService } from "../../coaching/service/CoachingService";
import { Suggestion } from "../../coaching/types";

type ShotCardNavigationProp = StackNavigationProp<RootStackParamList>;

interface ShotCardProps {
  shot: Shot;
}

const ShotCard: React.FC<ShotCardProps> = ({ shot }) => {
  const navigation = useNavigation<ShotCardNavigationProp>();
  const {
    allBeans,
    allMachines,
    toggleFavoriteShot,
    duplicateShot,
    deleteShot,
  } = useStore();

  const bean = allBeans.find((b) => b.id === shot.beanId);
  const machine = allMachines.find((m) => m.id === shot.machineId);

  // Coaching modal state
  const [coachingModalVisible, setCoachingModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
    await toggleFavoriteShot(shot.id);
  };

  const handleDuplicate = async () => {
    return await duplicateShot(shot.id);
  };

  const handleDelete = async () => {
    await deleteShot(shot.id);
  };

  const handleCoaching = async () => {
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

    // Build coaching input from shot data
    const coachingService = new CoachingService("rule");
    const input = {
      roast: bean.roastLevel,
      dose_g: shot.dose_g,
      yield_g: shot.yield_g,
      shotTime_s: shot.shotTime_s,
      ratio: shot.ratio,
      waterTemp_C: shot.waterTemp_C,
      preinfusion_s: shot.preinfusion_s,
      grindStep: shot.grindSetting,
      balance: {
        acidity: shot.acidity,
        bitterness: shot.bitterness,
        body: shot.body,
        aftertaste: shot.aftertaste,
      },
    };

    const results = await coachingService.getSuggestions(input);
    setSuggestions(results);
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
            <Text style={styles.metricValue}>{shot.shotTime_s}s</Text>
          </View>
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

        {/* Coaching Button - Only show if we have taste data */}
        {bean &&
          (shot.acidity !== undefined ||
            shot.bitterness !== undefined ||
            shot.body !== undefined ||
            shot.aftertaste !== undefined) && (
            <TouchableOpacity
              style={styles.coachingButton}
              onPress={handleCoaching}
              activeOpacity={0.7}
            >
              <SvgIcon name="magic_hat" size={20} color={colors.primary} />
              <Text style={styles.coachingButtonText}>Get Coaching</Text>
            </TouchableOpacity>
          )}
      </View>
    );
  };

  const subtitle =
    bean?.name || "Unknown Bean" + (bean?.deleted ? " (deleted)" : "");
  const subtitle2 =
    machine?.nickname ||
    `${machine?.brand} ${machine?.model}${
      machine?.grinder ? ` + ${machine?.grinder}` : ""
    }` ||
    "Unknown Machine" + (machine?.deleted ? " (deleted)" : "");

  return (
    <>
      <BaseCard
        showAvatar={false}
        data={shot as any}
        title={formatDate(shot.createdAt)}
        subtitle={subtitle}
        subtitle2={subtitle2}
        details={[]}
        additionalContent={additionalContent()}
        fallbackIcon="coffee"
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onFavorite={handleToggleFavorite}
        onPress={handleShotPress}
        showDeleteGesture={true}
        isFavorite={shot.isFavorite}
        editScreenName="NewShot"
      />

      <CoachingModal
        visible={coachingModalVisible}
        suggestions={suggestions}
        onClose={() => setCoachingModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  additionalContent: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    width: "100%",
  },
  shotMetrics: {
    width: "100%",
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
    width: "100%",
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
  coachingButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  coachingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});

export default ShotCard;
