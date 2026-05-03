export type StickerStatus = 'missing' | 'have' | 'duplicate'

export type Sticker = {
  number: string
  name: string
  type: string
  status: StickerStatus
}

export type Team = {
  id: string
  name: string
  code: string
  stickers: Sticker[]
}

export type AppPreferences = {
  motion: 'full' | 'light'
  sound: 'on' | 'off'
  vibration: 'on' | 'off'
  density: 'compact' | 'comfortable'
  statusCycle: 'full' | 'simple'
  language: 'pt' | 'en'
}

// export type AppState = {
//   selectedTeamId: string
//   selectedStickerNumber: string
//   teamQuery: string
//   stickerQuery: string
//   activeFilter: StickerStatus | 'all'
//   showAllTeams: boolean
//   activeView: 'collection' | 'dashboard'
//   preferences: AppPreferences
// }