import React, { useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useTheme, fonts }   from '../theme';
import { HapticPress }       from '../components/HapticPress';
import { OnboardingShell }   from './OnboardingShell';
import { ALBUMS }            from '../data/album';
import { IcCheck }           from '../components/Icons';

const COKE_RED = '#F40009';

interface Props {
  onNext: (albumId: string, withCocaCola: boolean) => void;
  onBack: () => void;
}

function CokeToggle({ value, onChange, count }: { value: boolean; onChange: (v: boolean) => void; count: number }) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const toggle = () => {
    const next = !value;
    Animated.spring(anim, { toValue: next ? 1 : 0, useNativeDriver: false, tension: 180, friction: 10 }).start();
    onChange(next);
  };

  const thumbLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 27] });
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [t.line2, COKE_RED] });

  return (
    <HapticPress
      onPress={toggle}
      style={[styles.cokeCard, {
        backgroundColor: value ? '#FFF0F0' : t.card,
        borderColor: value ? COKE_RED : t.line,
        borderWidth: value ? 1.5 : 0.5,
      }]}
    >
      {/* Red accent stripe at top */}
      <View style={[styles.cokeStripe, { backgroundColor: value ? COKE_RED : t.line }]} />

      <View style={styles.cokeContent}>
        {/* Left: logo + info */}
        <View style={styles.cokeLeft}>
          {/* Coca-Cola wordmark */}
          <View style={styles.cokeLogoRow}>
            <View style={[styles.cokeDot, { backgroundColor: COKE_RED }]} />
            <Text style={[styles.cokeBrand, { color: value ? COKE_RED : t.ink2 }]}>Coca-Cola</Text>
            <View style={[styles.cokeBadge, { backgroundColor: value ? COKE_RED + '22' : t.paper2 }]}>
              <Text style={[styles.cokeBadgeText, { color: value ? COKE_RED : t.ink4 }]}>
                +{count} estampas
              </Text>
            </View>
          </View>
          <Text style={[styles.cokeDesc, { color: value ? '#8B0000' : t.ink3, fontFamily: fonts.body }]}>
            Incluir las estampas especiales de{' '}
            <Text style={{ fontFamily: fonts.semibold }}>Coca-Cola México</Text>
            {' '}— exclusivas del álbum físico
          </Text>
        </View>

        {/* Right: animated toggle */}
        <View style={styles.cokeToggleWrap}>
          <Animated.View style={[styles.cokeTrack, { backgroundColor: trackColor }]}>
            <Animated.View style={[styles.cokeThumb, { left: thumbLeft }]} />
          </Animated.View>
        </View>
      </View>

      {/* When active: wave decoration */}
      {value && (
        <Text style={styles.cokeWave}>〜〜〜〜〜〜〜〜〜〜〜〜〜</Text>
      )}
    </HapticPress>
  );
}

export function OnboardAlbum({ onNext, onBack }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('mundial26');
  const [withCocaCola, setWithCocaCola] = useState(false);

  const activeAlbum = ALBUMS.find(a => a.id === selected);
  const showCoke = selected === 'mundial26' && !!activeAlbum?.cocaColaCount;

  const totalLabel = showCoke && withCocaCola
    ? `${(activeAlbum!.baseCount ?? 0) + (activeAlbum!.cocaColaCount ?? 0)} estampas en total`
    : null;

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

      {/* Coca-Cola toggle — only for Mundial 2026 */}
      {showCoke && (
        <View style={styles.cokeSection}>
          <CokeToggle
            value={withCocaCola}
            onChange={setWithCocaCola}
            count={activeAlbum!.cocaColaCount!}
          />
          {totalLabel && (
            <Text style={[styles.totalLabel, { color: t.ink3, fontFamily: fonts.mono }]}>
              {totalLabel}
            </Text>
          )}
        </View>
      )}

      <HapticPress
        style={[styles.btn, { backgroundColor: selected ? t.pitch : t.paper2, opacity: selected ? 1 : 0.4 }]}
        onPress={() => selected && onNext(selected, withCocaCola)}
      >
        <Text style={[styles.btnText, { color: selected ? '#fff' : t.ink4, fontFamily: fonts.headline }]}>Continuar</Text>
      </HapticPress>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  sub:         { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  list:        { gap: 10, marginBottom: 14 },
  card:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, position: 'relative' },
  cover:       { width: 58, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  coverAccent: { position: 'absolute', top: 6, left: 6, right: 6, height: 2, opacity: 0.85 },
  coverName:   { position: 'absolute', bottom: 6, left: 6, right: 6, fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 9, color: '#fff', letterSpacing: 0.4 },
  info:        { flex: 1 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  albumName:   { fontSize: 15 },
  badge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText:   { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4 },
  subtitle:    { fontSize: 12, lineHeight: 16 },
  check:       { position: 'absolute', top: 14, right: 14, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Coca-Cola toggle
  cokeSection:    { marginBottom: 18 },
  cokeCard:       { borderRadius: 18, overflow: 'hidden' },
  cokeStripe:     { height: 3, width: '100%' },
  cokeContent:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  cokeLeft:       { flex: 1 },
  cokeLogoRow:    { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  cokeDot:        { width: 8, height: 8, borderRadius: 4 },
  cokeBrand:      { fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 15, letterSpacing: -0.3 },
  cokeBadge:      { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  cokeBadgeText:  { fontFamily: 'JetBrainsMono_700Bold', fontSize: 10, letterSpacing: 0.2 },
  cokeDesc:       { fontSize: 12, lineHeight: 17 },
  cokeToggleWrap: { flexShrink: 0 },
  cokeTrack:      { width: 52, height: 30, borderRadius: 15, justifyContent: 'center', position: 'relative' },
  cokeThumb:      { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  cokeWave:       { textAlign: 'center', fontSize: 10, color: COKE_RED + '55', letterSpacing: 2, paddingBottom: 6, marginTop: -4 },
  totalLabel:     { textAlign: 'center', fontSize: 11, marginTop: 8, letterSpacing: 0.2 },

  btn:     { borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  btnText: { fontSize: 15 },
});
