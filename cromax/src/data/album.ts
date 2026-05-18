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
