import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
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
  const initialStates = useRef(new Map(stickers.map(s => [s.id, s.state])));

  const sessionAdded = useMemo(
    () => local.filter(s =>
      initialStates.current.get(s.id) === 'missing' &&
      (s.state === 'owned' || s.state === 'duplicate')
    ).length,
    [local],
  );

  const filtered = useMemo(
    () => selectedTeam ? local.filter(s => s.team === selectedTeam) : local,
    [local, selectedTeam],
  );

  const handlePress = useCallback((sticker: Sticker) => {
    setLocal(prev => prev.map(s => s.id === sticker.id ? cycleQuick(s) : s));
  }, []);

  const localRef = useRef(local);
  useEffect(() => { localRef.current = local; }, [local]);
  const handleDone = useCallback(() => {
    setStickers(localRef.current);
    nav.goBack();
  }, [setStickers, nav]);

  const renderItem = useCallback(
    ({ item }: { item: Sticker }) => (
      <StickerComponent sticker={item} size={CELL} onPress={handlePress} />
    ),
    [CELL, handlePress],
  );

  const listContentStyle = useMemo(
    () => ({ padding: PAD, gap: GAP, paddingBottom: insets.bottom + 80 }),
    [insets.bottom],
  );

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      <View style={[styles.header, { backgroundColor: t.paper }]}>
        <Text style={[styles.title, { color: t.ink, fontFamily: fonts.headline }]}>Marcar rápido</Text>
        <Text style={[styles.sub, { color: t.ink4, fontFamily: fonts.body }]}>
          Toca para ciclar: falta → tengo → repetida
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, {
            backgroundColor: selectedTeam === null ? t.pitch : t.paper2,
            borderColor: t.line,
          }]}
          onPress={() => setSelectedTeam(null)}
        >
          <Text style={[styles.chipLabel, {
            color: selectedTeam === null ? t.paper : t.ink3,
            fontFamily: fonts.semibold,
          }]}>
            Todas
          </Text>
        </TouchableOpacity>

        {TEAMS.map(team => {
          const active = selectedTeam === team.code;
          return (
            <TouchableOpacity
              key={team.code}
              style={[styles.chip, {
                backgroundColor: active ? t.pitch : t.paper2,
                borderColor: t.line,
              }]}
              onPress={() => setSelectedTeam(team.code)}
            >
              <Flag colors={team.colors} width={20} height={13} />
              <Text style={[styles.chipLabel, {
                color: active ? t.paper : t.ink3,
                fontFamily: fonts.semibold,
                marginLeft: 4,
              }]}>
                {team.code}
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
  container:   { flex: 1 },
  header:      { padding: 16, paddingBottom: 8 },
  title:       { fontSize: 20 },
  sub:         { fontSize: 13, marginTop: 4 },
  chipsRow:    { flexGrow: 0 },
  chips:       { paddingHorizontal: PAD, paddingBottom: 10, gap: 6, flexDirection: 'row' },
  chip:        {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 0.5,
  },
  chipLabel:   { fontSize: 11 },
  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  counter:     { fontSize: 11, textAlign: 'center', marginBottom: 8, letterSpacing: 0.2 },
  doneBtn:     { borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { fontSize: 16 },
  colWrapper:  { gap: GAP },
});
