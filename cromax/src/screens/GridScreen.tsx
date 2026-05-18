import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { useTheme, fonts } from '../theme';
import { TEAMS }           from '../data/album';
import type { Sticker }    from '../data/album';
import { Flag }            from '../components/Flag';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }     from '../components/HapticPress';
import { useNavigation }   from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList }  from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'owned' | 'missing' | 'duplicate';

const COLS = 6;
const GAP  = 6;
const PAD  = 16;
const W    = Dimensions.get('window').width;
const CELL = Math.floor((W - PAD * 2 - GAP * 5) / 6);

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'owned',     label: 'Tengo' },
  { key: 'missing',   label: 'Faltan' },
  { key: 'duplicate', label: 'Repetidas' },
];

// ─── helpers ────────────────────────────────────────────────────────────────

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

// ─── Team section header ─────────────────────────────────────────────────────

interface SectionHeaderProps {
  teamCode: string;
  sectionStickers: Sticker[];
}

function TeamSectionHeader({ teamCode, sectionStickers }: SectionHeaderProps) {
  const t = useTheme();

  const isSpecial = teamCode === '★';
  const team = isSpecial ? null : TEAMS.find(tm => tm.code === teamCode);
  const owned = sectionStickers.filter(s => s.state === 'owned' || s.state === 'duplicate').length;
  const total = sectionStickers.length;

  return (
    <View style={styles.sectionHeader}>
      {isSpecial ? (
        <View style={[styles.specialIcon, { backgroundColor: t.primary }]} />
      ) : (
        <Flag colors={team!.colors} width={28} height={18} />
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
  const t      = useTheme();
  const insets = useSafeAreaInsets();
  const nav    = useNavigation<Nav>();
  const stickers = useAlbumStore(s => s.stickers);

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  // Pre-filter counts (before search, just for chip badges)
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

  // Group visible stickers into ordered sections
  const sections = useMemo(() => {
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

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: t.paper }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar estampa…"
          placeholderTextColor={t.ink4}
          style={[styles.search, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
        />

        {/* Filter chips */}
        <View style={styles.filters}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <HapticPress
                key={f.key}
                style={[styles.chip, { backgroundColor: active ? t.pitch : t.paper2, flex: 1 }]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={{
                  color: active ? '#EFE7D2' : t.ink3,
                  fontSize: 12,
                  fontFamily: fonts.semibold,
                  letterSpacing: -0.1,
                  textAlign: 'center',
                }}>
                  {f.label}
                </Text>
                <Text style={{
                  color: active ? '#EFE7D2' : t.ink3,
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  textAlign: 'center',
                  opacity: active ? 0.7 : 0.55,
                  marginTop: 1,
                }}>
                  {chipCounts[f.key]}
                </Text>
              </HapticPress>
            );
          })}
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: t.ink3 }]}>Sin resultados.</Text>
          </View>
        ) : (
          sections.map(section => (
            <View key={section.key} style={styles.section}>
              <TeamSectionHeader
                teamCode={section.key}
                sectionStickers={section.stickers}
              />
              <View style={styles.stickerGrid}>
                {section.stickers.map(item => (
                  <StickerComponent
                    key={item.id}
                    sticker={item}
                    size={CELL}
                    onPress={() => nav.navigate('StickerModal', { stickerId: item.id })}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  filters:     { flexDirection: 'row', gap: 6 },
  chip:        { paddingHorizontal: 8, paddingVertical: 7, borderRadius: 20, alignItems: 'center' },
  scrollContent: { paddingHorizontal: PAD, paddingTop: 12 },

  // Section
  section:      { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  specialIcon:  { width: 20, height: 20, borderRadius: 5 },
  sectionName:  { fontSize: 15, flex: 1 },
  sectionCount: { fontSize: 11 },

  // Sticker grid
  stickerGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },

  // Empty state
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText:   { fontSize: 14, fontFamily: fonts.body },
});
