import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  TastingTag,
  TASTING_TAGS,
  ShotFormData,
  shotToShotFormData,
  shotFormDataToShot,
} from "@types";
import { colors } from "../themes/colors";

import PickerField from "../components/inputs/forms/PickerField";
import SvgIcon from "../components/SvgIcon";
import SuccessModal from "../components/modals/SuccessModal";
import ErrorModal from "../components/modals/ErrorModal";
import RatingSlider from "../components/inputs/sliders/RatingSlider";
import {
  TextField,
  NumberInputField,
  WaterTempField,
  TagChipsField,
  FormField,
} from "../components/inputs";
import { inputStyles } from "../components/inputs/styles";
import TastingNotes from "../components/TastingNotes";

type NewShotScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NewShot"
>;
type NewShotScreenRouteProp = RouteProp<RootStackParamList, "NewShot">;

const initialFormData: Partial<ShotFormData> = {
  beanId: "",
  machineId: "",
  dose_g: "",
  yield_g: "",
  shotTime_s: "",
  ratio: "",
  grindSetting: "",
  waterTemp_C: "",
  preinfusion_s: "",
  rating: 3,
  acidity: 0,
  bitterness: 0,
  body: 0,
  aftertaste: 0,
  tastingTags: [],
  notes: "",
  isFavorite: false,
};

