import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import SvgIcon, { IconName } from "./SvgIcon";
import { colors } from "../themes/colors";

interface AvatarProps {
  imageUri?: string;
  fallbackIcon: IconName;
  size?: number;
  onPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  imageUri,
  fallbackIcon,
  size = 60,
  onPress,
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const iconSize = size * 0.6; // Icon should be 60% of avatar size

  const content = (
    <View style={[styles.container, avatarStyle]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.image, avatarStyle]} />
      ) : (
        <View style={[styles.fallbackContainer, avatarStyle]}>
          <SvgIcon name={fallbackIcon} size={iconSize} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  fallbackContainer: {
    backgroundColor: colors.hover,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Avatar;
