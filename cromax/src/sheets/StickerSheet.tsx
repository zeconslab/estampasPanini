import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAlbumStore }  from '../store/useAlbumStore';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';

type Route = RouteProp<RootStackParamList, 'StickerModal'>;

const STATES = ['missing', 'owned', 'duplicate'] as const;
const STATE_LABELS = { missing: 'Me falta', owned: 'La tengo', duplicate: 'Repetida' };
const STATE_COLORS = (t: ReturnType<typeof useTheme>) => ({
  missing:   t.coral,
  owned:     t.lime,
  duplicate: t.gold,
});

export function StickerSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const route   = useRoute<Route>();
  const { stickerId } = route.params;

  const { stickers, updateSticker } = useAlbumStore();
  const sticker = stickers.find(s => s.id === stickerId);
  const colors  = STATE_COLORS(t);

  if (!sticker) return null;

  const setCount = (delta: number) => {
    const next = Math.max(1, (sticker.count || 1) + delta);
    updateSticker(sticker.id, { count: next });
  };

  return (
    <View style={[styles.container, { backgroundColor: t.paper, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <Text style={[styles.title, { color: t.ink }]}>{sticker.name}</Text>
      <Text style={[styles.label, { color: t.ink4 }]}>{sticker.label} · {sticker.team ?? 'Especial'}</Text>

      {/* State selector */}
      <View style={styles.stateRow}>
        {STATES.map(state => (
          <HapticPress
            key={state}
            style={[styles.stateBtn, {
              backgroundColor: sticker.state === state ? colors[state] : t.paper2,
              flex: 1,
            }]}
            onPress={() => updateSticker(sticker.id, {
              state,
              count: state === 'duplicate' ? (sticker.count || 1) : 0,
            })}
          >
            <Text style={[styles.stateBtnText, { color: sticker.state === state ? t.pitch : t.ink3 }]}>
              {STATE_LABELS[state]}
            </Text>
          </HapticPress>
        ))}
      </View>

      {/* Duplicate stepper */}
      {sticker.state === 'duplicate' && (
        <View style={styles.stepper}>
          <HapticPress style={[styles.stepBtn, { backgroundColor: t.paper2 }]} onPress={() => setCount(-1)}>
            <Text style={[styles.stepBtnText, { color: t.ink }]}>−</Text>
          </HapticPress>
          <Text style={[styles.stepCount, { color: t.ink }]}>×{(sticker.count || 1) + 1}</Text>
          <HapticPress style={[styles.stepBtn, { backgroundColor: t.paper2 }]} onPress={() => setCount(1)}>
            <Text style={[styles.stepBtnText, { color: t.ink }]}>+</Text>
          </HapticPress>
        </View>
      )}

      <HapticPress style={[styles.closeBtn, { backgroundColor: t.pitch }]} onPress={() => nav.goBack()}>
        <Text style={styles.closeBtnText}>Listo</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 20 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:        { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  label:        { fontSize: 14, marginBottom: 24 },
  stateRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stateBtn:     { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  stateBtnText: { fontSize: 13, fontWeight: '700' },
  stepper:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 },
  stepBtn:      { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:  { fontSize: 24, fontWeight: '300' },
  stepCount:    { fontSize: 28, fontWeight: '900', minWidth: 60, textAlign: 'center' },
  closeBtn:     { borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
});
