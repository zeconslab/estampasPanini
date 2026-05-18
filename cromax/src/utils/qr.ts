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
