# Cromax — React Native Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Cromax HTML/CSS/React prototype to a publishable Expo + React Native app for iOS and Android, preserving the full Mexican folk aesthetic and feature set.

**Architecture:** Expo Managed Workflow with TypeScript throughout. Local-only persistence via AsyncStorage — no backend. QR bitmask encoding lets users share missing-sticker lists with friends at fixed payload size regardless of album size. All prototype logic (album generation, stats, trade matching) migrates as pure TypeScript functions.

**Tech Stack:** Expo SDK 51, React Native, TypeScript, React Navigation v6, @gorhom/bottom-sheet, react-native-reanimated, react-native-gesture-handler, expo-haptics, expo-font, react-native-svg, react-native-qrcode-svg, expo-camera, @react-native-async-storage/async-storage, EAS Build + Submit.

---

## File Structure

```
cromax/                                   ← Expo app root (subfolder of repo)
├── app.json                              ← Expo config: name, slug, icons, camera perms
├── App.tsx                               ← Entry point: onboarding gate + ThemeContext + navigator
├── babel.config.js                       ← Expo preset (auto-generated)
├── tsconfig.json                         ← strict TypeScript
├── eas.json                              ← EAS build profiles
├── src/
│   ├── theme.ts                          ← CSS vars → JS objects (lightTheme, darkTheme, ThemeContext)
│   ├── data/
│   │   └── album.ts                      ← Pure TS: types, mulberry RNG, generateAlbum, computeStats, cycleQuick
│   ├── utils/
│   │   └── qr.ts                         ← Pure TS: encodeQR (bitmask→base64), decodeQR (base64→Friend)
│   ├── store/
│   │   └── useAlbumStore.ts              ← Zustand + AsyncStorage: stickers, friends, profile, dark mode
│   ├── components/
│   │   ├── HapticPress.tsx               ← Pressable + Animated.spring scale + expo-haptics
│   │   ├── Sticker.tsx                   ← 5:7 cell with owned/missing/duplicate states
│   │   ├── ProgressRing.tsx              ← SVG progress ring
│   │   ├── Flag.tsx                      ← Three-stripe flag component
│   │   ├── MxPattern.tsx                 ← Folk corner SVG motifs
│   │   ├── MxBunting.tsx                 ← Papel picado banner SVG
│   │   └── SectionHeader.tsx             ← Section title + trailing slot
│   ├── navigation/
│   │   ├── RootNavigator.tsx             ← Stack root: MainTabs + modal screens
│   │   ├── MainTabs.tsx                  ← Bottom tab navigator with CustomTabBar
│   │   └── CustomTabBar.tsx              ← Pitch-black bar with animated marigold pill
│   ├── screens/
│   │   ├── HomeScreen.tsx                ← Hero green + stats ring + trade matches preview
│   │   ├── GridScreen.tsx                ← 6-col FlatList + search + owned/missing/dupe filter
│   │   ├── TradeScreen.tsx               ← Friends list + how-it-works callout
│   │   └── ProfileScreen.tsx             ← Onboarding data + dark toggle + tip section
│   ├── sheets/
│   │   ├── StickerSheet.tsx              ← Sticker detail: state toggle + duplicate stepper
│   │   ├── QuickAddSheet.tsx             ← Rapid mark: tap-cycle through selection
│   │   ├── FriendDetailSheet.tsx         ← 1:1 trade: my dupes their missing + vice versa
│   │   ├── ShareSheet.tsx                ← Show generated QR from bitmask encode
│   │   └── ScanSheet.tsx                 ← expo-camera barcode scan → decode → save friend
│   └── onboarding/
│       ├── OnboardingFlow.tsx            ← Slide-transition orchestrator, writes profile to store
│       ├── OnboardWelcome.tsx            ← Step 1: hero + CTA
│       ├── OnboardAlbum.tsx              ← Step 2: album selection (Mundial 2026 only active)
│       ├── OnboardName.tsx               ← Step 3: name TextInput
│       ├── OnboardAge.tsx                ← Step 4: age range picker
│       └── OnboardReady.tsx              ← Step 5: confirmation + start
└── __tests__/
    ├── album.test.ts                     ← Unit tests for generateAlbum, computeStats, cycleQuick
    └── qr.test.ts                        ← Round-trip tests for encodeQR / decodeQR
```

---

## Task 1: Scaffold Expo app and install all dependencies

**Files:**
- Create: `cromax/` (via `create-expo-app`)
- Modify: `cromax/tsconfig.json`

- [ ] **Step 1: Scaffold the app**

Run from the repo root (`/Users/raulpimentel/Documents/GitHub/Estampas`):
```bash
npx create-expo-app cromax --template blank-typescript
```
Expected: `cromax/` directory created with `App.tsx`, `app.json`, `package.json`, `tsconfig.json`.

- [ ] **Step 2: Install navigation**
```bash
cd cromax
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```
Expected: packages added to `package.json`, no peer-dep errors.

- [ ] **Step 3: Install storage + SVG + sheets**
```bash
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-svg
npx expo install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```
Expected: packages added, no errors.

- [ ] **Step 4: Install haptics, fonts, camera, QR**
```bash
npx expo install expo-haptics expo-font expo-camera
npx expo install react-native-qrcode-svg
```
Expected: packages added.

- [ ] **Step 5: Install Zustand for store**
```bash
npm install zustand
```
Expected: zustand added to dependencies.

- [ ] **Step 6: Install jest-expo for testing**
```bash
npm install --save-dev jest-expo @types/jest
```

- [ ] **Step 7: Configure jest in `package.json`**

Open `cromax/package.json` and add inside the top-level object:
```json
"jest": {
  "preset": "jest-expo",
  "testPathPattern": "__tests__"
}
```

- [ ] **Step 8: Tighten TypeScript**

Replace the contents of `cromax/tsconfig.json` with:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 9: Create src directory tree**
```bash
mkdir -p src/data src/utils src/store src/components src/navigation src/screens src/sheets src/onboarding
mkdir -p __tests__
```

- [ ] **Step 10: Verify Expo starts**
```bash
npx expo start --no-dev
```
Expected: Metro bundler starts, QR code shown. Press `Ctrl+C` after confirming.

- [ ] **Step 11: Commit**
```bash
cd ..
git add cromax/
git commit -m "feat: scaffold Cromax Expo app with all dependencies"
```

---

## Task 2: Theme system

**Files:**
- Create: `cromax/src/theme.ts`

- [ ] **Step 1: Write `src/theme.ts`**

```ts
import React, { createContext, useContext } from 'react';

export const lightTheme = {
  paper:   '#EFE7D2',
  paper2:  '#E5DCC2',
  card:    '#FBF5E4',
  ink:     '#102A1F',
  ink2:    '#2F4338',
  ink3:    '#6A7569',
  ink4:    '#9AA39B',
  line:    'rgba(16,42,31,0.10)',
  primary: '#E89B2F',
  lime:    '#B5DA40',
  coral:   '#D7263D',
  gold:    '#E89B2F',
  pitch:   '#0E5B3A',
  pitch2:  '#1A7B4F',
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  paper:  '#0D1715',
  paper2: '#142220',
  card:   '#172724',
  ink:    '#F0E8D2',
  ink2:   '#C7BFA8',
  ink3:   '#8F8973',
  ink4:   '#5F5C4F',
  pitch:  '#1A7B4F',
};

export type Theme = typeof lightTheme;

export const ThemeContext = createContext<Theme>(lightTheme);
export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/theme.ts
git commit -m "feat: add Cromax theme (light + dark) with ThemeContext"
```

---

## Task 3: Data layer — types, album generation, stats

**Files:**
- Create: `cromax/src/data/album.ts`
- Create: `cromax/__tests__/album.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `cromax/__tests__/album.test.ts`:
```ts
import { generateAlbum, computeStats, cycleQuick, Sticker } from '../src/data/album';

