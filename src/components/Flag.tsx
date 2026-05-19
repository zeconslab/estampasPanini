import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props { colors: [string, string, string]; width?: number; height?: number }

export function Flag({ colors, width = 24, height = 16 }: Props) {
  const stripeH = height / 3;
  return (
    <View style={[styles.flag, { width, height }]}>
      {colors.map((c, i) => (
        <View key={i} style={{ width, height: stripeH, backgroundColor: c }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flag: { borderRadius: 2, overflow: 'hidden' },
});
