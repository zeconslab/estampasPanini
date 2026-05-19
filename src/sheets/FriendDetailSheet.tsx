import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAlbumStore } from '../store/useAlbumStore';
import type { Sticker } from '../data/album';
import { useTheme, fonts } from '../theme';
import { HapticPress }   from '../components/HapticPress';
import { SectionHeader } from '../components/SectionHeader';

type Route = RouteProp<RootStackParamList, 'FriendDetail'>;

export function FriendDetailSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const route   = useRoute<Route>();

  const { stickers, friends, removeFriend } = useAlbumStore();
  const friend = friends.find(f => f.id === route.params.friendId);

  if (!friend) return null;

  const myDupeIds    = new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id));
  const myMissingIds = new Set(stickers.filter(s => s.state === 'missing').map(s => s.id));

  // Stickers I can give them (my dupes they're missing)
  const canGive: Sticker[] = friend.missing
    .filter(id => myDupeIds.has(id))
    .map(id => stickers.find(s => s.id === id))
    .filter((s): s is Sticker => s !== undefined);

  // Stickers they can give me (their dupes I'm missing)
  const canReceive: Sticker[] = friend.dupes
    .filter(d => myMissingIds.has(d.id))
    .map(d => stickers.find(s => s.id === d.id))
    .filter((s): s is Sticker => s !== undefined);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.header, { backgroundColor: t.pitch, paddingTop: 20 }]}>
        <View style={[styles.handle, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        <Text style={[styles.name, { color: t.primary }]}>{friend.name}</Text>
        <Text style={[styles.meta, { color: t.ink4 }]}>{new Date(friend.scannedAt).toLocaleDateString('es-MX')}</Text>
      </View>

      <SectionHeader title={`Puedo darle (${canGive.length})`} />
      {canGive.length === 0 && (
        <Text style={[styles.empty, { color: t.ink4 }]}>Ninguna por ahora.</Text>
      )}
      {canGive.map(s => (
        <View key={s.id} style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[styles.rowLabel, { color: t.ink }]}>{s.label}</Text>
          <Text style={[styles.rowName, { color: t.ink3 }]}>{s.name}</Text>
        </View>
      ))}

      <SectionHeader title={`Me puede dar (${canReceive.length})`} />
      {canReceive.length === 0 && (
        <Text style={[styles.empty, { color: t.ink4 }]}>Ninguna por ahora.</Text>
      )}
      {canReceive.map(s => (
        <View key={s.id} style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[styles.rowLabel, { color: t.ink }]}>{s.label}</Text>
          <Text style={[styles.rowName, { color: t.ink3 }]}>{s.name}</Text>
        </View>
      ))}

      <HapticPress
        style={[styles.removeBtn, { backgroundColor: t.coral + '22', borderColor: t.coral }]}
        onPress={() => { removeFriend(friend.id); nav.goBack(); }}
      >
        <Text style={[styles.removeBtnText, { color: t.coral }]}>Eliminar amigo</Text>
      </HapticPress>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header:        { padding: 20, paddingBottom: 24 },
  handle:        { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  name:          { fontSize: 28, fontFamily: fonts.display },
  meta:          { fontSize: 13, marginTop: 4 },
  row:           { marginHorizontal: 16, marginBottom: 6, padding: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10 },
  rowLabel:      { fontFamily: fonts.headline, fontSize: 14, width: 50 },
  rowName:       { fontSize: 14, flex: 1 },
  empty:         { paddingHorizontal: 16, paddingBottom: 12, fontSize: 14 },
  removeBtn:     { margin: 16, marginTop: 24, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  removeBtnText: { fontFamily: fonts.semibold, fontSize: 15 },
});
