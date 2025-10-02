import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useStore } from "../store/useStore";
import { RootStackParamList } from "../navigation/AppNavigator";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import SuccessModal from "../components/modals/SuccessModal";
import ErrorModal from "../components/modals/ErrorModal";
import { TextInput } from "../components/inputs";
import { showImagePickerOptions } from "../utils/imageUtils";
import { colors } from "../themes/colors";

type NewMachineScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NewMachine"
>;
type NewMachineScreenRouteProp = RouteProp<RootStackParamList, "NewMachine">;

interface MachineFormData {
  brand: string;
  model: string;
  nickname: string;
  grinder: string;
  imageUri?: string;
}

const NewMachineScreen: React.FC = () => {
  const navigation = useNavigation<NewMachineScreenNavigationProp>();
  const route = useRoute<NewMachineScreenRouteProp>();
  const { createMachine, updateMachine, machines } = useStore();

  const [formData, setFormData] = useState<MachineFormData>({
    brand: "",
    model: "",
    nickname: "",
    grinder: "",
    imageUri: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  useEffect(() => {
    // If editing an existing machine, load its data
    if (route.params?.machineId) {
      const machine = machines.find((m) => m.id === route.params!.machineId!);
      if (machine) {
        setEditingMachineId(machine.id);
        setFormData({
          brand: machine.brand,
          model: machine.model,
          nickname: machine.nickname || "",
          grinder: machine.grinder || "Integrated grinder",
          imageUri: machine.imageUri || "",
        });
      }
    }
  }, [route.params?.machineId, machines]);

  const handleImageCapture = async () => {
    try {
      const result = await showImagePickerOptions();

      if (!result.cancelled && result.uri) {
        setFormData((prev) => ({ ...prev, imageUri: result.uri }));
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      setErrorModal({
        visible: true,
        message: "Failed to capture image. Please try again.",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.brand.trim() || !formData.model.trim()) {
      setErrorModal({ visible: true, message: "Brand and model are required" });
      return;
    }

    setIsLoading(true);
    try {
      const machineData = {
        id: editingMachineId || `machine-${Date.now()}`,
        userId: "default-user",
        ...formData,
        createdAt: editingMachineId
          ? machines.find((m) => m.id === editingMachineId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingMachineId) {
        await updateMachine(machineData);
        setSuccessModal({ visible: true, isUpdate: true });
      } else {
        await createMachine(machineData);
        setSuccessModal({ visible: true, isUpdate: false });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to save machine" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ visible: false, isUpdate: false });
    navigation.navigate("Shots", {
      screen: "Machines",
    } as any);
  };

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
          <Text style={styles.sectionTitle}>Machine Information</Text>

          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>Machine Photo</Text>
            <View style={styles.imageContainer}>
              <Avatar
                imageUri={formData.imageUri}
                fallbackIcon="coffeemaker"
                size={80}
                onPress={handleImageCapture}
              />
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleImageCapture}
              >
                <SvgIcon name="camera" size={20} />
                <Text style={styles.imageButtonText}>
                  {formData.imageUri ? "Change Photo" : "Add Photo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            label="Brand"
            value={formData.brand}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, brand: text }))
            }
            placeholder="e.g., Breville, Gaggia, La Marzocco"
            required={true}
          />

          <TextInput
            label="Model"
            value={formData.model}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, model: text }))
            }
            placeholder="e.g., Bambino Plus, Classic Pro, Linea Mini"
            required={true}
          />

          <TextInput
            label="Grinder"
            value={formData.grinder}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, grinder: text }))
            }
            placeholder="e.g., Fellow Ode Gen 2, Eureka Mignon Specialita, Comandante C40"
            subtitle="Specify the grinder model name if using a separate grinder"
          />

          <TextInput
            label="Nickname (Optional)"
            value={formData.nickname}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, nickname: text }))
            }
            placeholder="e.g., My Daily Driver, Office Machine"
          />

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? "Saving..."
                : editingMachineId
                ? "Update Machine"
                : "Save Machine"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? "Machine Updated!" : "Machine Saved!"}
        message={
          successModal.isUpdate
            ? "Your machine has been updated successfully!"
            : "Your machine has been saved successfully!"
        }
        primaryButtonText="View Machines"
        onPrimaryPress={handleSuccessModalClose}
        icon="coffeemaker"
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.hover,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
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

export default NewMachineScreen;
