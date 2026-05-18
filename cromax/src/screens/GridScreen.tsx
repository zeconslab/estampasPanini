import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { useTheme, fonts } from '../theme';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }     from '../components/HapticPress';
import { useNavigation }   from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList }  from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'owned' | 'missing' | 'duplicate';

const COLS  = 6;
const GAP   = 6;
const PAD   = 12;
const W     = Dimensions.get('window').width;
const CELL  = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'owned',     label: 'Tengo' },
  { key: 'missing',   label: 'Faltan' },
  { key: 'duplicate', label: 'Repetidas' },
];

export function GridScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<Nav>();
  const stickers = useAlbumStore(s => s.stickers);

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => stickers.filter(s => {
    if (filter !== 'all' && s.state !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.label.toLowerCase().includes(q);
    }
    return true;
  }), [stickers, filter, query]);

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: t.paper }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar estampa…"
          placeholderTextColor={t.ink4}
          style={[styles.search, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
        />
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <HapticPress
              key={f.key}
              style={[styles.chip, { backgroundColor: filter === f.key ? t.pitch : t.paper2 }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={{ color: filter === f.key ? '#EFE7D2' : t.ink3, fontSize: 13, fontFamily: fonts.semibold, letterSpacing: -0.1 }}>
                {f.label}
              </Text>
            </HapticPress>
          ))}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={s => String(s.id)}
        numColumns={COLS}
        contentContainerStyle={{ padding: PAD, gap: GAP }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <StickerComponent
            sticker={item}
            size={CELL}
            onPress={() => nav.navigate('StickerModal', { stickerId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { paddingHorizontal: 12, paddingBottom: 8 },
  search:    { borderRadius: 10, borderWidth: 1, padding: 10, fontSize: 15, marginBottom: 8, fontFamily: fonts.body },
  filters:   { flexDirection: 'row', gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
});
