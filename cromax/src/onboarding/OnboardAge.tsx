import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, fonts } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { OnboardingShell } from './OnboardingShell';

const AGE_RANGES = ['< 12', '12–17', '18–25', '26–35', '36–45', '46+'];

interface Props {
  onNext: (age: string) => void;
  onBack: () => void;
}

export function OnboardAge({ onNext, onBack }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingShell
      step={3}
      total={4}
      onBack={onBack}
      eyebrow="Paso 3 · Edad"
      title="¿Cuántos años tienes?"
    >
      <Text style={[styles.subtitle, { color: t.ink3 }]}>
        Nos ayuda a mejorar la app para todos los coleccionistas.
      </Text>

      <View style={styles.grid}>
        {AGE_RANGES.map(range => (
          <TouchableOpacity
            key={range}
            activeOpacity={0.85}
            onPress={() => setSelected(range)}
            style={[
              styles.chip,
              {
                backgroundColor: selected === range ? t.pitch : t.card,
                borderColor: selected === range ? t.pitch : t.line,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: selected === range ? '#EFE7D2' : t.ink }]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <HapticPress
        style={[
          styles.btn,
          { backgroundColor: selected ? t.pitch : t.paper2, opacity: selected ? 1 : 0.4 },
        ]}
        onPress={() => selected && onNext(selected)}
      >
        <Text style={[styles.btnText, { color: selected ? '#fff' : t.ink4 }]}>Continuar</Text>
      </HapticPress>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 19,
    marginBottom: 20,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 32,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  btn: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  btnText: { fontFamily: fonts.headline, fontSize: 15, letterSpacing: -0.1 },
});
