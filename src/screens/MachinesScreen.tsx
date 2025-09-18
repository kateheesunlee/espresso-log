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
} from "react-native";
import { useStore } from "../store/useStore";
import { Machine } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.machineItem}>
      <View style={styles.machineImage}>
        <Avatar
          imageUri={machine.imageUri}
          fallbackIcon="coffeemaker"
          size={60}
        />
      </View>
      <View style={styles.machineInfo}>
        <Text style={styles.machineName}>
          {machine.nickname || `${machine.brand}`}
        </Text>
        <Text style={styles.machineModel}>{machine.model}</Text>
        <Text style={styles.machineDate}>
          Added: {formatDate(machine.createdAt)}
        </Text>
      </View>
      <View style={styles.machineActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <SvgIcon name="edit" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <SvgIcon name="delete" size={20} />
        </TouchableOpacity>
      </View>
    </View>
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
      <View style={styles.modalContainer}>
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

        <View style={styles.modalContent}>
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
        </View>
      </View>
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
  machineItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  machineModel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 8,
  },
  machineDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  machineActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
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
    padding: 16,
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
  machineImage: {
    marginRight: 16,
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
