import type { Team } from "../types/album";
import { flagStyles } from "../data/flagStyles";

type RenderTeamsOptions = {
  selectedTeamId: string;
  showAllTeams: boolean;
  visibleLimit?: number;
};

export function renderTeams(
  container: HTMLElement,
  teams: Team[],
  options: RenderTeamsOptions,
): void {
  const visibleLimit = options.visibleLimit ?? 12;
  const visibleTeams = options.showAllTeams
    ? teams
    : teams.slice(0, visibleLimit);

  const hiddenCount = Math.max(teams.length - visibleLimit, 0);

  container.innerHTML = `
    ${visibleTeams
      .map((team) => {
        const flag =
          flagStyles[team.code] ??
          "linear-gradient(135deg, #e9e4d8, #fffdf8)";

        return `
          <button
            class="team-cell ${team.id === options.selectedTeamId ? "active" : ""}"
            data-team="${team.id}"
            style="--flag: ${flag}"
          >
            <span class="team-flag" aria-hidden="true"></span>
            <span>${team.code}</span>
          </button>
        `;
      })
      .join("")}

    ${
      hiddenCount > 0
        ? `
          <button class="team-toggle" type="button" data-team-toggle>
            ${options.showAllTeams ? "Ver menos" : `Ver mais seleções +${hiddenCount}`}
          </button>
        `
        : ""
    }
  `;
}
