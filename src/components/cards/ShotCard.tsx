import React from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../../store/useStore";
import { Shot } from "../../database/UniversalDatabase";
import { RootStackParamList } from "../../navigation/AppNavigator";
import BaseCard from "./BaseCard";
import { View, Text, StyleSheet } from "react-native";
import SvgIcon from "../SvgIcon";
import { colors } from "../../themes/colors";

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
      cloneOfNewItem={true}
      isFavorite={shot.isFavorite}
      editScreenName="NewShot"
    />
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
});

export default ShotCard;
