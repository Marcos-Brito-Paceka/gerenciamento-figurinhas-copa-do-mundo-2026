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
