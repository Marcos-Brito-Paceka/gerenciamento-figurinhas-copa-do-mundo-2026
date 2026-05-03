import type { Team } from '../types/album'
import { countOwned, getProgressPercent } from '../utils/albumStats'

export function renderTeamHeader(
  container: HTMLElement,
  team: Team,
): void {
  const owned = countOwned(team.stickers)
  const progress = getProgressPercent(team.stickers)
  const previousFill = container.querySelector<HTMLElement>('.team-progress div')
  const previousWidth = previousFill?.style.width || '0%'

  container.innerHTML = `
    <article class="team-header">
      <div>
        <span>Seleção ativa</span>
        <h2>${team.name}</h2>
        <p>${owned} / ${team.stickers.length} figurinhas · ${progress}%</p>
      </div>

      <strong>${team.code}</strong>

      <div class="team-progress">
        <div style="width: ${previousWidth}"></div>
      </div>
    </article>
  `

  const nextFill = container.querySelector<HTMLElement>('.team-progress div')

  requestAnimationFrame(() => {
    if (nextFill) {
      nextFill.style.width = `${progress}%`
    }
  })
}
