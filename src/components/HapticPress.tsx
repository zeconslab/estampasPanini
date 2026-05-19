import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  haptic?: boolean;
}

export function HapticPress({ children, style, onPress, onLongPress, haptic = true, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };
  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };
  const handleLongPress = (e: Parameters<NonNullable<PressableProps['onLongPress']>>[0]) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} onLongPress={handleLongPress} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
