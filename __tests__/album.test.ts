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
