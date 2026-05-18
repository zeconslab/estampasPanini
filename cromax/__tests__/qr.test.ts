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
