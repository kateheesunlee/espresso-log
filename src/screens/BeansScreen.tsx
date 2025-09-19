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
import { Bean } from "../database/UniversalDatabase";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MainTabParamList } from "../navigation/AppNavigator";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import EntityCard, {
  EntityCardData,
  EntityCardAction,
} from "../components/EntityCard";
import { showImagePickerOptions } from "../utils/imageUtils";
import { colors } from "../themes/colors";

interface BeanFormData {
  name: string;
  origin: string;
  process: string;
  roastLevel: string;
  roastDate: string;
  notes: string;
  imageUri?: string;
}

const BeanItem: React.FC<{
  bean: Bean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ bean, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const details: string[] = [];
  if (bean.process) details.push(`Process: ${bean.process}`);
  if (bean.roastLevel) details.push(`Roast: ${bean.roastLevel}`);
  if (bean.roastDate) details.push(`Roasted: ${formatDate(bean.roastDate)}`);

  const actions: EntityCardAction[] = [
    { icon: "edit", onPress: onEdit },
    { icon: "delete", onPress: onDelete },
  ];

  return (
    <EntityCard
      data={bean as EntityCardData}
      title={bean.name}
      subtitle={bean.origin}
      details={details}
      fallbackIcon="bean"
      actions={actions}
    />
  );
};

const BeanFormModal: React.FC<{
  visible: boolean;
  bean: Bean | null;
  onClose: () => void;
  onSave: (beanData: BeanFormData) => void;
}> = ({ visible, bean, onClose, onSave }) => {
  const [formData, setFormData] = useState<BeanFormData>({
    name: "",
    origin: "",
    process: "",
    roastLevel: "",
    roastDate: "",
    notes: "",
    imageUri: "",
  });

  useEffect(() => {
    if (bean) {
      setFormData({
        name: bean.name,
        origin: bean.origin || "",
        process: bean.process || "",
        roastLevel: bean.roastLevel || "",
        roastDate: bean.roastDate || "",
        notes: bean.notes || "",
        imageUri: bean.imageUri || "",
      });
    } else {
      setFormData({
        name: "",
        origin: "",
        process: "",
        roastLevel: "",
        roastDate: "",
        notes: "",
        imageUri: "",
      });
    }
  }, [bean]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Bean name is required");
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
    multiline: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
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
            {bean ? "Edit Bean" : "Add New Bean"}
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
              <Text style={styles.sectionLabel}>Bean Photo</Text>
              <View style={styles.imageContainer}>
                <Avatar
                  imageUri={formData.imageUri}
                  fallbackIcon="bean"
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
              "Bean Name *",
              formData.name,
              (text) => setFormData((prev) => ({ ...prev, name: text })),
              "e.g., Ethiopian Yirgacheffe"
            )}

            {renderInput(
              "Origin",
              formData.origin,
              (text) => setFormData((prev) => ({ ...prev, origin: text })),
              "e.g., Ethiopia, Colombia, Brazil"
            )}

            {renderInput(
              "Process",
              formData.process,
              (text) => setFormData((prev) => ({ ...prev, process: text })),
              "e.g., Washed, Natural, Honey"
            )}

            {renderInput(
              "Roast Level",
              formData.roastLevel,
              (text) => setFormData((prev) => ({ ...prev, roastLevel: text })),
              "e.g., Light, Medium, Dark"
            )}

            {renderInput(
              "Roast Date",
              formData.roastDate,
              (text) => setFormData((prev) => ({ ...prev, roastDate: text })),
              "YYYY-MM-DD"
            )}

            {renderInput(
              "Notes",
              formData.notes,
              (text) => setFormData((prev) => ({ ...prev, notes: text })),
              "Additional notes about this bean...",
              true
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const BeansScreen: React.FC = () => {
  const { beans, isLoading, loadBeans, createBean, updateBean, deleteBean } =
    useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBean, setEditingBean] = useState<Bean | null>(null);
  const route = useRoute<RouteProp<MainTabParamList, "Beans">>();

  useEffect(() => {
    loadBeans();
  }, [loadBeans]);

  // Auto-open modal if requested from navigation
  useEffect(() => {
    if (route.params?.openModal) {
      handleAddBean();
    }
  }, [route.params?.openModal]);

  const handleAddBean = () => {
    setEditingBean(null);
    setIsModalVisible(true);
  };

  const handleEditBean = (bean: Bean) => {
    setEditingBean(bean);
    setIsModalVisible(true);
  };

  const handleDeleteBean = (bean: Bean) => {
    Alert.alert(
      "Delete Bean",
      `Are you sure you want to delete "${bean.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBean(bean.id),
        },
      ]
    );
  };

  const handleSaveBean = async (beanData: BeanFormData) => {
    try {
      if (editingBean) {
        await updateBean({
          ...editingBean,
          ...beanData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await createBean({
          id: `bean-${Date.now()}`,
          userId: "default-user",
          ...beanData,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save bean");
    }
  };

  const renderBean = ({ item }: { item: Bean }) => (
    <BeanItem
      bean={item}
      onEdit={() => handleEditBean(item)}
      onDelete={() => handleDeleteBean(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading beans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coffee Beans</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddBean}>
          <SvgIcon name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {beans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SvgIcon name="bean" size={64} />
          <Text style={styles.emptyTitle}>No beans yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your coffee beans to track their characteristics and roast
            information
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAddBean}>
            <Text style={styles.emptyButtonText}>Add Your First Bean</Text>
          </TouchableOpacity>
        </View>
      ) : Platform.OS === "web" ? (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.listContainer}
        >
          {beans.map((bean) => (
            <View key={bean.id}>{renderBean({ item: bean })}</View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={beans}
          renderItem={renderBean}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BeanFormModal
        visible={isModalVisible}
        bean={editingBean}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveBean}
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
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
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

export default BeansScreen;
