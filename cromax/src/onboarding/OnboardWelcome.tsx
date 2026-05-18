import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { MxBunting } from '../components/MxBunting';

interface Props { onNext: () => void }

export function OnboardWelcome({ onNext }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.pitch }]}>
      <View style={styles.bunting}><MxBunting /></View>
      <Text style={styles.title}>Cromax</Text>
      <Text style={styles.sub}>Tu álbum del{'\n'}Mundial 2026</Text>
      <HapticPress style={[styles.btn, { backgroundColor: t.primary }] as any} onPress={onNext}>
        <Text style={styles.btnText}>Comenzar</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bunting: { position: 'absolute', top: 80 },
  title:   { fontSize: 52, fontWeight: '900', color: '#E89B2F', letterSpacing: -2 },
  sub:     { fontSize: 22, color: '#EFE7D2', textAlign: 'center', marginBottom: 48, marginTop: 8 },
  btn:     { paddingHorizontal: 48, paddingVertical: 16, borderRadius: 32 },
  btnText: { fontSize: 18, fontWeight: '700', color: '#102A1F' },
});
