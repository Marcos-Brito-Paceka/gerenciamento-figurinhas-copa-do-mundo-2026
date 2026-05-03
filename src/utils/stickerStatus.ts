import type { StickerStatus } from '../types/album'

export function getNextStatus(
  status: StickerStatus,
  cycle: 'full' | 'simple' = 'full',
): StickerStatus {
  if (cycle === 'simple') {
    return status === 'missing' ? 'have' : 'missing'
  }

  if (status === 'missing') return 'have'
  if (status === 'have') return 'duplicate'

  return 'missing'
}
