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

export const TEAMS: Array<{ code: string; name: string; players: number; colors: [string,string,string] }> = [
  { code: 'MEX', name: 'México',        players: 20, colors: ['#006847','#FFFFFF','#CE1126'] },
  { code: 'ARG', name: 'Argentina',     players: 20, colors: ['#75AADB','#FFFFFF','#75AADB'] },
  { code: 'BRA', name: 'Brasil',        players: 20, colors: ['#FEDF00','#009C3B','#002776'] },
  { code: 'FRA', name: 'Francia',       players: 20, colors: ['#002395','#FFFFFF','#ED2939'] },
  { code: 'ESP', name: 'España',        players: 20, colors: ['#AA151B','#F1BF00','#AA151B'] },
  { code: 'ENG', name: 'Inglaterra',    players: 20, colors: ['#FFFFFF','#CF091D','#FFFFFF'] },
  { code: 'GER', name: 'Alemania',      players: 20, colors: ['#000000','#DD0000','#FFCE00'] },
  { code: 'USA', name: 'EUA',           players: 20, colors: ['#B22234','#FFFFFF','#3C3B6E'] },
  { code: 'POR', name: 'Portugal',      players: 20, colors: ['#006600','#FFFFFF','#FF0000'] },
  { code: 'NED', name: 'Países Bajos',  players: 20, colors: ['#AE1C28','#FFFFFF','#21468B'] },
  { code: 'BEL', name: 'Bélgica',       players: 20, colors: ['#000000','#FAE042','#EF3340'] },
  { code: 'CRO', name: 'Croacia',       players: 20, colors: ['#FF0000','#FFFFFF','#0000FF'] },
  { code: 'URU', name: 'Uruguay',       players: 20, colors: ['#5CB8E4','#FFFFFF','#5CB8E4'] },
  { code: 'COL', name: 'Colombia',      players: 20, colors: ['#FCD116','#003087','#CE1126'] },
  { code: 'SEN', name: 'Senegal',       players: 20, colors: ['#00853F','#FDEF42','#E31B23'] },
  { code: 'JPN', name: 'Japón',         players: 20, colors: ['#FFFFFF','#BC002D','#FFFFFF'] },
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
  const total   = stickers.length;
  const owned   = stickers.filter(s => s.state !== 'missing').length;
  const missing = stickers.filter(s => s.state === 'missing').length;
  const dupes   = stickers
    .filter(s => s.state === 'duplicate')
    .reduce((acc, s) => acc + (s.count || 1), 0);
  const pct = total > 0 ? (owned / total) * 100 : 0;
  return { total, owned, missing, dupes, pct };
}

export function cycleQuick(sticker: Sticker): Sticker {
  if (sticker.state === 'missing')   return { ...sticker, state: 'owned',     count: 0 };
  if (sticker.state === 'owned')     return { ...sticker, state: 'duplicate', count: 1 };
  if (sticker.state === 'duplicate') {
    if (sticker.count >= 4) return { ...sticker, state: 'missing', count: 0 };
    return { ...sticker, count: sticker.count + 1 };
  }
  return sticker;
}

export interface Album {
  id:       string;
  name:     string;
  subtitle: string;
  cover:    string;
  accent:   string;
  active:   boolean;
}

export const ALBUMS: Album[] = [
  { id: 'mundial26',  name: 'Mundial 2026',         subtitle: 'Edición México · 670 estampas', cover: '#0E5B3A', accent: '#E89B2F', active: true },
  { id: 'champ24',   name: 'Champions 24/25',       subtitle: '32 clubes · 580 estampas',      cover: '#1B2D63', accent: '#67B7E8', active: false },
  { id: 'libert25',  name: 'Copa América Femenina', subtitle: '12 selecciones · 270 estampas', cover: '#D7263D', accent: '#F2E8D0', active: false },
];
