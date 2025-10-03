import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { colors } from "../../../themes/colors";
import SvgIcon from "../../SvgIcon";

interface BalanceSliderProps {
  /** Current value between MIN_VALUE and MAX_VALUE */
  value: number;
  /** Callback when value changes */
  onValueChange: (value: number) => void;
  /** Whether the slider is read-only */
  readOnly?: boolean;
  /** Quality indicator labels (typically 3 strings) */
  qualityIndicators?: string[];
}

const HANDLE_SIZE = 28;
const TRACK_HEIGHT = 8;
const MIN_VALUE = -1;
const MAX_VALUE = 1;
const STEP = 0.1;
const HANDLE_OVERLAP = 0.25; // Overlap factor for track highlight connection
const ANIMATION_CONFIG = {
  tension: 100,
  friction: 8,
};

const BalanceSlider: React.FC<BalanceSliderProps> = ({
  value,
  onValueChange,
  readOnly = false,
  qualityIndicators = ["Too weak", "Balanced", "Too strong"],
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const trackHighlightWidth = useRef(new Animated.Value(0)).current;
  const trackHighlightPosition = useRef(new Animated.Value(0)).current;
  const sliderWidth = useRef(0);
  const lastOffset = useRef(0);

  /**
   * Determine icon based on value distance from center (0)
   * @param val - Current slider value
   * @returns Icon name for the handle
   */
  const getIconName = (val: number) => {
    const distance = (Math.abs(val) / MAX_VALUE) * 100;
    if (distance <= 10) {
      return "heart_filled";
    } else if (distance <= 70) {
      return "heart_broken_filled";
    } else {
      return "heart_broken_2_filled";
    }
  };

  /**
   * Calculate handle position from value (centered handle)
   * @param val - Slider value
   * @param sliderWidth - Width of the slider track
   * @returns X position for the handle center
   */
  const getPositionFromValue = (val: number, sliderWidth: number) => {
    const range = MAX_VALUE - MIN_VALUE;
    const normalizedValue = (val - MIN_VALUE) / range;
    return normalizedValue * sliderWidth - HANDLE_SIZE / 2;
  };

  /**
   * Calculate value from handle position (centered handle)
   * @param position - Handle X position
   * @param sliderWidth - Width of the slider track
   * @returns Snapped slider value
   */
  const getValueFromPosition = (position: number, sliderWidth: number) => {
    const normalizedPosition = (position + HANDLE_SIZE / 2) / sliderWidth;
    const rawValue = MIN_VALUE + normalizedPosition * (MAX_VALUE - MIN_VALUE);
    return (Math.round(rawValue / STEP) * STEP).toFixed(1);
  };

  /**
   * Calculate track highlight width based on value
   * @param val - Current slider value
   * @param sliderWidth - Width of the slider track
   * @returns Width of the highlight track
   */
  const getTrackHighlightWidth = (val: number, sliderWidth: number) => {
    const absoluteValue = Math.abs(val);
    const valueRate = absoluteValue / MAX_VALUE;
    return Math.max(
      0,
      valueRate * (sliderWidth / 2) - HANDLE_SIZE * HANDLE_OVERLAP
    );
  };

  /**
   * Calculate track highlight position
   * @param val - Current slider value
   * @param sliderWidth - Width of the slider track
   * @returns X position for the highlight start
   */
  const getTrackHighlightPosition = (val: number, sliderWidth: number) => {
    if (val < 0) {
      const absoluteValue = Math.abs(val);
      const multiplier = 1 - absoluteValue;
      return multiplier * (sliderWidth / 2) + HANDLE_SIZE * HANDLE_OVERLAP;
    }
    return sliderWidth / 2;
  };

  // Initialize position and track highlight
  React.useEffect(() => {
    if (sliderWidth.current > 0) {
      const initialPosition = getPositionFromValue(value, sliderWidth.current);
      const highlightWidth = getTrackHighlightWidth(value, sliderWidth.current);
      const highlightPosition = getTrackHighlightPosition(
        value,
        sliderWidth.current
      );
      translateX.setValue(initialPosition);
      trackHighlightWidth.setValue(highlightWidth);
      trackHighlightPosition.setValue(highlightPosition);
      lastOffset.current = initialPosition;
    }
  }, [value]);

  const panGesture = Gesture.Pan()
    .enabled(!readOnly)
    .onUpdate((event) => {
      const newPosition = lastOffset.current + event.translationX;
      translateX.setValue(newPosition);

      // Update highlight in real-time during drag
      const currentValue = getValueFromPosition(
        newPosition,
        sliderWidth.current
      );
      const highlightWidth = getTrackHighlightWidth(
        Number(currentValue),
        sliderWidth.current
      );
      const highlightPosition = getTrackHighlightPosition(
        Number(currentValue),
        sliderWidth.current
      );
      trackHighlightWidth.setValue(highlightWidth);
      trackHighlightPosition.setValue(highlightPosition);
    })
    .onStart(() => {
      // Light haptic feedback when starting to drag
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
        ...ANIMATION_CONFIG,
      }).start();
    })
    .onEnd((event) => {
      const newPosition = Math.max(
        -HANDLE_SIZE / 2,
        Math.min(
          sliderWidth.current - HANDLE_SIZE / 2,
          lastOffset.current + event.translationX
        )
      );

      const newValue = getValueFromPosition(newPosition, sliderWidth.current);
      const snappedPosition = getPositionFromValue(
        Number(newValue),
        sliderWidth.current
      );
      const highlightWidth = getTrackHighlightWidth(
        Number(newValue),
        sliderWidth.current
      );
      const highlightPosition = getTrackHighlightPosition(
        Number(newValue),
        sliderWidth.current
      );

      // Medium haptic feedback when releasing the slider
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: snappedPosition,
          useNativeDriver: true,
          ...ANIMATION_CONFIG,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          ...ANIMATION_CONFIG,
        }),
        Animated.spring(trackHighlightWidth, {
          toValue: highlightWidth,
          useNativeDriver: false,
          ...ANIMATION_CONFIG,
        }),
        Animated.spring(trackHighlightPosition, {
          toValue: highlightPosition,
          useNativeDriver: false,
          ...ANIMATION_CONFIG,
        }),
      ]).start();

      lastOffset.current = snappedPosition;
      onValueChange(Number(newValue));
    });

  return (
    <View style={styles.sliderContainer}>
      <View
        style={styles.trackContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          sliderWidth.current = width;
          // Initialize position and track highlight when we get the width
          const initialPosition = getPositionFromValue(value, width);
          const highlightWidth = getTrackHighlightWidth(value, width);
          const highlightPosition = getTrackHighlightPosition(value, width);
          translateX.setValue(initialPosition);
          trackHighlightWidth.setValue(highlightWidth);
          trackHighlightPosition.setValue(highlightPosition);
          lastOffset.current = initialPosition;
        }}
      >
        {/* Track */}
        <View style={[styles.track, readOnly && styles.trackReadOnly]} />

        {/* Track Highlight */}
        <Animated.View
          style={[
            styles.trackHighlight,
            {
              width: trackHighlightWidth,
              left: trackHighlightPosition,
            },
            readOnly && styles.trackHighlightReadOnly,
          ]}
        />

        {/* Handle */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.handle,
              !readOnly && styles.activeHandle,
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
  sliderContainer: {
    marginBottom: 8,
    paddingHorizontal: HANDLE_SIZE / 2,
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
  trackReadOnly: {
    backgroundColor: colors.hover,
    opacity: 0.7,
  },
  trackHighlight: {
    position: "absolute",
    height: TRACK_HEIGHT,
    backgroundColor: colors.primary,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackHighlightReadOnly: {
    backgroundColor: colors.disabled,
    opacity: 0.5,
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
  activeHandle: {
    // Shadow styles can be added here if needed
  },
});

export default BalanceSlider;
