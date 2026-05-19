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

    const freshAlbum = generateAlbum(42);
    let stickers: Sticker[];

    if (rawStickers) {
      const cached: Sticker[] = JSON.parse(rawStickers);
      // If sticker count changed (album was updated), regenerate preserving state where IDs match
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