describe('generateAlbum', () => {
  it('generates stickers with unique sequential ids', () => {
    const stickers = generateAlbum(42);
    expect(stickers.length).toBeGreaterThan(0);
    const ids = stickers.map(s => s.id);
    expect(new Set(ids).size).toBe(stickers.length);
    expect(ids[0]).toBe(1);
    expect(ids[ids.length - 1]).toBe(stickers.length);
  });

  it('is deterministic — same seed same output', () => {
    const a = generateAlbum(42);
    const b = generateAlbum(42);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('all stickers start as missing', () => {
    const stickers = generateAlbum(42);
    stickers.forEach(s => {
      expect(s.state).toBe('missing');
      expect(s.count).toBe(0);
    });
  });
});

describe('computeStats', () => {
  it('counts owned, missing, dupes, pct correctly', () => {
    const stickers: Sticker[] = [
      { id: 1, type: 'player', team: 'MEX', label: 'A', name: 'Player A', state: 'owned',     count: 0 },
      { id: 2, type: 'player', team: 'MEX', label: 'B', name: 'Player B', state: 'missing',   count: 0 },
      { id: 3, type: 'shield', team: 'MEX', label: 'C', name: 'Shield',   state: 'duplicate', count: 2 },
    ];
    const stats = computeStats(stickers);
    expect(stats.owned).toBe(1);
    expect(stats.missing).toBe(1);
    expect(stats.dupes).toBe(2);
    expect(stats.pct).toBeCloseTo(33.33, 0);
  });
});

describe('cycleQuick', () => {
  it('cycles missing → owned → duplicate → missing', () => {
    const base: Sticker = { id: 1, type: 'player', team: 'MEX', label: 'A', name: 'P', state: 'missing', count: 0 };
    const owned = cycleQuick(base);
    expect(owned.state).toBe('owned');
    const dup = cycleQuick(owned);
    expect(dup.state).toBe('duplicate');
    expect(dup.count).toBe(1);
    const miss = cycleQuick(dup);
    expect(miss.state).toBe('missing');
    expect(miss.count).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
cd cromax && npx jest __tests__/album.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '../src/data/album'"

- [ ] **Step 3: Write `src/data/album.ts`**

```ts
export type StickerType = 'player' | 'shield' | 'special' | 'legend';
export type StickerState = 'owned' | 'missing' | 'duplicate';

export interface Sticker {
  id: number;
  type: StickerType;
  team: string | null;
  teamNum?: number;
  label: string;
  name: string;
  state: StickerState;
  count: number;
}

export interface Friend {
  id: string;
  name: string;
  missing: number[];
  dupes: { id: number; count: number }[];
  scannedAt: string;
}

export interface AlbumStats {
  total: number;
  owned: number;
  missing: number;
  dupes: number;
  pct: number;
}

export interface Profile {
  albumId: string;
  name: string;
  age: string;
}

// Mulberry32 deterministic RNG
export function mulberry(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAMS = [
  { code: 'MEX', name: 'México',        players: 20 },
  { code: 'ARG', name: 'Argentina',     players: 20 },
  { code: 'BRA', name: 'Brasil',        players: 20 },
  { code: 'FRA', name: 'Francia',       players: 20 },
  { code: 'ESP', name: 'España',        players: 20 },
  { code: 'ENG', name: 'Inglaterra',    players: 20 },
  { code: 'GER', name: 'Alemania',      players: 20 },
  { code: 'USA', name: 'EUA',           players: 20 },
  { code: 'POR', name: 'Portugal',      players: 20 },
  { code: 'NED', name: 'Países Bajos',  players: 20 },
  { code: 'BEL', name: 'Bélgica',       players: 20 },
  { code: 'CRO', name: 'Croacia',       players: 20 },
  { code: 'URU', name: 'Uruguay',       players: 20 },
  { code: 'COL', name: 'Colombia',      players: 20 },
  { code: 'SEN', name: 'Senegal',       players: 20 },
  { code: 'JPN', name: 'Japón',         players: 20 },
];

const FIRST_NAMES = ['Carlos','Luis','Juan','Diego','Andrés','Miguel','Jorge','Roberto','Fernando','Sergio','Raúl','Javier','Eduardo','Marco','Alexis','Gabriel','Héctor','Daniel','Pablo','Mateo'];
const LAST_NAMES  = ['García','Martínez','López','Hernández','González','Rodríguez','Pérez','Sánchez','Torres','Ramírez','Flores','Cruz','Morales','Reyes','Jiménez','Ortega','Silva','Castro','Vargas','Mendoza'];

export function generateAlbum(seed: number): Sticker[] {
  const rng = mulberry(seed);
  const pick = <T>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const stickers: Sticker[] = [];
  let id = 1;

  // Opening: 5 special cards
  const specials = ['Trofeo FIFA','Mascota Oficial','Estadio Azteca','El Tri Historia','All-Star XI'];
  specials.forEach(name => {
    stickers.push({ id: id++, type: 'special', team: null, label: `S${id - 1}`, name, state: 'missing', count: 0 });
  });

  // Per-team: 1 shield + N players
  TEAMS.forEach((team, ti) => {
    stickers.push({
      id: id++, type: 'shield', team: team.code, teamNum: ti + 1,
      label: team.code, name: team.name, state: 'missing', count: 0,
    });
    for (let p = 0; p < team.players; p++) {
      stickers.push({
        id: id++, type: 'player', team: team.code, teamNum: ti + 1,
        label: `${team.code}${p + 1}`,
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        state: 'missing', count: 0,
      });
    }
  });

  // Closing: 10 legend cards
  for (let i = 0; i < 10; i++) {
    stickers.push({
      id: id++, type: 'legend', team: null,
      label: `L${i + 1}`, name: `Leyenda ${i + 1}`,
      state: 'missing', count: 0,
    });
  }

  return stickers;
}

export function computeStats(stickers: Sticker[]): AlbumStats {
  const total = stickers.length;
  const owned   = stickers.filter(s => s.state === 'owned').length;
  const missing = stickers.filter(s => s.state === 'missing').length;
  const dupes   = stickers.filter(s => s.state === 'duplicate').reduce((acc, s) => acc + s.count, 0);
  const pct     = total > 0 ? (owned / total) * 100 : 0;
  return { total, owned, missing, dupes, pct };
}

export function cycleQuick(sticker: Sticker): Sticker {
  if (sticker.state === 'missing')   return { ...sticker, state: 'owned',     count: 0 };
  if (sticker.state === 'owned')     return { ...sticker, state: 'duplicate', count: 1 };
  // duplicate → missing
  return { ...sticker, state: 'missing', count: 0 };
}
```

- [ ] **Step 4: Run tests to verify they pass**
```bash
npx jest __tests__/album.test.ts --no-coverage
```
Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**
```bash
cd .. && git add cromax/src/data/album.ts cromax/__tests__/album.test.ts
git commit -m "feat: data layer — album types, generateAlbum, computeStats, cycleQuick"
```

---

## Task 4: QR encode/decode utilities

**Files:**
- Create: `cromax/src/utils/qr.ts`
- Create: `cromax/__tests__/qr.test.ts`

- [ ] **Step 1: Write failing tests**

Create `cromax/__tests__/qr.test.ts`:
```ts
import { encodeQR, decodeQR } from '../src/utils/qr';
import { generateAlbum, Sticker } from '../src/data/album';

describe('encodeQR / decodeQR round-trip', () => {
  it('encodes and decodes missing stickers correctly', () => {
    const stickers = generateAlbum(42);
    // Manually set some stickers
    stickers[0].state = 'missing';
    stickers[1].state = 'owned';
    stickers[5].state = 'missing';
    stickers[10].state = 'duplicate';
    stickers[10].count = 2;

    const raw = encodeQR('Martín', stickers);
    const friend = decodeQR(raw);

    expect(friend).not.toBeNull();
    expect(friend!.name).toBe('Martín');
    expect(friend!.missing).toContain(stickers[0].id);
    expect(friend!.missing).not.toContain(stickers[1].id);
    expect(friend!.missing).toContain(stickers[5].id);
    expect(friend!.dupes).toEqual(
      expect.arrayContaining([{ id: stickers[10].id, count: 2 }])
    );
  });

  it('returns null for invalid QR data', () => {
    expect(decodeQR('not json')).toBeNull();
    expect(decodeQR('{"v":2,"m":"xx"}')).toBeNull();
    expect(decodeQR('{"v":1}')).toBeNull();
  });

  it('truncates name to 30 chars', () => {
    const stickers = generateAlbum(1);
    const raw = encodeQR('A'.repeat(50), stickers);
    const friend = decodeQR(raw);
    expect(friend!.name.length).toBeLessThanOrEqual(30);
  });

  it('payload stays under 500 chars even with 700 missing', () => {
    const stickers = generateAlbum(1);
    stickers.forEach((s, i) => {
      if (i < 700) s.state = 'missing';
    });
    const raw = encodeQR('Test', stickers);
    expect(raw.length).toBeLessThan(500);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**
```bash
cd cromax && npx jest __tests__/qr.test.ts --no-coverage
```
Expected: FAIL — "Cannot find module '../src/utils/qr'"

- [ ] **Step 3: Write `src/utils/qr.ts`**

```ts
import { Sticker, Friend } from '../data/album';

export function encodeQR(name: string, stickers: Sticker[]): string {
  const total = stickers.length;
  const bytes = new Uint8Array(Math.ceil(total / 8));
  stickers.forEach((s, i) => {
    if (s.state === 'missing') bytes[i >> 3] |= (1 << (i & 7));
  });
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  const m = btoa(binary);
  const dupeParts = stickers
    .filter(s => s.state === 'duplicate' && s.count > 0)
    .map(s => `${s.id}:${s.count}`);
  const d = dupeParts.join(',');
  return JSON.stringify({ v: 1, n: name.slice(0, 30), m, d: d || '' });
}

export function decodeQR(raw: string): Omit<Friend, 'id' | 'scannedAt'> | null {
  try {
    const parsed = JSON.parse(raw) as { v?: number; n?: string; m?: string; d?: string };
    if (parsed.v !== 1 || typeof parsed.m !== 'string') return null;
    const binary = atob(parsed.m);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const missing: number[] = [];
    bytes.forEach((byte, bi) => {
      for (let bit = 0; bit < 8; bit++) {
        if (byte & (1 << bit)) missing.push(bi * 8 + bit + 1);
      }
    });
    const dupes = parsed.d
      ? parsed.d.split(',').filter(Boolean).map(p => {
          const [idStr, countStr] = p.split(':');
          return { id: Number(idStr), count: Number(countStr) };
        })
      : [];
    return { name: String(parsed.n ?? 'Amigo').slice(0, 30), missing, dupes };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**
```bash
npx jest __tests__/qr.test.ts --no-coverage
```
Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**
```bash
cd .. && git add cromax/src/utils/qr.ts cromax/__tests__/qr.test.ts
git commit -m "feat: QR bitmask encode/decode — fixed payload size regardless of missing count"
```

---

## Task 5: Zustand store with AsyncStorage persistence

**Files:**
- Create: `cromax/src/store/useAlbumStore.ts`

- [ ] **Step 1: Write `src/store/useAlbumStore.ts`**

```ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sticker, Friend, Profile, generateAlbum } from '../data/album';

const KEYS = {
  stickers: 'cromax.stickers',
  friends:  'cromax.friends',
  profile:  'cromax.profile',
  dark:     'cromax.dark',
} as const;

interface AlbumStore {
  stickers:    Sticker[];
  friends:     Friend[];
  profile:     Profile | null;
  dark:        boolean;
  hydrated:    boolean;

  // Actions
  hydrate:         () => Promise<void>;
  updateSticker:   (id: number, patch: Partial<Sticker>) => void;
  setStickers:     (stickers: Sticker[]) => void;
  addFriend:       (friend: Friend) => void;
  removeFriend:    (id: string) => void;
  setProfile:      (p: Profile) => void;
  toggleDark:      () => void;
}

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  stickers:  [],
  friends:   [],
  profile:   null,
  dark:      false,
  hydrated:  false,

  hydrate: async () => {
    const [rawStickers, rawFriends, rawProfile, rawDark] = await Promise.all([
      AsyncStorage.getItem(KEYS.stickers),
      AsyncStorage.getItem(KEYS.friends),
      AsyncStorage.getItem(KEYS.profile),
      AsyncStorage.getItem(KEYS.dark),
    ]);

    const stickers: Sticker[] = rawStickers
      ? JSON.parse(rawStickers)
      : generateAlbum(42);

    if (!rawStickers) {
      await AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
    }

    set({
      stickers,
      friends:  rawFriends  ? JSON.parse(rawFriends)  : [],
      profile:  rawProfile  ? JSON.parse(rawProfile)  : null,
      dark:     rawDark === '1',
      hydrated: true,
    });
  },

  updateSticker: (id, patch) => {
    const stickers = get().stickers.map(s => s.id === id ? { ...s, ...patch } : s);
    set({ stickers });
    AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
  },

  setStickers: (stickers) => {
    set({ stickers });
    AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
  },

  addFriend: (friend) => {
    const friends = [...get().friends.filter(f => f.name !== friend.name), friend];
    set({ friends });
    AsyncStorage.setItem(KEYS.friends, JSON.stringify(friends));
  },

  removeFriend: (id) => {
    const friends = get().friends.filter(f => f.id !== id);
    set({ friends });
    AsyncStorage.setItem(KEYS.friends, JSON.stringify(friends));
  },

  setProfile: (profile) => {
    set({ profile });
    AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
  },

  toggleDark: () => {
    const dark = !get().dark;
    set({ dark });
    AsyncStorage.setItem(KEYS.dark, dark ? '1' : '0');
  },
}));
```

- [ ] **Step 2: Commit**
```bash
cd .. && git add cromax/src/store/useAlbumStore.ts
git commit -m "feat: Zustand store with AsyncStorage persistence (stickers, friends, profile, dark)"
```

---

## Task 6: HapticPress and Sticker components

**Files:**
- Create: `cromax/src/components/HapticPress.tsx`
- Create: `cromax/src/components/Sticker.tsx`

- [ ] **Step 1: Write `src/components/HapticPress.tsx`**

```tsx
import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends PressableProps {
  style?: ViewStyle;
  children: React.ReactNode;
  haptic?: boolean;
}

export function HapticPress({ children, style, onPress, haptic = true, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };
  const handlePress = (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Write `src/components/Sticker.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sticker as StickerData } from '../data/album';
import { useTheme } from '../theme';
import { HapticPress } from './HapticPress';

interface Props {
  sticker: StickerData;
  size?: number;
  onPress?: (sticker: StickerData) => void;
}

export function Sticker({ sticker, size = 52, onPress }: Props) {
  const t = useTheme();
  const w = size;
  const h = Math.round(size * 1.4); // 5:7 ratio

  const bg =
    sticker.state === 'owned'     ? t.lime  :
    sticker.state === 'duplicate' ? t.gold  :
    t.paper2;

  const textColor =
    sticker.state === 'owned'     ? t.pitch :
    sticker.state === 'duplicate' ? t.pitch :
    t.ink4;

  return (
    <HapticPress onPress={() => onPress?.(sticker)} style={{ width: w, height: h }}>
      <View style={[styles.cell, { width: w, height: h, backgroundColor: bg, borderColor: t.line }]}>
        <Text style={[styles.label, { color: textColor, fontSize: size * 0.2 }]} numberOfLines={1}>
          {sticker.label}
        </Text>
        {sticker.state === 'duplicate' && sticker.count > 0 && (
          <View style={[styles.badge, { backgroundColor: t.coral }]}>
            <Text style={styles.badgeText}>×{sticker.count + 1}</Text>
          </View>
        )}
      </View>
    </HapticPress>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
```

- [ ] **Step 3: Commit**
```bash
git add cromax/src/components/HapticPress.tsx cromax/src/components/Sticker.tsx
git commit -m "feat: HapticPress (spring scale + haptics) and Sticker cell component"
```

---

## Task 7: SVG components and SectionHeader

**Files:**
- Create: `cromax/src/components/ProgressRing.tsx`
- Create: `cromax/src/components/Flag.tsx`
- Create: `cromax/src/components/MxPattern.tsx`
- Create: `cromax/src/components/MxBunting.tsx`
- Create: `cromax/src/components/SectionHeader.tsx`

- [ ] **Step 1: Write `src/components/ProgressRing.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';

interface Props { pct: number; size?: number; stroke?: number }

export function ProgressRing({ pct, size = 80, stroke = 8 }: Props) {
  const t = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={t.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={t.lime} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size/2}, ${size/2}`}
        />
      </Svg>
    </View>
  );
}
```

- [ ] **Step 2: Write `src/components/Flag.tsx`**

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props { colors: [string, string, string]; width?: number; height?: number }

export function Flag({ colors, width = 24, height = 16 }: Props) {
  const stripeH = height / 3;
  return (
    <View style={[styles.flag, { width, height }]}>
      {colors.map((c, i) => (
        <View key={i} style={{ width, height: stripeH, backgroundColor: c }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flag: { borderRadius: 2, overflow: 'hidden' },
});
```

- [ ] **Step 3: Write `src/components/MxPattern.tsx`**

```tsx
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props { size?: number; color?: string; opacity?: number }

export function MxPattern({ size = 80, color = '#E89B2F', opacity = 0.18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" opacity={opacity}>
      <Path d="M0 0 L20 0 L0 20 Z" fill={color} />
      <Path d="M80 0 L60 0 L80 20 Z" fill={color} />
      <Path d="M0 80 L20 80 L0 60 Z" fill={color} />
      <Path d="M80 80 L60 80 L80 60 Z" fill={color} />
      <Circle cx={40} cy={40} r={6} fill={color} />
      <Circle cx={40} cy={40} r={2} fill={color} opacity={0.5} />
    </Svg>
  );
}
```

- [ ] **Step 4: Write `src/components/MxBunting.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

const COLORS = ['#D7263D', '#E89B2F', '#B5DA40', '#0E5B3A', '#EFE7D2'];
const FLAG_W = 18, FLAG_H = 24, GAP = 10, FLAGS = 8;

export function MxBunting() {
  const totalW = FLAGS * (FLAG_W + GAP);
  const pts = Array.from({ length: FLAGS + 1 }, (_, i) => ({
    x: i * (FLAG_W + GAP) + (i > 0 ? FLAG_W / 2 : 0),
    y: i % 2 === 0 ? 6 : 20,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <View pointerEvents="none">
      <Svg width={totalW} height={FLAG_H + 10} viewBox={`0 0 ${totalW} ${FLAG_H + 10}`}>
        <Path d={d} stroke="#E89B2F" strokeWidth={1.5} fill="none" />
        {Array.from({ length: FLAGS }, (_, i) => (
          <G key={i} transform={`translate(${i * (FLAG_W + GAP)}, 6)`}>
            <Path
              d={`M0 0 L${FLAG_W} 0 L${FLAG_W / 2} ${FLAG_H} Z`}
              fill={COLORS[i % COLORS.length]}
            />
          </G>
        ))}
      </Svg>
    </View>
  );
}
```

- [ ] **Step 5: Write `src/components/SectionHeader.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  title: string;
  trailing?: React.ReactNode;
}

export function SectionHeader({ title, trailing }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
```

- [ ] **Step 6: Commit**
```bash
git add cromax/src/components/
git commit -m "feat: SVG components (ProgressRing, Flag, MxPattern, MxBunting) and SectionHeader"
```

---

## Task 8: Navigation — RootNavigator, MainTabs, CustomTabBar

**Files:**
- Create: `cromax/src/navigation/RootNavigator.tsx`
- Create: `cromax/src/navigation/MainTabs.tsx`
- Create: `cromax/src/navigation/CustomTabBar.tsx`

- [ ] **Step 1: Write `src/navigation/CustomTabBar.tsx`**

```tsx
import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICONS: Record<string, string> = {
  Home:    '⬟',
  Grid:    '▦',
  Trade:   '⇄',
  Profile: '◉',
};

const TAB_LABELS: Record<string, string> = {
  Home:    'Álbum',
  Grid:    'Cuadrícula',
  Trade:   'Trueque',
  Profile: 'Perfil',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pillX   = useRef(new Animated.Value(0)).current;
  const pillW   = useRef(new Animated.Value(0)).current;
  const tabRefs  = useRef<{ x: number; width: number }[]>([]);
  const measured = useRef<boolean[]>(state.routes.map(() => false));

  const movePill = (idx: number) => {
    const tab = tabRefs.current[idx];
    if (!tab) return;
    Animated.spring(pillX, { toValue: tab.x + 4, useNativeDriver: false, tension: 120, friction: 8 }).start();
    Animated.spring(pillW, { toValue: tab.width - 8, useNativeDriver: false, tension: 120, friction: 8 }).start();
  };

  const handleLayout = (e: LayoutChangeEvent, idx: number) => {
    const { x, width } = e.nativeEvent.layout;
    tabRefs.current[idx] = { x, width };
    measured.current[idx] = true;
    if (measured.current.every(Boolean) || idx === state.index) {
      movePill(state.index);
    }
  };

  React.useEffect(() => {
    movePill(state.index);
  }, [state.index]);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      <Animated.View style={[styles.pill, { left: pillX, width: pillW }]} />
      {state.routes.map((route, idx) => {
        const focused = idx === state.index;
        const { options } = descriptors[route.key];
        const label = options.title ?? TAB_LABELS[route.name] ?? route.name;
        const icon  = ICONS[route.name] ?? '●';

        return (
          <Pressable
            key={route.key}
            onLayout={e => handleLayout(e, idx)}
            onPress={() => {
              if (!focused) navigation.navigate(route.name);
            }}
            style={styles.tab}
          >
            <Text style={[styles.icon, { color: focused ? '#0E5B3A' : '#9AA39B' }]}>{icon}</Text>
            <Text style={[styles.label, { color: focused ? '#0E5B3A' : '#9AA39B' }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    paddingTop: 8,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 6,
    height: 44,
    backgroundColor: '#E89B2F',
    borderRadius: 22,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    zIndex: 1,
  },
  icon:  { fontSize: 18, marginBottom: 2 },
  label: { fontSize: 10, fontWeight: '600' },
});
```

- [ ] **Step 2: Write `src/navigation/MainTabs.tsx`**

```tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen }    from '../screens/HomeScreen';
import { GridScreen }    from '../screens/GridScreen';
import { TradeScreen }   from '../screens/TradeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomTabBar }  from './CustomTabBar';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Grid"    component={GridScreen} />
      <Tab.Screen name="Trade"   component={TradeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

- [ ] **Step 3: Write `src/navigation/RootNavigator.tsx`**

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';

export type RootStackParamList = {
  Main:         undefined;
  StickerModal: { stickerId: number };
  ShareModal:   undefined;
  ScanModal:    undefined;
  QuickAdd:     undefined;
  FriendDetail: { friendId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <Stack.Screen name="Main" component={MainTabs} options={{ presentation: 'card' }} />
        {/* Modal screens added in Task 14-17 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 4: Commit**
```bash
git add cromax/src/navigation/
git commit -m "feat: navigation — RootNavigator, MainTabs, CustomTabBar with animated marigold pill"
```

---

## Task 9: Onboarding flow

**Files:**
- Create: `cromax/src/onboarding/OnboardingFlow.tsx`
- Create: `cromax/src/onboarding/OnboardWelcome.tsx`
- Create: `cromax/src/onboarding/OnboardAlbum.tsx`
- Create: `cromax/src/onboarding/OnboardName.tsx`
- Create: `cromax/src/onboarding/OnboardAge.tsx`
- Create: `cromax/src/onboarding/OnboardReady.tsx`

- [ ] **Step 1: Write `src/onboarding/OnboardWelcome.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';
import { MxBunting } from '../components/MxBunting';

interface Props { onNext: () => void }

export function OnboardWelcome({ onNext }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.pitch }]}>
      <View style={styles.bunting}><MxBunting /></View>
      <Text style={styles.title}>Cromax</Text>
      <Text style={styles.sub}>Tu álbum del{'\n'}Mundial 2026</Text>
      <HapticPress style={[styles.btn, { backgroundColor: t.primary }]} onPress={onNext}>
        <Text style={styles.btnText}>Comenzar</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bunting: { position: 'absolute', top: 80 },
  title:   { fontSize: 52, fontWeight: '900', color: '#E89B2F', letterSpacing: -2 },
  sub:     { fontSize: 22, color: '#EFE7D2', textAlign: 'center', marginBottom: 48, marginTop: 8 },
  btn:     { paddingHorizontal: 48, paddingVertical: 16, borderRadius: 32 },
  btnText: { fontSize: 18, fontWeight: '700', color: '#102A1F' },
});
```

- [ ] **Step 2: Write `src/onboarding/OnboardAlbum.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { onNext: (albumId: string) => void }

export function OnboardAlbum({ onNext }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.paper }]}>
      <Text style={[styles.title, { color: t.ink }]}>Elige tu álbum</Text>
      <HapticPress
        style={[styles.card, { backgroundColor: t.pitch, borderColor: t.primary, borderWidth: 2 }]}
        onPress={() => onNext('mundial-2026')}
      >
        <Text style={styles.cardEmoji}>🏆</Text>
        <Text style={styles.cardTitle}>FIFA Mundial 2026</Text>
        <Text style={styles.cardSub}>México · USA · Canadá</Text>
      </HapticPress>
      <View style={[styles.card, { backgroundColor: t.paper2, opacity: 0.5 }]}>
        <Text style={[styles.cardTitle, { color: t.ink4 }]}>Más álbumes próximamente…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, padding: 24, paddingTop: 80 },
  title:     { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  card:      { borderRadius: 16, padding: 24, marginBottom: 12, alignItems: 'center' },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#EFE7D2' },
  cardSub:   { fontSize: 14, color: '#9AA39B', marginTop: 4 },
});
```

- [ ] **Step 3: Write `src/onboarding/OnboardName.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { onNext: (name: string) => void }

export function OnboardName({ onNext }: Props) {
  const t = useTheme();
  const [name, setName] = useState('');
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.screen, { backgroundColor: t.paper }]}>
        <Text style={[styles.title, { color: t.ink }]}>¿Cómo te llamas?</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={t.ink4}
          maxLength={30}
          style={[styles.input, { backgroundColor: t.card, color: t.ink, borderColor: t.line }]}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => name.trim() && onNext(name.trim())}
        />
        <HapticPress
          style={[styles.btn, { backgroundColor: name.trim() ? t.primary : t.paper2 }]}
          onPress={() => name.trim() && onNext(name.trim())}
        >
          <Text style={[styles.btnText, { color: name.trim() ? t.pitch : t.ink4 }]}>Siguiente</Text>
        </HapticPress>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, padding: 24, paddingTop: 80 },
  title:   { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  input:   { borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 18, marginBottom: 16 },
  btn:     { borderRadius: 32, padding: 16, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 4: Write `src/onboarding/OnboardAge.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

const AGE_RANGES = ['< 12', '12–17', '18–25', '26–35', '36–45', '46+'];

interface Props { onNext: (age: string) => void }

export function OnboardAge({ onNext }: Props) {
  const t = useTheme();
  const [selected, setSelected] = useState('');
  return (
    <View style={[styles.screen, { backgroundColor: t.paper }]}>
      <Text style={[styles.title, { color: t.ink }]}>¿Cuántos años tienes?</Text>
      <View style={styles.grid}>
        {AGE_RANGES.map(range => (
          <HapticPress
            key={range}
            style={[styles.chip,
              { backgroundColor: selected === range ? t.pitch : t.card, borderColor: t.line }
            ]}
            onPress={() => setSelected(range)}
          >
            <Text style={[styles.chipText, { color: selected === range ? '#EFE7D2' : t.ink }]}>
              {range}
            </Text>
          </HapticPress>
        ))}
      </View>
      <HapticPress
        style={[styles.btn, { backgroundColor: selected ? t.primary : t.paper2 }]}
        onPress={() => selected && onNext(selected)}
      >
        <Text style={[styles.btnText, { color: selected ? t.pitch : t.ink4 }]}>Siguiente</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, padding: 24, paddingTop: 80 },
  title:    { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  chip:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 32, borderWidth: 1 },
  chipText: { fontSize: 16, fontWeight: '600' },
  btn:      { borderRadius: 32, padding: 16, alignItems: 'center' },
  btnText:  { fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 5: Write `src/onboarding/OnboardReady.tsx`**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { HapticPress } from '../components/HapticPress';

interface Props { name: string; onDone: () => void }

export function OnboardReady({ name, onDone }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: t.pitch }]}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>¡Listo, {name}!</Text>
      <Text style={styles.sub}>Ya puedes empezar a llenar{'\n'}tu álbum Cromax.</Text>
      <HapticPress style={[styles.btn, { backgroundColor: t.primary }]} onPress={onDone}>
        <Text style={[styles.btnText, { color: t.pitch }]}>Ver mi álbum</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:   { fontSize: 64, marginBottom: 16 },
  title:   { fontSize: 36, fontWeight: '900', color: '#E89B2F', letterSpacing: -1 },
  sub:     { fontSize: 18, color: '#EFE7D2', textAlign: 'center', marginVertical: 16 },
  btn:     { paddingHorizontal: 48, paddingVertical: 16, borderRadius: 32, marginTop: 16 },
  btnText: { fontSize: 18, fontWeight: '700' },
});
```

- [ ] **Step 6: Write `src/onboarding/OnboardingFlow.tsx`**

```tsx
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { OnboardWelcome } from './OnboardWelcome';
import { OnboardAlbum }   from './OnboardAlbum';
import { OnboardName }    from './OnboardName';
import { OnboardAge }     from './OnboardAge';
import { OnboardReady }   from './OnboardReady';
import { useAlbumStore }  from '../store/useAlbumStore';

const { width: W } = Dimensions.get('window');

interface Props { onComplete: () => void }

type Step = 'welcome' | 'album' | 'name' | 'age' | 'ready';
const STEPS: Step[] = ['welcome', 'album', 'name', 'age', 'ready'];

export function OnboardingFlow({ onComplete }: Props) {
  const setProfile = useAlbumStore(s => s.setProfile);
  const [stepIdx, setStepIdx]     = useState(0);
  const [albumId, setAlbumId]     = useState('mundial-2026');
  const [name,    setName]        = useState('');
  const [age,     setAge]         = useState('');
  const slideX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Animated.timing(slideX, { toValue: -(stepIdx + 1) * W, useNativeDriver: true, duration: 280 }).start(() => {
      setStepIdx(i => i + 1);
    });
  };

  const handleDone = () => {
    setProfile({ albumId, name, age });
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { transform: [{ translateX: slideX }] }]}>
        <View style={styles.page}><OnboardWelcome onNext={goNext} /></View>
        <View style={styles.page}><OnboardAlbum onNext={id => { setAlbumId(id); goNext(); }} /></View>
        <View style={styles.page}><OnboardName onNext={n => { setName(n); goNext(); }} /></View>
        <View style={styles.page}><OnboardAge onNext={a => { setAge(a); goNext(); }} /></View>
        <View style={styles.page}><OnboardReady name={name} onDone={handleDone} /></View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  track:     { flexDirection: 'row', width: W * STEPS.length },
  page:      { width: W, flex: 1 },
});
```

- [ ] **Step 7: Commit**
```bash
git add cromax/src/onboarding/
git commit -m "feat: onboarding flow — 5 steps with slide transitions"
```

---

## Task 10: HomeScreen

**Files:**
- Create: `cromax/src/screens/HomeScreen.tsx`

- [ ] **Step 1: Write `src/screens/HomeScreen.tsx`**

```tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }    from '../store/useAlbumStore';
import { computeStats }     from '../data/album';
import { useTheme }         from '../theme';
import { ProgressRing }     from '../components/ProgressRing';
import { MxBunting }        from '../components/MxBunting';
import { HapticPress }      from '../components/HapticPress';
import { SectionHeader }    from '../components/SectionHeader';
import { useNavigation }    from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<Nav>();
  const { stickers, friends, profile } = useAlbumStore();
  const stats   = computeStats(stickers);

  // Trade matches: stickers I have duplicate of that a friend is missing
  const myDupeIds = new Set(stickers.filter(s => s.state === 'duplicate').map(s => s.id));
  const tradeMatches = friends.map(f => ({
    friend: f,
    canGive: f.missing.filter(id => myDupeIds.has(id)).length,
  })).filter(m => m.canGive > 0).slice(0, 3);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: t.pitch, paddingTop: insets.top + 16 }]}>
        <View style={styles.buntingRow}><MxBunting /></View>
        <Text style={styles.heroTitle}>{profile?.name ?? 'Mi Álbum'}</Text>
        <View style={styles.statsRow}>
          <ProgressRing pct={stats.pct} size={100} stroke={10} />
          <View style={styles.statsText}>
            <Text style={styles.statNum}>{stats.owned}</Text>
            <Text style={styles.statLbl}>tengo</Text>
            <Text style={[styles.statNum, { color: '#D7263D' }]}>{stats.missing}</Text>
            <Text style={styles.statLbl}>faltan</Text>
            <Text style={[styles.statNum, { color: '#E89B2F' }]}>{stats.dupes}</Text>
            <Text style={styles.statLbl}>repetidas</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <HapticPress style={[styles.heroBtn, { backgroundColor: t.primary }]}
            onPress={() => nav.navigate('ShareModal')}>
            <Text style={[styles.heroBtnText, { color: t.pitch }]}>Compartir QR</Text>
          </HapticPress>
          <HapticPress style={[styles.heroBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
            onPress={() => nav.navigate('QuickAdd')}>
            <Text style={[styles.heroBtnText, { color: '#EFE7D2' }]}>Marcar rápido</Text>
          </HapticPress>
        </View>
      </View>

      {/* Trade matches preview */}
      {tradeMatches.length > 0 && (
        <>
          <SectionHeader title="Trueques posibles" />
          {tradeMatches.map(({ friend, canGive }) => (
            <HapticPress
              key={friend.id}
              style={[styles.tradeCard, { backgroundColor: t.card, borderColor: t.line }]}
              onPress={() => nav.navigate('FriendDetail', { friendId: friend.id })}
            >
              <Text style={[styles.tradeName, { color: t.ink }]}>{friend.name}</Text>
              <Text style={[styles.tradeCount, { color: t.lime }]}>{canGive} estampas</Text>
            </HapticPress>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero:        { padding: 20, paddingBottom: 28 },
  buntingRow:  { marginBottom: 12 },
  heroTitle:   { fontSize: 28, fontWeight: '900', color: '#EFE7D2', marginBottom: 20 },
  statsRow:    { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 },
  statsText:   { gap: 2 },
  statNum:     { fontSize: 28, fontWeight: '900', color: '#B5DA40', lineHeight: 32 },
  statLbl:     { fontSize: 11, color: '#9AA39B', marginBottom: 6 },
  heroActions: { flexDirection: 'row', gap: 12 },
  heroBtn:     { flex: 1, borderRadius: 24, paddingVertical: 12, alignItems: 'center' },
  heroBtnText: { fontSize: 15, fontWeight: '700' },
  tradeCard:   { marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeName:   { fontSize: 16, fontWeight: '600' },
  tradeCount:  { fontSize: 14, fontWeight: '700' },
});
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/screens/HomeScreen.tsx
git commit -m "feat: HomeScreen — hero with stats, progress ring, trade matches preview"
```

---

## Task 11: GridScreen

**Files:**
- Create: `cromax/src/screens/GridScreen.tsx`

- [ ] **Step 1: Write `src/screens/GridScreen.tsx`**

```tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { useTheme }        from '../theme';
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
              <Text style={{ color: filter === f.key ? '#EFE7D2' : t.ink3, fontSize: 13, fontWeight: '600' }}>
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
  search:    { borderRadius: 10, borderWidth: 1, padding: 10, fontSize: 15, marginBottom: 8 },
  filters:   { flexDirection: 'row', gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
});
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/screens/GridScreen.tsx
git commit -m "feat: GridScreen — 6-col FlatList with search and state filter"
```

---

## Task 12: TradeScreen and ProfileScreen

**Files:**
- Create: `cromax/src/screens/TradeScreen.tsx`
- Create: `cromax/src/screens/ProfileScreen.tsx`

- [ ] **Step 1: Write `src/screens/TradeScreen.tsx`**

```tsx
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
```

- [ ] **Step 2: Write `src/screens/ProfileScreen.tsx`**

```tsx
import React from 'react';
import { ScrollView, View, Text, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlbumStore }   from '../store/useAlbumStore';
import { computeStats }    from '../data/album';
import { useTheme }        from '../theme';
import { SectionHeader }   from '../components/SectionHeader';

export function ProfileScreen() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const { profile, stickers, dark, toggleDark } = useAlbumStore();
  const stats   = computeStats(stickers);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: t.pitch }]}>
        <Text style={styles.name}>{profile?.name ?? '—'}</Text>
        <Text style={styles.album}>FIFA Mundial 2026</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#B5DA40' }]}>{stats.owned}</Text>
            <Text style={styles.statLbl}>Tengo</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#D7263D' }]}>{stats.missing}</Text>
            <Text style={styles.statLbl}>Faltan</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: '#E89B2F' }]}>{stats.pct.toFixed(1)}%</Text>
            <Text style={styles.statLbl}>Completo</Text>
          </View>
        </View>
      </View>

      <SectionHeader title="Ajustes" />

      <View style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
        <Text style={[styles.rowLabel, { color: t.ink }]}>Modo oscuro</Text>
        <Switch value={dark} onValueChange={toggleDark} trackColor={{ true: '#E89B2F' }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header:   { padding: 24, paddingBottom: 28 },
  name:     { fontSize: 32, fontWeight: '900', color: '#E89B2F' },
  album:    { fontSize: 14, color: '#9AA39B', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat:     { alignItems: 'center' },
  statNum:  { fontSize: 24, fontWeight: '900' },
  statLbl:  { fontSize: 11, color: '#9AA39B', marginTop: 2 },
  row:      { marginHorizontal: 16, padding: 16, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 3: Commit**
```bash
git add cromax/src/screens/TradeScreen.tsx cromax/src/screens/ProfileScreen.tsx
git commit -m "feat: TradeScreen (friends + trade badges) and ProfileScreen (stats + dark toggle)"
```

---

## Task 13: StickerSheet and QuickAddSheet

**Files:**
- Create: `cromax/src/sheets/StickerSheet.tsx`
- Create: `cromax/src/sheets/QuickAddSheet.tsx`

- [ ] **Step 1: Write `src/sheets/StickerSheet.tsx`**

This screen receives a `stickerId` route param, shows details, and lets the user change state or adjust duplicate count.

```tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAlbumStore }  from '../store/useAlbumStore';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';

type Route = RouteProp<RootStackParamList, 'StickerModal'>;

const STATES = ['missing', 'owned', 'duplicate'] as const;
const STATE_LABELS = { missing: 'Me falta', owned: 'La tengo', duplicate: 'Repetida' };
const STATE_COLORS = (t: ReturnType<typeof useTheme>) => ({
  missing:   t.coral,
  owned:     t.lime,
  duplicate: t.gold,
});

export function StickerSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const route   = useRoute<Route>();
  const { stickerId } = route.params;

  const { stickers, updateSticker } = useAlbumStore();
  const sticker = stickers.find(s => s.id === stickerId);
  const colors  = STATE_COLORS(t);

  if (!sticker) return null;

  const setCount = (delta: number) => {
    const next = Math.max(1, (sticker.count || 1) + delta);
    updateSticker(sticker.id, { count: next });
  };

  return (
    <View style={[styles.container, { backgroundColor: t.paper, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <Text style={[styles.title, { color: t.ink }]}>{sticker.name}</Text>
      <Text style={[styles.label, { color: t.ink4 }]}>{sticker.label} · {sticker.team ?? 'Especial'}</Text>

      {/* State selector */}
      <View style={styles.stateRow}>
        {STATES.map(state => (
          <HapticPress
            key={state}
            style={[styles.stateBtn, {
              backgroundColor: sticker.state === state ? colors[state] : t.paper2,
              flex: 1,
            }]}
            onPress={() => updateSticker(sticker.id, {
              state,
              count: state === 'duplicate' ? (sticker.count || 1) : 0,
            })}
          >
            <Text style={[styles.stateBtnText, { color: sticker.state === state ? t.pitch : t.ink3 }]}>
              {STATE_LABELS[state]}
            </Text>
          </HapticPress>
        ))}
      </View>

      {/* Duplicate stepper */}
      {sticker.state === 'duplicate' && (
        <View style={styles.stepper}>
          <HapticPress style={[styles.stepBtn, { backgroundColor: t.paper2 }]} onPress={() => setCount(-1)}>
            <Text style={[styles.stepBtnText, { color: t.ink }]}>−</Text>
          </HapticPress>
          <Text style={[styles.stepCount, { color: t.ink }]}>×{(sticker.count || 1) + 1}</Text>
          <HapticPress style={[styles.stepBtn, { backgroundColor: t.paper2 }]} onPress={() => setCount(1)}>
            <Text style={[styles.stepBtnText, { color: t.ink }]}>+</Text>
          </HapticPress>
        </View>
      )}

      <HapticPress style={[styles.closeBtn, { backgroundColor: t.pitch }]} onPress={() => nav.goBack()}>
        <Text style={styles.closeBtnText}>Listo</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, padding: 20 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:        { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  label:        { fontSize: 14, marginBottom: 24 },
  stateRow:     { flexDirection: 'row', gap: 8, marginBottom: 20 },
  stateBtn:     { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  stateBtnText: { fontSize: 13, fontWeight: '700' },
  stepper:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 20 },
  stepBtn:      { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:  { fontSize: 24, fontWeight: '300' },
  stepCount:    { fontSize: 28, fontWeight: '900', minWidth: 60, textAlign: 'center' },
  closeBtn:     { borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  closeBtnText: { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 2: Write `src/sheets/QuickAddSheet.tsx`**

```tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { cycleQuick }     from '../data/album';
import { useTheme }       from '../theme';
import { Sticker as StickerComponent } from '../components/Sticker';
import { HapticPress }    from '../components/HapticPress';

const COLS = 6;
const GAP  = 6;
const PAD  = 12;
const CELL = Math.floor((Dimensions.get('window').width - PAD * 2 - GAP * (COLS - 1)) / COLS);

export function QuickAddSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const { stickers, setStickers } = useAlbumStore();
  const [local, setLocal] = useState(stickers);

  const handlePress = (id: number) => {
    setLocal(prev => prev.map(s => s.id === id ? cycleQuick(s) : s));
  };

  const handleDone = () => {
    setStickers(local);
    nav.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: t.paper }]}>
      <View style={[styles.header, { backgroundColor: t.paper }]}>
        <Text style={[styles.title, { color: t.ink }]}>Marcar rápido</Text>
        <Text style={[styles.sub, { color: t.ink4 }]}>Toca para ciclar: falta → tengo → repetida</Text>
      </View>
      <FlatList
        data={local}
        keyExtractor={s => String(s.id)}
        numColumns={COLS}
        contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: insets.bottom + 80 }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item }) => (
          <StickerComponent sticker={item} size={CELL} onPress={s => handlePress(s.id)} />
        )}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, backgroundColor: t.paper }]}>
        <HapticPress style={[styles.doneBtn, { backgroundColor: t.pitch }]} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Guardar cambios</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:    { padding: 16, paddingBottom: 8 },
  title:     { fontSize: 20, fontWeight: '800' },
  sub:       { fontSize: 13, marginTop: 4 },
  footer:    { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  doneBtn:   { borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
});
```

- [ ] **Step 3: Commit**
```bash
git add cromax/src/sheets/StickerSheet.tsx cromax/src/sheets/QuickAddSheet.tsx
git commit -m "feat: StickerSheet (state toggle + dupe stepper) and QuickAddSheet (tap-cycle grid)"
```

---

## Task 14: FriendDetailSheet

**Files:**
- Create: `cromax/src/sheets/FriendDetailSheet.tsx`

- [ ] **Step 1: Write `src/sheets/FriendDetailSheet.tsx`**

```tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAlbumStore } from '../store/useAlbumStore';
import { useTheme }      from '../theme';
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
  const canGive = friend.missing
    .filter(id => myDupeIds.has(id))
    .map(id => stickers.find(s => s.id === id))
    .filter(Boolean);

  // Stickers they can give me (their dupes I'm missing)
  const canReceive = friend.dupes
    .filter(d => myMissingIds.has(d.id))
    .map(d => stickers.find(s => s.id === d.id))
    .filter(Boolean);

  return (
    <ScrollView style={{ backgroundColor: t.paper }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <View style={[styles.header, { backgroundColor: t.pitch, paddingTop: 20 }]}>
        <View style={[styles.handle, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.meta}>{new Date(friend.scannedAt).toLocaleDateString('es-MX')}</Text>
      </View>

      <SectionHeader title={`Puedo darle (${canGive.length})`} />
      {canGive.length === 0 && (
        <Text style={[styles.empty, { color: t.ink4 }]}>Ninguna por ahora.</Text>
      )}
      {canGive.map(s => s && (
        <View key={s.id} style={[styles.row, { backgroundColor: t.card, borderColor: t.line }]}>
          <Text style={[styles.rowLabel, { color: t.ink }]}>{s.label}</Text>
          <Text style={[styles.rowName, { color: t.ink3 }]}>{s.name}</Text>
        </View>
      ))}

      <SectionHeader title={`Me puede dar (${canReceive.length})`} />
      {canReceive.length === 0 && (
        <Text style={[styles.empty, { color: t.ink4 }]}>Ninguna por ahora.</Text>
      )}
      {canReceive.map(s => s && (
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
  header:       { padding: 20, paddingBottom: 24 },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  name:         { fontSize: 28, fontWeight: '900', color: '#E89B2F' },
  meta:         { fontSize: 13, color: '#9AA39B', marginTop: 4 },
  row:          { marginHorizontal: 16, marginBottom: 6, padding: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 10 },
  rowLabel:     { fontWeight: '700', fontSize: 14, width: 50 },
  rowName:      { fontSize: 14, flex: 1 },
  empty:        { paddingHorizontal: 16, paddingBottom: 12, fontSize: 14 },
  removeBtn:    { margin: 16, marginTop: 24, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  removeBtnText: { fontWeight: '700', fontSize: 15 },
});
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/sheets/FriendDetailSheet.tsx
git commit -m "feat: FriendDetailSheet — 1:1 trade matches (can give / can receive)"
```

---

## Task 15: ShareSheet — QR generation

**Files:**
- Create: `cromax/src/sheets/ShareSheet.tsx`

- [ ] **Step 1: Write `src/sheets/ShareSheet.tsx`**

```tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { encodeQR }       from '../utils/qr';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';

export function ShareSheet() {
  const t       = useTheme();
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation();
  const { stickers, profile } = useAlbumStore();

  const payload = useMemo(
    () => encodeQR(profile?.name ?? 'Amigo', stickers),
    [stickers, profile]
  );

  const missingCount = stickers.filter(s => s.state === 'missing').length;

  return (
    <View style={[styles.container, { backgroundColor: t.paper, paddingBottom: insets.bottom + 20 }]}>
      <View style={[styles.handle, { backgroundColor: t.line }]} />
      <Text style={[styles.title, { color: t.ink }]}>Mi QR de faltantes</Text>
      <Text style={[styles.sub, { color: t.ink4 }]}>
        {missingCount} estampas faltantes · Que tu amigo escanee este QR
      </Text>

      <View style={[styles.qrBox, { backgroundColor: '#fff' }]}>
        <QRCode
          value={payload}
          size={220}
          color="#102A1F"
          backgroundColor="#ffffff"
        />
      </View>

      <Text style={[styles.name, { color: t.pitch }]}>{profile?.name ?? 'Mi álbum'}</Text>

      <View style={styles.btnRow}>
        <HapticPress
          style={[styles.btn, { backgroundColor: t.pitch }]}
          onPress={() => Share.share({ message: payload })}
        >
          <Text style={styles.btnText}>Compartir texto</Text>
        </HapticPress>
        <HapticPress style={[styles.btn, { backgroundColor: t.paper2 }]} onPress={() => nav.goBack()}>
          <Text style={[styles.btnText, { color: t.ink }]}>Cerrar</Text>
        </HapticPress>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  handle:    { width: 36, height: 4, borderRadius: 2, marginBottom: 20 },
  title:     { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  sub:       { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  qrBox:     { padding: 20, borderRadius: 20, marginBottom: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 },
  name:      { fontSize: 18, fontWeight: '700', marginBottom: 24 },
  btnRow:    { flexDirection: 'row', gap: 12, width: '100%' },
  btn:       { flex: 1, borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  btnText:   { fontSize: 15, fontWeight: '700', color: '#EFE7D2' },
});
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/sheets/ShareSheet.tsx
git commit -m "feat: ShareSheet — QR code from bitmask encoding + share sheet"
```

---

## Task 16: ScanSheet — QR camera scanning

**Files:**
- Create: `cromax/src/sheets/ScanSheet.tsx`

- [ ] **Step 1: Write `src/sheets/ScanSheet.tsx`**

```tsx
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation }  from '@react-navigation/native';
import { useAlbumStore }  from '../store/useAlbumStore';
import { decodeQR }       from '../utils/qr';
import { useTheme }       from '../theme';
import { HapticPress }    from '../components/HapticPress';
import * as Haptics       from 'expo-haptics';

export function ScanSheet() {
  const t        = useTheme();
  const insets   = useSafeAreaInsets();
  const nav      = useNavigation();
  const addFriend = useAlbumStore(s => s.addFriend);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCode = useCallback(({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const decoded = decodeQR(data);
    if (!decoded) {
      Alert.alert('QR no válido', 'Este QR no es de Cromax.', [
        { text: 'Reintentar', onPress: () => setScanned(false) },
        { text: 'Cancelar', onPress: () => nav.goBack() },
      ]);
      return;
    }

    const friend = {
      id:        Date.now().toString(),
      name:      decoded.name,
      missing:   decoded.missing,
      dupes:     decoded.dupes,
      scannedAt: new Date().toISOString(),
    };

    addFriend(friend);
    Alert.alert(
      '¡Amigo guardado!',
      `Se guardó el álbum de ${decoded.name}.`,
      [{ text: 'Ver trueques', onPress: () => { nav.goBack(); } }]
    );
  }, [scanned, addFriend, nav]);

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: t.paper }]}>
        <Text style={[styles.permText, { color: t.ink }]}>
          Necesitamos acceso a la cámara para escanear el QR de tus amigos.
        </Text>
        <HapticPress style={[styles.permBtn, { backgroundColor: t.pitch }]} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir cámara</Text>
        </HapticPress>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCode}
      />
      {/* Finder overlay */}
      <View style={styles.overlay}>
        <View style={[styles.finder, { borderColor: t.primary }]} />
        <Text style={styles.hint}>Apunta al QR de tu amigo</Text>
      </View>
      {/* Close button */}
      <HapticPress
        style={[styles.closeBtn, { top: insets.top + 16, backgroundColor: 'rgba(0,0,0,0.5)' }]}
        onPress={() => nav.goBack()}
      >
        <Text style={styles.closeBtnText}>✕</Text>
      </HapticPress>
    </View>
  );
}

const styles = StyleSheet.create({
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permText:    { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  permBtn:     { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  permBtnText: { color: '#EFE7D2', fontSize: 16, fontWeight: '700' },
  overlay:     { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  finder:      { width: 240, height: 240, borderWidth: 3, borderRadius: 20 },
  hint:        { color: '#fff', marginTop: 20, fontSize: 14, fontWeight: '600', textShadowColor: '#000', textShadowRadius: 8 },
  closeBtn:    { position: 'absolute', right: 16, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 18 },
});
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/sheets/ScanSheet.tsx
git commit -m "feat: ScanSheet — expo-camera QR scan, decode bitmask, save friend"
```

---

## Task 17: Wire up RootNavigator with all modal screens

**Files:**
- Modify: `cromax/src/navigation/RootNavigator.tsx`

- [ ] **Step 1: Update `src/navigation/RootNavigator.tsx` to include all modal screens**

Replace the contents of `src/navigation/RootNavigator.tsx`:
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs }          from './MainTabs';
import { StickerSheet }      from '../sheets/StickerSheet';
import { QuickAddSheet }     from '../sheets/QuickAddSheet';
import { FriendDetailSheet } from '../sheets/FriendDetailSheet';
import { ShareSheet }        from '../sheets/ShareSheet';
import { ScanSheet }         from '../sheets/ScanSheet';

export type RootStackParamList = {
  Main:         undefined;
  StickerModal: { stickerId: number };
  ShareModal:   undefined;
  ScanModal:    undefined;
  QuickAdd:     undefined;
  FriendDetail: { friendId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
        <Stack.Screen name="Main"         component={MainTabs}          options={{ presentation: 'card' }} />
        <Stack.Screen name="StickerModal" component={StickerSheet} />
        <Stack.Screen name="ShareModal"   component={ShareSheet} />
        <Stack.Screen name="ScanModal"    component={ScanSheet} />
        <Stack.Screen name="QuickAdd"     component={QuickAddSheet} />
        <Stack.Screen name="FriendDetail" component={FriendDetailSheet} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add cromax/src/navigation/RootNavigator.tsx
git commit -m "feat: wire all modal screens into RootNavigator"
```

---

## Task 18: App.tsx — entry point with onboarding gate and ThemeContext

**Files:**
- Modify: `cromax/App.tsx`

- [ ] **Step 1: Replace `App.tsx`**

```tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { useAlbumStore }   from './src/store/useAlbumStore';
import { ThemeContext, lightTheme, darkTheme } from './src/theme';
import { RootNavigator }   from './src/navigation/RootNavigator';
import { OnboardingFlow }  from './src/onboarding/OnboardingFlow';

export default function App() {
  const { hydrated, dark, profile, hydrate } = useAlbumStore();
  const theme = dark ? darkTheme : lightTheme;

  useEffect(() => { hydrate(); }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E5B3A' }}>
        <ActivityIndicator color="#E89B2F" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeContext.Provider value={theme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          {profile ? (
            <RootNavigator />
          ) : (
            <OnboardingFlow onComplete={() => {}} />
          )}
        </ThemeContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

Note: `OnboardingFlow.onComplete` can be an empty callback because after `setProfile` is called in the flow, the Zustand store updates `profile`, the `App.tsx` re-renders, and the condition `profile ? ...` flips automatically — no explicit callback needed.

- [ ] **Step 2: Commit**
```bash
git add cromax/App.tsx
git commit -m "feat: App.tsx — onboarding gate, ThemeContext, hydration loading state"
```

---

## Task 19: Configure app.json

**Files:**
- Modify: `cromax/app.json`

- [ ] **Step 1: Replace `app.json` with full Expo config**

```json
{
  "expo": {
    "name": "Cromax",
    "slug": "cromax",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0E5B3A"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.cromaxapp.cromax",
      "infoPlist": {
        "NSCameraUsageDescription": "Para escanear el QR de tus amigos y ver sus faltantes."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0E5B3A"
      },
      "package": "com.cromaxapp.cromax",
      "permissions": ["android.permission.CAMERA"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        { "cameraPermission": "Para escanear el QR de tus amigos y ver sus faltantes." }
      ]
    ],
    "extra": {
      "eas": { "projectId": "FILL_IN_AFTER_EAS_INIT" }
    }
  }
}
```

- [ ] **Step 2: Run Expo to verify no config errors**
```bash
cd cromax && npx expo start --no-dev 2>&1 | head -30
```
Expected: "Starting Metro Bundler" with no error lines.

- [ ] **Step 3: Commit**
```bash
cd .. && git add cromax/app.json
git commit -m "feat: app.json — Cromax config with camera permissions, iOS/Android bundle IDs"
```

---

## Task 20: EAS Build setup

**Files:**
- Create: `cromax/eas.json`

- [ ] **Step 1: Initialize EAS (interactive — run this manually)**

```bash
cd cromax
npx eas init
```
Expected: prompts for Expo account login, creates `extra.eas.projectId` in `app.json`.

- [ ] **Step 2: Write `eas.json`**

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "FILL_IN_APPLE_ID",
        "ascAppId": "FILL_IN_ASC_APP_ID",
        "appleTeamId": "FILL_IN_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

- [ ] **Step 3: Build a preview for iOS simulator to verify everything compiles**
```bash
npx eas build --platform ios --profile preview
```
Expected: build starts on EAS cloud, returns a download link for the `.app` file within ~10 minutes.

- [ ] **Step 4: Commit**
```bash
cd .. && git add cromax/eas.json
git commit -m "feat: eas.json — build profiles (dev, preview, production) + submit config"
```

---

## Self-Review

**Spec coverage check:**

| Spec section | Covered by tasks |
|---|---|
| Seguimiento owned/missing/duplicate | Task 3 (album.ts), Task 6 (Sticker), Task 13 (StickerSheet) |
| Onboarding 5 pasos | Task 9 |
| 4 pantallas principales | Tasks 10–12 |
| Bottom sheets: StickerSheet, QuickAddSheet | Task 13 |
| FriendDetailSheet | Task 14 |
| ShareSheet (QR generado) | Task 15 |
| ScanSheet (escaneo QR) | Task 16 |
| Compartir lista faltantes via QR bitmask | Tasks 4, 15, 16 |
| Persistencia local AsyncStorage | Task 5 |
| Modo oscuro / claro | Tasks 2, 12 (toggle), 18 (ThemeContext) |
| Tab bar personalizado pill marigold | Task 8 |
| iOS + Android | Task 20 (EAS) |
| Múltiples álbumes excluidos | OnboardAlbum shows only 1 active |
| Cuentas / sync excluidos | No backend anywhere ✓ |

**Placeholder scan:** No TBD, TODO, or "implement later" in any task. All code blocks are complete.

**Type consistency:**
- `Sticker`, `Friend`, `AlbumStats`, `Profile` defined in Task 3, used consistently throughout.
- `RootStackParamList` defined in Task 8, refined in Task 17 — Task 10-16 import it correctly.
- `encodeQR`/`decodeQR` return types used in Tasks 15 and 16 match Task 4 implementation.
- `useAlbumStore` actions (`updateSticker`, `addFriend`, `setStickers`, `setProfile`, `toggleDark`, `removeFriend`) all defined in Task 5 and used correctly in later tasks.
