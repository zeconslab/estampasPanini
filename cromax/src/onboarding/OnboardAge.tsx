import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

const AGE_RANGES = ['< 12', '12–17', '18–25', '26–35', '36–45', '46+'];

interface Props { onNext: (age: string) => void }

export function OnboardAge({ onNext }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('');
  return (
    <View style={[styles.screen, { backgroundColor: t.paper }]}>
      <Text style={[styles.title, { color: t.ink }]}>¿Cuántos años tienes?</Text>
      <View style={styles.grid}>
        {AGE_RANGES.map(range => (
          <HapticPress
            key={range}
            style={[styles.chip,
              { backgroundColor: selected === range ? t.pitch : t.card, borderColor: t.line }
            ]}
            onPress={() => setSelected(range)}
          >
            <Text style={[styles.chipText, { color: selected === range ? '#EFE7D2' : t.ink }]}>
              {range}
            </Text>
          </HapticPress>
        ))}
      </View>
      <HapticPress
        style={[styles.btn, { backgroundColor: selected ? t.primary : t.paper2 }]}
        onPress={() => selected && onNext(selected)}
      >
        <Text style={[styles.btnText, { color: selected ? t.pitch : t.ink4 }]}>Siguiente</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, padding: 24, paddingTop: 80 },
  title:    { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  chip:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 32, borderWidth: 1 },
  chipText: { fontSize: 16, fontWeight: '600' },
  btn:      { borderRadius: 32, padding: 16, alignItems: 'center' },
  btnText:  { fontSize: 18, fontWeight: '700' },
});
