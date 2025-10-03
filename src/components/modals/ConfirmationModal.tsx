import React from "react";

import { IconName } from "../SvgIcon";
import BaseModal, { ButtonConfig, IconConfig } from "./BaseModal";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  icon?: IconName;
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
  icon,
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
      iconConfig={icon ? { name: icon } : undefined}
    />
  );
};

export default ConfirmationModal;
