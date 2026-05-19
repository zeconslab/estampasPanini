import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts }  from '../theme';
import { HapticPress }      from '../components/HapticPress';
import { OnboardingShell }  from './OnboardingShell';

const STEPS = [
  { n: '1', title: 'Marca lo que ya pegaste',   desc: 'Selecciona la sigla del país y toca cada estampa que ya tengas.', color: 'primary' as const },
  { n: '2', title: 'Anota las repetidas',        desc: 'Toca otra vez una estampa que ya tienes para marcarla como repetida.', color: 'coral' as const },
  { n: '3', title: 'Comparte tus faltantes',     desc: 'Genera un link único para enviar a tus amigos y armar intercambios físicos.', color: 'pitch' as const },
];

interface Props { name: string; onDone: () => void }

export function OnboardReady({ name, onDone }: Props) {
  const t = useTheme();

  return (
    <OnboardingShell step={3} total={4} eyebrow="Paso 4 · Listo" title={`¡Bienvenido,\n${name}!`}>
      <Text style={[styles.sub, { color: t.ink3, fontFamily: fonts.body }]}>
        Tu álbum está listo. Aquí van los siguientes pasos para empezar:
      </Text>

      <View style={styles.steps}>
        {STEPS.map(s => (
          <View key={s.n} style={styles.stepRow}>
            <View style={[styles.bullet, {
              backgroundColor: s.color === 'primary' ? t.primary : s.color === 'coral' ? t.coral : t.pitch,
            }]}>
              <Text style={[styles.bulletNum, { fontFamily: fonts.mono }]}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stepTitle, { color: t.ink, fontFamily: fonts.headline }]}>{s.title}</Text>
              <Text style={[styles.stepDesc,  { color: t.ink3, fontFamily: fonts.body }]}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <HapticPress style={[styles.btn, { backgroundColor: t.pitch }]} onPress={onDone}>
        <Text style={[styles.btnText, { color: '#fff', fontFamily: fonts.headline }]}>Ir a mi álbum →</Text>
      </HapticPress>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sub:       { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 24 },
  steps:     { gap: 14, marginBottom: 28 },
  stepRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  bullet:    { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bulletNum: { fontSize: 14, color: '#fff' },
  stepTitle: { fontSize: 15, marginBottom: 3 },
  stepDesc:  { fontSize: 12, lineHeight: 17 },
  btn:       { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnText:   { fontSize: 16 },
});
