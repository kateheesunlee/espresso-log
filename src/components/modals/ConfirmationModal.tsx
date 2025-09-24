import React from "react";
import BaseModal, { ButtonConfig } from "./BaseModal";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}) => {
  const buttonConfigs: ButtonConfig[] = [
    {
      text: cancelText,
      onPress: onCancel,
      variant: "secondary",
    },
    {
      text: confirmText,
      onPress: onConfirm,
      variant: destructive ? "destructive" : "primary",
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onCancel}
      animationType="fade"
      title={title}
      message={message}
      buttonConfigs={buttonConfigs}
    />
  );
};

export default ConfirmationModal;
