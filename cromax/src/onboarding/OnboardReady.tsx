import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { name: string; onDone: () => void }

export function OnboardReady({ name, onDone }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.pitch }]}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>¡Listo, {name}!</Text>
      <Text style={styles.sub}>Ya puedes empezar a llenar{'\n'}tu álbum Cromax.</Text>
      <HapticPress style={[styles.btn, { backgroundColor: t.primary }] as any} onPress={onDone}>
        <Text style={[styles.btnText, { color: t.pitch }]}>Ver mi álbum</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:   { fontSize: 64, marginBottom: 16 },
  title:   { fontSize: 36, fontWeight: '900', color: '#E89B2F', letterSpacing: -1 },
  sub:     { fontSize: 18, color: '#EFE7D2', textAlign: 'center', marginVertical: 16 },
  btn:     { paddingHorizontal: 48, paddingVertical: 16, borderRadius: 32, marginTop: 16 },
  btnText: { fontSize: 18, fontWeight: '700' },
});