const NewShotScreen: React.FC = () => {
  const navigation = useNavigation<NewShotScreenNavigationProp>();
  const route = useRoute<NewShotScreenRouteProp>();
  const { beans, machines, createShot, updateShot, shots } = useStore();

  const [formData, setFormData] = useState<ShotFormData>(
    initialFormData as ShotFormData
  );

  const [isLoading, setIsLoading] = useState(false);
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  const [pendingBeanSelection, setPendingBeanSelection] = useState<
    string | null
  >(null);
  const [pendingMachineSelection, setPendingMachineSelection] = useState<
    string | null
  >(null);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  useEffect(() => {
    // If duplicating from another shot, load its data
    if (route.params?.duplicateFrom && shots.length > 0) {
      loadShotData(route.params.duplicateFrom);
    } else {
      // For new shots, use selected filters or set the latest bean and machine
      if (route.params?.selectedBeanId || route.params?.selectedMachineId) {
        setSelectedFilters();
      } else {
        setLatestBeanAndMachine();
      }
    }
  }, [
    route.params?.duplicateFrom,
    route.params?.selectedBeanId,
    route.params?.selectedMachineId,
    shots,
    beans,
    machines,
  ]);

  // Handle returning from bean/machine creation
  useFocusEffect(
    React.useCallback(() => {
      // If we have pending selections, set them when we return
      if (pendingBeanSelection) {
        setFormData((prev) => ({ ...prev, beanId: pendingBeanSelection }));
        setPendingBeanSelection(null);
      }
      if (pendingMachineSelection) {
        setFormData((prev) => ({
          ...prev,
          machineId: pendingMachineSelection,
        }));
        setPendingMachineSelection(null);
      }
    }, [pendingBeanSelection, pendingMachineSelection])
  );

  const loadShotData = async (shotId: string) => {
    try {
      const shot = shots.find((s) => s.id === shotId);
      if (shot) {
        // Don't set editingShotId - we want to create a new shot, not edit the existing one
        const formData = shotToShotFormData(shot);
        setFormData(formData);
      }
    } catch (error) {
      console.error("Failed to load shot data:", error);
    }
  };

  const setLatestBeanAndMachine = () => {
    // Set the latest bean (most recently created)
    if (beans.length > 0) {
      const latestBean = beans.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setFormData((prev) => ({ ...prev, beanId: latestBean.id }));
    }

    // Set the latest machine (most recently created)
    if (machines.length > 0) {
      const latestMachine = machines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setFormData((prev) => ({ ...prev, machineId: latestMachine.id }));
    }
  };

  const setSelectedFilters = () => {
    // Set the selected bean from filters
    if (route.params?.selectedBeanId) {
      setFormData((prev) => ({
        ...prev,
        beanId: route.params!.selectedBeanId!,
      }));
    } else if (beans.length > 0) {
      // Fallback to latest bean if no filter selected
      const latestBean = beans.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setFormData((prev) => ({ ...prev, beanId: latestBean.id }));
    }

    // Set the selected machine from filters
    if (route.params?.selectedMachineId) {
      setFormData((prev) => ({
        ...prev,
        machineId: route.params!.selectedMachineId!,
      }));
    } else if (machines.length > 0) {
      // Fallback to latest machine if no filter selected
      const latestMachine = machines.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setFormData((prev) => ({ ...prev, machineId: latestMachine.id }));
    }
  };

  const handleCreateBean = () => {
    // Set pending selection to the latest bean ID (will be updated when we return)
    const latestBean = beans.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    setPendingBeanSelection(latestBean?.id || "");

    // Navigate to NewBean screen
    (navigation as any).navigate("NewBean");
  };

  const handleCreateMachine = () => {
    // Set pending selection to the latest machine ID (will be updated when we return)
    const latestMachine = machines.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    setPendingMachineSelection(latestMachine?.id || "");

    // Navigate to NewMachine screen
    (navigation as any).navigate("NewMachine");
  };

  const handleTastingTagsChange = (tags: string[]) => {
    // Convert strings to TastingTag[], filtering out invalid tags
    const validTastingTags = tags.filter((tag): tag is TastingTag => {
      return TASTING_TAGS.includes(tag as TastingTag);
    });
    handleInputChange("tastingTags", validTastingTags);
  };

  const handleInputChange = (
    field: keyof ShotFormData,
    value: string | boolean | number | TastingTag[]
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-calculate ratio when dose or yield changes
      if (field === "dose_g" || field === "yield_g") {
        const dose = parseFloat(
          field === "dose_g" ? (value as string) : prev.dose_g
        );
        const yieldAmount = parseFloat(
          field === "yield_g" ? (value as string) : prev.yield_g
        );

        if (dose > 0 && yieldAmount > 0) {
          const ratio = yieldAmount / dose;
          newData.ratio = ratio.toFixed(1);
        } else {
          newData.ratio = "";
        }
      }

      return newData;
    });
  };

  const handleSave = async () => {
    // Validate required fields
    if (
      !formData.beanId ||
      !formData.machineId ||
      !formData.dose_g ||
      !formData.yield_g ||
      !formData.shotTime_s ||
      !formData.grindSetting
    ) {
      setErrorModal({
        visible: true,
        message:
          "Please fill in all required fields (Bean, Machine, Dose, Yield, Shot Time, Grind Setting)",
      });

      return;
    }

    setIsLoading(true);
    try {
      const shotOverride = shotFormDataToShot(formData);

      if (editingShotId) {
        // Update existing shot (duplicated shot)
        const existingShot = shots.find((s) => s.id === editingShotId);
        if (existingShot) {
          const updateData = {
            ...existingShot,
            ...shotOverride,
            updatedAt: new Date().toISOString(),
          };
          await updateShot(updateData);
          setSuccessModal({ visible: true, isUpdate: true });
        }
      } else {
        // Create new shot
        await createShot(formData);
        setSuccessModal({ visible: true, isUpdate: false });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to save shot" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ visible: false, isUpdate: false });
    navigation.navigate("Shots");
  };

  const renderPicker = (
    label: string,
    value: string,
    options: Array<{ id: string; name: string }>,
    onValueChange: (value: string) => void,
    required: boolean = false,
    onCreateNew?: () => void,
    createButtonText?: string
  ) => (
    <PickerField
      label={label}
      value={value}
      options={options}
      onValueChange={onValueChange}
      required={required}
      onCreateNew={onCreateNew}
      createButtonText={createButtonText}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "position" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.form}>
          {route.params?.duplicateFrom && (
            <View style={styles.duplicateNotice}>
              <SvgIcon name="copy" size={20} />
              <Text style={styles.duplicateNoticeText}>
                This form is pre-filled with data from a previous shot. Modify
                the parameters as needed before saving.
              </Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {renderPicker(
            "Bean",
            formData.beanId,
            beans.map((b) => ({ id: b.id, name: b.name })),
            (value) => handleInputChange("beanId", value),
            true,
            handleCreateBean,
            "Create Bean"
          )}

          {renderPicker(
            "Machine",
            formData.machineId,
            machines.map((m) => ({
              id: m.id,
              name:
                m.nickname ||
                `${m.brand} ${m.model}${m.grinder ? ` + ${m.grinder}` : ""}`,
            })),
            (value) => handleInputChange("machineId", value),
            true,
            handleCreateMachine,
            "Create Machine"
          )}

          <Text style={styles.sectionTitle}>Brew Parameters</Text>

          <NumberInputField
            label="Grind Setting"
            value={formData.grindSetting}
            onChangeText={(text) => handleInputChange("grindSetting", text)}
            placeholder="10"
            required={true}
            step={1}
            minValue={0}
          />

          <NumberInputField
            label="Dose"
            value={formData.dose_g}
            onChangeText={(text) => handleInputChange("dose_g", text)}
            placeholder="18.0"
            required={true}
            unit="g"
            step={0.1}
            minValue={0}
          />

          <NumberInputField
            label="Yield"
            value={formData.yield_g}
            onChangeText={(text) => handleInputChange("yield_g", text)}
            placeholder="36.0"
            required={true}
            unit="g"
            step={0.1}
            minValue={0}
          />

          <TextField
            label="Ratio (auto-calculated)"
            value={formData.ratio}
            placeholder="Auto-calculated from dose/yield"
            readOnly={true}
            onChangeText={() => {}}
          />

          <NumberInputField
            label="Shot Time"
            value={formData.shotTime_s}
            onChangeText={(text) => handleInputChange("shotTime_s", text)}
            placeholder="30.0"
            required={true}
            unit="s"
            step={1}
            minValue={0}
          />

          <WaterTempField
            label="Water Temperature"
            value={formData.waterTemp_C}
            onChangeText={(text) => handleInputChange("waterTemp_C", text)}
            placeholder="93.0"
            step={0.1}
            minValue={0}
          />

          <NumberInputField
            label="Preinfusion Time"
            value={formData.preinfusion_s}
            onChangeText={(text) => handleInputChange("preinfusion_s", text)}
            placeholder="5.0"
            unit="s"
            step={1}
            minValue={0}
          />

          <Text style={styles.sectionTitle}>Tasting Notes</Text>

          <TastingNotes
            formData={formData}
            setFormData={(formData) => setFormData(formData as ShotFormData)}
          />

          <FormField label="Overall Rating">
            <RatingSlider
              value={formData.rating}
              onValueChange={(value) => handleInputChange("rating", value)}
              iconType="star"
            />
          </FormField>

          <TagChipsField
            label="Additional Tasting Tags"
            value={formData.tastingTags}
            onChange={handleTastingTagsChange}
            suggestions={[...TASTING_TAGS]}
            allowCustom={true}
            subtitle="Add descriptive tags to complement your tasting notes above"
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => handleInputChange("notes", text)}
            placeholder="Additional tasting notes..."
            multiline={true}
            numberOfLines={4}
          />

          <View style={inputStyles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                handleInputChange("isFavorite", !formData.isFavorite)
              }
            >
              <SvgIcon
                name={formData.isFavorite ? "heart_filled" : "heart"}
                color={formData.isFavorite ? colors.heart : colors.primary}
                secondaryColor={
                  formData.isFavorite ? colors.heartLight : colors.primaryLight
                }
                size={24}
              />
              <Text style={styles.checkboxLabel}>Mark as favorite shot</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save Shot"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? "Shot Updated!" : "Shot Saved!"}
        message={
          successModal.isUpdate
            ? "Your shot has been updated successfully!"
            : "Your shot has been saved successfully!"
        }
        primaryButtonText="View Shots"
        onPrimaryPress={handleSuccessModalClose}
        icon="coffee"
      />

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onButtonPress={() => setErrorModal({ visible: false, message: "" })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: 16,
  },
  duplicateNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  duplicateNoticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginTop: 24,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textDark,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default NewShotScreen;
