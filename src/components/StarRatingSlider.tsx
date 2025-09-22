import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import SvgIcon from "./SvgIcon";
import { colors } from "../themes/colors";

interface StarRatingSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

const StarRatingSlider: React.FC<StarRatingSliderProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
}) => {
  const min = 1;
  const max = 5;
  const step = 0.5;
  const starSize = 32;
  const totalStars = 5;

  const sliderWidth = useRef(0);
  const starsWidth = useRef(0);

  // Calculate position based on value using step
  const getPositionFromValue = (val: number, width: number) => {
    const availableWidth = width - starSize;

    // For half values, we need to account for step increments
    const stepIndex = Math.round((val - min) / step);
    const position =
      ((stepIndex * step) / (max - min)) * availableWidth + starSize / 2;

    return Math.max(starSize / 2, Math.min(width - starSize / 2, position));
  };

  // Calculate value from position using step
  const getValueFromPosition = (position: number, width: number) => {
    const availableWidth = width - starSize;
    const normalizedPosition = (position - starSize / 2) / availableWidth;

    // Calculate the step index based on position
    const stepIndex = Math.round((normalizedPosition * (max - min)) / step);
    const value = min + stepIndex * step;

    return Math.max(min, Math.min(max, value));
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
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
      // Final value calculation based on end position
      const finalValue = getValueFromPosition(event.x, sliderWidth.current);
      onValueChange(finalValue);
    });

  const handleStarPress = (starValue: number) => {
    if (disabled) return;
    // If clicking the same star that's already selected, toggle to half value using step
    if (starValue === value) {
      const newValue = value % 1 === 0 ? value - step : value + step;
      onValueChange(Math.max(min, Math.min(max, newValue)));
    } else {
      onValueChange(starValue);
    }
  };

  const renderStar = (starValue: number) => {
    const isFilled = starValue <= value;
    const isHalfFilled = starValue - step <= value && value < starValue;

    return (
      <TouchableOpacity
        key={starValue}
        style={styles.starContainer}
        onPress={() => handleStarPress(starValue)}
        disabled={disabled}
      >
        <SvgIcon
          name={isFilled ? "star_filled" : "star"}
          size={starSize}
          color={isFilled ? colors.star : colors.borderLight}
          secondaryColor={isFilled ? colors.starLight : colors.border}
        />
        {isHalfFilled && (
          <View style={styles.halfStarOverlay}>
            <SvgIcon
              name="star_filled"
              size={starSize}
              color={colors.star}
              secondaryColor={colors.starLight}
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
          {/* Track with stars inside for drag gestures */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.trackContainer}>
              {/* Visible stars */}
              <View
                style={styles.starsContainer}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout;
                  starsWidth.current = width;
                  // Update slider width to match stars width
                  sliderWidth.current = width;
                }}
              >
                {Array.from({ length: totalStars }, (_, i) => min + i).map(
                  renderStar
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
  currentValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: "center",
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
  starsContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  starContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  halfStarOverlay: {
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

export default StarRatingSlider;
