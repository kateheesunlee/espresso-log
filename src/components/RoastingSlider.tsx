import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import SvgIcon from "./SvgIcon";
import { colors } from "../themes/colors";
import { RoastLevel } from "../database/UniversalDatabase";

interface RoastingSliderProps {
  label: string;
  value: RoastLevel;
  onValueChange: (value: RoastLevel) => void;
  disabled?: boolean;
}

const HANDLE_SIZE = 28;
const TRACK_HEIGHT = 8;

const ROASTING_LEVELS = [
  RoastLevel.LIGHT,
  RoastLevel.MEDIUM_LIGHT,
  RoastLevel.MEDIUM,
  RoastLevel.MEDIUM_DARK,
  RoastLevel.DARK,
];

const roastingColorMap = {
  [RoastLevel.LIGHT]: colors.roastingLight,
  [RoastLevel.MEDIUM_LIGHT]: colors.roastingMediumLight,
  [RoastLevel.MEDIUM]: colors.roastingMedium,
  [RoastLevel.MEDIUM_DARK]: colors.roastingMediumDark,
  [RoastLevel.DARK]: colors.roastingDark,
};

const roastingColorMapLight = {
  [RoastLevel.LIGHT]: colors.roastingLight_Light,
  [RoastLevel.MEDIUM_LIGHT]: colors.roastingMediumLight_Light,
  [RoastLevel.MEDIUM]: colors.roastingMedium_Light,
  [RoastLevel.MEDIUM_DARK]: colors.roastingMediumDark_Light,
  [RoastLevel.DARK]: colors.roastingDark_Light,
};

const RoastingSlider: React.FC<RoastingSliderProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const sliderWidth = useRef(0);
  const lastOffset = useRef(0);

  // Helper function to get a valid roast level, defaulting to Medium if not found
  const getValidRoastLevel = (val: RoastLevel): RoastLevel => {
    return ROASTING_LEVELS.includes(val) ? val : RoastLevel.MEDIUM;
  };

  // Calculate initial position based on value
  const getPositionFromValue = (val: RoastLevel, width: number) => {
    const index = ROASTING_LEVELS.indexOf(val);
    // If value is not found, default to Medium (index 2)
    const validIndex = index === -1 ? 2 : index;
    const normalizedValue = validIndex / (ROASTING_LEVELS.length - 1);
    return normalizedValue * (width - HANDLE_SIZE);
  };

  // Calculate value from position
  const getValueFromPosition = (
    position: number,
    width: number
  ): RoastLevel => {
    const normalizedPosition = position / (width - HANDLE_SIZE);
    const index = Math.round(normalizedPosition * (ROASTING_LEVELS.length - 1));
    return ROASTING_LEVELS[
      Math.max(0, Math.min(ROASTING_LEVELS.length - 1, index))
    ];
  };

  // Initialize position
  React.useEffect(() => {
    if (sliderWidth.current > 0) {
      const initialPosition = getPositionFromValue(value, sliderWidth.current);
      translateX.setValue(initialPosition);
      lastOffset.current = initialPosition;
    }
  }, [value, sliderWidth.current]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      translateX.setValue(lastOffset.current + event.translationX);
    })
    .onStart(() => {
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
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {/* <Text style={styles.currentValue}>{value}</Text> */}
      </View>
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
          <View style={styles.track} />

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
              <SvgIcon
                name="bean_filled"
                size={HANDLE_SIZE}
                color={roastingColorMap[getValidRoastLevel(value)]}
                secondaryColor={
                  roastingColorMapLight[getValidRoastLevel(value)]
                }
              />
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Roasting level indicators below track */}
        <View style={styles.roastingIndicators}>
          {ROASTING_LEVELS.map((level) => (
            <Text key={level} style={styles.roastingIndicator}>
              {level}
            </Text>
          ))}
        </View>
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
  roastingIndicators: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 6,
  },
  roastingIndicator: {
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

export default RoastingSlider;
