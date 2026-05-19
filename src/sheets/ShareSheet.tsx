import React, { useMemo, useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Share, Linking, Platform,
} from 'react-native';
import QRCode              from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }   from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList }  from '../navigation/RootNavigator';
import { useAlbumStore }   from '../store/useAlbumStore';
import { encodeQR }        from '../utils/qr';
import { TEAMS }           from '../data/album';
import { useTheme, fonts } from '../theme';
import { HapticPress }     from '../components/HapticPress';
import { Flag }            from '../components/Flag';

// ─── helpers ────────────────────────────────────────────────────────────────

function buildShareText(
  name: string,
  missingByTeam: Array<{ teamCode: string; teamName: string; labels: string[] }>,
  total: number,
): string {
  const lines = [
    `Mis faltantes — FIFA Mundial 2026`,
    `${name} · ${total} estampas faltantes`,
    '',
  ];
  for (const { teamCode, teamName, labels } of missingByTeam) {
    if (labels.length === 0) continue;
    lines.push(`${teamCode} (${teamName}): ${labels.join(', ')}`);
  }
  return lines.join('\n');
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TeamMissingRow({
  teamCode, teamName, colors, count, labels,
}: {
  teamCode: string; teamName: string;
  colors: [string, string, string];
  count: number; labels: string[];
}) {
  const t = useTheme();
  if (count === 0) return null;
  return (
    <View style={[styles.teamRow, { borderColor: t.line }]}>
      <Flag colors={colors} width={28} height={18} />
      <View style={styles.teamMeta}>
        <Text style={[styles.teamCode, { color: t.ink, fontFamily: fonts.semibold }]}>{teamCode}</Text>
        <Text style={[styles.teamName, { color: t.ink4, fontFamily: fonts.mono }]}>{teamName}</Text>
      </View>
      <Text style={[styles.teamCount, { color: t.coral, fontFamily: fonts.mono }]}>{count}</Text>
      <Text style={[styles.teamLabels, { color: t.ink3, fontFamily: fonts.mono }]} numberOfLines={2}>
        {labels.slice(0, 6).join(' · ')}{labels.length > 6 ? ` +${labels.length - 6}` : ''}
      </Text>
    </View>
  );
}

function ChannelBtn({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <HapticPress style={[chanStyles.btn, { backgroundColor: t.card, borderColor: t.line }]} onPress={onPress}>
      <View style={[chanStyles.iconBg, { backgroundColor: color }]}>
        <Text style={chanStyles.icon}>{icon}</Text>
      </View>
      <Text style={[chanStyles.label, { color: t.ink, fontFamily: fonts.semibold }]} numberOfLines={1}>
        {label}
      </Text>
    </HapticPress>
  );
}

const chanStyles = StyleSheet.create({
  btn:    { alignItems: 'center', gap: 7, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 16, borderWidth: 0.5, width: 76 },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  icon:   { fontSize: 20 },
  label:  { fontSize: 11, textAlign: 'center' },
});

// ─── Main sheet ──────────────────────────────────────────────────────────────

type Nav = StackNavigationProp<RootStackParamList>;

export function ShareSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<Nav>();
  const { stickers, profile, friends } = useAlbumStore();
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => encodeQR(profile?.name ?? 'Amigo', stickers), [stickers, profile]);

  const missingStickers = useMemo(() => stickers.filter(s => s.state === 'missing'), [stickers]);
  const dupeStickers    = useMemo(() => stickers.filter(s => s.state === 'duplicate'), [stickers]);
  const myDupeIds       = useMemo(() => new Set(dupeStickers.map(s => s.id)), [dupeStickers]);
  const myMissingIds    = useMemo(() => new Set(missingStickers.map(s => s.id)), [missingStickers]);

  // Missing grouped by team (preserving TEAMS order + specials)
  const missingByTeam = useMemo(() => {
    const result: Array<{ teamCode: string; teamName: string; colors: [string,string,string]; labels: string[] }> = [];

    for (const team of TEAMS) {
      const labels = missingStickers
        .filter(s => s.team === team.code)
        .map(s => s.label);
      result.push({ teamCode: team.code, teamName: team.name, colors: team.colors, labels });
    }

    // Specials + legends (no team)
    const specialLabels = missingStickers.filter(s => !s.team).map(s => s.label);
    if (specialLabels.length > 0) {
      result.push({
        teamCode: '★',
        teamName: 'Especiales · Leyendas',
        colors: ['#E89B2F', '#0E5B3A', '#E89B2F'],
        labels: specialLabels,
      });
    }

    return result;
  }, [missingStickers]);

  // Friend trade matches
  const friendMatches = useMemo(() =>
    friends.map(f => ({
      friend: f,
      canGive:    f.missing.filter(id => myDupeIds.has(id)).length,
      canReceive: (f.dupes ?? []).filter(d => myMissingIds.has(d.id)).length,
    })).filter(m => m.canGive > 0 || m.canReceive > 0),
    [friends, myDupeIds, myMissingIds],
  );

  const handle = profile
    ? '@' + profile.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)
    : '';

  const shareText = useMemo(
    () => buildShareText(profile?.name ?? 'Mi álbum', missingByTeam, missingStickers.length),
    [profile, missingByTeam, missingStickers.length],
  );

  const teamsWithMissing = missingByTeam.filter(r => r.labels.length > 0);

  const handleWhatsApp = useCallback(async () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      Linking.openURL(url);
    } else {
      Share.share({ message: shareText });
    }
  }, [shareText]);

  const handleMessages = useCallback(() => {
    const url = Platform.OS === 'ios'
      ? `sms:&body=${encodeURIComponent(shareText)}`
      : `sms:?body=${encodeURIComponent(shareText)}`;
    Linking.openURL(url).catch(() => Share.share({ message: shareText }));
  }, [shareText]);

  const handleCopy = useCallback(async () => {
    await Share.share({ message: shareText });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText]);

  const handleShare = useCallback(() => {
    Share.share({ message: shareText });
  }, [shareText]);

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      {/* Drag handle */}
      <View style={[styles.handle, { backgroundColor: t.line }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* QR hero card */}
        <View style={[styles.qrCard, { backgroundColor: t.pitch }]}>
          <View style={styles.qrWrap}>
            <QRCode value={payload} size={200} color="#102A1F" backgroundColor="#ffffff" />
          </View>
          <Text style={[styles.qrName, { color: '#E89B2F', fontFamily: fonts.display }]}>
            {profile?.name ?? 'Mi álbum'}
          </Text>
          <Text style={[styles.qrHandle, { color: 'rgba(255,255,255,0.5)', fontFamily: fonts.mono }]}>
            {handle} · FIFA Mundial 2026
          </Text>

          <View style={styles.statsPills}>
            <View style={[styles.pill, { backgroundColor: 'rgba(215,38,61,0.18)' }]}>
              <View style={[styles.pillDot, { backgroundColor: t.coral }]} />
              <Text style={[styles.pillText, { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.mono }]}>
                {missingStickers.length} faltantes
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(232,155,47,0.18)' }]}>
              <View style={[styles.pillDot, { backgroundColor: t.primary }]} />
              <Text style={[styles.pillText, { color: 'rgba(255,255,255,0.85)', fontFamily: fonts.mono }]}>
                {dupeStickers.length} repetidas
              </Text>
            </View>
          </View>

          <Text style={[styles.scanHint, { color: 'rgba(255,255,255,0.35)', fontFamily: fonts.body }]}>
            Pídele a un amigo que escanee este QR
          </Text>
        </View>

        {/* Channel buttons */}
        <View style={styles.channelRow}>
          <ChannelBtn icon="💬"                   label="WhatsApp"              color="#25D366"  onPress={handleWhatsApp} />
          <ChannelBtn icon="✉️"                   label="Mensajes"              color={t.pitch2} onPress={handleMessages} />
          <ChannelBtn icon="📤"                   label="Compartir"             color={t.ink}    onPress={handleShare} />
          <ChannelBtn icon={copied ? "✅" : "📋"} label={copied ? "Copiado" : "Copiar"} color={t.gold} onPress={handleCopy} />
        </View>

        {/* Friend matches */}
        {friendMatches.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.ink, fontFamily: fonts.headline }]}>
                Matches con amigos
              </Text>
              <Text style={[styles.sectionCount, { color: t.ink4, fontFamily: fonts.mono }]}>
                {friendMatches.length}
              </Text>
            </View>
            {friendMatches.map(({ friend, canGive, canReceive }) => (
              <HapticPress key={friend.id} style={[styles.friendCard, { backgroundColor: t.card, borderColor: t.line }]} onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}>
                <View style={[styles.friendAvatar, { backgroundColor: t.pitch2 }]}>
                  <Text style={[styles.friendAvatarLetter, { color: t.primary, fontFamily: fonts.headline }]}>
                    {friend.name[0]}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: t.ink, fontFamily: fonts.semibold }]}>{friend.name}</Text>
                  <Text style={[styles.friendHandle, { color: t.ink4, fontFamily: fonts.mono }]}>
                    {'@' + friend.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)}
                  </Text>
                </View>
                <View style={styles.matchBadges}>
                  <View style={[styles.matchBadge, { backgroundColor: t.paper2 }]}>
                    <Text style={[styles.badgeLabel, { color: t.ink4 }]}>LE DAS</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgeDot, { backgroundColor: t.lime }]} />
                      <Text style={[styles.badgeNum, { color: t.ink, fontFamily: fonts.mono }]}>{canGive}</Text>
                    </View>
                  </View>
                  <View style={[styles.matchBadge, { backgroundColor: t.paper2 }]}>
                    <Text style={[styles.badgeLabel, { color: t.ink4 }]}>RECIBES</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badgeDot, { backgroundColor: t.coral }]} />
                      <Text style={[styles.badgeNum, { color: t.ink, fontFamily: fonts.mono }]}>{canReceive}</Text>
                    </View>
                  </View>
                </View>
              </HapticPress>
            ))}
          </>
        )}

        {/* Missing by team */}
        {teamsWithMissing.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.ink, fontFamily: fonts.headline }]}>
                Faltantes por selección
              </Text>
              <Text style={[styles.sectionCount, { color: t.ink4, fontFamily: fonts.mono }]}>
                {teamsWithMissing.length} equipos
              </Text>
            </View>
            <View style={[styles.teamCard, { backgroundColor: t.card, borderColor: t.line }]}>
              {teamsWithMissing.map(({ teamCode, teamName, colors, labels }, i) => (
                <TeamMissingRow
                  key={teamCode}
                  teamCode={teamCode}
                  teamName={teamName}
                  colors={colors}
                  count={labels.length}
                  labels={labels}
                />
              ))}
            </View>
          </>
        )}

        {/* Flash tip */}
        <View style={[styles.flashTip, { backgroundColor: 'rgba(214,242,63,0.22)' }]}>
          <Text style={{ fontSize: 16 }}>⚡</Text>
          <Text style={[styles.flashText, { color: t.ink2, fontFamily: fonts.body }]}>
            Cuando un amigo abra tu link, automáticamente te dirá cuáles de tus faltantes él tiene repetidas.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.btnGroup}>
          <HapticPress
            style={[styles.btnPrimary, { backgroundColor: t.pitch }]}
            onPress={() => Share.share({ message: shareText })}
          >
            <Text style={[styles.btnPrimaryText, { fontFamily: fonts.headline }]}>↑  Compartir lista</Text>
          </HapticPress>
          <HapticPress
            style={[styles.btnSecondary, { backgroundColor: t.paper2 }]}
            onPress={() => nav.goBack()}
          >
            <Text style={[styles.btnSecondaryText, { color: t.ink, fontFamily: fonts.semibold }]}>Cerrar</Text>
          </HapticPress>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handle:    { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },

  // QR card
  qrCard:    { margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  qrWrap:    { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  qrName:    { fontSize: 26, letterSpacing: -0.8, marginBottom: 2 },
  qrHandle:  { fontSize: 11, letterSpacing: 0.4, marginBottom: 16 },
  statsPills:{ flexDirection: 'row', gap: 8, marginBottom: 12 },
  pill:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillDot:   { width: 7, height: 7, borderRadius: 4 },
  pillText:  { fontSize: 12 },
  scanHint:  { fontSize: 11, textAlign: 'center' },

  // Section headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitle:  { fontSize: 16 },
  sectionCount:  { fontSize: 12 },

  // Friend cards
  friendCard:        { marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  friendAvatar:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  friendAvatarLetter:{ fontSize: 16 },
  friendInfo:        { flex: 1 },
  friendName:        { fontSize: 15 },
  friendHandle:      { fontSize: 11, marginTop: 1 },
  matchBadges:       { flexDirection: 'row', gap: 6 },
  matchBadge:        { borderRadius: 10, padding: 8, minWidth: 52, alignItems: 'center' },
  badgeLabel:        { fontFamily: fonts.mono, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  badgeRow:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeDot:          { width: 6, height: 6, borderRadius: 3 },
  badgeNum:          { fontSize: 15 },

  // Team breakdown card
  teamCard:   { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  teamRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  teamMeta:   { width: 110 },
  teamCode:   { fontSize: 13 },
  teamName:   { fontSize: 10, marginTop: 1 },
  teamCount:  { fontSize: 15, width: 30, textAlign: 'right' },
  teamLabels: { flex: 1, fontSize: 10, lineHeight: 14 },

  // Channel row
  channelRow: { flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 8, marginBottom: 4 },

  // Flash tip
  flashTip:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 12, margin: 16, marginTop: 8 },
  flashText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // Buttons
  btnGroup:         { margin: 16, marginTop: 20, gap: 10 },
  btnPrimary:       { borderRadius: 24, paddingVertical: 15, alignItems: 'center' },
  btnPrimaryText:   { fontSize: 16, color: '#EFE7D2' },
  btnSecondary:     { borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { fontSize: 15 },
});
