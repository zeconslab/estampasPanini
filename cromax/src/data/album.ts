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
  albumId:      string;
  name:         string;
  age:          string;
  withCocaCola: boolean;
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

// ─── 48 selecciones · 12 grupos · estructura oficial Panini ──────────────────
// Cada selección: 1 escudo + 1 foto grupal + 18 jugadores = 20 estampas
// 48 × 20 = 960 + 20 especiales FIFA = 980 total
export const TEAMS: Array<{
  code: string; name: string; group: string; players: number;
  colors: [string, string, string];
}> = [
  // ── Grupo A ──────────────────────────────────────────
  { code: 'MEX', name: 'México',               group: 'A', players: 18, colors: ['#006847','#FFFFFF','#CE1126'] },
  { code: 'KOR', name: 'Corea del Sur',        group: 'A', players: 18, colors: ['#FFFFFF','#C60C30','#003478'] },
  { code: 'RSA', name: 'Sudáfrica',            group: 'A', players: 18, colors: ['#007A4D','#FFB612','#001489'] },
  { code: 'CZE', name: 'Chequia',              group: 'A', players: 18, colors: ['#D7141A','#FFFFFF','#11457E'] },
  // ── Grupo B ──────────────────────────────────────────
  { code: 'CAN', name: 'Canadá',               group: 'B', players: 18, colors: ['#FF0000','#FFFFFF','#FF0000'] },
  { code: 'QAT', name: 'Catar',                group: 'B', players: 18, colors: ['#8D1B3D','#FFFFFF','#8D1B3D'] },
  { code: 'SUI', name: 'Suiza',                group: 'B', players: 18, colors: ['#FF0000','#FFFFFF','#FF0000'] },
  { code: 'BIH', name: 'Bosnia y Herz.',       group: 'B', players: 18, colors: ['#002395','#FECB00','#FFFFFF'] },
  // ── Grupo C ──────────────────────────────────────────
  { code: 'BRA', name: 'Brasil',               group: 'C', players: 18, colors: ['#FEDF00','#009C3B','#002776'] },
  { code: 'HAI', name: 'Haití',                group: 'C', players: 18, colors: ['#00209F','#D21034','#000000'] },
  { code: 'MAR', name: 'Marruecos',            group: 'C', players: 18, colors: ['#C1272D','#006233','#C1272D'] },
  { code: 'SCO', name: 'Escocia',              group: 'C', players: 18, colors: ['#003087','#FFFFFF','#003087'] },
  // ── Grupo D ──────────────────────────────────────────
  { code: 'USA', name: 'EUA',                  group: 'D', players: 18, colors: ['#B22234','#FFFFFF','#3C3B6E'] },
  { code: 'AUS', name: 'Australia',            group: 'D', players: 18, colors: ['#00008B','#FFD700','#00008B'] },
  { code: 'PAR', name: 'Paraguay',             group: 'D', players: 18, colors: ['#D52B1E','#FFFFFF','#0038A8'] },
  { code: 'TUR', name: 'Turquía',              group: 'D', players: 18, colors: ['#E30A17','#FFFFFF','#E30A17'] },
  // ── Grupo E ──────────────────────────────────────────
  { code: 'GER', name: 'Alemania',             group: 'E', players: 18, colors: ['#000000','#DD0000','#FFCE00'] },
  { code: 'ECU', name: 'Ecuador',              group: 'E', players: 18, colors: ['#FFD100','#003DA5','#FF0000'] },
  { code: 'CUW', name: 'Curazao',              group: 'E', players: 18, colors: ['#002B7F','#F7D618','#FFFFFF'] },
  { code: 'CIV', name: 'Costa de Marfil',      group: 'E', players: 18, colors: ['#F77F00','#FFFFFF','#009A44'] },
  // ── Grupo F ──────────────────────────────────────────
  { code: 'NED', name: 'Países Bajos',         group: 'F', players: 18, colors: ['#AE1C28','#FFFFFF','#21468B'] },
  { code: 'JPN', name: 'Japón',                group: 'F', players: 18, colors: ['#FFFFFF','#BC002D','#FFFFFF'] },
  { code: 'SWE', name: 'Suecia',               group: 'F', players: 18, colors: ['#006AA7','#FECC02','#006AA7'] },
  { code: 'TUN', name: 'Túnez',                group: 'F', players: 18, colors: ['#E70013','#FFFFFF','#E70013'] },
  // ── Grupo G ──────────────────────────────────────────
  { code: 'BEL', name: 'Bélgica',              group: 'G', players: 18, colors: ['#000000','#FAE042','#EF3340'] },
  { code: 'EGY', name: 'Egipto',               group: 'G', players: 18, colors: ['#CE1126','#FFFFFF','#000000'] },
  { code: 'IRN', name: 'Irán',                 group: 'G', players: 18, colors: ['#239F40','#FFFFFF','#DA0000'] },
  { code: 'NZL', name: 'Nueva Zelanda',        group: 'G', players: 18, colors: ['#00247D','#CC142B','#00247D'] },
  // ── Grupo H ──────────────────────────────────────────
  { code: 'ESP', name: 'España',               group: 'H', players: 18, colors: ['#AA151B','#F1BF00','#AA151B'] },
  { code: 'URU', name: 'Uruguay',              group: 'H', players: 18, colors: ['#5CB8E4','#FFFFFF','#5CB8E4'] },
  { code: 'KSA', name: 'Arabia Saudita',       group: 'H', players: 18, colors: ['#006C35','#FFFFFF','#006C35'] },
  { code: 'CPV', name: 'Cabo Verde',           group: 'H', players: 18, colors: ['#003893','#FFFFFF','#CF2027'] },
  // ── Grupo I ──────────────────────────────────────────
  { code: 'FRA', name: 'Francia',              group: 'I', players: 18, colors: ['#002395','#FFFFFF','#ED2939'] },
  { code: 'SEN', name: 'Senegal',              group: 'I', players: 18, colors: ['#00853F','#FDEF42','#E31B23'] },
  { code: 'NOR', name: 'Noruega',              group: 'I', players: 18, colors: ['#EF2B2D','#FFFFFF','#002868'] },
  { code: 'IRQ', name: 'Irak',                 group: 'I', players: 18, colors: ['#007A3D','#FFFFFF','#CE1126'] },
  // ── Grupo J ──────────────────────────────────────────
  { code: 'ARG', name: 'Argentina',            group: 'J', players: 18, colors: ['#75AADB','#FFFFFF','#75AADB'] },
  { code: 'AUT', name: 'Austria',              group: 'J', players: 18, colors: ['#ED2939','#FFFFFF','#ED2939'] },
  { code: 'ALG', name: 'Argelia',              group: 'J', players: 18, colors: ['#006233','#FFFFFF','#D21034'] },
  { code: 'JOR', name: 'Jordania',             group: 'J', players: 18, colors: ['#007A3D','#000000','#CE1126'] },
  // ── Grupo K ──────────────────────────────────────────
  { code: 'COL', name: 'Colombia',             group: 'K', players: 18, colors: ['#FCD116','#003087','#CE1126'] },
  { code: 'POR', name: 'Portugal',             group: 'K', players: 18, colors: ['#006600','#FFFFFF','#FF0000'] },
  { code: 'UZB', name: 'Uzbekistán',           group: 'K', players: 18, colors: ['#1EB53A','#FFFFFF','#CE1126'] },
  { code: 'COD', name: 'RD del Congo',         group: 'K', players: 18, colors: ['#007FFF','#F7D618','#CE1126'] },
  // ── Grupo L ──────────────────────────────────────────
  { code: 'ENG', name: 'Inglaterra',           group: 'L', players: 18, colors: ['#FFFFFF','#CF091D','#FFFFFF'] },
  { code: 'CRO', name: 'Croacia',              group: 'L', players: 18, colors: ['#FF0000','#FFFFFF','#0000FF'] },
  { code: 'GHA', name: 'Ghana',                group: 'L', players: 18, colors: ['#006B3F','#FCD116','#CE1126'] },
  { code: 'PAN', name: 'Panamá',               group: 'L', players: 18, colors: ['#DA121A','#FFFFFF','#002B7F'] },
];

