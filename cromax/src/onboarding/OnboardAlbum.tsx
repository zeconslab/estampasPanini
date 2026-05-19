import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts }   from '../theme';
import { HapticPress }       from '../components/HapticPress';
import { OnboardingShell }   from './OnboardingShell';
import { ALBUMS }            from '../data/album';
import { IcCheck }           from '../components/Icons';

interface Props {
  onNext: (albumId: string) => void;
  onBack: () => void;
}

export function OnboardAlbum({ onNext, onBack }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('mundial26');

  return (
    <OnboardingShell step={1} total={4} onBack={onBack} eyebrow="Paso 1 · Álbum" title="¿Cuál estás llenando?">
      <Text style={[styles.sub, { color: t.ink3, fontFamily: fonts.body }]}>
        Por ahora trabajamos con el oficial del Mundial. Pronto se sumarán más álbumes.
      </Text>

      <View style={styles.list}>
        {ALBUMS.map(album => {
          const sel = selected === album.id;
          return (
            <HapticPress
              key={album.id}
              style={[
                styles.card,
                {
                  backgroundColor: t.card,
                  borderColor: sel ? t.pitch : t.line,
                  borderWidth: sel ? 2 : 0.5,
                  opacity: album.active ? 1 : 0.55,
                },
              ]}
              onPress={() => album.active && setSelected(album.id)}
            >
              <View style={[styles.cover, { backgroundColor: album.cover }]}>
                <View style={[styles.coverAccent, { backgroundColor: album.accent }]} />
                <Text style={styles.coverName}>{album.name.toUpperCase()}</Text>
              </View>

              <View style={styles.info}>
                <View style={styles.titleRow}>
                  <Text style={[styles.albumName, { color: t.ink, fontFamily: fonts.headline }]}>{album.name}</Text>
                  {!album.active && (
                    <View style={[styles.badge, { backgroundColor: t.line }]}>
                      <Text style={[styles.badgeText, { color: t.ink4, fontFamily: fonts.mono }]}>Pronto</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.subtitle, { color: t.ink3, fontFamily: fonts.body }]}>{album.subtitle}</Text>
              </View>

              {sel && (
                <View style={[styles.check, { backgroundColor: t.pitch }]}>
                  <IcCheck color="#fff" size={12} />
                </View>
              )}
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
  sub:        { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  list:       { gap: 10, marginBottom: 22 },
  card:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, position: 'relative' },
  cover:      { width: 58, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  coverAccent:{ position: 'absolute', top: 6, left: 6, right: 6, height: 2, opacity: 0.85 },
  coverName:  { position: 'absolute', bottom: 6, left: 6, right: 6, fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 9, color: '#fff', letterSpacing: 0.4 },
  info:       { flex: 1 },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  albumName:  { fontSize: 15 },
  badge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText:  { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4 },
  subtitle:   { fontSize: 12, lineHeight: 16 },
  check:      { position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btn:        { borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  btnText:    { fontSize: 15 },
});
