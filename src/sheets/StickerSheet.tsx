import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Sticker as StickerData } from '../data/album';
import { useAlbumStore }   from '../store/useAlbumStore';
import { TEAMS }           from '../data/album';
import { useTheme, fonts } from '../theme';
import { HapticPress }     from '../components/HapticPress';
import { Flag }            from '../components/Flag';
import { IcClose, IcCheck, IcMinus, IcPlus, IcSwap } from '../components/Icons';

type Route = RouteProp<RootStackParamList, 'StickerModal'>;

// ─── Mini card preview ───────────────────────────────────────────────────────

const CARD_W = 60;
const CARD_H = Math.round(CARD_W * 7 / 5); // 84

function cardGradient(code: string | null): [string, string] {
  if (code === 'CC') return ['#E61A27', '#8B0000'];
  const team = code ? TEAMS.find(t => t.code === code) : null;
  return team ? [team.colors[0], team.colors[2] ?? team.colors[1]] : ['#E8B23A', '#BF8A20'];
}

function initials(name: string): string {
  return name.split(' ').pop()?.slice(0, 3).toUpperCase() ?? '??';
}

function MiniCard({ sticker }: { sticker: StickerData }) {
  const t         = useTheme();
  const isMissing = sticker.state === 'missing';
  const isOwned   = !isMissing;
  const [c1, c2]  = cardGradient(sticker.team);
  const FOOT_H    = 18;

  return (
    <View style={[
      miniStyles.card,
      isMissing
        ? { backgroundColor: t.paper2, borderWidth: 1.5, borderColor: t.ink4, borderStyle: 'dashed' }
        : { overflow: 'hidden', borderWidth: 0.5, borderColor: t.line2 },
    ]}>
      <Text style={[miniStyles.num, { color: isMissing ? t.ink4 : t.ink3 }]} numberOfLines={1}>
        {sticker.label}
      </Text>

      {isOwned ? (
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={miniStyles.art}
        >
          <View style={miniStyles.sheen} />
          <Text style={miniStyles.init}>{initials(sticker.name)}</Text>
        </LinearGradient>
      ) : (
        <View style={miniStyles.art} />
      )}

      <View style={[miniStyles.foot, { height: FOOT_H, backgroundColor: isMissing ? t.paper3 : t.ink }]}>
        <Text style={[miniStyles.footText, { color: isMissing ? t.ink3 : t.paper }]} numberOfLines={1}>
          {sticker.team ?? sticker.label}
        </Text>
      </View>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 8,
    overflow: 'hidden',
  },
  num: {
    position: 'absolute',
    top: 3,
    left: 4,
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: -0.2,
    zIndex: 2,
  },
  art: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
    marginTop: 14,
  },
  init: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -0.5,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: '-30%' as any,
    width: '60%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    transform: [{ skewX: '-15deg' }],
  },
  foot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footText: {
    fontFamily: fonts.headline,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

// ─── Main sheet ──────────────────────────────────────────────────────────────

export function StickerSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const route   = useRoute<Route>();
  const { stickerId } = route.params;
  const { stickers, updateSticker } = useAlbumStore();
  const sticker = stickers.find(s => s.id === stickerId);

  if (!sticker) return null;

  const team = sticker.team && sticker.team !== 'CC'
    ? TEAMS.find(tm => tm.code === sticker.team)
    : null;

  const setState = (state: 'missing' | 'owned' | 'duplicate') => {
    updateSticker(sticker.id, {
      state,
      count: state === 'duplicate' ? Math.max(sticker.count || 1, 1) : 0,
    });
  };

  const adjustDupe = (delta: number) => {
    const next = (sticker.count || 1) + delta;
    if (next < 1) {
      updateSticker(sticker.id, { state: 'owned', count: 0 });
    } else {
      updateSticker(sticker.id, { count: next });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.paper, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.handle, { backgroundColor: t.line2 }]} />

      <View style={styles.topRow}>
        <Text style={[styles.eyebrow, { color: t.ink3 }]}>
          Estampa #{String(sticker.id).padStart(3, '0')}
        </Text>
        <HapticPress
          style={[styles.closeBtn, { backgroundColor: t.card, borderColor: t.line }]}
          onPress={() => nav.goBack()}
        >
          <IcClose color={t.ink} size={16} />
        </HapticPress>
      </View>

      <View style={styles.infoRow}>
        <MiniCard sticker={sticker} />
        <View style={styles.meta}>
          {team && (
            <View style={styles.teamRow}>
              <Flag colors={team.colors} width={18} height={12} />
              <Text style={[styles.teamName, { color: t.ink2, fontFamily: fonts.body }]}>{team.name}</Text>
            </View>
          )}
          {sticker.team === 'CC' && (
            <View style={styles.teamRow}>
              <View style={[styles.ccDot, { backgroundColor: '#E61A27' }]} />
              <Text style={[styles.teamName, { color: t.ink2, fontFamily: fonts.body }]}>Coca-Cola</Text>
            </View>
          )}
          <Text style={[styles.stickerName, { color: t.ink, fontFamily: fonts.headline }]}>{sticker.name}</Text>
          <Text style={[styles.stickerLabel, { color: t.ink3, fontFamily: fonts.mono }]}>
            {sticker.label}
          </Text>
          <View style={[
            styles.stateChip,
            {
              backgroundColor:
                sticker.state === 'owned'     ? (t.lime + '38') :
                sticker.state === 'missing'   ? t.coralSoft :
                                                t.goldSoft,
            }
          ]}>
            <View style={[styles.chipDot, {
              backgroundColor:
                sticker.state === 'owned'     ? t.lime  :
                sticker.state === 'missing'   ? t.coral :
                                                t.gold,
            }]} />
            <Text style={[styles.chipText, { color: t.ink, fontFamily: fonts.body }]}>
              {sticker.state === 'owned'     ? 'En tu álbum' :
               sticker.state === 'missing'  ? 'Te falta'    :
                                               `Repetida ×${(sticker.count || 1) + 1}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tileRow}>
        <ActionTile
          active={sticker.state === 'missing'}
          color={t.coral}
          label="Falta"
          sub="No la tengo"
          onPress={() => setState('missing')}
        />
        <ActionTile
          active={sticker.state === 'owned'}
          color={t.lime}
          label="Tengo"
          sub="1 en álbum"
          onPress={() => setState('owned')}
        />
        <ActionTile
          active={sticker.state === 'duplicate'}
          color={t.gold}
          label="Repetida"
          sub="2 o más"
          onPress={() => setState('duplicate')}
        />
      </View>

      {sticker.state === 'duplicate' && (
        <View style={[styles.stepperCard, { backgroundColor: t.card, borderColor: t.line }]}>
          <View>
            <Text style={[styles.stepperLabel, { color: t.ink3, fontFamily: fonts.mono }]}>cantidad total</Text>
            <Text style={[styles.stepperNum, { color: t.ink, fontFamily: fonts.mono }]}>
              {(sticker.count || 1) + 1}
            </Text>
          </View>
          <View style={styles.stepperBtns}>
            <HapticPress style={[styles.stepBtn, { backgroundColor: t.paper2, borderColor: t.line }]} onPress={() => adjustDupe(-1)}>
              <IcMinus color={t.ink} size={18} />
            </HapticPress>
            <HapticPress style={[styles.stepBtn, { backgroundColor: t.pitch }]} onPress={() => adjustDupe(1)}>
              <IcPlus color="#fff" size={18} />
            </HapticPress>
          </View>
        </View>
      )}

      <HapticPress style={[styles.ghostBtn, { backgroundColor: t.paper2 }]} onPress={() => nav.goBack()}>
        <IcSwap color={t.ink} size={16} />
        <Text style={[styles.ghostBtnText, { color: t.ink, fontFamily: fonts.headline }]}>Buscar entre amigos</Text>
      </HapticPress>
    </View>
  );
}

function ActionTile({ active, color, label, sub, onPress }: {
  active: boolean; color: string; label: string; sub: string; onPress: () => void;
}) {
  const t = useTheme();
  return (
    <HapticPress
      style={[
        tileStyles.tile,
        { backgroundColor: active ? t.pitch : t.card, borderColor: active ? 'transparent' : t.line },
      ]}
      onPress={onPress}
    >
      <View style={tileStyles.dotRow}>
        <View style={[tileStyles.dot, { backgroundColor: color }]} />
        {active && <IcCheck color="#fff" size={12} />}
      </View>
      <Text style={[tileStyles.label, { color: active ? '#fff' : t.ink, fontFamily: fonts.headline }]}>{label}</Text>
      <Text style={[tileStyles.sub, { color: active ? 'rgba(255,255,255,0.65)' : t.ink3, fontFamily: fonts.body }]}>{sub}</Text>
    </HapticPress>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 18 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  topRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow:      { fontFamily: 'JetBrainsMono_700Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2 },
  closeBtn:     { width: 32, height: 32, borderRadius: 11, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  infoRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  meta:         { flex: 1, paddingTop: 2 },
  teamRow:      { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  ccDot:        { width: 8, height: 8, borderRadius: 4 },
  teamName:     { fontSize: 13 },
  stickerName:  { fontSize: 22, letterSpacing: -0.4, marginBottom: 4 },
  stickerLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 },
  stateChip:    { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginTop: 12, alignSelf: 'flex-start' },
  chipDot:      { width: 7, height: 7, borderRadius: 4 },
  chipText:     { fontSize: 13 },
  tileRow:      { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stepperCard:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, borderWidth: 0.5, marginBottom: 14 },
  stepperLabel: { fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
  stepperNum:   { fontSize: 24, marginTop: 2 },
  stepperBtns:  { flexDirection: 'row', gap: 8 },
  stepBtn:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5 },
  ghostBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 14, marginTop: 4 },
  ghostBtnText: { fontSize: 14 },
});

const tileStyles = StyleSheet.create({
  tile:   { flex: 1, borderRadius: 16, padding: 14, borderWidth: 0.5 },
  dotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dot:    { width: 10, height: 10, borderRadius: 5 },
  label:  { fontSize: 14, marginBottom: 2 },
  sub:    { fontSize: 10, lineHeight: 14 },
});
