import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

const TRACK_W   = 51;
const TRACK_H   = 31;
const THUMB_D   = 27;
const THUMB_PAD = 2;
const TRAVEL    = TRACK_W - THUMB_D - THUMB_PAD * 2; // 20

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  activeColor?: string;
}

const SPRING = { damping: 22, stiffness: 260, mass: 0.85 };

export function Toggle({ value, onValueChange, activeColor = '#34C759' }: Props) {
  // posAnim  → useNativeDriver: true  (translateX, fast)
  // colAnim  → useNativeDriver: false (backgroundColor, JS thread)
  const posAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const colAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    const target = value ? 1 : 0;
    Animated.parallel([
      Animated.spring(posAnim, { toValue: target, useNativeDriver: true,  ...SPRING }),
      Animated.spring(colAnim, { toValue: target, useNativeDriver: false, ...SPRING }),
    ]).start();
  }, [value]);

  const translateX = posAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [THUMB_PAD, THUMB_PAD + TRAVEL],
  });

  const trackBg = colAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['#D1D1D6', activeColor],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={8} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width:        TRACK_W,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    width:        THUMB_D,
    height:       THUMB_D,
    borderRadius: THUMB_D / 2,
    backgroundColor: '#FFFFFF',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.22,
    shadowRadius:    3,
    elevation:       4,
  },
});
