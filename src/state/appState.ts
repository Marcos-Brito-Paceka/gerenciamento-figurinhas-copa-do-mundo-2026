import type { AppPreferences, AppState } from '../types/album'

export const defaultPreferences: AppPreferences = {
  motion: 'full',
  sound: 'on',
  vibration: 'on',
  density: 'compact',
  statusCycle: 'full',
  language: 'pt',
}

export const appState: AppState = {
  selectedTeamId: 'brasil',
  selectedStickerNumber: 'BRA 01',
  teamQuery: '',
  stickerQuery: '',
  activeFilter: 'all',
  showAllTeams: false,
  activeView: 'collection',
  preferences: defaultPreferences,
}