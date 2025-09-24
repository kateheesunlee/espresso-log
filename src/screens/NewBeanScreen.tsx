import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
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
import { RoastLevel } from "../database/UniversalDatabase";
import SvgIcon from "../components/SvgIcon";
import Avatar from "../components/Avatar";
import RoastingSlider from "../components/RoastingSlider";
import SuccessModal from "../components/modals/SuccessModal";
import ErrorModal from "../components/modals/ErrorModal";
import { showImagePickerOptions } from "../utils/imageUtils";
import { colors } from "../themes/colors";

type NewBeanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NewBean"
>;
type NewBeanScreenRouteProp = RouteProp<RootStackParamList, "NewBean">;

interface BeanFormData {
  name: string;
  origin: string;
  process: string;
  roastLevel: RoastLevel;
  roastDate: string;
  notes: string;
  imageUri?: string;
}

const NewBeanScreen: React.FC = () => {
  const navigation = useNavigation<NewBeanScreenNavigationProp>();
  const route = useRoute<NewBeanScreenRouteProp>();
  const { createBean, updateBean, beans } = useStore();

  const [formData, setFormData] = useState<BeanFormData>({
    name: "",
    origin: "",
    process: "",
    roastLevel: "Medium",
    roastDate: "",
    notes: "",
    imageUri: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingBeanId, setEditingBeanId] = useState<string | null>(null);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    isUpdate: boolean;
  }>({ visible: false, isUpdate: false });

  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  useEffect(() => {
    // If editing an existing bean, load its data
    if (route.params?.beanId) {
      const bean = beans.find((b) => b.id === route.params!.beanId!);
      if (bean) {
        setEditingBeanId(bean.id);
        setFormData({
          name: bean.name,
          origin: bean.origin || "",
          process: bean.process || "",
          roastLevel: bean.roastLevel || "Medium",
          roastDate: bean.roastDate || "",
          notes: bean.notes || "",
          imageUri: bean.imageUri || "",
        });
      }
    }
  }, [route.params?.beanId, beans]);

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
    if (!formData.name.trim()) {
      setErrorModal({ visible: true, message: "Bean name is required" });
      return;
    }

    setIsLoading(true);
    try {
      const beanData = {
        id: editingBeanId || `bean-${Date.now()}`,
        userId: "default-user",
        ...formData,
        createdAt: editingBeanId
          ? beans.find((b) => b.id === editingBeanId)?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingBeanId) {
        await updateBean(beanData);
        setSuccessModal({ visible: true, isUpdate: true });
      } else {
        await createBean(beanData);
        setSuccessModal({ visible: true, isUpdate: false });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: "Failed to save bean" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal({ visible: false, isUpdate: false });
    navigation.navigate("Shots", {
      screen: "Beans",
    } as any);
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    required: boolean = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Bean Information</Text>

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
            "Bean Name",
            formData.name,
            (text) => setFormData((prev) => ({ ...prev, name: text })),
            "e.g., Ethiopian Yirgacheffe",
            false,
            true
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

          <RoastingSlider
            label="Roast Level"
            value={formData.roastLevel || "Medium"}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, roastLevel: value }))
            }
          />

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

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading
                ? "Saving..."
                : editingBeanId
                ? "Update Bean"
                : "Save Bean"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={successModal.visible}
        title={successModal.isUpdate ? "Bean Updated!" : "Bean Saved!"}
        message={
          successModal.isUpdate
            ? "Your bean has been updated successfully!"
            : "Your bean has been saved successfully!"
        }
        primaryButtonText="View Beans"
        onPrimaryPress={handleSuccessModalClose}
        icon="bean"
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
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 16,
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

export default NewBeanScreen;
