import React, { useMemo, useCallback } from 'react';
import {
  ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage                from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { useBottomTabBarHeight }   from '@react-navigation/bottom-tabs';
import { useAlbumStore }           from '../store/useAlbumStore';
import { computeStats, ALBUMS }    from '../data/album';
import { useTheme, fonts }         from '../theme';
import { SectionHeader }           from '../components/SectionHeader';
import { ProgressRing }            from '../components/ProgressRing';
import { Topbar, IconBtn }         from '../components/Topbar';
import { IcMoon, IcSun }           from '../components/Icons';
import { HapticPress }             from '../components/HapticPress';

export function ProfileScreen() {
  const t            = useTheme();
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { profile, stickers, dark, toggleDark } = useAlbumStore();
  const stats = useMemo(() => computeStats(stickers), [stickers]);

  const [scrolled, setScrolled] = React.useState(false);

  const handle = useMemo(
    () => profile ? '@' + profile.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) : '',
    [profile?.name],
  );

  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      'Reiniciar álbum',
      '¿Seguro? Esto borrará todo tu progreso, amigos guardados y perfil. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar todo',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'cromax.stickers',
              'cromax.friends',
              'cromax.profile',
              'cromax.dark',
            ]);
            useAlbumStore.setState({
              stickers: [],
              friends:  [],
              profile:  null,
              dark:     false,
              hydrated: false,
            });
          },
        },
      ],
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <Topbar
        title="Mi perfil"
        scrolled={scrolled}
        right={
          <IconBtn onPress={toggleDark}>
            {dark ? <IcSun color={t.ink} size={17} /> : <IcMoon color={t.ink} size={17} />}
          </IconBtn>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (tabBarHeight ?? 80) + 8 }]}
        onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 6)}
        scrollEventThrottle={16}
      >

        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.pitch }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: '#1A7B4F' }]}>
              <Text style={[styles.avatarLetter, { color: t.primary, fontFamily: fonts.headline }]}>
                {profile?.name?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.name, { color: '#E89B2F', fontFamily: fonts.display }]}>
                {profile?.name ?? '—'}
              </Text>
              <View style={styles.subRow}>
                <Text style={[styles.handle, { color: '#9AA39B', fontFamily: fonts.mono }]}>{handle}</Text>
                {profile?.age != null && profile.age !== '' ? (
                  <Text style={[styles.age, { color: '#9AA39B', fontFamily: fonts.mono }]}>
                    {' '}· {profile.age} años
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
          <Text style={[styles.albumLabel, { color: '#9AA39B', fontFamily: fonts.body }]}>
            FIFA Mundial 2026
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: '#B5DA40', fontFamily: fonts.mono }]}>{stats.owned}</Text>
              <Text style={[styles.statLbl, { color: '#9AA39B', fontFamily: fonts.monoMedium }]}>Tengo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: '#D7263D', fontFamily: fonts.mono }]}>{stats.missing}</Text>
              <Text style={[styles.statLbl, { color: '#9AA39B', fontFamily: fonts.monoMedium }]}>Faltan</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: '#E89B2F', fontFamily: fonts.mono }]}>{stats.pct.toFixed(1)}%</Text>
              <Text style={[styles.statLbl, { color: '#9AA39B', fontFamily: fonts.monoMedium }]}>Completo</Text>
            </View>
          </View>
        </View>

        {/* Mis álbumes */}
        <SectionHeader title="Mis álbumes" />
        <View style={{ gap: 10, paddingHorizontal: 16 }}>
          {ALBUMS.map(album => {
            const pct = album.active ? stats.pct : 0;
            return (
              <View key={album.id} style={[styles.albumCard, { backgroundColor: t.card, borderColor: t.line }]}>
                <View style={[styles.albumCover, { backgroundColor: album.cover }]}>
                  <View style={[styles.albumCoverAccent, { backgroundColor: album.accent }]} />
                  <Text style={styles.albumCoverName}>{album.name.toUpperCase()}</Text>
                </View>
                <View style={styles.albumInfo}>
                  <View style={styles.albumTitleRow}>
                    <Text style={[styles.albumTitle, { color: t.ink, fontFamily: fonts.semibold }]}>{album.name}</Text>
                    {album.active
                      ? <View style={[styles.activeBadge, { backgroundColor: t.lime }]}>
                          <Text style={[styles.activeBadgeText, { color: t.pitch }]}>Activo</Text>
                        </View>
                      : <View style={[styles.activeBadge, { backgroundColor: t.line }]}>
                          <Text style={[styles.activeBadgeText, { color: t.ink4 }]}>Pronto</Text>
                        </View>
                    }
                  </View>
                  <Text style={[styles.albumSubtitle, { color: t.ink3, fontFamily: fonts.mono }]}>{album.subtitle}</Text>
                  <View style={[styles.progressTrack, { backgroundColor: t.line }]}>
                    <View style={[styles.progressFill, { backgroundColor: t.lime, width: `${pct}%` as any }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Ajustes */}
        <SectionHeader title="Ajustes" />

        <View style={[styles.settingsCard, { backgroundColor: t.card, borderColor: t.line }]}>
          {/* Idioma */}
          <View style={[styles.settingsRow, styles.settingsRowBorder, { borderColor: t.line }]}>
            <Text style={[styles.rowLabel, { color: t.ink, fontFamily: fonts.semibold }]}>Idioma</Text>
            <Text style={[styles.rowValue, { color: t.ink4, fontFamily: fonts.body }]}>Español</Text>
          </View>

          {/* Mostrar números */}
          <View style={[styles.settingsRow, styles.settingsRowBorder, { borderColor: t.line }]}>
            <Text style={[styles.rowLabel, { color: t.ink, fontFamily: fonts.semibold }]}>Mostrar números</Text>
            <Text style={[styles.rowValue, { color: t.ink4, fontFamily: fonts.body }]}>Pronto</Text>
          </View>

          {/* Modo oscuro */}
          <View style={[styles.settingsRow, styles.settingsRowBorder, { borderColor: t.line }]}>
            <Text style={[styles.rowLabel, { color: t.ink, fontFamily: fonts.semibold }]}>Modo oscuro</Text>
            <Switch
              value={dark}
              onValueChange={toggleDark}
              trackColor={{ false: t.paper2, true: t.primary }}
              thumbColor={dark ? t.paper : '#FFFFFF'}
              ios_backgroundColor={t.paper2}
            />
          </View>

          {/* Reiniciar álbum */}
          <TouchableOpacity style={styles.settingsRow} onPress={handleResetOnboarding}>
            <Text style={[styles.rowLabel, { color: t.coral, fontFamily: fonts.semibold }]}>Reiniciar álbum</Text>
          </TouchableOpacity>
        </View>

        {/* Tip Jar */}
        <View style={{ padding: 16, paddingTop: 8 }}>
          <TipJar />
        </View>

      </ScrollView>
    </View>
  );
}

function TipJar() {
  const t = useTheme();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(50);
  const [sent, setSent] = React.useState(false);
  const OPTIONS = [20, 50, 100, 250];

  return (
    <View style={[tipStyles.card, { backgroundColor: t.goldSoft, borderColor: t.line }]}>
      <View style={tipStyles.header}>
        <View style={[tipStyles.iconBg, { backgroundColor: t.primary }]}>
          <Text style={{ fontSize: 16 }}>☕</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[tipStyles.title, { color: t.ink, fontFamily: fonts.headline }]}>¿Te late la app?</Text>
          <Text style={[tipStyles.sub, { color: t.ink3, fontFamily: fonts.body }]}>
            Estampas es <Text style={{ fontFamily: fonts.semibold, color: t.ink2 }}>100% gratis</Text> · si quieres, invítame un cafecito
          </Text>
        </View>
      </View>

      {!open && !sent && (
        <HapticPress
          style={[tipStyles.btn, { backgroundColor: t.primary }]}
          onPress={() => setOpen(true)}
        >
          <Text style={[tipStyles.btnText, { color: t.pitch, fontFamily: fonts.headline }]}>
            ❤️  Invítame un cafecito
          </Text>
        </HapticPress>
      )}

      {open && !sent && (
        <>
          <View style={tipStyles.amountRow}>
            {OPTIONS.map(v => (
              <HapticPress
                key={v}
                style={[tipStyles.amountChip, {
                  backgroundColor: amount === v ? t.ink : t.card,
                  borderColor: amount === v ? t.ink : t.line,
                }]}
                onPress={() => setAmount(v)}
              >
                <Text style={[tipStyles.amountNum, { color: amount === v ? t.paper : t.ink, fontFamily: fonts.mono }]}>${v}</Text>
                <Text style={tipStyles.amountEmoji}>
                  {v <= 20 ? '☕' : v <= 50 ? '☕☕' : v <= 100 ? '🌼' : '🌼🌼'}
                </Text>
              </HapticPress>
            ))}
          </View>
          <View style={tipStyles.actions}>
            <HapticPress style={[tipStyles.cancelBtn, { backgroundColor: t.paper2 }]} onPress={() => setOpen(false)}>
              <Text style={[tipStyles.cancelText, { color: t.ink, fontFamily: fonts.semibold }]}>Cancelar</Text>
            </HapticPress>
            <HapticPress style={[tipStyles.sendBtn, { backgroundColor: t.primary, flex: 1 }]} onPress={() => setSent(true)}>
              <Text style={[tipStyles.sendText, { color: t.pitch, fontFamily: fonts.headline }]}>Enviar ${amount}</Text>
            </HapticPress>
          </View>
        </>
      )}

      {sent && (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontSize: 28, marginBottom: 4 }}>🌼</Text>
          <Text style={[tipStyles.title, { color: t.ink, fontFamily: fonts.headline }]}>¡Mil gracias!</Text>
          <Text style={[tipStyles.sub, { color: t.ink3, fontFamily: fonts.body, textAlign: 'center' }]}>
            Tu apoyo nos ayuda a seguir mejorando.
          </Text>
        </View>
      )}

      <Text style={[tipStyles.disclaimer, { color: t.ink4, fontFamily: fonts.mono }]}>
        Donación voluntaria · No desbloquea funciones · Toda la app sigue gratis
      </Text>
    </View>
  );
}

