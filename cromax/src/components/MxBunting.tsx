import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const COLORS = [
  '#D7263D', // rojo mexicano
  '#E89B2F', // marigold
  '#B5DA40', // chartreuse
  '#0E5B3A', // verde
  '#EFE7D2', // crema
  '#2D9CDB', // azul
  '#FF6B9D', // rosa
];

const FLAG_W  = 20;
const FLAG_H  = 28;
const GAP     = 5;
const ROPE_Y  = 8;
const TOTAL_H = ROPE_Y + FLAG_H + 12;
const SLOT    = FLAG_W + GAP;

interface Props { width?: number }

export function MxBunting({ width: propWidth }: Props) {
  const { width: screenW } = useWindowDimensions();
  const W = propWidth ?? screenW;

  const numFlags = Math.ceil(W / SLOT) + 2;
  const totalSlotW = numFlags * SLOT;
  const startX = (W - totalSlotW) / 2;

  // Catenary rope path — gentle sag in the middle
  const SAG = 10;
  const ropePath = `M 0 ${ROPE_Y} Q ${W / 2} ${ROPE_Y + SAG} ${W} ${ROPE_Y}`;

  return (
    <Svg width={W} height={TOTAL_H} viewBox={`0 0 ${W} ${TOTAL_H}`} pointerEvents="none">
      {/* Rope */}
      <Path
        d={ropePath}
        stroke="rgba(239,231,210,0.7)"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {Array.from({ length: numFlags }, (_, i) => {
        const slotX = startX + i * SLOT;
        const cx = slotX + FLAG_W / 2;

        // Each flag hangs from a point on the catenary rope
        const t = Math.max(0, Math.min(1, cx / W));
        const ropeAtX = ROPE_Y + 4 * t * (1 - t) * SAG;

        const color = COLORS[i % COLORS.length];

        // Pentagon flag: flat top, angled sides, pointed bottom
        const x1 = slotX;
        const x2 = slotX + FLAG_W;
        const y1 = ropeAtX;
        const y2 = ropeAtX + FLAG_H - 7;
        const y3 = ropeAtX + FLAG_H;
        const flagPath = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2} L ${cx} ${y3} L ${x1} ${y2} Z`;

        // Papel picado diamond cutout
        const dy = ropeAtX + FLAG_H * 0.42;
        const dr = 4;
        const cutout = `M ${cx} ${dy - dr} L ${cx + dr} ${dy} L ${cx} ${dy + dr} L ${cx - dr} ${dy} Z`;

        // Small circles near top corners (decorative holes)
        const dotY = ropeAtX + 4;

        return (
          <G key={i}>
            {/* Flag body */}
            <Path d={flagPath} fill={color} opacity={0.9} />
            {/* Diamond cutout */}
            <Path d={cutout} fill="rgba(0,0,0,0.18)" />
            {/* Top corner holes */}
            <Circle cx={x1 + 3} cy={dotY} r={1.2} fill="rgba(0,0,0,0.15)" />
            <Circle cx={x2 - 3} cy={dotY} r={1.2} fill="rgba(0,0,0,0.15)" />
            {/* Rope attachment dot */}
            <Circle cx={cx} cy={ropeAtX} r={2} fill="rgba(239,231,210,0.85)" />
          </G>
        );
      })}
    </Svg>
  );
}
