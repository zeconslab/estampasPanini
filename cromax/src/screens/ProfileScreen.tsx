import React, { useMemo, useCallback } from 'react';
import {
  ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage                from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets }       from 'react-native-safe-area-context';
import { useAlbumStore }           from '../store/useAlbumStore';
import { computeStats }            from '../data/album';
import { useTheme, fonts }         from '../theme';
import { SectionHeader }           from '../components/SectionHeader';
import { ProgressRing }            from '../components/ProgressRing';

export function ProfileScreen() {
  const t      = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, stickers, dark, toggleDark } = useAlbumStore();
  const stats = useMemo(() => computeStats(stickers), [stickers]);

  const handle = useMemo(
    () => profile ? '@' + profile.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) : '',
    [profile?.name],
  );

  const handleResetOnboarding = useCallback(() => {
    Alert.alert(
      'Reiniciar álbum',
      '¿Seguro? Esto borrará tu perfil y regresarás al inicio.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            AsyncStorage.removeItem('cromax.profile').catch(console.error);
            useAlbumStore.setState({ profile: null });
          },
        },
      ],
    );
  }, []);

  const scrollStyle = useMemo(() => ({ backgroundColor: t.paper }), [t.paper]);

  return (
    <ScrollView style={scrollStyle} contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: t.pitch }]}>
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
      <View style={[styles.albumCard, { backgroundColor: t.card, borderColor: t.line }]}>
        <ProgressRing pct={stats.pct} size={56} stroke={5} />
        <View style={styles.albumInfo}>
          <View style={styles.albumTitleRow}>
            <Text style={[styles.albumTitle, { color: t.ink, fontFamily: fonts.semibold }]}>
              FIFA Mundial 2026
            </Text>
            <View style={[styles.activeBadge, { backgroundColor: t.lime }]}>
              <Text style={[styles.activeBadgeText, { color: t.pitch, fontFamily: fonts.mono }]}>Activo</Text>
            </View>
          </View>
          <Text style={[styles.albumProgress, { color: t.ink4, fontFamily: fonts.mono }]}>
            {stats.owned}/{stats.total} estampas
          </Text>
          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: t.line }]}>
            <View style={[styles.progressFill, { backgroundColor: t.lime, width: `${stats.pct}%` }]} />
          </View>
        </View>
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
          <Switch value={dark} onValueChange={toggleDark} trackColor={{ true: t.primary }} />
        </View>

        {/* Reiniciar álbum */}
        <TouchableOpacity style={styles.settingsRow} onPress={handleResetOnboarding}>
          <Text style={[styles.rowLabel, { color: t.coral, fontFamily: fonts.semibold }]}>Reiniciar álbum</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },

  // Header
  header:     { padding: 24, paddingBottom: 28 },
  name:       { fontSize: 32, letterSpacing: -1 },
  subRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 2 },
  handle:     { fontSize: 12 },
  age:        { fontSize: 12 },
  albumLabel: { fontSize: 13, marginBottom: 18 },
  statsRow:   { flexDirection: 'row', gap: 24 },
  stat:       { alignItems: 'center' },
  statNum:    { fontSize: 24 },
  statLbl:    { fontSize: 9, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Album card
  albumCard:       { marginHorizontal: 16, padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  albumInfo:       { flex: 1 },
  albumTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  albumTitle:      { fontSize: 15, flex: 1 },
  activeBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeBadgeText: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  albumProgress:   { fontSize: 11, marginBottom: 6 },
  progressTrack:   { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:    { height: 4, borderRadius: 2 },

  // Settings
  settingsCard:      { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingsRow:       { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel:          { fontSize: 16 },
  rowValue:          { fontSize: 14 },
});
