import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

const COLORS = ['#D7263D', '#E89B2F', '#B5DA40', '#0E5B3A', '#EFE7D2'];
const FLAG_W = 18, FLAG_H = 24, GAP = 10, FLAGS = 8;

export function MxBunting() {
  const totalW = FLAGS * (FLAG_W + GAP);
  const pts = Array.from({ length: FLAGS + 1 }, (_, i) => ({
    x: i * (FLAG_W + GAP) + (i > 0 ? FLAG_W / 2 : 0),
    y: i % 2 === 0 ? 6 : 20,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <View pointerEvents="none">
      <Svg width={totalW} height={FLAG_H + 10} viewBox={`0 0 ${totalW} ${FLAG_H + 10}`}>
        <Path d={d} stroke="#E89B2F" strokeWidth={1.5} fill="none" />
        {Array.from({ length: FLAGS }, (_, i) => (
          <G key={i} transform={`translate(${i * (FLAG_W + GAP)}, 6)`}>
            <Path
              d={`M0 0 L${FLAG_W} 0 L${FLAG_W / 2} ${FLAG_H} Z`}
              fill={COLORS[i % COLORS.length]}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}
