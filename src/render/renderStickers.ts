import type { Team } from "../types/album";

const statusSymbol = {
  missing: ".",
  have: "✓",
  duplicate: "×",
};

export function renderStickers(
  container: HTMLElement,
  team: Team,
  changedStickerNumber?: string,
): void {
  container.innerHTML = team.stickers
    .map(
      (sticker) => `
        <button 
          class="sticker-cell sticker-cell--${sticker.status} ${
            sticker.number === changedStickerNumber ? "changed" : ""
          }"
          data-sticker="${sticker.number}"
          data-status="${sticker.status}"
        >
          <span class="sticker-number">${sticker.number}</span>
          <span class="sticker-symbol">${statusSymbol[sticker.status]}</span>
        </button>
      `,
    )
    .join("");
}
