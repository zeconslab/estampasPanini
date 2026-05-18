import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts } from '../theme';

interface Props {
  title: string;
  trailing?: React.ReactNode;
}

export function SectionHeader({ title, trailing }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 18,
    letterSpacing: -0.4,
    lineHeight: 22,
  },
});
