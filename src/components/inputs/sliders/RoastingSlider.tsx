import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { RoastLevel, ROAST_LEVELS } from '@types';
import { colors } from '../../../themes/colors';
import SvgIcon from '../../SvgIcon';

interface RoastingSliderProps {
  value: RoastLevel;
  onValueChange: (value: RoastLevel) => void;
  disabled?: boolean;
}

const HANDLE_SIZE = 28;
const TRACK_HEIGHT = 8;

const ROASTING_LEVELS: RoastLevel[] = [...ROAST_LEVELS];

const roastingColorMap = {
  ['Light']: colors.roastingLight,
  ['Medium Light']: colors.roastingMediumLight,
  ['Medium']: colors.roastingMedium,
  ['Medium Dark']: colors.roastingMediumDark,
  ['Dark']: colors.roastingDark,
};

const roastingColorMapLight = {
  ['Light']: colors.roastingLight_Light,
  ['Medium Light']: colors.roastingMediumLight_Light,
  ['Medium']: colors.roastingMedium_Light,
  ['Medium Dark']: colors.roastingMediumDark_Light,
  ['Dark']: colors.roastingDark_Light,
};

const RoastingSlider: React.FC<RoastingSliderProps> = ({
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
    return ROASTING_LEVELS.includes(val) ? val : 'Medium';
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
  }, [value]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate(event => {
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
    .onEnd(event => {
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
        onLayout={event => {
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
              name='bean_filled'
              size={HANDLE_SIZE}
              color={roastingColorMap[getValidRoastLevel(value)]}
              secondaryColor={roastingColorMapLight[getValidRoastLevel(value)]}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Roasting level indicators below track */}
      <View style={styles.roastingIndicators}>
        {ROASTING_LEVELS.map(level => (
          <Text key={level} style={styles.roastingIndicator}>
            {level}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  handle: {
    alignItems: 'center',
    height: HANDLE_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    width: HANDLE_SIZE,
  },
  roastingIndicator: {
    color: colors.textMedium,
    fontSize: 12,
  },
  roastingIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 6,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  track: {
    backgroundColor: colors.borderLight,
    borderRadius: TRACK_HEIGHT / 2,
    height: TRACK_HEIGHT,
    width: '100%',
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
});

export default RoastingSlider;
