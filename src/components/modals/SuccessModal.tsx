import React from 'react';
import { StyleSheet } from 'react-native';

import BaseModal, { ButtonConfig, IconConfig } from './BaseModal';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  icon?: 'coffee' | 'bean' | 'coffeemaker' | 'star' | 'add-notes';
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  primaryButtonText,
  secondaryButtonText = 'Cancel',
  onPrimaryPress,
  onSecondaryPress,
  icon = 'star',
}) => {
  const iconConfig: IconConfig = {
    name: icon,
  };

  const buttonConfigs: ButtonConfig[] = [];

  if (onSecondaryPress) {
    buttonConfigs.push({
      text: secondaryButtonText,
      onPress: onSecondaryPress,
      variant: 'secondary',
    });
  }

  buttonConfigs.push({
    text: primaryButtonText,
    onPress: onPrimaryPress,
    variant: 'primary',
  });

  return (
    <BaseModal
      visible={visible}
      onRequestClose={onSecondaryPress || (() => {})}
      animationType='fade'
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
    alignItems: 'center',
    maxWidth: 350,
    width: '85%',
  },
});

export default SuccessModal;
