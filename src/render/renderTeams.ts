import type { Team } from "../types/album";
import { flagStyles } from "../data/flagStyles";
import { getFlagSvgUrl } from "../data/flagSvgSources";
import { getProgressPercent } from "../utils/albumStats";

type RenderTeamsOptions = {
  selectedTeamId: string;
  matrix: "4x3" | "5x3" | "6x4";
  visibleLimit?: number;
};

export function renderTeams(
  container: HTMLElement,
  teams: Team[],
  options: RenderTeamsOptions,
): void {
  const previousAngles = new Map(
    Array.from(container.querySelectorAll<HTMLElement>("[data-team]")).map(
      (teamButton) => [
        teamButton.dataset.team || "",
        teamButton.style.getPropertyValue("--angle"),
      ],
    ),
  );
  const matrixLimits = {
    "4x3": 12,
    "5x3": 15,
    "6x4": 24,
  };
  const visibleLimit = options.visibleLimit ?? matrixLimits[options.matrix];
  const teamPages = Array.from(
    { length: Math.ceil(teams.length / visibleLimit) },
    (_, index) => teams.slice(index * visibleLimit, (index + 1) * visibleLimit),
  );

  function progressDotColor(value: number): string {
    if (value >= 80) return "var(--have)";
    if (value >= 45) return "var(--accent)";
    return "var(--missing)";
  }

  function renderTeamCell(team: Team): string {
    const isSection = team.kind === "section";
    const flag =
      flagStyles[team.code] ??
      "linear-gradient(135deg, rgba(214, 225, 102, 0.42), #fffdf8)";
    const completion = getProgressPercent(team.stickers);
    const flagSvgUrl = isSection ? null : getFlagSvgUrl(team.code);
    const progressAngle = `${completion * 3.6}deg`;
    const previousAngle = previousAngles.get(team.id) || progressAngle;

    return `
      <button
        class="team-cell ${isSection ? "team-cell--section" : ""} ${team.id === options.selectedTeamId ? "active" : ""}"
        data-team="${team.id}"
        data-progress-angle="${progressAngle}"
        style="--flag: ${flag}; --angle: ${previousAngle}; --dot: ${progressDotColor(completion)}"
        aria-label="${team.name}, ${completion}% completo"
      >
        ${
          isSection
            ? `<span class="team-section-icon" aria-hidden="true">FWC</span>`
            : `<span class="team-flag" aria-hidden="true" ${flagSvgUrl ? "hidden" : ""}></span>`
        }
        ${
          flagSvgUrl
            ? `<img class="team-flag-image" src="${flagSvgUrl}" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.previousElementSibling.hidden=false" />`
            : ""
        }
        <span>${team.code}</span>
      </button>
    `;
  }

  container.innerHTML = `
    ${
      teamPages.length
        ? teamPages
            .map(
              (page, index) => `
                <div class="team-page" aria-label="Página ${index + 1} de ${teamPages.length}">
                  ${page.map(renderTeamCell).join("")}
                </div>
              `,
            )
            .join("")
        : `<p class="team-empty">Nenhuma seção ou seleção encontrada.</p>`
    }
  `;

  requestAnimationFrame(() => {
    container
      .querySelectorAll<HTMLElement>("[data-progress-angle]")
      .forEach((teamButton) => {
        const angle = teamButton.dataset.progressAngle;

        if (angle) {
          teamButton.style.setProperty("--angle", angle);
        }
      });
  });
}
