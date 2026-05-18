import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { onNext: (name: string) => void }

export function OnboardName({ onNext }: Props) {
  const t = useTheme();
  const [name, setName] = useState('');
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.screen, { backgroundColor: t.paper }]}>
        <Text style={[styles.title, { color: t.ink }]}>¿Cómo te llamas?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={t.ink4}
          maxLength={30}
          style={[styles.input, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => name.trim() && onNext(name.trim())}
        />
        <HapticPress
          style={[styles.btn, { backgroundColor: name.trim() ? t.primary : t.paper2 }]}
          onPress={() => name.trim() && onNext(name.trim())}
        >
          <Text style={[styles.btnText, { color: name.trim() ? t.pitch : t.ink4 }]}>Siguiente</Text>
        </HapticPress>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, padding: 24, paddingTop: 80 },
  title:   { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  input:   { borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 18, marginBottom: 16 },
  btn:     { borderRadius: 32, padding: 16, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
});
