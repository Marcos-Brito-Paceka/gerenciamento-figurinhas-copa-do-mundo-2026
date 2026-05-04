import type { Team } from '../types/album'
import { getFlagSvgUrl } from '../data/flagSvgSources'
import { getTeamTheme } from '../data/teamThemes'
import { countOwned, getProgressPercent } from '../utils/albumStats'

export function updateTeamHeaderProgress(
  container: HTMLElement,
  team: Team,
): void {
  const owned = countOwned(team.stickers)
  const progress = getProgressPercent(team.stickers)
  const meta = container.querySelector<HTMLParagraphElement>('[data-team-meta]')
  const fill = container.querySelector<HTMLElement>('.team-progress div')

  if (meta) {
    meta.textContent = `${owned} / ${team.stickers.length} figurinhas · ${progress}%`
  }

  if (fill) {
    fill.style.width = `${progress}%`
  }
}

export function renderTeamHeader(
  container: HTMLElement,
  team: Team,
): void {
  const owned = countOwned(team.stickers)
  const progress = getProgressPercent(team.stickers)
  const previousFill = container.querySelector<HTMLElement>('.team-progress div')
  const previousWidth = previousFill?.style.width || '0%'
  const flagSvgUrl = team.kind === 'section' ? null : getFlagSvgUrl(team.code)
  const [themeA, themeB, themeC] = getTeamTheme(team.code, team.kind)
  const headerVisual = flagSvgUrl
    ? `<img class="team-header-flag" src="${flagSvgUrl}" alt="" loading="lazy" decoding="async" />`
    : `<strong class="team-header-code">${team.code}</strong>`

  container.innerHTML = `
    <article class="team-header" style="--team-theme-a: ${themeA}; --team-theme-b: ${themeB}; --team-theme-c: ${themeC}">
      <div>
        <span>${team.kind === 'section' ? 'Seção ativa' : 'Seleção ativa'}</span>
        <h2>${team.name}</h2>
        <p data-team-meta>${owned} / ${team.stickers.length} figurinhas · ${progress}%</p>
      </div>

      ${headerVisual}

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
