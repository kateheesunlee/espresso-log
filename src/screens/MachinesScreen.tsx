import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useStore } from "../store/useStore";
import { Machine } from "../database/UniversalDatabase";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MainTabParamList } from "../navigation/AppNavigator";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import EntityCard, {
  EntityCardData,
  EntityCardAction,
} from "../components/EntityCard";
import KeyboardDismissScrollView from "../components/KeyboardDismissScrollView";
import ScrollableListView from "../components/ScrollableListView";
import EmptyEntity from "../components/EmptyEntity";
import ConfirmationModal from "../components/ConfirmationModal";
import ErrorModal from "../components/ErrorModal";
import { showImagePickerOptions } from "../utils/imageUtils";
import { colors } from "../themes/colors";

interface MachineFormData {
  brand: string;
  model: string;
  nickname: string;
  imageUri?: string;
}

const MachineItem: React.FC<{
  machine: Machine;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ machine, onEdit, onDelete }) => {
  const title = machine.nickname || `${machine.brand}`;
  const subtitle = machine.model;

  const actions: EntityCardAction[] = [
    { icon: "edit", onPress: onEdit },
    { icon: "delete", onPress: onDelete },
  ];

  return (
    <EntityCard
      data={machine as EntityCardData}
      title={title}
      subtitle={subtitle}
      fallbackIcon="coffeemaker"
      actions={actions}
    />
  );
};

const MachineFormModal: React.FC<{
  visible: boolean;
  machine: Machine | null;
  onClose: () => void;
  onSave: (machineData: MachineFormData) => void;
  setErrorModal: (errorModal: { visible: boolean; message: string }) => void;
}> = ({ visible, machine, onClose, onSave, setErrorModal }) => {
  const [formData, setFormData] = useState<MachineFormData>({
    brand: "",
    model: "",
    nickname: "",
    imageUri: "",
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        brand: machine.brand,
        model: machine.model,
        nickname: machine.nickname || "",
        imageUri: machine.imageUri || "",
      });
    } else {
      setFormData({
        brand: "",
        model: "",
        nickname: "",
        imageUri: "",
      });
    }
  }, [machine]);

  const handleSave = () => {
    if (!formData.brand.trim() || !formData.model.trim()) {
      setErrorModal({ visible: true, message: "Brand and model are required" });
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleImageCapture = async () => {
    try {
      const result = await showImagePickerOptions();

      if (!result.cancelled && result.uri) {
        // ImagePicker now provides base64 directly
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

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    required: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {machine ? "Edit Machine" : "Add New Machine"}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardDismissScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          {renderInput(
            "Brand",
            formData.brand,
            (text) => setFormData((prev) => ({ ...prev, brand: text })),
            "e.g., Breville, Gaggia, La Marzocco",
            true
          )}

          {renderInput(
            "Model",
            formData.model,
            (text) => setFormData((prev) => ({ ...prev, model: text })),
            "e.g., Bambino Plus, Classic Pro, Linea Mini",
            true
          )}

          {renderInput(
            "Nickname (Optional)",
            formData.nickname,
            (text) => setFormData((prev) => ({ ...prev, nickname: text })),
            "e.g., My Daily Driver, Office Machine"
          )}
        </KeyboardDismissScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const MachinesScreen: React.FC = () => {
  const {
    machines,
    isLoading,
    loadMachines,
    createMachine,
    updateMachine,
    deleteMachine,
  } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    machine: Machine | null;
  }>({ visible: false, machine: null });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const route = useRoute<RouteProp<MainTabParamList, "Machines">>();

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  // Auto-open modal if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddMachine();
    }
  }, [route.params?.openModal]);

  const handleAddMachine = () => {
    setEditingMachine(null);
    setIsModalVisible(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setIsModalVisible(true);
  };

  const handleDeleteMachine = (machine: Machine) => {
    setDeleteConfirmation({ visible: true, machine });
  };

  const confirmDeleteMachine = async () => {
    if (deleteConfirmation.machine) {
      try {
        await deleteMachine(deleteConfirmation.machine.id);
      } catch (error) {
        setErrorModal({ visible: true, message: "Failed to delete machine" });
      }
    }
    setDeleteConfirmation({ visible: false, machine: null });
  };

  const cancelDeleteMachine = () => {
    setDeleteConfirmation({ visible: false, machine: null });
  };

  const handleSaveMachine = async (machineData: MachineFormData) => {
    try {
      if (editingMachine) {
        await updateMachine({
          ...editingMachine,
          ...machineData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await createMachine({
          id: `machine-${Date.now()}`,
          userId: "default-user",
          ...machineData,
        });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to save machine" });
    }
  };

  const renderMachine = ({ item }: { item: Machine }) => (
    <MachineItem
      machine={item}
      onEdit={() => handleEditMachine(item)}
      onDelete={() => handleDeleteMachine(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading machines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Espresso Machines</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMachine}>
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollableListView
        data={machines}
        renderItem={renderMachine}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        emptyComponent={
          <EmptyEntity
            icon="coffeemaker"
            title="No machines yet"
            subtitle="Add your espresso machines to track which one you used for each shot"
            buttonText="Add Your First Machine"
            onButtonPress={handleAddMachine}
          />
        }
      />

      <MachineFormModal
        visible={isModalVisible}
        machine={editingMachine}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMachine}
        setErrorModal={setErrorModal}
      />

      <ConfirmationModal
        visible={deleteConfirmation.visible}
        title="Delete Machine"
        message={`Are you sure you want to delete "${
          deleteConfirmation.machine?.nickname ||
          `${deleteConfirmation.machine?.brand} ${deleteConfirmation.machine?.model}`
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMachine}
        onCancel={cancelDeleteMachine}
        destructive={true}
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  saveButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    fontSize: 16,
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
});

export default MachinesScreen;
