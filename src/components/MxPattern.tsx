import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props { size?: number; color?: string; opacity?: number }

export function MxPattern({ size = 80, color = '#E89B2F', opacity = 0.18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" opacity={opacity}>
      <Path d="M0 0 L20 0 L0 20 Z" fill={color} />
      <Path d="M80 0 L60 0 L80 20 Z" fill={color} />
      <Path d="M0 80 L20 80 L0 60 Z" fill={color} />
      <Path d="M80 80 L60 80 L80 60 Z" fill={color} />
      <Circle cx={40} cy={40} r={6} fill={color} />
      <Circle cx={40} cy={40} r={2} fill={color} opacity={0.5} />
    </Svg>
  );
}
