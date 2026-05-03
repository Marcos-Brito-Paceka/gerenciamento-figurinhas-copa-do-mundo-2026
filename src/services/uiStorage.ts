type UIState = {
  selectedTeamIndex: number
  activeFilter: 'all' | 'have' | 'missing' | 'duplicate'
  stickerQuery: string
}

const UI_KEY = 'album2026-ui'

export function saveUIState(state: UIState): void {
  localStorage.setItem(UI_KEY, JSON.stringify(state))
}

export function loadUIState(): Partial<UIState> {
  const saved = localStorage.getItem(UI_KEY)

  if (!saved) return {}

  try {
    return JSON.parse(saved)
  } catch {
    return {}
  }
}