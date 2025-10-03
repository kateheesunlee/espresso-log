import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../../themes/colors";
import SvgIcon, { IconName } from "../SvgIcon";

export interface IconConfig {
  name: IconName;
  size?: number;
  color?: string;
}

export interface ButtonConfig {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export interface BaseModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  animationType?: "none" | "slide" | "fade";
  iconConfig?: IconConfig;
  headerTitle?: string;
  headerIcon?: IconName;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  buttonConfigs?: ButtonConfig[];
  overlayStyle?: ViewStyle;
  modalStyle?: ViewStyle;
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onRequestClose,
  animationType = "fade",
  iconConfig,
  headerTitle,
  headerIcon,
  title,
  message,
  children,
  buttonConfigs = [],
  overlayStyle,
  modalStyle,
}) => {
  const renderIcon = () => {
    if (!iconConfig) return null;

    return (
      <View style={styles.iconContainer}>
        <SvgIcon
          name={iconConfig.name}
          size={iconConfig.size || 48}
          color={iconConfig.color}
        />
      </View>
    );
  };

  const renderButton = (buttonConfig: ButtonConfig, index: number) => {
    const getButtonStyle = () => {
      switch (buttonConfig.variant) {
        case "secondary":
          return [styles.button, styles.secondaryButton, buttonConfig.style];
        case "destructive":
          return [styles.button, styles.destructiveButton, buttonConfig.style];
        default:
          return [styles.button, styles.primaryButton, buttonConfig.style];
      }
    };

    const getTextStyle = () => {
      switch (buttonConfig.variant) {
        case "secondary":
          return [styles.secondaryButtonText, buttonConfig.textStyle];
        case "destructive":
          return [styles.destructiveButtonText, buttonConfig.textStyle];
        default:
          return [styles.primaryButtonText, buttonConfig.textStyle];
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={getButtonStyle()}
        onPress={buttonConfig.onPress}
      >
        <Text style={getTextStyle()}>{buttonConfig.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.overlay, overlayStyle]}>
        <View style={[styles.modalContainer, modalStyle]}>
          {headerTitle && (
            <View style={styles.headerContainer}>
              {headerIcon && (
                <SvgIcon name={headerIcon} size={24} color={colors.textDark} />
              )}
              <Text style={styles.headerTitle}>{headerTitle}</Text>
              <TouchableOpacity onPress={onRequestClose}>
                <SvgIcon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.contentContainer}>
            {renderIcon()}
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}
            {children}
          </View>
          {buttonConfigs.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttonConfigs.map((buttonConfig, index) =>
                renderButton(buttonConfig, index)
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const MODAL_PADDING = 20;
const BORDER_RADIUS = 12;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    // Ensure modal is above other content on web
    ...Platform.select({
      web: {
        zIndex: 9999,
      },
    }),
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: BORDER_RADIUS,
    padding: MODAL_PADDING,
    width: "100%",
    maxWidth: 400,
    maxHeight: "85%",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  // Allows content to grow and push footer while staying inside container
  contentContainer: {
    flexShrink: 1,
    gap: MODAL_PADDING / 2,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: MODAL_PADDING,
    marginBottom: MODAL_PADDING,
    marginTop: -MODAL_PADDING,
    marginHorizontal: -MODAL_PADDING,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 8,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },
  iconContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textMedium,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    minHeight: 44,
    flexDirection: "row",
    gap: 12,
    paddingTop: MODAL_PADDING,
  },
  button: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  destructiveButton: {
    backgroundColor: colors.error,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});

export default BaseModal;
