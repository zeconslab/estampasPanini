import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';

interface Props { pct: number; size?: number; stroke?: number }

export function ProgressRing({ pct, size = 80, stroke = 8 }: Props) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
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
    </View>
  );
}
