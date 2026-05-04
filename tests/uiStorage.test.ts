import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveUIState, loadUIState } from '../src/services/uiStorage';

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

describe('uiStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUIState = {
    selectedTeamIndex: 1,
  };

  it('should save UI state correctly', () => {
    saveUIState(mockUIState);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'album2026-ui',
      JSON.stringify(mockUIState)
    );
  });

  it('should load UI state correctly', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUIState));

    const result = loadUIState();
    expect(result).toEqual(mockUIState);
  });

  it('should return empty object if no saved data', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const result = loadUIState();
    expect(result).toEqual({});
  });

  it('should handle corrupted data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const result = loadUIState();
    expect(result).toEqual({});
  });
});