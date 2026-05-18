import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveProgress, loadProgress, clearProgress, savePreferences, loadPreferences } from '../src/services/storage';
import type { Team, AppPreferences } from '../src/types/album';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTeam: Team = {
    id: 'BRA',
    name: 'Brazil',
    code: 'BRA',
    stickers: [
      { number: '1', type: 'player', status: 'have' },
      { number: '2', type: 'player', status: 'missing' },
    ],
  };

  const mockTeams: Team[] = [mockTeam];

  const mockPreferences: AppPreferences = {
    motion: 'full',
    sound: 'on',
    vibration: 'on',
    density: 'compact',
    statusCycle: 'full',
    teamMatrix: '4x3',
    language: 'pt',
  };

  describe('saveProgress and loadProgress', () => {
    it('should save and load progress correctly', () => {
      saveProgress(mockTeams);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'album2026-progress',
        expect.any(String)
      );

      // Mock getItem to return the saved data
      const savedData = localStorageMock.setItem.mock.calls[0][1];
      localStorageMock.getItem.mockReturnValue(savedData);

      const loadedTeams = loadProgress([mockTeam]);

      expect(loadedTeams[0].stickers[0].status).toBe('have');
      expect(loadedTeams[0].stickers[1].status).toBe('missing');
    });

    it('should return original teams if no saved data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadProgress(mockTeams);
      expect(result).toBe(mockTeams);
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadProgress(mockTeams);
      expect(result).toBe(mockTeams);
    });
  });

  describe('clearProgress', () => {
    it('should clear progress from localStorage', () => {
      clearProgress();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('album2026-progress');
    });
  });

  describe('savePreferences and loadPreferences', () => {
    it('should save and load preferences correctly', () => {
      savePreferences(mockPreferences);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'album2026-settings',
        JSON.stringify(mockPreferences)
      );

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockPreferences));

      const loadedPrefs = loadPreferences();
      expect(loadedPrefs).toEqual(mockPreferences);
    });

    it('should return default preferences if no saved data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadPreferences();
      expect(result.motion).toBe('full');
      expect(result.sound).toBe('on');
    });

    it('should merge saved preferences with defaults', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ sound: 'off' }));

      const result = loadPreferences();
      expect(result.sound).toBe('off');
      expect(result.motion).toBe('full'); // default
    });
  });
});