const FIRST_NAMES = ['Carlos','Luis','Juan','Diego','Andrés','Miguel','Jorge','Roberto','Fernando','Sergio','Raúl','Javier','Eduardo','Marco','Alexis','Gabriel','Héctor','Daniel','Pablo','Mateo'];
const LAST_NAMES  = ['García','Martínez','López','Hernández','González','Rodríguez','Pérez','Sánchez','Torres','Ramírez','Flores','Cruz','Morales','Reyes','Jiménez','Ortega','Silva','Castro','Vargas','Mendoza'];

// 14 estampas Colección Coca-Cola oficial (CC1–CC14)
const CC_STICKERS = [
  'Lamine Yamal',       // CC1
  'Joshua Kimmich',     // CC2
  'Harry Kane',         // CC3
  'Santiago Giménez',   // CC4
  'Joško Gvardiol',     // CC5
  'Federico Valverde',  // CC6
  'Jeferson Lerma',     // CC7
  'Enner Valencia',     // CC8
  'Gabriel Magalhães',  // CC9
  'Virgil van Dijk',    // CC10
  'Alphonso Davies',    // CC11
  'Emiliano Martínez',  // CC12
  'Raúl Jiménez',       // CC13
  'Lautaro Martínez',   // CC14
];

// 19 estampas FWC — sección FIFA World Cup
// FWC1–8: Intro / oficiales (foil)  |  FWC9–19: Historia / FIFA Museum
const FWC_STICKERS: { name: string; label: string }[] = [
  { label: 'FWC1',  name: 'Official Emblem 1' },
  { label: 'FWC2',  name: 'Official Emblem 2' },
  { label: 'FWC3',  name: 'Official Mascots' },
  { label: 'FWC4',  name: 'Official Slogan' },
  { label: 'FWC5',  name: 'Official Ball' },
  { label: 'FWC6',  name: 'Canadá sede' },
  { label: 'FWC7',  name: 'México sede' },
  { label: 'FWC8',  name: 'USA sede' },
  { label: 'FWC9',  name: 'Italia 1934' },
  { label: 'FWC10', name: 'Uruguay 1950' },
  { label: 'FWC11', name: 'Alemania Occidental 1954' },
  { label: 'FWC12', name: 'Brasil 1962' },
  { label: 'FWC13', name: 'Alemania Occidental 1974' },
  { label: 'FWC14', name: 'Argentina 1986' },
  { label: 'FWC15', name: 'Brasil 1994' },
  { label: 'FWC16', name: 'Brasil 2002' },
  { label: 'FWC17', name: 'Italia 2006' },
  { label: 'FWC18', name: 'Alemania 2014' },
  { label: 'FWC19', name: 'Argentina 2022' },
];

