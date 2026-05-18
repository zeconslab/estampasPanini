import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { onNext: (albumId: string) => void }

export function OnboardAlbum({ onNext }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.paper }]}>
      <Text style={[styles.title, { color: t.ink }]}>Elige tu álbum</Text>
      <HapticPress
        style={[styles.card, { backgroundColor: t.pitch, borderColor: t.primary, borderWidth: 2 }] as any}
        onPress={() => onNext('mundial-2026')}
      >
        <Text style={styles.cardEmoji}>🏆</Text>
        <Text style={styles.cardTitle}>FIFA Mundial 2026</Text>
        <Text style={styles.cardSub}>México · USA · Canadá</Text>
      </HapticPress>
      <View style={[styles.card, { backgroundColor: t.paper2, opacity: 0.5 }]}>
        <Text style={[styles.cardTitle, { color: t.ink4 }]}>Más álbumes próximamente…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, padding: 24, paddingTop: 80 },
  title:     { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  card:      { borderRadius: 16, padding: 24, marginBottom: 12, alignItems: 'center' },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#EFE7D2' },
  cardSub:   { fontSize: 14, color: '#9AA39B', marginTop: 4 },
});
