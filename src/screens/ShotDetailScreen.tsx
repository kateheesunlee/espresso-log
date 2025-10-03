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
import BalanceSlider from "../components/inputs/sliders/BalanceSlider";
import RatingSlider from "../components/inputs/sliders/RatingSlider";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import SuccessModal from "../components/modals/SuccessModal";
import ErrorModal from "../components/modals/ErrorModal";
import { colors } from "../themes/colors";
import { FormField } from "../components/inputs";
import RoastingIndicator from "../components/RoastingIndicator";

type ShotDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ShotDetail"
>;
type ShotDetailScreenRouteProp = RouteProp<RootStackParamList, "ShotDetail">;

const ShotDetailScreen: React.FC = () => {
  const navigation = useNavigation<ShotDetailScreenNavigationProp>();
  const route = useRoute<ShotDetailScreenRouteProp>();
  const {
    shots,
    beans,
    machines,
    toggleFavoriteShot,
    duplicateShot,
    deleteShot,
  } = useStore();

  const [shot, setShot] = useState<Shot | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    newShotId: string | null;
  }>({ visible: false, newShotId: null });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  useEffect(() => {
    const foundShot = shots.find((s) => s.id === route.params.shotId);
    setShot(foundShot || null);
  }, [shots, route.params.shotId]);

  const handleToggleFavorite = async () => {
    if (!shot) return;

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
    if (!shot) return;

    try {
      const newShotId = await duplicateShot(shot.id);
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

  const handleDelete = () => {
    if (!shot) return;
    setDeleteConfirmation(true);
  };

  const confirmDeleteShot = async () => {
    if (!shot) return;
    try {
      await deleteShot(shot.id);
      navigation.goBack();
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to delete shot" });
    }
    setDeleteConfirmation(false);
  };

  const cancelDeleteShot = () => {
    setDeleteConfirmation(false);
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
      setErrorModal({ visible: true, message: "Failed to share shot details" });
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

  const renderBalanceSlider = (label: string, value: number | undefined) => {
    let qualityIndicators: string[];

    switch (label) {
      case "Acidity":
        qualityIndicators = ["Flat", "Balanced", "Sharp"];
        break;
      case "Bitterness":
        qualityIndicators = ["None", "Balanced", "Bitter/Burnt"];
        break;
      case "Body":
        qualityIndicators = ["Thin/Watery", "Balanced", "Thick/Heavy"];
        break;
      case "Aftertaste":
        qualityIndicators = ["Short/Faint", "Balanced", "Lingering/Harsh"];
        break;
      default:
        qualityIndicators = ["Low", "Balanced", "High"];
    }

    return (
      <FormField label={label}>
        <BalanceSlider
          value={value ?? 0}
          onValueChange={() => {}} // No-op since it's disabled
          disabled={true}
          qualityIndicators={qualityIndicators}
        />
      </FormField>
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
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.shotTitleContainer}>
              <Text style={styles.shotTitle}>
                {bean?.name || "Unknown Bean"}
              </Text>
              <RoastingIndicator roastLevel={bean?.roastLevel!} size="md" />
            </View>

            <Text style={styles.shotSubtitle}>
              {machine?.nickname ||
                `${machine?.brand} ${machine?.model}` ||
                "Unknown Machine"}
            </Text>
            <Text style={styles.shotDate}>{formatDate(shot.createdAt)}</Text>
          </View>
          {shot.isFavorite && (
            <SvgIcon
              name="heart_filled"
              size={24}
              color={shot.isFavorite ? colors.heart : colors.primary}
              secondaryColor={
                shot.isFavorite ? colors.heartLight : colors.primaryLight
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brew Parameters</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <SvgIcon name="dial" size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Grind</Text>
                <Text style={styles.metricValue}>
                  {shot.grindSetting || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name="scale" size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Dose</Text>
                <Text style={styles.metricValue}>{shot.dose_g}g</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name="water" size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Yield</Text>
                <Text style={styles.metricValue}>{shot.yield_g}g</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name="ratio" size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Ratio</Text>
                <Text style={styles.metricValue}>
                  {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <SvgIcon name="timer" size={36} color={colors.textMedium} />
              <View style={styles.metricTextContainer}>
                <Text style={styles.metricLabel}>Time</Text>
                <Text style={styles.metricValue}>{shot.shotTime_s}s</Text>
              </View>
            </View>
          </View>

          {(shot.waterTemp_C || shot.preinfusion_s) && (
            <View style={styles.additionalParams}>
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
              {renderBalanceSlider("Acidity", shot.acidity)}
              {renderBalanceSlider("Bitterness", shot.bitterness)}
              {renderBalanceSlider("Body", shot.body)}
              {renderBalanceSlider("Aftertaste", shot.aftertaste)}
              <FormField label="Overall Rating">
                <RatingSlider
                  value={shot.rating}
                  onValueChange={() => {}} // No-op since it's disabled
                  readonly={true}
                  iconType="star"
                />
              </FormField>
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
            onPress={handleToggleFavorite}
          >
            <SvgIcon
              name={shot.isFavorite ? "heart_filled" : "heart"}
              size={24}
            />
            <Text style={styles.actionButtonText}>
              {shot.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
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
        secondaryButtonText="Done"
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
  shotTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  metricTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textMedium,
    opacity: 0.8,
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
