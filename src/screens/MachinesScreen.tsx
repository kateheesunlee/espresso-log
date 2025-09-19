import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useStore } from "../store/useStore";
import { Machine } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import EntityCard, {
  EntityCardData,
  EntityCardAction,
} from "../components/EntityCard";
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
}> = ({ visible, machine, onClose, onSave }) => {
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
      Alert.alert("Validation Error", "Brand and model are required");
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
      Alert.alert("Error", "Failed to capture image. Please try again.");
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

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
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
          </ScrollView>
        </TouchableWithoutFeedback>
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

  useEffect(() => {
    loadMachines();
  }, [loadMachines]);

  const handleAddMachine = () => {
    setEditingMachine(null);
    setIsModalVisible(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setIsModalVisible(true);
  };

  const handleDeleteMachine = (machine: Machine) => {
    Alert.alert(
      "Delete Machine",
      `Are you sure you want to delete "${
        machine.nickname || `${machine.brand} ${machine.model}`
      }"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMachine(machine.id),
        },
      ]
    );
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
      Alert.alert("Error", "Failed to save machine");
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

      {machines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SvgIcon name="coffeemaker" size={64} />
          <Text style={styles.emptyTitle}>No machines yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your espresso machines to track which one you used for each shot
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddMachine}
          >
            <Text style={styles.emptyButtonText}>Add Your First Machine</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === "web" ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.listContainer}
        >
          {machines.map((machine) => (
            <View key={machine.id}>{renderMachine({ item: machine })}</View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={machines}
          renderItem={renderMachine}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <MachineFormModal
        visible={isModalVisible}
        machine={editingMachine}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMachine}
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
