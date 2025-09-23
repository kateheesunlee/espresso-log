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
import WarningIcon from "./icons/WarningIcon";

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onButtonPress: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = "Error",
  message,
  buttonText = "OK",
  onButtonPress,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onButtonPress}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <WarningIcon size={36} color={colors.error} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onButtonPress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
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
    padding: 20,
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
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: colors.error,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: colors.textMedium,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorModal;
