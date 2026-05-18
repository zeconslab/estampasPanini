import React from 'react';
import { ScrollView, View, Text, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { computeStats }    from '../data/album';
import { useTheme }        from '../theme';
import { SectionHeader }   from '../components/SectionHeader';

export function ProfileScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const { profile, stickers, dark, toggleDark } = useAlbumStore();
  const stats   = computeStats(stickers);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: t.pitch }]}>
        <Text style={styles.name}>{profile?.name ?? '—'}</Text>
        <Text style={styles.album}>FIFA Mundial 2026</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#B5DA40' }]}>{stats.owned}</Text>
            <Text style={styles.statLbl}>Tengo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#D7263D' }]}>{stats.missing}</Text>
            <Text style={styles.statLbl}>Faltan</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#E89B2F' }]}>{stats.pct.toFixed(1)}%</Text>
            <Text style={styles.statLbl}>Completo</Text>
          </View>
        </View>
      </View>

      <SectionHeader title="Ajustes" />

      <View style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
        <Text style={[styles.rowLabel, { color: t.ink }]}>Modo oscuro</Text>
        <Switch value={dark} onValueChange={toggleDark} trackColor={{ true: '#E89B2F' }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header:   { padding: 24, paddingBottom: 28 },
  name:     { fontSize: 32, fontWeight: '900', color: '#E89B2F' },
  album:    { fontSize: 14, color: '#9AA39B', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat:     { alignItems: 'center' },
  statNum:  { fontSize: 24, fontWeight: '900' },
  statLbl:  { fontSize: 11, color: '#9AA39B', marginTop: 2 },
  row:      { marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
});
