import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts }  from '../theme';
import { HapticPress }      from '../components/HapticPress';
import { OnboardingShell }  from './OnboardingShell';
import { IcCheck }          from '../components/Icons';

const BUCKETS = [
  { id: 'kid',   label: 'Menos de 12',  sub: 'Versión simple, ayuda de un adulto sugerida' },
  { id: 'teen',  label: '12 a 17',       sub: 'Comparte con compañeros del cole' },
  { id: 'adult', label: '18 a 35',       sub: 'La experiencia completa' },
  { id: 'pro',   label: '36 o más',      sub: 'Coleccionista experto, todos los álbumes' },
];

interface Props {
  onNext: (age: string) => void;
  onBack: () => void;
}

export function OnboardAge({ onNext, onBack }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('');

  return (
    <OnboardingShell step={3} total={4} onBack={onBack} eyebrow="Paso 3 · Edad" title="¿Tu rango de edad?">
      <Text style={[styles.sub, { color: t.ink3, fontFamily: fonts.body }]}>
        Nos ayuda a ajustar la experiencia. No compartimos tus datos.
      </Text>

      <View style={styles.list}>
        {BUCKETS.map(b => {
          const sel = selected === b.id;
          return (
            <HapticPress
              key={b.id}
              style={[
                styles.row,
                {
                  backgroundColor: sel ? t.pitch : t.card,
                  borderColor: sel ? 'transparent' : t.line,
                },
              ]}
              onPress={() => setSelected(b.id)}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: sel ? '#fff' : t.ink, fontFamily: fonts.headline }]}>{b.label}</Text>
                <Text style={[styles.rowSub, { color: sel ? 'rgba(255,255,255,0.7)' : t.ink4, fontFamily: fonts.body }]}>{b.sub}</Text>
              </View>
              <View style={[
                styles.radio,
                {
                  backgroundColor: sel ? '#fff' : 'transparent',
                  borderColor: sel ? 'transparent' : t.line2,
                },
              ]}>
                {sel && <IcCheck color={t.pitch} size={12} />}
              </View>
            </HapticPress>
          );
        })}
      </View>

      <HapticPress
        style={[styles.btn, { backgroundColor: selected ? t.pitch : t.paper2, opacity: selected ? 1 : 0.4 }]}
        onPress={() => selected && onNext(selected)}
      >
        <Text style={[styles.btnText, { color: selected ? '#fff' : t.ink4, fontFamily: fonts.headline }]}>Continuar</Text>
      </HapticPress>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sub:      { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  list:     { gap: 8, marginBottom: 20 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, borderWidth: 0.5 },
  rowText:  { flex: 1 },
  rowLabel: { fontSize: 15 },
  rowSub:   { fontSize: 11, marginTop: 2, lineHeight: 15 },
  radio:    { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  btn:      { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  btnText:  { fontSize: 15 },
});
