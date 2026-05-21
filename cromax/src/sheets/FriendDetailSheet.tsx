import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, useWindowDimensions,
} from 'react-native';
import { LinearGradient }      from 'expo-linear-gradient';
import { useSafeAreaInsets }   from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp }      from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAlbumStore }       from '../store/useAlbumStore';
import { TEAMS }               from '../data/album';
import type { Sticker }        from '../data/album';
import { useTheme, fonts }     from '../theme';
import { HapticPress }         from '../components/HapticPress';
import { Flag }                from '../components/Flag';

type Route = RouteProp<RootStackParamList, 'FriendDetail'>;

const COLS = 5;
const GAP  = 6;
const PAD  = 16;

function teamColors(code: string | null): [string, string] {
  if (!code) return ['#E8B23A', '#F5D77A'];
  if (code === 'CC') return ['#E61A27', '#8B0000'];
  const team = TEAMS.find(t => t.code === code);
  return team ? [team.colors[0], team.colors[2] ?? team.colors[1]] : ['#444', '#222'];
}

function initials(name: string): string {
  return name.split(' ').pop()?.slice(0, 3).toUpperCase() ?? '?';
}

function MiniSticker({ sticker, size, tint }: { sticker: Sticker; size: number; tint: string }) {
  const t    = useTheme();
  const w    = size;
  const h    = Math.round(size * 7 / 5);
  const footH = Math.max(8, Math.round(h * 0.165));
  const [c1, c2] = teamColors(sticker.team ?? null);
  const numLabel = sticker.team && sticker.team !== 'CC'
    ? `${sticker.team} ${String(sticker.teamNum ?? sticker.id).padStart(2, '0')}`
    : sticker.label;

  return (
    <View style={{ width: w, height: h, borderRadius: 6, overflow: 'hidden', borderWidth: 1.5, borderColor: tint + '60' }}>
      {/* num */}
      <Text style={{ position: 'absolute', top: 2, left: 3, fontFamily: fonts.mono, fontSize: Math.max(5, Math.round(size * 0.13)), color: t.ink3, zIndex: 2, letterSpacing: -0.3 }} numberOfLines={1}>
        {numLabel}
      </Text>
      {/* art */}
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 3 }}
      >
        <Text style={{ fontFamily: fonts.display, fontSize: Math.max(9, Math.round(size * 0.34)), color: 'rgba(255,255,255,0.9)', letterSpacing: -1 }}>
          {initials(sticker.name)}
        </Text>
        <View style={{ position: 'absolute', top: 0, left: '-30%' as any, width: '60%', height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', transform: [{ skewX: '-15deg' }] }} />
      </LinearGradient>
      {/* foot */}
      <View style={{ height: footH, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.headline, fontSize: Math.max(5, Math.round(size * 0.11)), color: t.paper, textTransform: 'uppercase', letterSpacing: 0.3 }} numberOfLines={1}>
          {sticker.label}
        </Text>
      </View>
      {/* tint overlay */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: tint + '18', pointerEvents: 'none' }} />
    </View>
  );
}

