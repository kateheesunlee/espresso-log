import React from "react";
import { View, StyleSheet, ViewStyle, Text, TextStyle } from "react-native";
import { colors } from "../themes/colors";
import { RoastLevel } from "../database/UniversalDatabase";

interface RoastingIndicatorProps {
  roastLevel: RoastLevel;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  marginLeft?: number;
  compact?: boolean;
}

const roastingColorMap = {
  ["Light"]: colors.roastingLight,
  ["Medium Light"]: colors.roastingMediumLight,
  ["Medium"]: colors.roastingMedium,
  ["Medium Dark"]: colors.roastingMediumDark,
  ["Dark"]: colors.roastingDark,
};

const sizeMap = {
  sm: 8,
  md: 10,
  lg: 12,
};

const textSizeMap = {
  sm: 10,
  md: 12,
  lg: 14,
};

const RoastingIndicator: React.FC<RoastingIndicatorProps> = ({
  roastLevel,
  size = "md",
  compact = false,
}) => {
  const color = roastingColorMap[roastLevel];

  const getDotStylesBySize = (size: "sm" | "md" | "lg") => {
    return {
      width: compact ? sizeMap[size] : undefined,
      height: compact ? sizeMap[size] : undefined,
      paddingVertical: compact ? 0 : 4,
      paddingHorizontal: compact ? 0 : 8,
      borderRadius: compact ? "50%" : 16,
      backgroundColor: color,
    };
  };

  const getTextStylesBySize = (size: "sm" | "md" | "lg") => {
    return {
      fontSize: textSizeMap[size],
      color: colors.white,
    };
  };

  return (
    <View style={getDotStylesBySize(size)}>
      {compact ? (
        ""
      ) : (
        <Text style={getTextStylesBySize(size)}>{roastLevel}</Text>
      )}
    </View>
  );
};

export default RoastingIndicator;
