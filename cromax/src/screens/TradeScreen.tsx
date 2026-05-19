import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAlbumStore }                      from '../store/useAlbumStore';
import { useTheme, fonts }                    from '../theme';
import { HapticPress }                        from '../components/HapticPress';
import { SectionHeader }                      from '../components/SectionHeader';
import { Topbar, IconBtn }                    from '../components/Topbar';
import { IcShare }                            from '../components/Icons';
import { useNavigation }                      from '@react-navigation/native';
import { useBottomTabBarHeight }              from '@react-navigation/bottom-tabs';
import type { StackNavigationProp }           from '@react-navigation/stack';
import type { RootStackParamList }            from '../navigation/RootNavigator';
import type { Friend }                        from '../data/album';

type Nav = StackNavigationProp<RootStackParamList>;

function toHandle(name: string): string {
  return '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
}

function relativeTime(ts: string | number): string {
  const diff = typeof ts === 'number' ? Date.now() - ts : Date.now() - new Date(ts).getTime();
  if (diff < 60000)    return 'ahora';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

const HOW_STEPS = [
  { n: '1', title: 'Marca tus repetidas',  text: 'Cada estampa duplicada queda lista para intercambiar.' },
  { n: '2', title: 'Comparte tu lista',     text: 'Envía tu lista de faltantes con un link único a varios amigos.' },
  { n: '3', title: 'Acordamos el cambio',   text: 'La app te muestra coincidencias 1×1 con cada amigo.' },
];

function stringColor(name: string): string {
  const colors = ['#0E5B3A','#1A7B4F','#3D5A80','#6B4226','#8B2FC9'];
  const h = name.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  return colors[Math.abs(h) % colors.length];
}

function DirTag({ n, color, sign }: { n: number; color: string; sign: string }) {
  const t = useTheme();
  return (
    <View style={[dirTagStyles.tag, { backgroundColor: t.paper2 }]}>
      <View style={[dirTagStyles.dot, { backgroundColor: color }]} />
      <Text style={[dirTagStyles.text, { color: t.ink, fontFamily: fonts.mono }]}>{sign}{n}</Text>
    </View>
  );
}

const dirTagStyles = StyleSheet.create({
  tag:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12 },
});

const FriendCard = React.memo(({ friend, myDupeIds, myMissingIds, onPress, last }: {
  friend: Friend;
  myDupeIds: Set<number>;
  myMissingIds: Set<number>;
  onPress: () => void;
  last: boolean;
}) => {
  const t = useTheme();
  const canGive    = friend.missing.filter((id: number) => myDupeIds.has(id)).length;
  const canReceive = friend.dupes.filter((d: { id: number; count: number }) => myMissingIds.has(d.id)).length;
  return (
    <HapticPress
      style={[friendCardStyles.row, !last && { borderBottomWidth: 0.5, borderBottomColor: t.line }]}
      onPress={onPress}
    >
      <View style={[friendCardStyles.avatar, { backgroundColor: stringColor(friend.name) }]}>
        <Text style={[friendCardStyles.avatarLetter, { color: '#fff', fontFamily: fonts.headline }]}>
          {friend.name[0]}
        </Text>
      </View>
      <View style={friendCardStyles.info}>
        <Text style={[friendCardStyles.name, { color: t.ink, fontFamily: fonts.semibold }]}>{friend.name}</Text>
        <Text style={[friendCardStyles.meta, { color: t.ink4, fontFamily: fonts.mono }]}>
          {'@' + friend.name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,12)} · {relativeTime(friend.scannedAt)}
        </Text>
      </View>
      <View style={friendCardStyles.tags}>
        <DirTag n={canGive}    color={t.lime}  sign="↑" />
        <DirTag n={canReceive} color={t.coral} sign="↓" />
      </View>
    </HapticPress>
  );
});

const friendCardStyles = StyleSheet.create({
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16 },
  avatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarLetter: { fontSize: 16 },
  info:         { flex: 1 },
  name:         { fontSize: 15 },
  meta:         { fontSize: 11, marginTop: 1 },
  tags:         { flexDirection: 'row', gap: 6 },
});

