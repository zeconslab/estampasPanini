import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }  from '../store/useAlbumStore';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';
import { SectionHeader }  from '../components/SectionHeader';
import { useNavigation }  from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList }  from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

export function TradeScreen() {
  const t      = useTheme();
  const insets = useSafeAreaInsets();
  const nav    = useNavigation<Nav>();
  const { friends, stickers } = useAlbumStore();

  const myDupeIds  = new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id));
  const myMissingIds = new Set(stickers.filter(s => s.state === 'missing').map(s => s.id));

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ paddingTop: insets.top + 16 }} />

      <SectionHeader
        title="Amigos"
        trailing={
          <HapticPress onPress={() => nav.navigate('ScanModal')}
            style={{ backgroundColor: t.pitch, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: '#EFE7D2', fontWeight: '700', fontSize: 13 }}>Escanear QR</Text>
          </HapticPress>
        }
      />

      {friends.length === 0 && (
        <View style={[styles.empty, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[styles.emptyText, { color: t.ink3 }]}>
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
              <Text style={[styles.name, { color: t.ink }]}>{friend.name}</Text>
              <Text style={[styles.meta, { color: t.ink4 }]}>
                {new Date(friend.scannedAt).toLocaleDateString('es-MX')}
              </Text>
            </View>
            <View style={styles.matchBadges}>
              {canGive > 0 && (
                <View style={[styles.badge, { backgroundColor: t.lime }]}>
                  <Text style={[styles.badgeText, { color: t.pitch }]}>▲ {canGive}</Text>
                </View>
              )}
              {canReceive > 0 && (
                <View style={[styles.badge, { backgroundColor: t.coral }]}>
                  <Text style={styles.badgeText}>▼ {canReceive}</Text>
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
  empty:       { margin: 16, padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyText:   { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  card:        { marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:        { fontSize: 17, fontWeight: '700' },
  meta:        { fontSize: 12, marginTop: 2 },
  matchBadges: { flexDirection: 'row', gap: 6 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:   { fontSize: 12, fontWeight: '700', color: '#fff' },
});
