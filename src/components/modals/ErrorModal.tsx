import React from "react";
import { StyleSheet } from "react-native";

import { colors } from "../../themes/colors";
import BaseModal, { ButtonConfig, IconConfig } from "./BaseModal";

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
  const iconConfig: IconConfig = {
    name: "warning",
    color: colors.error,
  };

  const buttonConfigs: ButtonConfig[] = [
    {
      text: buttonText,
      onPress: onButtonPress,
      variant: "destructive",
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onButtonPress}
      animationType="fade"
      iconConfig={iconConfig}
      title={title}
      message={message}
      buttonConfigs={buttonConfigs}
      modalStyle={styles.modalContainer}
    />
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: "85%",
    maxWidth: 350,
    alignItems: "center",
  },
});

export default ErrorModal;
