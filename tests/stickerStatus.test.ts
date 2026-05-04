import { describe, it, expect } from 'vitest';
import { getNextStatus } from '../src/utils/stickerStatus';

describe('stickerStatus', () => {
  it('should cycle through statuses in full cycle', () => {
    expect(getNextStatus('missing')).toBe('have');
    expect(getNextStatus('have')).toBe('duplicate');
    expect(getNextStatus('duplicate')).toBe('missing');
  });

  it('should cycle through statuses in simple cycle', () => {
    expect(getNextStatus('missing', 'simple')).toBe('have');
    expect(getNextStatus('have', 'simple')).toBe('missing');
    expect(getNextStatus('duplicate', 'simple')).toBe('missing');
  });
});