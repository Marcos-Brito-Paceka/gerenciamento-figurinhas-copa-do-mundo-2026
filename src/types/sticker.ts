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