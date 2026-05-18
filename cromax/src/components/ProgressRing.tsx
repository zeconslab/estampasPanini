import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, fonts } from '../theme';

interface Props { pct: number; size?: number; stroke?: number; showLabel?: boolean }

export function ProgressRing({ pct, size = 80, stroke = 8, showLabel = false }: Props) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={t.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={t.lime} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>
      {showLabel && (
        <View style={styles.labelWrap}>
          <Text style={[styles.pct, { color: '#fff', fontSize: size * 0.2 }]}>{Math.round(pct)}%</Text>
          <Text style={[styles.sub, { color: 'rgba(255,255,255,0.6)', fontSize: size * 0.09 }]}>COMPLETO</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelWrap: { alignItems: 'center' },
  pct: { fontFamily: fonts.mono, letterSpacing: -1 },
  sub: { fontFamily: fonts.monoMedium, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 1 },
});
