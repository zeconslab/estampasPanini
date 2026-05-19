import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { cycleQuick, TEAMS } from '../data/album';
import type { Sticker } from '../data/album';
import { useTheme, fonts } from '../theme';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }    from '../components/HapticPress';
import { Flag }           from '../components/Flag';

const COLS = 6;
const GAP  = 6;
const PAD  = 12;

const keyExtractor = (s: Sticker) => String(s.id);

export function QuickAddSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const { stickers, setStickers } = useAlbumStore();
  const { width } = useWindowDimensions();

  const CELL = useMemo(
    () => Math.floor((width - PAD * 2 - GAP * (COLS - 1)) / COLS),
    [width],
  );

  const [local, setLocal] = useState(stickers);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const initialStates = useRef(new Map(stickers.map(s => [s.id, s.state])));

  const sessionAdded = useMemo(
    () => local.filter(s =>
      initialStates.current.get(s.id) === 'missing' &&
      (s.state === 'owned' || s.state === 'duplicate')
    ).length,
    [local],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return local.filter(s => {
      if (selectedTeam && s.team !== selectedTeam) return false;
      if (!q) return true;
      const teamObj = TEAMS.find(tm => tm.code === s.team);
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.id).includes(q) ||
        (s.team ?? '').toLowerCase().includes(q) ||
        (teamObj?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [local, selectedTeam, query]);

  const handlePress = useCallback((sticker: Sticker) => {
    setLocal(prev => prev.map(s => s.id === sticker.id ? cycleQuick(s) : s));
  }, []);

  const handleLongPress = useCallback((sticker: Sticker) => {
    setLocal(prev => prev.map(s => s.id === sticker.id ? { ...s, state: 'missing', count: 0 } : s));
  }, []);

  const localRef = useRef(local);
  useEffect(() => { localRef.current = local; }, [local]);
  const handleDone = useCallback(() => {
    setStickers(localRef.current);
    nav.goBack();
  }, [setStickers, nav]);

  const renderItem = useCallback(
    ({ item }: { item: Sticker }) => (
      <StickerComponent sticker={item} size={CELL} onPress={handlePress} onLongPress={handleLongPress} />
    ),
    [CELL, handlePress, handleLongPress],
  );

  const listContentStyle = useMemo(
    () => ({ padding: PAD, gap: GAP, paddingBottom: insets.bottom + 80 }),
    [insets.bottom],
  );

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      <View style={[styles.header, { backgroundColor: t.paper }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: t.ink, fontFamily: fonts.headline }]}>Marcar rápido</Text>
          <Text style={[styles.sub, { color: t.ink4, fontFamily: fonts.body }]}>falta → tengo → repetida</Text>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por código (ARG), selección o nº…"
          placeholderTextColor={t.ink4}
          style={[styles.search, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, {
            backgroundColor: selectedTeam === null ? t.primary : t.paper2,
            borderColor: t.line,
          }]}
          onPress={() => setSelectedTeam(null)}
        >
          <Text style={[styles.chipCode, { color: selectedTeam === null ? t.pitch : t.ink3, fontFamily: fonts.semibold }]}>
            Todas
          </Text>
        </TouchableOpacity>

        {TEAMS.map(team => {
          const active = selectedTeam === team.code;
          const teamStickers = local.filter(s => s.team === team.code);
          const ownedCount   = teamStickers.filter(s => s.state !== 'missing').length;
          return (
            <TouchableOpacity
              key={team.code}
              style={[styles.chip, {
                backgroundColor: active ? t.ink : t.card,
                borderColor: active ? t.ink : t.line,
              }]}
              onPress={() => setSelectedTeam(active ? null : team.code)}
            >
              <Flag colors={team.colors} width={20} height={14} />
              <Text style={[styles.chipCode, { color: active ? '#fff' : t.ink, fontFamily: fonts.semibold }]}>
                {team.code}
              </Text>
              <Text style={[styles.chipCount, { color: active ? 'rgba(255,255,255,0.55)' : t.ink4, fontFamily: fonts.mono }]}>
                {ownedCount}/{teamStickers.length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        numColumns={COLS}
        contentContainerStyle={listContentStyle}
        columnWrapperStyle={styles.colWrapper}
        renderItem={renderItem}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, backgroundColor: t.paper }]}>
        {sessionAdded > 0 && (
          <Text style={[styles.counter, { color: t.ink3, fontFamily: fonts.mono }]}>
            esta sesión +{sessionAdded} estampas marcadas
          </Text>
        )}
        <HapticPress style={[styles.doneBtn, { backgroundColor: t.pitch }]} onPress={handleDone}>
          <Text style={[styles.doneBtnText, { color: t.paper, fontFamily: fonts.semibold }]}>Guardar cambios</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  header:     { padding: 16, paddingBottom: 10 },
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  title:      { fontSize: 19 },
  sub:        { fontSize: 11 },
  search:     {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  chipsRow:   { flexGrow: 0 },
  chips:      { paddingHorizontal: PAD, paddingBottom: 10, gap: 6, flexDirection: 'row' },
  chip:       {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 0.5,
  },
  chipCode:   { fontSize: 12 },
  chipCount:  { fontSize: 9, marginTop: 1 },
  footer:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  counter:    { fontSize: 11, textAlign: 'center', marginBottom: 8, letterSpacing: 0.2 },
  doneBtn:    { borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  doneBtnText:{ fontSize: 16 },
  colWrapper: { gap: GAP },
});
