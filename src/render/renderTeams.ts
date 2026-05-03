import type { Team } from "../types/album";
import { flagStyles } from "../data/flagStyles.ts";


export function renderTeams(
  container: HTMLElement,
  teams: Team[],
  selectedTeamId: string,
): void {
  container.innerHTML = teams
    .map((team) => {
      const flag = flagStyles[team.code] ?? "linear-gradient(135deg, #e9e4d8, #fffdf8)";

      return `
        <button
          class="team-cell ${team.id === selectedTeamId ? "active" : ""}"
          data-team="${team.id}"
          style="--flag: ${flag}"
        >
          <span class="team-flag" aria-hidden="true"></span>
          <span>${team.code}</span>
        </button>
      `;
    })
    .join("");
}