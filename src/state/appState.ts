import type { AppPreferences } from '../types/album'
import type { Team } from '../types/album'

export const defaultPreferences: AppPreferences = {
  motion: 'full',
  sound: 'on',
  vibration: 'on',
  scanner: 'off',
  density: 'compact',
  statusCycle: 'full',
  teamMatrix: '4x3',
  language: 'pt',
}

export type AppState = {
  albumTeams: Team[]
  selectedTeamIndex: number
  teamQuery: string
  showIncompleteOnly: boolean
}

export function createAppState(teams: Team[]): AppState {
  return {
    albumTeams: teams,
    selectedTeamIndex: 0,
    teamQuery: '',
    showIncompleteOnly: false,
  }
}
