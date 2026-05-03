import type { Team } from '../types/album'

const statusLabel = {
  missing: 'Faltando',
  have: 'Tenho',
  duplicate: 'Repetida',
}

export function renderStickers(container: HTMLElement, team: Team): void {
  container.innerHTML = team.stickers
    .map(
      (sticker) => `
        <button 
          class="sticker-cell"
          data-sticker="${sticker.number}"
          data-status="${sticker.status}"
        >
          <strong>${sticker.number}</strong>
          <span>${sticker.name}</span>
          <small>${statusLabel[sticker.status]}</small>
        </button>
      `,
    )
    .join('')
}