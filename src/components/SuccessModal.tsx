import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { colors } from "../themes/colors";
import SvgIcon from "./SvgIcon";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  icon?: "coffee" | "bean" | "coffeemaker" | "star" | "add-notes";
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  primaryButtonText,
  secondaryButtonText = "Cancel",
  onPrimaryPress,
  onSecondaryPress,
  icon = "star",
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onSecondaryPress || (() => {})}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <SvgIcon name={icon} size={48} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {onSecondaryPress && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryPress}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onPrimaryPress}
            >
              <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    // Ensure modal is above other content on web
    ...Platform.select({
      web: {
        zIndex: 9999,
      },
    }),
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.textDark,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: colors.textMedium,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SuccessModal;