function StickerGrid({ stickers, tint, cellSize }: { stickers: Sticker[]; tint: string; cellSize: number }) {
  if (stickers.length === 0) return null;
  return (
    <View style={[gridStyles.wrap, { gap: GAP }]}>
      {stickers.map(s => (
        <MiniSticker key={s.id} sticker={s} size={cellSize} tint={tint} />
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});

function SectionCard({
  title, subtitle, count, dotColor, stickers, cellSize, empty,
}: {
  title: string; subtitle: string; count: number; dotColor: string;
  stickers: Sticker[]; cellSize: number; empty: string;
}) {
  const t = useTheme();
  return (
    <View style={[sectionStyles.card, { backgroundColor: t.card, borderColor: t.line }]}>
      <View style={sectionStyles.header}>
        <View style={[sectionStyles.dot, { backgroundColor: dotColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={[sectionStyles.title, { color: t.ink, fontFamily: fonts.headline }]}>{title}</Text>
          <Text style={[sectionStyles.sub, { color: t.ink4, fontFamily: fonts.body }]}>{subtitle}</Text>
        </View>
        <View style={[sectionStyles.badge, { backgroundColor: dotColor + '28' }]}>
          <Text style={[sectionStyles.badgeNum, { color: dotColor, fontFamily: fonts.mono }]}>{count}</Text>
        </View>
      </View>
      {stickers.length > 0
        ? <StickerGrid stickers={stickers} tint={dotColor} cellSize={cellSize} />
        : <Text style={[sectionStyles.empty, { color: t.ink4, fontFamily: fonts.body }]}>{empty}</Text>
      }
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card:     { borderRadius: 18, borderWidth: 0.5, padding: 14, marginHorizontal: PAD, marginBottom: 12 },
  header:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dot:      { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  title:    { fontSize: 15 },
  sub:      { fontSize: 11, marginTop: 1 },
  badge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeNum: { fontSize: 15 },
  empty:    { fontSize: 13, paddingBottom: 4 },
});

function stringColor(name: string): string {
  const colors = ['#0E5B3A', '#1A7B4F', '#3D5A80', '#6B4226', '#8B2FC9'];
  const h = name.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  return colors[Math.abs(h) % colors.length];
}

export function FriendDetailSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const route   = useRoute<Route>();
  const { width } = useWindowDimensions();

  const cellSize = Math.floor((width - PAD * 2 - GAP * (COLS - 1)) / COLS);

  const { stickers, friends, removeFriend } = useAlbumStore();
  const friend = friends.find(f => f.id === route.params.friendId);

  const myDupeIds    = useMemo(() => new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id)), [stickers]);
  const myMissingIds = useMemo(() => new Set(stickers.filter(s => s.state === 'missing').map(s => s.id)), [stickers]);

  const canGive: Sticker[]    = useMemo(() => (friend?.missing ?? [])
    .filter(id => myDupeIds.has(id))
    .map(id => stickers.find(s => s.id === id))
    .filter((s): s is Sticker => s !== undefined), [friend, myDupeIds, stickers]);

  const canReceive: Sticker[] = useMemo(() => (friend?.dupes ?? [])
    .filter(d => myMissingIds.has(d.id))
    .map(d => stickers.find(s => s.id === d.id))
    .filter((s): s is Sticker => s !== undefined), [friend, myMissingIds, stickers]);

  if (!friend) return null;

  const avatarColor = stringColor(friend.name);
  const scannedDate = new Date(friend.scannedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });

  const friendTeam = TEAMS.find(tm =>
    (friend.missing?.length ?? 0) > 0 &&
    stickers.find(s => s.id === friend.missing[0])?.team === tm.code
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.pitch, paddingTop: insets.top + 12 }]}>
        <View style={[styles.handle, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />

        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={[styles.avatarLetter, { color: '#fff', fontFamily: fonts.headline }]}>
              {friend.name[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.friendName, { color: '#E89B2F', fontFamily: fonts.display }]}>
              {friend.name}
            </Text>
            <Text style={[styles.friendMeta, { color: 'rgba(255,255,255,0.5)', fontFamily: fonts.mono }]}>
              Escaneado el {scannedDate}
            </Text>
          </View>
          <HapticPress
            style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
            onPress={() => nav.goBack()}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
          </HapticPress>
        </View>

        {/* Summary pills */}
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: 'rgba(181,218,64,0.2)' }]}>
            <View style={[styles.pillDot, { backgroundColor: '#B5DA40' }]} />
            <Text style={[styles.pillText, { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.mono }]}>
              {canGive.length} le das
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(215,38,61,0.2)' }]}>
            <View style={[styles.pillDot, { backgroundColor: '#D7263D' }]} />
            <Text style={[styles.pillText, { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.mono }]}>
              {canReceive.length} recibes
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.pillText, { color: 'rgba(255,255,255,0.55)', fontFamily: fonts.mono }]}>
              {friend.missing.length} faltantes totales
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionCard
          title="Puedo darle"
          subtitle="Mis repetidas que a él le faltan"
          count={canGive.length}
          dotColor={t.lime}
          stickers={canGive}
          cellSize={cellSize}
          empty="No tienes repetidas de lo que le falta."
        />

        <SectionCard
          title="Me puede dar"
          subtitle="Sus repetidas que a mí me faltan"
          count={canReceive.length}
          dotColor={t.coral}
          stickers={canReceive}
          cellSize={cellSize}
          empty="No tiene repetidas de lo que me falta."
        />

        {(canGive.length === 0 && canReceive.length === 0) && (
          <View style={[styles.noMatch, { backgroundColor: t.card, borderColor: t.line }]}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>🤷</Text>
            <Text style={[styles.noMatchTitle, { color: t.ink, fontFamily: fonts.headline }]}>
              Sin matches por ahora
            </Text>
            <Text style={[styles.noMatchSub, { color: t.ink3, fontFamily: fonts.body }]}>
              Cuando marques más repetidas o él actualice su álbum, los trueques aparecerán aquí.
            </Text>
          </View>
        )}

        <HapticPress
          style={[styles.removeBtn, { backgroundColor: t.coralSoft, borderColor: t.coral + '60' }]}
          onPress={() => { removeFriend(friend.id); nav.goBack(); }}
        >
          <Text style={[styles.removeBtnText, { color: t.coral, fontFamily: fonts.semibold }]}>
            Eliminar amigo
          </Text>
        </HapticPress>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { paddingHorizontal: PAD, paddingBottom: 20 },
  handle:        { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  topRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar:        { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarLetter:  { fontSize: 20 },
  friendName:    { fontSize: 26, letterSpacing: -0.6 },
  friendMeta:    { fontSize: 11, marginTop: 2 },
  closeBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pills:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillDot:       { width: 6, height: 6, borderRadius: 3 },
  pillText:      { fontSize: 11 },
  noMatch:       { margin: 16, borderRadius: 18, borderWidth: 0.5, padding: 28, alignItems: 'center' },
  noMatchTitle:  { fontSize: 17, marginBottom: 6 },
  noMatchSub:    { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  removeBtn:     { marginHorizontal: PAD, marginTop: 8, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  removeBtnText: { fontSize: 15 },
});
