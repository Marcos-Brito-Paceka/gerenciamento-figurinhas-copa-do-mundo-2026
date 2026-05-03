import type { Team } from '../types/album'
import {
  countByStatus,
  countOwned,
  getAllStickers,
  getProgressPercent,
} from '../utils/albumStats'

export function renderAlbumSummary(
  container: HTMLElement,
  teams: Team[],
): void {
  const stickers = getAllStickers(teams)
  const completion = getProgressPercent(stickers)

  container.innerHTML = `
    <section class="summary" aria-label="Resumo do álbum">
      <div class="dial">
        <div class="ring" style="--angle: ${completion * 3.6}deg">
          <span>${completion}%</span>
        </div>
      </div>

      <div class="counters">
        <article class="counter">
          <strong>${stickers.length}</strong>
          <span>Total</span>
        </article>

        <article class="counter">
          <strong>${countOwned(stickers)}</strong>
          <span>Tenho</span>
        </article>

        <article class="counter">
          <strong>${countByStatus(stickers, 'missing')}</strong>
          <span>Faltam</span>
        </article>

        <article class="counter">
          <strong>${countByStatus(stickers, 'duplicate')}</strong>
          <span>Repetidas</span>
        </article>
      </div>
   </section>
  `
}
