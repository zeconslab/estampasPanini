import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, fonts } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { OnboardingShell } from './OnboardingShell';

const ALBUMS = [
  {
    id: 'mundial-2026',
    name: 'FIFA Mundial 2026',
    subtitle: '351 estampas · México, USA & Canadá',
    cover: '#0E5B3A',
    accent: '#E89B2F',
    active: true,
  },
  {
    id: 'copa-america-2025',
    name: 'Copa América 2025',
    subtitle: 'Próximamente',
    cover: '#1B2C6B',
    accent: '#D7263D',
    active: false,
  },
];

interface Props {
  onNext: (albumId: string) => void;
  onBack: () => void;
}

export function OnboardAlbum({ onNext, onBack }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('mundial-2026');

  return (
    <OnboardingShell
      step={1}
      total={4}
      onBack={onBack}
      eyebrow="Paso 1 · Álbum"
      title="¿Cuál estás llenando?"
    >
      <Text style={[styles.subtitle, { color: t.ink3 }]}>
        Por ahora trabajamos con el oficial del Mundial. Pronto se sumarán más álbumes.
      </Text>

      <View style={styles.list}>
        {ALBUMS.map(a => {
          const sel = selected === a.id;
          const dis = !a.active;
          return (
            <TouchableOpacity
              key={a.id}
              disabled={dis}
              activeOpacity={0.85}
              onPress={() => !dis && setSelected(a.id)}
              style={[
                styles.card,
                { backgroundColor: t.card, borderColor: sel ? t.pitch : t.line, opacity: dis ? 0.55 : 1 },
                sel && styles.cardSelected,
              ]}
            >
              {/* Cover art */}
              <View style={[styles.cover, { backgroundColor: a.cover }]}>
                <View style={[styles.coverAccent, { backgroundColor: a.accent }]} />
                <Text style={styles.coverLabel}>{a.name.toUpperCase()}</Text>
              </View>

              {/* Details */}
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardName, { color: t.ink }]}>{a.name}</Text>
                  {!a.active && (
                    <View style={[styles.soonBadge, { backgroundColor: t.paper2 }]}>
                      <Text style={[styles.soonText, { color: t.ink3 }]}>PRONTO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardSub, { color: t.ink3 }]}>{a.subtitle}</Text>
              </View>

              {/* Checkmark */}
              {sel && (
                <View style={[styles.check, { backgroundColor: t.pitch }]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 18,
    marginTop: 8,
  },
  list: { gap: 10, marginBottom: 22 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardSelected: { borderWidth: 2 },
  cover: {
    width: 58,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    justifyContent: 'flex-end',
    padding: 6,
  },
  coverAccent: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    height: 2,
    opacity: 0.85,
  },
  coverLabel: {
    fontFamily: fonts.display,
    fontSize: 8,
    color: '#fff',
    letterSpacing: 0.4,
    lineHeight: 10,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardName: { fontFamily: fonts.headline, fontSize: 15 },
  soonBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  soonText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 0.4, textTransform: 'uppercase' },
  cardSub: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  btn: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  btnText: { fontFamily: fonts.headline, fontSize: 15, letterSpacing: -0.1 },
});
