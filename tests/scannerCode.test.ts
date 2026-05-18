import { describe, expect, it } from 'vitest';
import { teams } from '../src/data/team';
import { normalizeScannedStickerNumber } from '../src/utils/scannerCode';

describe('scannerCode', () => {
  it('normalizes exact national team sticker codes', () => {
    expect(normalizeScannedStickerNumber('HAI20', teams)).toBe('HAI 20');
    expect(normalizeScannedStickerNumber('BRA 03', teams)).toBe('BRA 03');
  });

  it('corrects common OCR mistakes against the team catalog', () => {
    expect(normalizeScannedStickerNumber('WA 20', teams)).toBe('HAI 20');
    expect(normalizeScannedStickerNumber('HA1 2O', teams)).toBe('HAI 20');
  });

  it('rejects numbers outside national team sticker ranges', () => {
    expect(normalizeScannedStickerNumber('HAI 99', teams)).toBeNull();
  });

  it('rejects weak partial reads instead of guessing a team', () => {
    expect(normalizeScannedStickerNumber('CI', teams)).toBeNull();
    expect(normalizeScannedStickerNumber('CI 01', teams)).toBeNull();
  });
});
