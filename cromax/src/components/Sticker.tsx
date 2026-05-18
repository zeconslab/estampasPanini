import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sticker as StickerData } from '../data/album';
import { useTheme } from '../theme';
import { HapticPress } from './HapticPress';

interface Props {
  sticker: StickerData;
  size?: number;
  onPress?: (sticker: StickerData) => void;
}

export function Sticker({ sticker, size = 52, onPress }: Props) {
  const t = useTheme();
  const w = size;
  const h = Math.round(size * 1.4); // 5:7 ratio

  const bg =
    sticker.state === 'owned'     ? t.lime  :
    sticker.state === 'duplicate' ? t.gold  :
    t.paper2;

  const textColor =
    sticker.state === 'owned'     ? t.pitch :
    sticker.state === 'duplicate' ? t.pitch :
    t.ink4;

  return (
    <HapticPress onPress={() => onPress?.(sticker)} style={{ width: w, height: h }}>
      <View style={[styles.cell, { width: w, height: h, backgroundColor: bg, borderColor: t.line }]}>
        <Text style={[styles.label, { color: textColor, fontSize: size * 0.2 }]} numberOfLines={1}>
          {sticker.label}
        </Text>
        {sticker.state === 'duplicate' && sticker.count > 0 && (
          <View style={[styles.badge, { backgroundColor: t.coral }]}>
            <Text style={styles.badgeText}>×{sticker.count + 1}</Text>
          </View>
        )}
      </View>
    </HapticPress>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