export function TradeScreen() {
  const t            = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const nav          = useNavigation<Nav>();
  const { friends, stickers } = useAlbumStore();

  const [scrolled, setScrolled] = React.useState(false);

  const myDupeIds    = useMemo(() => new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id)), [stickers]);
  const myMissingIds = useMemo(() => new Set(stickers.filter(s => s.state === 'missing').map(s => s.id)),  [stickers]);

  const tradeablePairs = useMemo(
    () => friends.reduce((count, friend) => count + friend.missing.filter(id => myDupeIds.has(id)).length, 0),
    [friends, myDupeIds],
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <Topbar
        title="Trueques"
        scrolled={scrolled}
        right={
          <IconBtn onPress={() => nav.navigate('ShareModal' as any)}>
            <IcShare color={t.ink} size={17} />
          </IconBtn>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (tabBarHeight ?? 80) + 8 }]}
        onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 6)}
        scrollEventThrottle={16}
      >
        {/* Hero card */}
        <View style={{ padding: 16, paddingTop: 4 }}>
          <View style={[styles.hero, { backgroundColor: t.pitch }]}>
            <View style={[styles.heroInner]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroEyebrow, { color: 'rgba(242,232,208,0.75)', fontFamily: fonts.mono }]}>
                  Trueques posibles
                </Text>
                <Text style={[styles.heroNumber, { color: '#fff', fontFamily: fonts.display }]}>
                  {tradeablePairs}
                  <Text style={{ fontSize: 14, opacity: 0.6, fontFamily: fonts.semibold }}> parejas</Text>
                </Text>
                <Text style={[styles.heroSub, { color: 'rgba(242,232,208,0.65)', fontFamily: fonts.body }]}>
                  Estampas que puedes cambiar 1×1
                </Text>
              </View>
              <HapticPress
                style={[styles.heroShareBtn, { backgroundColor: t.primary }]}
                onPress={() => nav.navigate('ShareModal' as any)}
              >
                <IcShare color={t.pitch} size={16} />
                <Text style={[styles.heroShareText, { color: t.pitch, fontFamily: fonts.headline }]}>Compartir</Text>
              </HapticPress>
            </View>
          </View>
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

        {friends.length > 0 && (
          <View style={[styles.friendsList, { backgroundColor: t.card, borderColor: t.line }]}>
            {friends.map((friend, index) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                myDupeIds={myDupeIds}
                myMissingIds={myMissingIds}
                onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
                last={index === friends.length - 1}
              />
            ))}
          </View>
        )}

        {/* Cómo funciona */}
        <SectionHeader title="Cómo funciona" />
        <View style={[styles.howCard, { backgroundColor: t.card, borderColor: t.line }]}>
          {HOW_STEPS.map(step => (
            <View key={step.n} style={styles.howRow}>
              <View style={[styles.howNum, { backgroundColor: t.pitch }]}>
                <Text style={[styles.howNumText, { color: t.paper, fontFamily: fonts.mono }]}>{step.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.howTitle, { color: t.ink, fontFamily: fonts.semibold }]}>{step.title}</Text>
                <Text style={[styles.howText, { color: t.ink3, fontFamily: fonts.body }]}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Scroll
  scrollContent: { paddingBottom: 32 },

  // Hero
  hero:          { borderRadius: 22, overflow: 'hidden', position: 'relative' },
  heroInner:     { flexDirection: 'row', alignItems: 'flex-end', gap: 14, padding: 20, paddingBottom: 22 },
  heroEyebrow:   { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 4 },
  heroNumber:    { fontSize: 34, letterSpacing: -1, lineHeight: 38 },
  heroSub:       { fontSize: 12, marginTop: 4 },
  heroShareBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  heroShareText: { fontSize: 13 },

  // Friends list container
  friendsList: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },

  // How it works
  howCard:    { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 14, marginBottom: 4 },
  howRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howNum:     { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  howNumText: { fontSize: 11 },
  howTitle:   { fontSize: 14, marginBottom: 2 },
  howText:    { fontSize: 13, lineHeight: 19 },

  // Scan button
  scanBtn:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scanBtnText: { fontSize: 13 },

  // Friends empty
  empty:     { margin: 16, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
