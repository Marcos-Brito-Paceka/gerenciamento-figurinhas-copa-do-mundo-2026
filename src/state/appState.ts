import type { AppPreferences } from '../types/album'
import type { Team } from '../types/album'

export const defaultPreferences: AppPreferences = {
  motion: 'full',
  sound: 'on',
  vibration: 'on',
  density: 'compact',
  statusCycle: 'full',
  language: 'pt',
}

export type AppState = {
  albumTeams: Team[]
  selectedTeamIndex: number
  teamQuery: string
}

export function createAppState(teams: Team[]): AppState {
  return {
    albumTeams: teams,
    selectedTeamIndex: 0,
    teamQuery: '',
  }
}
