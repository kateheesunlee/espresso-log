import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../themes/colors';

interface ExpandableChevronProps {
  isExpanded: boolean;
  onPress?: () => void;
  size?: number;
  color?: string;
}

const ExpandableChevron: React.FC<ExpandableChevronProps> = ({
  isExpanded,
  onPress,
  size = 24,
  color = colors.textDark,
}) => {
  const rotateValue = useMemo(
    () => new Animated.Value(isExpanded ? 1 : 0),
    [isExpanded]
  );

  useEffect(() => {
    Animated.timing(rotateValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateValue]);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const content = (
    <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
      <Ionicons name='chevron-down' size={size} color={color} />
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.button}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  container: {},
});

export default ExpandableChevron;
