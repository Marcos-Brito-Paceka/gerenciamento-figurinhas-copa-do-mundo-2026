import { describe, it, expect } from 'vitest';
import { countOwned, getAllStickers, countByStatus, getProgressPercent, isTeamComplete } from '../src/utils/albumStats';
import type { Sticker, Team } from '../src/types/album';

describe('albumStats', () => {
  const mockStickers: Sticker[] = [
    { number: '1', name: 'Player1', type: 'player', status: 'have' },
    { number: '2', name: 'Player2', type: 'player', status: 'missing' },
    { number: '3', name: 'Player3', type: 'player', status: 'duplicate' },
    { number: '4', name: 'Player4', type: 'player', status: 'have' },
  ];

  const mockTeam: Team = {
      id: 'BRA',
      name: 'Brazil',
      stickers: mockStickers,
      code: ''
  };

  const mockTeams: Team[] = [mockTeam];

  it('should count owned stickers correctly', () => {
    expect(countOwned(mockStickers)).toBe(3);
  });

  it('should get all stickers from teams', () => {
    expect(getAllStickers(mockTeams)).toEqual(mockStickers);
  });

  it('should count stickers by status', () => {
    expect(countByStatus(mockStickers, 'have')).toBe(2);
    expect(countByStatus(mockStickers, 'missing')).toBe(1);
    expect(countByStatus(mockStickers, 'duplicate')).toBe(1);
  });

  it('should calculate progress percent', () => {
    expect(getProgressPercent(mockStickers)).toBe(75); // 3/4 * 100 = 75
    expect(getProgressPercent([])).toBe(0);
    const allHave = mockStickers.map(s => ({ ...s, status: 'have' as const }));
    expect(getProgressPercent(allHave)).toBe(100);
  });

  it('should check if team is complete', () => {
    expect(isTeamComplete(mockTeam)).toBe(false);
    const completeTeam: Team = {
      ...mockTeam,
      stickers: mockStickers.map(s => ({ ...s, status: 'have' as const })),
    };
    expect(isTeamComplete(completeTeam)).toBe(true);
  });
});