export function generateAlbum(seed: number, withCocaCola = false): Sticker[] {
  const rng = mulberry(seed);
  const pick = <T>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
  const stickers: Sticker[] = [];
  let id = 1;

  // Estampa 00 — Panini (la primera que se pega)
  stickers.push({
    id: id++, type: 'special', team: null,
    label: '00', name: 'Panini', state: 'missing', count: 0,
  });

  // 19 estampas FWC (FWC1–FWC19)
  FWC_STICKERS.forEach(({ label, name }) => {
    stickers.push({
      id: id++, type: 'special', team: null,
      label, name, state: 'missing', count: 0,
    });
  });

  // 48 selecciones × 20 = 960
  // Cada selección: 01 escudo · 02 portero · 03-12 jugadores · 13 foto grupal · 14-20 jugadores
  TEAMS.forEach((team) => {
    let teamNum = 1;

    // 01 — escudo
    stickers.push({
      id: id++, type: 'shield', team: team.code, teamNum: teamNum++,
      label: team.code, name: team.name, state: 'missing', count: 0,
    });

    // 02-12 — portero (1) + jugadores (10)
    for (let p = 0; p < 11; p++) {
      stickers.push({
        id: id++, type: 'player', team: team.code, teamNum: teamNum++,
        label: `${team.code}${p + 1}`,
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        state: 'missing', count: 0,
      });
    }

    // 13 — foto grupal
    stickers.push({
      id: id++, type: 'special', team: team.code, teamNum: teamNum++,
      label: `${team.code}-GRP`,
      name: `${team.name} · Foto grupal`,
      state: 'missing', count: 0,
    });

    // 14-20 — jugadores restantes (7)
    for (let p = 11; p < team.players; p++) {
      stickers.push({
        id: id++, type: 'player', team: team.code, teamNum: teamNum++,
        label: `${team.code}${p + 1}`,
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        state: 'missing', count: 0,
      });
    }
  });

  // 14 estampas Colección Coca-Cola (CC1–CC14) — solo si el usuario las activó
  if (withCocaCola) {
    CC_STICKERS.forEach((name, i) => {
      stickers.push({
        id: id++, type: 'player', team: 'CC',
        label: `CC${i + 1}`,
        name, state: 'missing', count: 0,
      });
    });
  }

  // 00 + FWC1–19 + 48×20 = 980  |  Con Coca-Cola: 994 ✓
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
  id:            string;
  name:          string;
  subtitle:      string;
  cover:         string;
  accent:        string;
  active:        boolean;
  baseCount:     number;
  cocaColaCount?: number;
}

export const ALBUMS: Album[] = [
  {
    id: 'mundial26', name: 'Mundial 2026',
    subtitle: '48 selecciones · 12 grupos · 980 estampas',
    cover: '#0E5B3A', accent: '#E89B2F', active: true,
    baseCount: 980, cocaColaCount: 14,
  },
  {
    id: 'champ24', name: 'Champions 24/25',
    subtitle: '32 clubes · 590 estampas',
    cover: '#1B2D63', accent: '#67B7E8', active: false,
    baseCount: 590,
  },
  {
    id: 'libert25', name: 'Copa América Femenina',
    subtitle: '12 selecciones · 290 estampas',
    cover: '#D7263D', accent: '#F2E8D0', active: false,
    baseCount: 290,
  },
];