const tipStyles = StyleSheet.create({
  card:       { borderRadius: 22, padding: 18, borderWidth: 0.5, overflow: 'hidden' },
  header:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  iconBg:     { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:      { fontSize: 17 },
  sub:        { fontSize: 12, lineHeight: 17, marginTop: 2 },
  btn:        { borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginBottom: 6 },
  btnText:    { fontSize: 15 },
  amountRow:  { flexDirection: 'row', gap: 6, marginBottom: 10 },
  amountChip: { flex: 1, borderRadius: 12, borderWidth: 0.5, paddingVertical: 10, alignItems: 'center' },
  amountNum:  { fontSize: 14 },
  amountEmoji:{ fontSize: 9, marginTop: 2 },
  actions:    { flexDirection: 'row', gap: 8, marginBottom: 6 },
  cancelBtn:  { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  cancelText: { fontSize: 14 },
  sendBtn:    { borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  sendText:   { fontSize: 14 },
  disclaimer: { fontSize: 10, textAlign: 'center', marginTop: 8, letterSpacing: 0.2 },
});

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  // Header
  header:       { padding: 24, paddingBottom: 28 },
  avatarRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  avatar:       { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22 },
  avatarInfo:   { flex: 1 },
  name:         { fontSize: 28, letterSpacing: -1 },
  subRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  handle:       { fontSize: 12 },
  age:          { fontSize: 12 },
  albumLabel: { fontSize: 13, marginBottom: 18 },
  statsRow:   { flexDirection: 'row', gap: 24 },
  stat:       { alignItems: 'center' },
  statNum:    { fontSize: 24 },
  statLbl:    { fontSize: 9, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Album cards (new multi-album layout)
  albumCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 14, borderWidth: 0.5 },
  albumCover:       { width: 52, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  albumCoverAccent: { position: 'absolute', top: 6, left: 6, right: 6, height: 2, opacity: 0.8 },
  albumCoverName:   { position: 'absolute', bottom: 6, left: 6, right: 6, fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 8, color: '#fff', letterSpacing: 0.4 },
  albumInfo:        { flex: 1 },
  albumTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  albumTitle:       { fontSize: 15 },
  activeBadge:      { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  activeBadgeText:  { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4 },
  albumSubtitle:    { fontSize: 11, marginBottom: 6 },
  progressTrack:    { height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill:     { height: 3, borderRadius: 2 },

  // Settings
  settingsCard:      { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingsRow:       { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:          { fontSize: 16 },
  rowValue:          { fontSize: 14 },
});
