import type { StickerStatus } from '../types/album'

export function getNextStatus(status: StickerStatus): StickerStatus {
  if (status === 'missing') return 'have'
  if (status === 'have') return 'duplicate'

  return 'missing'
}