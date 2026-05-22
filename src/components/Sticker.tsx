import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Sticker as StickerData } from '../data/album';
import { TEAMS } from '../data/album';
import { useTheme, fonts } from '../theme';
import { HapticPress } from './HapticPress';

interface Props {
  sticker: StickerData;
  size?: number;
  onPress?: (sticker: StickerData) => void;
  onLongPress?: (sticker: StickerData) => void;
}

const TEAM_COLOR_MAP = new Map(
  TEAMS.map(t => [t.code, [t.colors[0], t.colors[2] ?? t.colors[1]] as [string, string]])
);
function teamColors(code: string): [string, string] {
  return TEAM_COLOR_MAP.get(code) ?? ['#444', '#222'];
}

function initials(name: string): string {
  return name.split(' ').pop()?.slice(0, 3).toUpperCase() ?? '?';
}

export const Sticker = React.memo(function Sticker({ sticker, size = 52, onPress, onLongPress }: Props) {
  const t = useTheme();
  const w = size;
  const h = Math.round(size * 7 / 5);

  const isMissing   = sticker.state === 'missing';
  const isDuplicate = sticker.state === 'duplicate';
  const isOwned     = sticker.state === 'owned' || isDuplicate;

  const [c1, c2]  = sticker.team ? teamColors(sticker.team) : ['#E8B23A', '#F5D77A'];
  const numLabel  = sticker.team && sticker.team !== 'CC'
    ? `${sticker.team} ${String(sticker.teamNum ?? sticker.id).padStart(2, '0')}`
    : sticker.label;
  const footLabel = sticker.label;

  const footH    = Math.max(10, Math.round(h * 0.165));
  const numSize  = Math.max(5,  Math.round(size * 0.135));
  const initSize = Math.max(9,  Math.round(size * 0.36));
  const footSize = Math.max(5,  Math.round(size * 0.115));

  return (
    <HapticPress
      onPress={() => onPress?.(sticker)}
      onLongPress={() => onLongPress?.(sticker)}
      style={{ width: w, height: h }}
    >
      {isDuplicate && (
        <>
          <View style={[styles.dupeShadow2, { width: w, height: h, backgroundColor: t.card, borderRadius: 6, borderColor: t.line2 }]} />
          <View style={[styles.dupeShadow1, { width: w, height: h, backgroundColor: t.card, borderRadius: 6, borderColor: t.line2 }]} />
        </>
      )}

      <View style={[
        styles.cell,
        { width: w, height: h },
        isMissing
          ? { borderStyle: 'dashed', borderWidth: 1.25, borderColor: t.line2, backgroundColor: 'transparent' }
          : { backgroundColor: t.card, borderWidth: 0.5, borderColor: t.line2 },
      ]}>
        <Text style={[styles.num, { fontSize: numSize, color: isMissing ? t.ink4 : t.ink3 }]} numberOfLines={1}>
          {numLabel}
        </Text>

        {isOwned ? (
          <LinearGradient
            colors={[c1, c2]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.art, { height: h - footH - Math.round(h * 0.15) }]}
          >
            <Text style={[styles.init, { fontSize: initSize }]}>{initials(sticker.name)}</Text>
            <View style={[styles.sheen, { left: -Math.round(w * 0.3), width: Math.round(w * 0.6) }]} />
          </LinearGradient>
        ) : (
          <View style={[styles.art, { height: h - footH - Math.round(h * 0.15) }]} />
        )}

        <View style={[styles.foot, { height: footH, backgroundColor: isMissing ? t.line : t.ink }]}>
          <Text style={[styles.footText, { fontSize: footSize, color: isMissing ? 'transparent' : t.paper }]} numberOfLines={1}>
            {footLabel}
          </Text>
        </View>

        {isDuplicate && (sticker.count ?? 0) > 0 && (
          <View style={[styles.badge, { backgroundColor: t.gold, borderColor: t.paper }]}>
            <Text style={[styles.badgeText, { color: t.ink }]}>×{(sticker.count ?? 0) + 1}</Text>
          </View>
        )}
      </View>
    </HapticPress>
  );
});

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  dupeShadow2: {
    position: 'absolute',
    borderWidth: 0.5,
    transform: [{ translateX: 3 }, { translateY: 3 }],
    zIndex: -2,
  },
  dupeShadow1: {
    position: 'absolute',
    borderWidth: 0.5,
    transform: [{ translateX: 1.5 }, { translateY: 1.5 }],
    zIndex: -1,
  },
  num: {
    position: 'absolute',
    top: 3,
    left: 4,
    fontFamily: fonts.mono,
    zIndex: 2,
    letterSpacing: -0.3,
  },
  art: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
    position: 'relative',
  },
  init: {
    fontFamily: fonts.display,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -1,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ skewX: '-15deg' }],
  },
  foot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footText: {
    fontFamily: fonts.headline,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 3,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    lineHeight: 11,
  },
});
