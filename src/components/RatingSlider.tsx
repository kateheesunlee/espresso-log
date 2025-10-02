import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import SvgIcon from "./SvgIcon";
import { colors } from "../themes/colors";

type IconType = 'star' | 'coffee-bean';

interface RatingSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  iconType?: IconType;
}

// Icon and color mapping configuration
const iconConfig = {
  star: {
    filledIcon: 'star_filled',
    emptyIcon: 'star',
    color: colors.star,
    secondaryColor: colors.starLight,
  },
  'coffee-bean': {
    filledIcon: 'bean_filled',
    emptyIcon: 'bean',
    color: colors.primary,
    secondaryColor: colors.primaryLight,
  },
} as const;

const RatingSlider: React.FC<RatingSliderProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  iconType = 'star',
}) => {
  const min = 1;
  const max = 5;
  const step = 0.5;
  const iconSize = 32;
  const totalIcons = 5;
  
  // Get current icon configuration
  const currentIconConfig = iconConfig[iconType];

  const sliderWidth = useRef(0);
  const iconsWidth = useRef(0);

  // Calculate position based on value using step
  const getPositionFromValue = (val: number, width: number) => {
    const availableWidth = width - iconSize;

    // For half values, we need to account for step increments
    const stepIndex = Math.round((val - min) / step);
    const position =
      ((stepIndex * step) / (max - min)) * availableWidth + iconSize / 2;

    return Math.max(iconSize / 2, Math.min(width - iconSize / 2, position));
  };

  // Calculate value from position using step
  const getValueFromPosition = (position: number, width: number) => {
    const availableWidth = width - iconSize;
    const normalizedPosition = (position - iconSize / 2) / availableWidth;

    // Calculate the step index based on position
    const stepIndex = Math.round((normalizedPosition * (max - min)) / step);
    const value = min + stepIndex * step;

    return Math.max(min, Math.min(max, value));
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
      // Light haptic feedback when starting to drag
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Calculate the value based on the starting position
      const startValue = getValueFromPosition(event.x, sliderWidth.current);
      onValueChange(startValue);
    })
    .onUpdate((event) => {
      // Calculate the value based on the current position
      const currentValue = getValueFromPosition(event.x, sliderWidth.current);
      onValueChange(currentValue);
    })
    .onEnd((event) => {
      // Medium haptic feedback when releasing the slider
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Final value calculation based on end position
      const finalValue = getValueFromPosition(event.x, sliderWidth.current);
      onValueChange(finalValue);
    });

  const handleIconPress = (iconValue: number) => {
    if (disabled) return;
    
    // Light haptic feedback when tapping an icon
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // If clicking the same icon that's already selected, toggle to half value using step
    if (iconValue === value) {
      const newValue = value % 1 === 0 ? value - step : value + step;
      onValueChange(Math.max(min, Math.min(max, newValue)));
    } else {
      onValueChange(iconValue);
    }
  };

  const renderIcon = (iconValue: number) => {
    const isFilled = iconValue <= value;
    const isHalfFilled = iconValue - step <= value && value < iconValue;

    return (
      <TouchableOpacity
        key={iconValue}
        style={styles.iconContainer}
        onPress={() => handleIconPress(iconValue)}
        disabled={disabled}
      >
        <SvgIcon
          name={isFilled ? currentIconConfig.filledIcon : currentIconConfig.emptyIcon}
          size={iconSize}
          color={isFilled ? currentIconConfig.color : colors.borderLight}
          secondaryColor={isFilled ? currentIconConfig.secondaryColor : colors.border}
        />
        {isHalfFilled && (
          <View style={styles.halfIconOverlay}>
            <SvgIcon
              name={currentIconConfig.filledIcon}
              size={iconSize}
              color={currentIconConfig.color}
              secondaryColor={currentIconConfig.secondaryColor}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {/* <Text style={styles.currentValue}>{value}</Text> */}
      </View>
      <View style={styles.sliderAndLabelsContainer}>
        <View style={styles.sliderContainer}>
          {/* Track with icons inside for drag gestures */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.trackContainer}>
              {/* Visible icons */}
              <View
                style={styles.iconsContainer}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  iconsWidth.current = width;
                  // Update slider width to match icons width
                  sliderWidth.current = width;
                }}
              >
                {Array.from({ length: totalIcons }, (_, i) => min + i).map(
                  renderIcon
                )}
              </View>
            </View>
          </GestureDetector>
        </View>

        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>Poor</Text>
          <Text style={styles.scaleLabel}>Excellent</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderAndLabelsContainer: {
    width: "100%",
    alignSelf: "center",
  },
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  sliderContainer: {
    position: "relative",
    marginBottom: 8,
  },
  trackContainer: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  iconsContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  iconContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  halfIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    overflow: "hidden",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  scaleLabel: {
    fontSize: 12,
    color: colors.textMedium,
    fontWeight: "500",
  },
});

export default RatingSlider;
