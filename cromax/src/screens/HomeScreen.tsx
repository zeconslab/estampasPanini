import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }    from '../store/useAlbumStore';
import { computeStats }     from '../data/album';
import { useTheme }         from '../theme';
import { ProgressRing }     from '../components/ProgressRing';
import { MxBunting }        from '../components/MxBunting';
import { HapticPress }      from '../components/HapticPress';
import { SectionHeader }    from '../components/SectionHeader';
import { useNavigation }    from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<Nav>();
  const { stickers, friends, profile } = useAlbumStore();
  const stats   = computeStats(stickers);

  // Trade matches: stickers I have duplicate of that a friend is missing
  const myDupeIds = new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id));
  const tradeMatches = friends.map(f => ({
    friend: f,
    canGive: f.missing.filter(id => myDupeIds.has(id)).length,
  })).filter(m => m.canGive > 0).slice(0, 3);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: t.pitch, paddingTop: insets.top + 16 }]}>
        <View style={styles.buntingRow}><MxBunting /></View>
        <Text style={styles.heroTitle}>{profile?.name ?? 'Mi Álbum'}</Text>
        <View style={styles.statsRow}>
          <ProgressRing pct={stats.pct} size={100} stroke={10} />
          <View style={styles.statsText}>
            <Text style={styles.statNum}>{stats.owned}</Text>
            <Text style={styles.statLbl}>tengo</Text>
            <Text style={[styles.statNum, { color: '#D7263D' }]}>{stats.missing}</Text>
            <Text style={styles.statLbl}>faltan</Text>
            <Text style={[styles.statNum, { color: '#E89B2F' }]}>{stats.dupes}</Text>
            <Text style={styles.statLbl}>repetidas</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <HapticPress style={[styles.heroBtn, { backgroundColor: t.primary }]}
            onPress={() => nav.navigate('ShareModal')}>
            <Text style={[styles.heroBtnText, { color: t.pitch }]}>Compartir QR</Text>
          </HapticPress>
          <HapticPress style={[styles.heroBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
            onPress={() => nav.navigate('QuickAdd')}>
            <Text style={[styles.heroBtnText, { color: '#EFE7D2' }]}>Marcar rápido</Text>
          </HapticPress>
        </View>
      </View>

      {/* Trade matches preview */}
      {tradeMatches.length > 0 && (
        <>
          <SectionHeader title="Trueques posibles" />
          {tradeMatches.map(({ friend, canGive }) => (
            <HapticPress
              key={friend.id}
              style={[styles.tradeCard, { backgroundColor: t.card, borderColor: t.line }]}
              onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
            >
              <Text style={[styles.tradeName, { color: t.ink }]}>{friend.name}</Text>
              <Text style={[styles.tradeCount, { color: t.lime }]}>{canGive} estampas</Text>
            </HapticPress>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero:        { padding: 20, paddingBottom: 28 },
  buntingRow:  { marginBottom: 12 },
  heroTitle:   { fontSize: 28, fontWeight: '900', color: '#EFE7D2', marginBottom: 20 },
  statsRow:    { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 },
  statsText:   { gap: 2 },
  statNum:     { fontSize: 28, fontWeight: '900', color: '#B5DA40', lineHeight: 32 },
  statLbl:     { fontSize: 11, color: '#9AA39B', marginBottom: 6 },
  heroActions: { flexDirection: 'row', gap: 12 },
  heroBtn:     { flex: 1, borderRadius: 24, paddingVertical: 12, alignItems: 'center' },
  heroBtnText: { fontSize: 15, fontWeight: '700' },
  tradeCard:   { marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeName:   { fontSize: 16, fontWeight: '600' },
  tradeCount:  { fontSize: 14, fontWeight: '700' },
});
