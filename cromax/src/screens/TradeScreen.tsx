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
import type { Friend }                        from '../data/album';

type Nav = StackNavigationProp<RootStackParamList>;

function toHandle(name: string): string {
  return '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
}

function relativeTime(dateStr: string): string {
  const h = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000);
  if (h < 1)  return 'hace un momento';
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ayer';
  return `hace ${d}d`;
}

const HOW_STEPS = [
  { n: '1', text: 'Escanea el QR de tu amigo para ver su álbum.' },
  { n: '2', text: 'Ve cuáles de tus repetidas le faltan a él, y viceversa.' },
  { n: '3', text: 'Coordinen el trueque y marquen las estampas intercambiadas.' },
];

interface FriendCardProps {
  friend: Friend;
  myDupeIds: Set<number>;
  myMissingIds: Set<number>;
  onPress: () => void;
}

const FriendCard = React.memo(({ friend, myDupeIds, myMissingIds, onPress }: FriendCardProps) => {
  const t = useTheme();
  const canGive    = friend.missing.filter(id => myDupeIds.has(id)).length;
  const canReceive = friend.dupes.filter(d => myMissingIds.has(d.id)).length;
  return (
    <HapticPress
      style={[friendCardStyles.card, { backgroundColor: t.card, borderColor: t.line }]}
      onPress={onPress}
    >
      <View style={friendCardStyles.info}>
        <Text style={[friendCardStyles.name, { color: t.ink, fontFamily: fonts.semibold }]}>{friend.name}</Text>
        <Text style={[friendCardStyles.meta, { color: t.ink4, fontFamily: fonts.mono }]}>
          {toHandle(friend.name)} · {relativeTime(friend.scannedAt)}
        </Text>
      </View>
      <View style={friendCardStyles.matchBadges}>
        <View style={[friendCardStyles.badge, { backgroundColor: t.paper2 }]}>
          <Text style={[friendCardStyles.badgeLabel, { color: t.ink4 }]}>TE DEBE</Text>
          <View style={friendCardStyles.badgeRow}>
            <View style={[friendCardStyles.dot, { backgroundColor: t.lime }]} />
            <Text style={[friendCardStyles.badgeNum, { color: t.ink }]}>{canGive}</Text>
          </View>
        </View>
        <View style={[friendCardStyles.badge, { backgroundColor: t.paper2 }]}>
          <Text style={[friendCardStyles.badgeLabel, { color: t.ink4 }]}>LE DEBES</Text>
          <View style={friendCardStyles.badgeRow}>
            <View style={[friendCardStyles.dot, { backgroundColor: t.coral }]} />
            <Text style={[friendCardStyles.badgeNum, { color: t.ink }]}>{canReceive}</Text>
          </View>
        </View>
      </View>
    </HapticPress>
  );
});

const friendCardStyles = StyleSheet.create({
  card:        { marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  info:        { flex: 1 },
  name:        { fontSize: 15 },
  meta:        { fontSize: 11, marginTop: 2 },
  matchBadges: { flexDirection: 'row', gap: 8 },
  badge:       { borderRadius: 10, padding: 8, minWidth: 56, alignItems: 'center' },
  badgeLabel:  { fontFamily: fonts.mono, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  badgeRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:         { width: 6, height: 6, borderRadius: 3 },
  badgeNum:    { fontFamily: fonts.mono, fontSize: 15 },
});

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

  const scrollStyle = useMemo(() => ({ backgroundColor: t.paper }), [t.paper]);

  return (
    <ScrollView style={scrollStyle} contentContainerStyle={styles.scrollContent}>

      {/* Hero card */}
      <View style={[styles.hero, { backgroundColor: t.pitch, paddingTop: insets.top + 20 }]}>
        <MxBunting />
        <Text style={[styles.heroEyebrow, { color: t.primary, fontFamily: fonts.mono }]}>
          Trueques disponibles
        </Text>
        <Text style={[styles.heroNumber, { color: t.primary, fontFamily: fonts.display }]}>
          {tradeablePairs}
        </Text>
        <Text style={[styles.heroSub, { color: t.ink4, fontFamily: fonts.body }]}>
          {tradeablePairs === 1 ? 'estampa lista para intercambiar' : 'estampas listas para intercambiar'}
        </Text>
      </View>

      {/* Cómo funciona */}
      <SectionHeader title="Cómo funciona" />
      <View style={[styles.howCard, { backgroundColor: t.card, borderColor: t.line }]}>
        {HOW_STEPS.map(step => (
          <View key={step.n} style={styles.howRow}>
            <View style={[styles.howNum, { backgroundColor: t.pitch }]}>
              <Text style={[styles.howNumText, { color: t.paper, fontFamily: fonts.mono }]}>{step.n}</Text>
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
            <Text style={[styles.scanBtnText, { color: t.paper, fontFamily: fonts.semibold }]}>Escanear QR</Text>
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

      {friends.map(friend => (
        <FriendCard
          key={friend.id}
          friend={friend}
          myDupeIds={myDupeIds}
          myMissingIds={myMissingIds}
          onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Scroll
  scrollContent: { paddingBottom: 32 },

  // Hero
  hero:         { padding: 24, paddingBottom: 28, alignItems: 'center' },
  heroEyebrow:  { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, marginTop: 12, marginBottom: 4 },
  heroNumber:   { fontSize: 56, letterSpacing: -2, lineHeight: 60 },
  heroSub:      { fontSize: 13, marginTop: 2 },

  // How it works
  howCard:      { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, marginBottom: 4 },
  howRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howNum:       { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  howNumText:   { fontSize: 11 },
  howText:      { flex: 1, fontSize: 14, lineHeight: 20 },

  // Scan button
  scanBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scanBtnText: { fontSize: 13 },

  // Friends
  empty:       { margin: 16, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyText:   { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
