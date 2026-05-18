import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import { useTheme, fonts } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { OnboardingShell } from './OnboardingShell';

interface Props {
  onNext: (name: string) => void;
  onBack: () => void;
}

export function OnboardName({ onNext, onBack }: Props) {
  const t = useTheme();
  const [name, setName] = useState('');
  const trimmed = name.trim();

  return (
    <OnboardingShell
      step={2}
      total={4}
      onBack={onBack}
      eyebrow="Paso 2 · Nombre"
      title="¿Cómo te llamas?"
    >
      <Text style={[styles.subtitle, { color: t.ink3 }]}>
        Lo usaremos para mostrarte tu progreso y al armar trueques con amigos.
      </Text>

      {/* Avatar + input row */}
      <View style={styles.inputRow}>
        <View style={[styles.avatar, { backgroundColor: trimmed ? undefined : t.paper2 }]}>
          {trimmed ? (
            <View style={styles.avatarGrad}>
              <Text style={styles.avatarLetter}>{trimmed[0].toUpperCase()}</Text>
            </View>
          ) : (
            <Text style={[styles.avatarQuestion, { color: t.ink4 }]}>?</Text>
          )}
        </View>
        <View style={styles.inputWrap}>
          <Text style={[styles.inputLabel, { color: t.ink3 }]}>Tu nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre o apodo"
            placeholderTextColor={t.ink4}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={() => { if (trimmed) { Keyboard.dismiss(); onNext(trimmed); } }}
            style={[styles.input, { color: t.ink, borderBottomColor: t.line }]}
          />
        </View>
      </View>

      <Text style={[styles.hint, { color: t.ink4 }]}>
        Solo lo verás tú y los amigos con los que intercambies. Puedes cambiarlo después.
      </Text>

      <HapticPress
        style={[
          styles.btn,
          { backgroundColor: trimmed ? t.pitch : t.paper2, opacity: trimmed ? 1 : 0.4 },
        ]}
        onPress={() => { if (trimmed) { Keyboard.dismiss(); onNext(trimmed); } }}
      >
        <Text style={[styles.btnText, { color: trimmed ? '#fff' : t.ink4 }]}>Continuar</Text>
      </HapticPress>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    lineHeight: 19,
    marginBottom: 24,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarGrad: {
    flex: 1,
    backgroundColor: '#0E5B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.headline,
    fontSize: 24,
    color: '#E89B2F',
  },
  avatarQuestion: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: fonts.headline,
    fontSize: 24,
    lineHeight: 64,
  },
  inputWrap: { flex: 1 },
  inputLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  input: {
    fontFamily: fonts.headline,
    fontSize: 22,
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    paddingBottom: 6,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 22,
  },
  btn: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  btnText: { fontFamily: fonts.headline, fontSize: 15, letterSpacing: -0.1 },
});
