import type { Team } from '../types/album'

export function renderTeams(
  container: HTMLElement,
  teams: Team[],
  selectedTeamId: string,
): void {
  container.innerHTML = teams
    .map(
      (team) => `
        <button 
          class="team-cell ${
            team.id === selectedTeamId ? 'active' : ''
          }"
          data-team="${team.id}"
        >
          ${team.code}
        </button>
      `,
    )
    .join('')
}