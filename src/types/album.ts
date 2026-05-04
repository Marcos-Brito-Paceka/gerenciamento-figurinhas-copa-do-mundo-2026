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
  kind?: 'section' | 'team'
  stickers: Sticker[]
}

export type AppPreferences = {
  motion: 'full' | 'light'
  sound: 'on' | 'off'
  vibration: 'on' | 'off'
  density: 'compact' | 'comfortable'
  statusCycle: 'full' | 'simple'
  teamMatrix: '4x3' | '5x3' | '6x4'
  language: 'pt' | 'en'
}
