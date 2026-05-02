import type { Team } from '../types/album'

export function renderTeams(
  container: HTMLElement,
  teams: Team[],
): void {
  container.innerHTML = teams
    .map(
      (team) => `
        <button 
          class="team-cell"
          data-team="${team.id}"
        >
          ${team.code}
        </button>
      `,
    )
    .join('')
}