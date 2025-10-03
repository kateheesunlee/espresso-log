import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import SvgIcon from "../../SvgIcon";
import { colors } from "../../../themes/colors";

interface BalanceSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  qualityIndicators?: string[]; // it must be an array of 3 strings
}

const HANDLE_SIZE = 28;
const TRACK_HEIGHT = 8;

const BalanceSlider: React.FC<BalanceSliderProps> = ({
  value,
  onValueChange,
  min = -1,
  max = 1,
  step = 0.1,
  disabled = false,
  qualityIndicators = ["Too weak", "Balanced", "Too strong"],
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const sliderWidth = useRef(0);
  const lastOffset = useRef(0);

  // Determine icon based on value distance from 0 (percentage-based)
  const getIconName = (val: number) => {
    const distance = (Math.abs(val) / max) * 100;
    if (distance <= 10) {
      return "heart_filled";
    } else if (distance <= 70) {
      return "heart_broken_filled";
    } else {
      return "heart_broken_2_filled";
    }
  };

  // Calculate initial position based on value
  const getPositionFromValue = (val: number, width: number) => {
    const range = max - min;
    const normalizedValue = (val - min) / range;
    return normalizedValue * (width - HANDLE_SIZE);
  };

  // Calculate value from position
  const getValueFromPosition = (position: number, width: number) => {
    const normalizedPosition = position / (width - HANDLE_SIZE);
    const rawValue = min + normalizedPosition * (max - min);
    return Math.round(rawValue / step) * step;
  };

  // Initialize position
  React.useEffect(() => {
    if (sliderWidth.current > 0) {
      const initialPosition = getPositionFromValue(value, sliderWidth.current);
      translateX.setValue(initialPosition);
      lastOffset.current = initialPosition;
    }
  }, [value]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      translateX.setValue(lastOffset.current + event.translationX);
    })
    .onStart(() => {
      // Light haptic feedback when starting to drag
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    })
    .onEnd((event) => {
      const newPosition = Math.max(
        0,
        Math.min(
          sliderWidth.current - HANDLE_SIZE,
          lastOffset.current + event.translationX
        )
      );

      const newValue = getValueFromPosition(newPosition, sliderWidth.current);
      const snappedPosition = getPositionFromValue(
        newValue,
        sliderWidth.current
      );

      // Medium haptic feedback when releasing the slider
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: snappedPosition,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      lastOffset.current = snappedPosition;
      onValueChange(newValue);
    });

  return (
    <View style={styles.sliderContainer}>
      <View
        style={styles.trackContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          sliderWidth.current = width;
          // Initialize position when we get the width
          const initialPosition = getPositionFromValue(value, width);
          translateX.setValue(initialPosition);
          lastOffset.current = initialPosition;
        }}
      >
        {/* Track */}
        <View style={[styles.track, disabled && styles.trackDisabled]} />

        {/* Handle */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.handle,
              {
                transform: [{ translateX }, { scale }],
              },
            ]}
          >
            <SvgIcon name={getIconName(value)} size={HANDLE_SIZE} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Quality indicators below track
       */}
      <View style={styles.qualityIndicators}>
        {qualityIndicators.map((level, index) => (
          <Text
            key={level}
            style={[
              styles.qualityIndicator,
              qualityIndicators.length === 3 && {
                flex: index === 1 ? 0 : 1,
                textAlign:
                  index === 0 ? "left" : index === 1 ? "center" : "right",
              },
              qualityIndicators.length === 2 && {
                flex: 1,
                textAlign: index === 0 ? "left" : "right",
              },
            ]}
          >
            {level}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  trackContainer: {
    position: "relative",
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: colors.borderLight,
    borderRadius: TRACK_HEIGHT / 2,
    width: "100%",
  },
  trackDisabled: {
    backgroundColor: colors.hover, // Lighter color for disabled track
  },
  qualityIndicators: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  qualityIndicator: {
    fontSize: 12,
    color: colors.textMedium,
  },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BalanceSlider;
