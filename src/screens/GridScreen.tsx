import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, SectionList,
  StyleSheet, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { useTheme, fonts } from '../theme';
import { TEAMS }           from '../data/album';
import type { Sticker }    from '../data/album';
import { Flag }            from '../components/Flag';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }     from '../components/HapticPress';
import { Topbar }          from '../components/Topbar';
import { useNavigation }   from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList }  from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'owned' | 'missing' | 'duplicate';

const COLS = 6;
const GAP  = 6;
const PAD  = 16;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'owned',     label: 'Pegadas' },
  { key: 'missing',   label: 'Faltan' },
  { key: 'duplicate', label: 'Repetidas' },
];

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Chip badge counts = exact state match.
 * Section header "owned" count = owned + duplicate ("have it").
 * These differ intentionally: the chip badge answers "how many in this state?",
 * while the section header answers "how many do you have (any copy)?".
 */
function filterCount(stickers: Sticker[], f: Filter): number {
  if (f === 'all') return stickers.length;
  return stickers.filter(s => s.state === f).length;
}

function stickerMatches(s: Sticker, q: string): boolean {
  return (
    s.name.toLowerCase().includes(q) ||
    s.label.toLowerCase().includes(q) ||
    String(s.id).includes(q) ||
    (s.team ?? '').toLowerCase().includes(q)
  );
}

function chunkRows(arr: Sticker[], size: number): Sticker[][] {
  const rows: Sticker[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// ─── Team section header ─────────────────────────────────────────────────────

interface SectionHeaderProps {
  teamCode: string;
  sectionStickers: Sticker[];
}

function TeamSectionHeader({ teamCode, sectionStickers }: SectionHeaderProps) {
  const t = useTheme();

  const isSpecial = teamCode === '★';
  const team = isSpecial ? null : TEAMS.find(tm => tm.code === teamCode);
  // Section header counts both owned and duplicate as "have it"
  const owned = sectionStickers.filter(s => s.state !== 'missing').length;
  const total = sectionStickers.length;

  return (
    <View style={styles.sectionHeader}>
      {isSpecial ? (
        <View style={[styles.specialIcon, { backgroundColor: t.primary }]} />
      ) : (
        <Flag colors={team?.colors ?? ['#888888', '#888888', '#888888']} width={28} height={18} />
      )}
      <Text style={[styles.sectionName, { color: t.ink, fontFamily: fonts.headline }]}>
        {isSpecial ? 'Especiales · Leyendas' : (team?.name ?? teamCode)}
      </Text>
      <Text style={[styles.sectionCount, { color: t.ink3, fontFamily: fonts.mono }]}>
        {owned}/{total}
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function GridScreen() {
  const t            = useTheme();
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const nav          = useNavigation<Nav>();
  const stickers = useAlbumStore(s => s.stickers);
  const { width } = useWindowDimensions();

  // CELL is derived from the live window width so it reacts to orientation changes
  const CELL = useMemo(() => Math.floor((width - PAD * 2 - GAP * 5) / 6), [width]);

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [scrolled, setScrolled] = React.useState(false);

  // Pre-filter counts (before search, just for chip badges — exact state match)
  const chipCounts = useMemo<Record<Filter, number>>(() => ({
    all:       filterCount(stickers, 'all'),
    owned:     filterCount(stickers, 'owned'),
    missing:   filterCount(stickers, 'missing'),
    duplicate: filterCount(stickers, 'duplicate'),
  }), [stickers]);

  // Visible stickers after filter + search
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stickers.filter(s => {
      if (filter !== 'all' && s.state !== filter) return false;
      if (q) return stickerMatches(s, q);
      return true;
    });
  }, [stickers, filter, query]);

  // Group visible stickers into ordered sections chunked into rows for SectionList
  const orderedSections = useMemo(() => {
    const map = new Map<string, Sticker[]>();

    for (const team of TEAMS) {
      map.set(team.code, []);
    }
    map.set('★', []);

    for (const s of visible) {
      const key = s.team ?? '★';
      const bucket = map.get(key);
      if (bucket) {
        bucket.push(s);
      } else {
        // unknown team key — fall back to specials bucket
        map.get('★')!.push(s);
      }
    }

    // Build ordered array, skip empty buckets
    const result: Array<{ key: string; stickers: Sticker[] }> = [];
    for (const team of TEAMS) {
      const bucket = map.get(team.code)!;
      if (bucket.length > 0) result.push({ key: team.code, stickers: bucket });
    }
    const special = map.get('★')!;
    if (special.length > 0) result.push({ key: '★', stickers: special });

    return result;
  }, [visible]);

  // Transform sections into SectionList format with rows chunked to COLS
  const sections = useMemo(
    () => orderedSections.map(s => ({ key: s.key, data: chunkRows(s.stickers, COLS) })),
    [orderedSections],
  );

  const ListHeader = (
    <View style={[styles.header, { backgroundColor: t.paper }]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar estampa…"
        placeholderTextColor={t.ink4}
        style={[styles.search, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
      />

      {/* Filter — segmented control */}
      <View style={[styles.filterWrap, { backgroundColor: t.card }]}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <HapticPress
              key={f.key}
              style={[styles.chip, active && { backgroundColor: t.pitch, shadowColor: t.pitch, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipLabel, { color: active ? '#fff' : t.ink2 }]}>
                {f.label}
              </Text>
              <Text style={[styles.chipCount, { color: active ? 'rgba(255,255,255,0.65)' : t.ink4 }]}>
                {chipCounts[f.key]}
              </Text>
            </HapticPress>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      <Topbar title="Cuadrícula" scrolled={scrolled} />
      <SectionList
        sections={sections}
        keyExtractor={(row, index) => `row-${index}-${row[0]?.id ?? index}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: t.ink3 }]}>Sin resultados.</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <TeamSectionHeader
            teamCode={section.key}
            sectionStickers={section.data.flat()}
          />
        )}
        renderItem={({ item: row }) => (
          <View style={[styles.row, { paddingHorizontal: PAD, gap: GAP, marginBottom: GAP }]}>
            {row.map(sticker => (
              <StickerComponent
                key={sticker.id}
                sticker={sticker}
                size={CELL}
                onPress={() => nav.navigate('StickerModal', { stickerId: sticker.id })}
              />
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 6)}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: PAD, paddingBottom: 8 },
  search:      {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
    fontFamily: fonts.body,
  },
  filterWrap:  { flexDirection: 'row', borderRadius: 13, padding: 3, gap: 2 },
  chip:        { flex: 1, paddingVertical: 9, paddingHorizontal: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chipLabel:   { fontSize: 12, fontFamily: fonts.semibold, letterSpacing: -0.2, textAlign: 'center' },
  chipCount:   { fontSize: 10, fontFamily: fonts.mono, textAlign: 'center', marginTop: 2 },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: PAD,
    paddingTop: 12,
  },
  specialIcon:  { width: 20, height: 20, borderRadius: 5 },
  sectionName:  { fontSize: 15, flex: 1 },
  sectionCount: { fontSize: 11 },

  // Row inside a section
  row: { flexDirection: 'row' },

  // Empty state
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText:   { fontSize: 14, fontFamily: fonts.body },
});
