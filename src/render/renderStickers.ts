import type { Team } from "../types/album";

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
        </button>
      `,
    ).join("");
}
