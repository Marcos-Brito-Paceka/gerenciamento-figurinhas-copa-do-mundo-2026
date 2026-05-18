import type { Team } from "../types/album";

type BindAppEventsParams = {
  matrix: HTMLElement;
  stickerMatrix: HTMLElement;
  albumTeams: Team[];
  teamSearch: HTMLInputElement;
  incompleteFilter: HTMLButtonElement;
  getSelectedTeamIndex: () => number;
  setSelectedTeamIndex: (index: number) => void;
  updateSelectedTeam: (index: number) => void;
  updateProgress: () => void;
  updateAlbumSummary: () => void;
  toggleStickerStatus: (stickerNumber: string) => void;
  getVisibleTeams: () => Team[];
  renderTeamMatrix: () => void;
  setTeamQuery: (query: string) => void;
  toggleIncompleteFilter: () => void;
};

export function bindAppEvents(params: BindAppEventsParams): void {
  params.matrix.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    const teamButton = target.closest("[data-team]");

    if (!teamButton) return;

    const teamId = teamButton.getAttribute("data-team");
    const index = params.albumTeams.findIndex((team) => team.id === teamId);

    if (index !== -1) {
      params.setSelectedTeamIndex(index);
      params.updateSelectedTeam(index);
    }
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
    params.renderTeamMatrix();
  });

  params.incompleteFilter.addEventListener("click", () => {
    params.toggleIncompleteFilter();
  });
}
