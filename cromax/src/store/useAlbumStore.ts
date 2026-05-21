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

    const profile: Profile | null = rawProfile ? JSON.parse(rawProfile) : null;
    const withCocaCola = profile?.withCocaCola ?? false;
    const freshAlbum = generateAlbum(42, withCocaCola);
    let stickers: Sticker[];

    if (rawStickers) {
      const cached: Sticker[] = JSON.parse(rawStickers);
      // If sticker count changed (album updated or CC flag changed), regenerate preserving state by ID
      if (cached.length !== freshAlbum.length) {
        const stateById = new Map(cached.map(s => [s.id, { state: s.state, count: s.count }]));
        stickers = freshAlbum.map(s => {
          const saved = stateById.get(s.id);
          return saved ? { ...s, ...saved } : s;
        });
        await AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
      } else {
        stickers = cached;
      }
    } else {
      stickers = freshAlbum;
      await AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
    }

    set({
      stickers,
      friends:  rawFriends ? JSON.parse(rawFriends) : [],
      profile,
      dark:     rawDark === '1',
      hydrated: true,
    });
  },

  updateSticker: (id, patch) => {
    const now = Date.now();
    const stickers = get().stickers.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, ...patch };
      if (patch.state && patch.state !== 'missing' && s.state === 'missing') {
        next.markedAt = now;
      }
      return next;
    });
    set({ stickers });
    AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
  },

  setStickers: (incoming) => {
    const prev = new Map(get().stickers.map(s => [s.id, s.state]));
    const now = Date.now();
    const stickers = incoming.map(s => {
      if (s.state !== 'missing' && prev.get(s.id) === 'missing') {
        return { ...s, markedAt: s.markedAt ?? now };
      }
      return s;
    });
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
    const prev = get().profile;
    set({ profile });
    AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));

    // Regenerate stickers when withCocaCola changes (includes first-time setup)
    if (prev?.withCocaCola !== profile.withCocaCola) {
      const current = get().stickers;
      const fresh = generateAlbum(42, profile.withCocaCola);
      const stateById = new Map(current.map(s => [s.id, { state: s.state, count: s.count }]));
      const stickers = fresh.map(s => {
        const saved = stateById.get(s.id);
        return saved ? { ...s, ...saved } : s;
      });
      set({ stickers });
      AsyncStorage.setItem(KEYS.stickers, JSON.stringify(stickers));
    }
  },

  toggleDark: () => {
    const dark = !get().dark;
    set({ dark });
    AsyncStorage.setItem(KEYS.dark, dark ? '1' : '0');
  },
}));
