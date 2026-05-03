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

  container.innerHTML = `
    <section class="album-summary">
      <h2>Resumo do álbum</h2>

      <p>Progresso geral: ${getProgressPercent(stickers)}%</p>

      <div>
        <strong>${stickers.length}</strong>
        <span>Total</span>
      </div>

      <div>
        <strong>${countOwned(stickers)}</strong>
        <span>Tenho</span>
      </div>

      <div>
        <strong>${countByStatus(stickers, 'missing')}</strong>
        <span>Faltam</span>
      </div>

      <div>
        <strong>${countByStatus(stickers, 'duplicate')}</strong>
        <span>Repetidas</span>
      </div>
    </section>
  `
}