import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Shot } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import { colors } from "../themes/colors";

type ShotDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ShotDetail"
>;
type ShotDetailScreenRouteProp = RouteProp<RootStackParamList, "ShotDetail">;

const ShotDetailScreen: React.FC = () => {
  const navigation = useNavigation<ShotDetailScreenNavigationProp>();
  const route = useRoute<ShotDetailScreenRouteProp>();
  const { shots, beans, machines, toggleBestShot, duplicateShot, deleteShot } =
    useStore();

  const [shot, setShot] = useState<Shot | null>(null);

  useEffect(() => {
    const foundShot = shots.find((s) => s.id === route.params.shotId);
    setShot(foundShot || null);
  }, [shots, route.params.shotId]);

  const handleToggleBest = async () => {
    if (!shot) return;

    try {
      await toggleBestShot(shot.id);
    } catch (error) {
      Alert.alert("Error", "Failed to update best shot");
    }
  };

  const handleOneMore = async () => {
    if (!shot) return;

    try {
      const newShotId = await duplicateShot(shot.id);
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

  const handleDelete = () => {
    if (!shot) return;

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
              await deleteShot(shot.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete shot");
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!shot) return;

    const bean = beans.find((b) => b.id === shot.beanId);
    const machine = machines.find((m) => m.id === shot.machineId);

    const shareText = `Espresso Shot Details:
Bean: ${bean?.name || "Unknown"}
Machine: ${
      machine?.nickname || `${machine?.brand} ${machine?.model}` || "Unknown"
    }
Dose: ${shot.dose_g}g
Yield: ${shot.yield_g}g
Time: ${shot.shotTime_s}s
Ratio: ${shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
Rating: ${shot.rating ? `${shot.rating}/5` : "N/A"}
${shot.notes ? `Notes: ${shot.notes}` : ""}`;

    try {
      await Share.share({
        message: shareText,
        title: "Espresso Shot Details",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share shot details");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <SvgIcon
            key={star}
            name={star <= rating ? "star_filled" : "star"}
            size={24}
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (label: string, value: number | undefined) => {
    if (value === undefined) return null;

    return (
      <View style={styles.ratingBar}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <View key={level} style={styles.ratingBean}>
              <SvgIcon
                name={level <= value ? "bean_filled" : "bean"}
                size={16}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!shot) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading shot details...</Text>
      </View>
    );
  }

  const bean = beans.find((b) => b.id === shot.beanId);
  const machine = machines.find((m) => m.id === shot.machineId);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.shotTitle}>{bean?.name || "Unknown Bean"}</Text>
          <Text style={styles.shotSubtitle}>
            {machine?.nickname ||
              `${machine?.brand} ${machine?.model}` ||
              "Unknown Machine"}
          </Text>
          <Text style={styles.shotDate}>{formatDate(shot.createdAt)}</Text>
        </View>
        {shot.isBest && (
          <View style={styles.bestBadge}>
            <SvgIcon name="star_filled" size={24} />
            <Text style={styles.bestText}>BEST</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brew Parameters</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{shot.dose_g}</Text>
            <Text style={styles.metricLabel}>Dose (g)</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{shot.yield_g}</Text>
            <Text style={styles.metricLabel}>Yield (g)</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{shot.shotTime_s}</Text>
            <Text style={styles.metricLabel}>Time (s)</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
            </Text>
            <Text style={styles.metricLabel}>Ratio</Text>
          </View>
        </View>

        {(shot.grindSetting || shot.waterTemp_C || shot.preinfusion_s) && (
          <View style={styles.additionalParams}>
            {shot.grindSetting && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Grind Setting:</Text>
                <Text style={styles.paramValue}>{shot.grindSetting}</Text>
              </View>
            )}
            {shot.waterTemp_C && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Water Temperature:</Text>
                <Text style={styles.paramValue}>{shot.waterTemp_C}°C</Text>
              </View>
            )}
            {shot.preinfusion_s && (
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>Preinfusion:</Text>
                <Text style={styles.paramValue}>{shot.preinfusion_s}s</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {shot.rating && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasting Notes</Text>
          <View style={styles.ratingSection}>
            <View style={styles.overallRating}>
              <Text style={styles.ratingTitle}>Overall Rating</Text>
              {renderStars(shot.rating)}
              <Text style={styles.ratingText}>{shot.rating}/5</Text>
            </View>

            <View style={styles.flavorRatings}>
              {renderRatingBar("Acidity", shot.acidity)}
              {renderRatingBar("Sweetness", shot.sweetness)}
              {renderRatingBar("Bitterness", shot.bitterness)}
              {renderRatingBar("Body", shot.body)}
              {renderRatingBar("Aftertaste", shot.aftertaste)}
            </View>
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
          onPress={handleToggleBest}
        >
          <SvgIcon name={shot.isBest ? "star_filled" : "star"} size={24} />
          <Text style={styles.actionButtonText}>
            {shot.isBest ? "Remove from Best" : "Mark as Best"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleOneMore}>
          <SvgIcon name="add-notes" size={24} />
          <Text style={styles.actionButtonText}>One More</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <SvgIcon name="share" size={24} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <SvgIcon name="delete" size={24} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: colors.white,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerInfo: {
    flex: 1,
  },
  shotTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 4,
  },
  shotSubtitle: {
    fontSize: 16,
    color: colors.textMedium,
    marginBottom: 4,
  },
  shotDate: {
    fontSize: 14,
    color: colors.textLight,
  },
  bestBadge: {
    backgroundColor: colors.warningBackground,
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    minWidth: 60,
  },
  bestText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.warning,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: colors.hover,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textMedium,
  },
  additionalParams: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  paramRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paramLabel: {
    fontSize: 16,
    color: colors.textMedium,
  },
  paramValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  ratingSection: {
    marginTop: 8,
  },
  overallRating: {
    alignItems: "center",
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    color: colors.textMedium,
  },
  satisfiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successBackground,
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
  },
  satisfiedText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.success,
    fontWeight: "600",
  },
  flavorRatings: {
    marginTop: 16,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.textMedium,
    width: 80,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    flex: 1,
  },
  ratingBean: {
    marginRight: 8,
  },
  notesText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});

export default ShotDetailScreen;
