import type { AppPreferences, Team } from '../types/album'
import { defaultPreferences } from '../state/appState'
import { debounce } from '../utils/debounce'
import { compress, decompress } from 'lz-string'

const PROGRESS_KEY = 'album2026-progress'
const PREFERENCES_KEY = 'album2026-settings'

type SavedSticker = {
  number: string
  status: 'missing' | 'have' | 'duplicate'
}

type SavedTeam = {
  id: string
  stickers: SavedSticker[]
}

export function saveProgress(teams: Team[]): void {
  const payload: SavedTeam[] = teams.map((team) => ({
    id: team.id,
    stickers: team.stickers.map((sticker) => ({
      number: sticker.number,
      status: sticker.status,
    })),
  }))

  const json = JSON.stringify(payload)
  const compressed = compress(json)
  localStorage.setItem(PROGRESS_KEY, compressed)
}

export const debouncedSaveProgress = debounce(saveProgress, 500)

export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY)
}

export function loadProgress(teams: Team[]): Team[] {
  const saved = localStorage.getItem(PROGRESS_KEY)

  if (!saved) return teams

  try {
    const decompressed = decompress(saved)
    if (!decompressed) return teams
    const parsed = JSON.parse(decompressed) as SavedTeam[]

    parsed.forEach((savedTeam) => {
      const team = teams.find((item) => item.id === savedTeam.id)

      if (!team) return

      savedTeam.stickers.forEach((savedSticker) => {
        const sticker = team.stickers.find(
          (item) => item.number === savedSticker.number,
        )

        if (sticker) {
          sticker.status = savedSticker.status
        }
      })
    })

    return teams
  } catch {
    return teams
  }
}

export function savePreferences(preferences: AppPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
}

export function loadPreferences(): AppPreferences {
  const saved = localStorage.getItem(PREFERENCES_KEY)

  if (!saved) return defaultPreferences

  try {
    return {
      ...defaultPreferences,
      ...JSON.parse(saved),
    }
  } catch {
    return defaultPreferences
  }
}
