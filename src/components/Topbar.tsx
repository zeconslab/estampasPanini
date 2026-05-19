import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, fonts } from '../theme';
import { HapticPress } from './HapticPress';

interface IconBtnProps {
  onPress: () => void;
  children: React.ReactNode;
}

export function IconBtn({ onPress, children }: IconBtnProps) {
  const t = useTheme();
  return (
    <HapticPress
      onPress={onPress}
      style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.line }]}
    >
      {children}
    </HapticPress>
  );
}

interface TopbarProps {
  title: string;
  scrolled?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export function Topbar({ title, scrolled = false, left, right }: TopbarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: t.paper, paddingTop: insets.top + 8 },
        scrolled && styles.elevated,
      ]}
    >
      <View style={styles.side}>{left ?? <View style={styles.placeholder} />}</View>
      <Text style={[styles.title, { color: t.ink }]} numberOfLines={1}>{title}</Text>
      <View style={[styles.side, styles.rightSide]}>{right ?? <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderBottomWidth: 0.5,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 17,
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
  },
  side: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'flex-end',
    gap: 8,
  },
  placeholder: { width: 40 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
