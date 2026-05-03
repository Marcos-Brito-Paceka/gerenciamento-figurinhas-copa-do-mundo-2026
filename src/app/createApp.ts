import "../style.css";
import { teams } from "../data/team.ts";
import { loadProgress, saveProgress } from "../services/storage";
import { getAllStickers, getProgressPercent } from "../utils/albumStats";
import { renderTeams } from "../render/renderTeams";
import { renderStickers } from "../render/renderStickers";
import { getNextStatus } from "../utils/stickerStatus";
import { renderTeamHeader } from "../render/renderTeamHeader";
import { renderAlbumSummary } from "../render/renderAlbumSummary";
import { renderAppShell } from "../render/renderAppShell";
import { bindAppEvents } from "../events/bindAppEvents";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento ${selector} não encontrado`);
  }

  return element;
}

export function createApp() {
  const app = getElement<HTMLDivElement>("#app");

  const albumTeams = loadProgress(teams);
  let selectedTeamIndex = 0;

  function getStickers() {
    return getAllStickers(albumTeams);
  }

  let activeFilter: "all" | "have" | "missing" | "duplicate" = "all";
  let stickerQuery = "";

  function updateFilterUI(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      "#stickerFilters button",
    );

    buttons.forEach((button) => {
      const filter = button.getAttribute("data-filter");

      if (filter === activeFilter) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  renderAppShell(app);

  const albumSummary = getElement<HTMLDivElement>("#albumSummary");
  const stickerSearch = getElement<HTMLInputElement>("#stickerSearch");

  function updateAlbumSummary(): void {
    renderAlbumSummary(albumSummary, albumTeams);
  }

  const matrix = getElement<HTMLDivElement>("#teamMatrix");
  const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
  const teamHeader = getElement<HTMLDivElement>("#teamHeader");
  const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");

  function updateSelectedTeam(index: number): void {
    selectedTeamIndex = index;

    const selectedTeam = albumTeams[selectedTeamIndex];

    renderTeamHeader(teamHeader, selectedTeam);

    renderTeams(matrix, albumTeams, selectedTeam.id);

    const normalizedQuery = stickerQuery.trim().toLowerCase();

    const stickers = selectedTeam.stickers.filter((sticker) => {
      const matchesFilter =
        activeFilter === "all" || sticker.status === activeFilter;

      const matchesSearch =
        !normalizedQuery ||
        `${sticker.number} ${sticker.name} ${sticker.type}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesSearch;
    });

    stickerResults.textContent = `Mostrando ${stickers.length} de ${selectedTeam.stickers.length} figurinhas`;

    renderStickers(stickerMatrix, {
      ...selectedTeam,
      stickers,
    });
  }

  const stickerFilters = getElement<HTMLDivElement>("#stickerFilters");

  renderTeams(matrix, albumTeams, albumTeams[selectedTeamIndex].id);
  updateSelectedTeam(0);
  updateAlbumSummary();
  updateFilterUI();
  updateProgress();

  function updateProgress(): void {
    const progressText =
      document.querySelector<HTMLParagraphElement>("#progressText");

    if (!progressText) return;

    progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`;
  }

  function toggleStickerStatus(stickerNumber: string): void {
    const team = albumTeams[selectedTeamIndex]

    const sticker = team.stickers.find((item) => item.number === stickerNumber)

    if (!sticker) return

    sticker.status = getNextStatus(sticker.status)

    saveProgress(albumTeams)
    updateSelectedTeam(selectedTeamIndex)
    updateProgress()
    updateAlbumSummary()
  }

  bindAppEvents({
    matrix,
    stickerMatrix,
    stickerFilters,
    stickerSearch,
    albumTeams,
    toggleStickerStatus,

    getSelectedTeamIndex: () => selectedTeamIndex,
    setSelectedTeamIndex: (index) => {
      selectedTeamIndex = index;
    },

    getActiveFilter: () => activeFilter,
    setActiveFilter: (filter) => {
      activeFilter = filter;
    },

    setStickerQuery: (query) => {
      stickerQuery = query;
    },

    updateSelectedTeam,
    updateProgress,
    updateAlbumSummary,
  });
}
