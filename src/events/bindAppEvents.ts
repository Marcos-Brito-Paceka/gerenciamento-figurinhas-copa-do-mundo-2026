import type { Team } from "../types/album";

type BindAppEventsParams = {
  matrix: HTMLElement;
  stickerMatrix: HTMLElement;
  stickerFilters: HTMLElement;
  stickerSearch: HTMLInputElement;
  albumTeams: Team[];
  teamSearch: HTMLInputElement;
  getSelectedTeamIndex: () => number;
  setSelectedTeamIndex: (index: number) => void;
  getActiveFilter: () => "all" | "have" | "missing" | "duplicate";
  setActiveFilter: (filter: "all" | "have" | "missing" | "duplicate") => void;
  setStickerQuery: (query: string) => void;
  updateSelectedTeam: (index: number) => void;
  updateProgress: () => void;
  updateAlbumSummary: () => void;
  toggleStickerStatus: (stickerNumber: string) => void;
  toggleShowAllTeams: () => void;
  getVisibleTeams: () => Team[];
  setTeamQuery: (query: string) => void;
};

export function bindAppEvents(params: BindAppEventsParams): void {
  params.matrix.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const toggleButton = target.closest("[data-team-toggle]");

    if (toggleButton) {
      params.toggleShowAllTeams();
      return;
    }

    const teamButton = target.closest("[data-team]");

    if (!teamButton) return;

    const teamId = teamButton.getAttribute("data-team");
    const index = params.albumTeams.findIndex((team) => team.id === teamId);

    if (index !== -1) {
      params.setSelectedTeamIndex(index);
      params.updateSelectedTeam(index);
    }
  });

  params.stickerFilters.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const filterButton = target.closest("[data-filter]");

    if (!filterButton) return;

    const filter = filterButton.getAttribute("data-filter");

    if (
      filter !== "all" &&
      filter !== "have" &&
      filter !== "missing" &&
      filter !== "duplicate"
    ) {
      return;
    }

    params.setActiveFilter(filter);
    params.updateSelectedTeam(params.getSelectedTeamIndex());
  });

  params.stickerSearch.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;

    params.setStickerQuery(target.value);
    params.updateSelectedTeam(params.getSelectedTeamIndex());
  });

  params.stickerMatrix.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const stickerButton = target.closest("[data-sticker]");

    if (!stickerButton) return;

    const stickerNumber = stickerButton.getAttribute("data-sticker");
    const team = params.albumTeams[params.getSelectedTeamIndex()];
    const sticker = team.stickers.find((item) => item.number === stickerNumber);

    if (!sticker) return;


    if (!stickerNumber) return;

    params.toggleStickerStatus(stickerNumber);
  });

  params.teamSearch.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;

    params.setTeamQuery(target.value);
    params.updateSelectedTeam(params.getSelectedTeamIndex());
  });
}
