import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }    from '../store/useAlbumStore';
import { computeStats, TEAMS } from '../data/album';
import { useTheme, fonts }  from '../theme';
import { ProgressRing }     from '../components/ProgressRing';
import { MxBunting }        from '../components/MxBunting';
import { MxPattern }        from '../components/MxPattern';
import { HapticPress }      from '../components/HapticPress';
import { SectionHeader }    from '../components/SectionHeader';
import { Flag }             from '../components/Flag';
import { Sticker as StickerComponent } from '../components/Sticker';
import { useNavigation }    from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/MainTabs';

type Nav = StackNavigationProp<RootStackParamList>;

const GRID_PAD = 16;
const GRID_GAP = 6;
const GRID_COLS = 6;

const AVATAR_PALETTE = ['#0E5B3A', '#1A7B4F', '#3D5A80', '#6B4226', '#8B2FC9'];
function nameColor(name: string): string {
  const hash = name.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0x7FFFFFFF, 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function HomeScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<Nav>();
  const tabNav  = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { width: SCREEN_W } = useWindowDimensions();
  const CELL_SIZE = useMemo(
    () => Math.floor((SCREEN_W - GRID_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS),
    [SCREEN_W],
  );
  const { stickers, friends } = useAlbumStore();
  const stats = useMemo(() => computeStats(stickers), [stickers]);

  // Top 3 teams by completion %
  const top3Teams = useMemo(() => TEAMS.map(team => {
    const list  = stickers.filter(s => s.team === team.code);
    const owned = list.filter(s => s.state !== 'missing').length;
    return { team, owned, total: list.length };
  }).filter(e => e.total > 0)
    .sort((a, b) => b.owned / b.total - a.owned / a.total)
    .slice(0, 3), [stickers]);

  // Trade matches
  const myDupeIds = useMemo(
    () => new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id)),
    [stickers],
  );
  const tradeMatches = useMemo(() => friends.map(f => ({
    friend: f,
    canGive: f.missing.filter(id => myDupeIds.has(id)).length,
    canGet: (f.dupes ?? []).filter(d => stickers.find(s => s.id === d.id && s.state === 'missing')).length,
  })).filter(m => m.canGive > 0).slice(0, 4), [friends, myDupeIds, stickers]);

  // Recent stickers (last 8 owned/duplicate)
  const recent = useMemo(
    () => stickers.filter(s => s.state !== 'missing').slice(-8).reverse(),
    [stickers],
  );

  const scrollStyle = useMemo(() => ({ backgroundColor: t.paper }), [t.paper]);

  return (
    <ScrollView
      style={scrollStyle}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO — rounded card with padding */}
      <View style={{ padding: 16, paddingTop: insets.top + 12 }}>
        <View style={[styles.heroCard, { backgroundColor: t.pitch }]}>
          <View style={styles.patternWrap}><MxPattern size={110} color="#EFE7D2" opacity={0.1} /></View>
          <View style={styles.buntingWrap}><MxBunting /></View>

          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>Álbum activo</Text>
            <Text style={[styles.heroEdition, { color: t.primary }]}>Edición México</Text>
          </View>

          <Text style={styles.heroTitle}>Mundial{'\n'}2026</Text>

          <View style={styles.statsRow}>
            <ProgressRing pct={stats.pct} size={108} stroke={11} showLabel />
            <View style={styles.statsText}>
              <StatLine label="tengo"     value={stats.owned}   accent={t.lime}    sub={`/${stats.total}`} />
              <StatLine label="me faltan" value={stats.missing} accent={t.coral} />
              <StatLine label="repetidas" value={stats.dupes}   accent={t.primary} />
            </View>
          </View>

          <View style={styles.heroActions}>
            <HapticPress
              style={[styles.heroBtn, { backgroundColor: t.primary }]}
              onPress={() => nav.navigate('QuickAdd')}
            >
              <Text style={[styles.heroBtnIcon, { color: '#0E5B3A' }]}>+</Text>
              <Text style={[styles.heroBtnText, { color: '#0E5B3A' }]}>Marcar nuevas</Text>
            </HapticPress>
            <HapticPress
              style={[styles.heroBtn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
              onPress={() => nav.navigate('ShareModal')}
            >
              <Text style={[styles.heroBtnIcon, { color: 'rgba(255,255,255,0.9)' }]}>↑</Text>
              <Text style={[styles.heroBtnText, { color: 'rgba(255,255,255,0.9)' }]}>Mis faltantes</Text>
            </HapticPress>
          </View>
        </View>
      </View>

      {/* TRADE MATCHES — horizontal scroll */}
      {friends.length > 0 && (
        <>
          <SectionHeader
            title="Matches de trueque"
            trailing={<Text style={[styles.eyebrowText, { color: t.ink3 }]}>{friends.length} amigos</Text>}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.friendsScroll}
          >
            {tradeMatches.map(({ friend, canGive, canGet }) => (
              <HapticPress
                key={friend.id}
                style={[styles.friendCard, { backgroundColor: t.card, borderColor: t.line }]}
                onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
              >
                <View style={styles.friendTop}>
                  <View style={[styles.avatar, { backgroundColor: nameColor(friend.name) }]}>
                    <Text style={[styles.avatarLetter, { color: t.primary }]}>{friend.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={[styles.friendName, { color: t.ink }]}>{friend.name}</Text>
                    <Text style={[styles.friendSub, { color: t.ink3 }]}>actualizado hoy</Text>
                  </View>
                </View>
                <View style={styles.miniStats}>
                  <MiniStat label="te debe" value={canGive} color={t.lime}  bg={t.paper2} textColor={t.ink} />
                  <MiniStat label="le debes" value={canGet}  color={t.coral} bg={t.paper2} textColor={t.ink} />
                </View>
              </HapticPress>
            ))}
            <View style={{ width: 8 }} />
          </ScrollView>
        </>
      )}

      {/* TOP TEAMS */}
      {top3Teams.length > 0 && (
        <>
          <SectionHeader
            title="Selecciones avanzadas"
            trailing={
              <HapticPress onPress={() => tabNav.navigate('Grid')}>
                <Text style={[styles.eyebrowText, { color: t.ink3 }]}>Ver todas →</Text>
              </HapticPress>
            }
          />
          <View style={[styles.teamsCard, { backgroundColor: t.card, borderColor: t.line }]}>
            {top3Teams.map(({ team, owned, total }, i) => {
              const pct = total > 0 ? (owned / total) * 100 : 0;
              return (
                <View
                  key={team.code}
                  style={[
                    styles.teamRow,
                    i < top3Teams.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: t.line },
                  ]}
                >
                  <Flag colors={team.colors} width={28} height={18} />
                  <View style={styles.teamInfo}>
                    <View style={styles.teamLabelRow}>
                      <Text style={[styles.teamName, { color: t.ink }]}>{team.name}</Text>
                      <Text style={[styles.teamCount, { color: t.ink3 }]}>{owned}/{total}</Text>
                    </View>
                    <View style={[styles.barBg, { backgroundColor: t.line }]}>
                      <View style={[styles.barFill, { backgroundColor: t.pitch2, width: `${pct}%` as `${number}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* RECENT STICKERS */}
      {recent.length > 0 && (
        <>
          <SectionHeader title="Pegadas recientemente" />
          <View style={styles.recentGrid}>
            {recent.map(s => (
              <StickerComponent
                key={s.id}
                sticker={s}
                size={CELL_SIZE}
                onPress={() => nav.navigate('StickerModal', { stickerId: s.id })}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatLine({ label, value, accent, sub }: { label: string; value: number; accent: string; sub?: string }) {
  return (
    <View style={styles.statLine}>
      <Text style={styles.statLineLabel}>{label}</Text>
      <View style={styles.statLineRight}>
        <Text style={styles.statLineNum}>{value}</Text>
        {sub && <Text style={styles.statLineSub}>{sub}</Text>}
        <View style={[styles.statLineDot, { backgroundColor: accent }]} />
      </View>
    </View>
  );
}

function MiniStat({ label, value, color, bg, textColor }: {
  label: string; value: number; color: string; bg: string; textColor: string;
}) {
  const t = useTheme();
  return (
    <View style={[styles.miniStat, { backgroundColor: bg }]}>
      <Text style={[styles.miniStatLabel, { color: t.ink3 }]}>{label}</Text>
      <View style={styles.miniStatRow}>
        <View style={[styles.miniDot, { backgroundColor: color }]} />
        <Text style={[styles.miniStatNum, { color: textColor }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  patternWrap: { position: 'absolute', bottom: 0, right: 0 },
  buntingWrap: { position: 'absolute', top: 10, left: -20 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  heroEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: 'rgba(242,232,208,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroEdition: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 38,
    marginTop: 6,
    marginBottom: 18,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 20 },
  statsText: { flex: 1, gap: 10 },

  statLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLineLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statLineRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLineNum: { fontFamily: fonts.mono, fontSize: 22, color: '#fff', letterSpacing: -0.4 },
  statLineSub: { fontFamily: fonts.mono, fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  statLineDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },

  heroActions: { flexDirection: 'row', gap: 8 },
  heroBtn: {
    flex: 1,
    borderRadius: 26,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroBtnIcon: { fontFamily: fonts.headline, fontSize: 17 },
  heroBtnText: { fontFamily: fonts.headline, fontSize: 15, letterSpacing: -0.2 },

  eyebrowText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  friendsScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  friendCard: {
    width: 170,
    padding: 14,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  friendTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: fonts.headline, fontSize: 14 },
  friendName: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  friendSub: { fontFamily: fonts.body, fontSize: 11 },
  miniStats: { flexDirection: 'row', gap: 8 },
  miniStat: { flex: 1, borderRadius: 10, padding: 8 },
  miniStatLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  miniStatRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniStatNum: { fontFamily: fonts.mono, fontSize: 16 },

  teamsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
  },
  teamInfo: { flex: 1 },
  teamLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  teamName: { fontFamily: fonts.semibold, fontSize: 14 },
  teamCount: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: -0.2 },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },

  recentGrid: {
    paddingHorizontal: GRID_PAD,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});
