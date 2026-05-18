import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets }                  from 'react-native-safe-area-context';
import { useAlbumStore }                      from '../store/useAlbumStore';
import { useTheme, fonts }                    from '../theme';
import { HapticPress }                        from '../components/HapticPress';
import { SectionHeader }                      from '../components/SectionHeader';
import { MxBunting }                          from '../components/MxBunting';
import { useNavigation }                      from '@react-navigation/native';
import type { StackNavigationProp }           from '@react-navigation/stack';
import type { RootStackParamList }            from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

const HOW_STEPS = [
  { n: '1', text: 'Escanea el QR de tu amigo para ver su álbum.' },
  { n: '2', text: 'Ve cuáles de tus repetidas le faltan a él, y viceversa.' },
  { n: '3', text: 'Coordinen el trueque y marquen las estampas intercambiadas.' },
];

export function TradeScreen() {
  const t      = useTheme();
  const insets = useSafeAreaInsets();
  const nav    = useNavigation<Nav>();
  const { friends, stickers } = useAlbumStore();

  const myDupeIds    = useMemo(() => new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id)), [stickers]);
  const myMissingIds = useMemo(() => new Set(stickers.filter(s => s.state === 'missing').map(s => s.id)),  [stickers]);

  const tradeablePairs = useMemo(
    () => friends.reduce((count, friend) => count + friend.missing.filter(id => myDupeIds.has(id)).length, 0),
    [friends, myDupeIds],
  );

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* Hero card */}
      <View style={[styles.hero, { backgroundColor: t.pitch, paddingTop: insets.top + 20 }]}>
        <MxBunting />
        <Text style={[styles.heroEyebrow, { color: t.primary, fontFamily: fonts.mono }]}>
          Trueques disponibles
        </Text>
        <Text style={[styles.heroNumber, { color: '#E89B2F', fontFamily: fonts.display }]}>
          {tradeablePairs}
        </Text>
        <Text style={[styles.heroSub, { color: '#9AA39B', fontFamily: fonts.body }]}>
          {tradeablePairs === 1 ? 'estampa lista para intercambiar' : 'estampas listas para intercambiar'}
        </Text>
      </View>

      {/* Cómo funciona */}
      <SectionHeader title="Cómo funciona" />
      <View style={[styles.howCard, { backgroundColor: t.card, borderColor: t.line }]}>
        {HOW_STEPS.map(step => (
          <View key={step.n} style={styles.howRow}>
            <View style={[styles.howNum, { backgroundColor: t.pitch }]}>
              <Text style={[styles.howNumText, { fontFamily: fonts.mono }]}>{step.n}</Text>
            </View>
            <Text style={[styles.howText, { color: t.ink, fontFamily: fonts.body }]}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Friends */}
      <SectionHeader
        title="Amigos"
        trailing={
          <HapticPress
            onPress={() => nav.navigate('ScanModal')}
            style={[styles.scanBtn, { backgroundColor: t.pitch }]}
          >
            <Text style={[styles.scanBtnText, { fontFamily: fonts.semibold }]}>Escanear QR</Text>
          </HapticPress>
        }
      />

      {friends.length === 0 && (
        <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[styles.emptyText, { color: t.ink3, fontFamily: fonts.body }]}>
            Escanea el QR de un amigo para ver sus faltantes y calcular trueques.
          </Text>
        </View>
      )}

      {friends.map(friend => {
        const canGive    = friend.missing.filter(id => myDupeIds.has(id)).length;
        const canReceive = friend.dupes.filter(d => myMissingIds.has(d.id)).length;
        return (
          <HapticPress
            key={friend.id}
            style={[styles.card, { backgroundColor: t.card, borderColor: t.line }]}
            onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
          >
            <View>
              <Text style={[styles.name, { color: t.ink, fontFamily: fonts.semibold }]}>{friend.name}</Text>
              <Text style={[styles.meta, { color: t.ink4, fontFamily: fonts.body }]}>
                {new Date(friend.scannedAt).toLocaleDateString('es-MX')}
              </Text>
            </View>
            <View style={styles.matchBadges}>
              {canGive > 0 && (
                <View style={[styles.badge, { backgroundColor: t.lime }]}>
                  <Text style={[styles.badgeText, { color: t.pitch, fontFamily: fonts.mono }]}>▲ {canGive}</Text>
                </View>
              )}
              {canReceive > 0 && (
                <View style={[styles.badge, { backgroundColor: t.coral }]}>
                  <Text style={[styles.badgeText, { color: '#fff', fontFamily: fonts.mono }]}>▼ {canReceive}</Text>
                </View>
              )}
            </View>
          </HapticPress>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Hero
  hero:         { padding: 24, paddingBottom: 28, alignItems: 'center' },
  heroEyebrow:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, marginTop: 12, marginBottom: 4 },
  heroNumber:   { fontSize: 56, letterSpacing: -2, lineHeight: 60 },
  heroSub:      { fontSize: 13, marginTop: 2 },

  // How it works
  howCard:      { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, marginBottom: 4 },
  howRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howNum:       { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  howNumText:   { fontSize: 11, color: '#EFE7D2' },
  howText:      { flex: 1, fontSize: 14, lineHeight: 20 },

  // Scan button
  scanBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scanBtnText: { color: '#EFE7D2', fontSize: 13 },

  // Friends
  empty:       { margin: 16, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyText:   { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  card:        { marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:        { fontSize: 17 },
  meta:        { fontSize: 12, marginTop: 2 },
  matchBadges: { flexDirection: 'row', gap: 6 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:   { fontSize: 12 },
});
