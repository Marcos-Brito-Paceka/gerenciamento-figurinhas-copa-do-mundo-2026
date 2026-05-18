import { describe, expect, it } from 'vitest';
import { teams } from '../src/data/team';

describe('team data', () => {
  it('keeps stickers scoped to number, type and status', () => {
    expect(teams.length).toBeGreaterThan(0);

    teams.forEach((team) => {
      team.stickers.forEach((sticker) => {
        expect(Object.keys(sticker).sort()).toEqual([
          'number',
          'status',
          'type',
        ]);
      });
    });
  });

  it('keeps national team sticker numbers stable', () => {
    const nationalTeams = teams.filter((team) => team.kind === 'team');

    expect(nationalTeams.length).toBeGreaterThan(0);

    nationalTeams.forEach((team) => {
      expect(team.stickers).toHaveLength(20);

      team.stickers.forEach((sticker, index) => {
        const stickerNumber = String(index + 1).padStart(2, '0');

        expect(sticker.number).toBe(`${team.code} ${stickerNumber}`);
      });
    });
  });
});
