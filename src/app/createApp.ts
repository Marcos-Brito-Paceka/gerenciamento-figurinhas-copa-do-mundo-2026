import "../styles/main.css";
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
import { createAppState } from "../state/appState";
import { loadUIState, saveUIState } from '../services/uiStorage';

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento ${selector} não encontrado`);
  }

  return element;
}

export function createApp(): void {
  const app = getElement<HTMLDivElement>("#app");

  const state = createAppState(loadProgress(teams));
  const savedUI = loadUIState()

  state.selectedTeamIndex = savedUI.selectedTeamIndex ?? 0
  state.activeFilter = savedUI.activeFilter ?? 'all'
  state.stickerQuery = savedUI.stickerQuery ?? ''

  function persistUI(): void {
    saveUIState({
      selectedTeamIndex: state.selectedTeamIndex,
      activeFilter: state.activeFilter,
      stickerQuery: state.stickerQuery,
    })
  }


  function getStickers() {
    return getAllStickers(state.albumTeams);
  }

  renderAppShell(app);

  const albumSummary = getElement<HTMLDivElement>("#albumSummary");
  const stickerSearch = getElement<HTMLInputElement>("#stickerSearch");
  const matrix = getElement<HTMLDivElement>("#teamMatrix");
  const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
  const teamHeader = getElement<HTMLDivElement>("#teamHeader");
  const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");
  const stickerFilters = getElement<HTMLDivElement>("#stickerFilters");

  function updateFilterUI(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      "#stickerFilters button",
    );

    buttons.forEach((button) => {
      const filter = button.getAttribute("data-filter");

      button.classList.toggle("active", filter === state.activeFilter);
    });
  }

  function updateAlbumSummary(): void {
    renderAlbumSummary(albumSummary, state.albumTeams);
  }

  function updateProgress(): void {
    const progressText =
      document.querySelector<HTMLParagraphElement>("#progressText");

    if (!progressText) return;

    progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`;
  }

  function updateSelectedTeam(index: number): void {
    state.selectedTeamIndex = index;

    const selectedTeam = state.albumTeams[state.selectedTeamIndex];

    renderTeamHeader(teamHeader, selectedTeam);
    renderTeams(matrix, state.albumTeams, {
      selectedTeamId: selectedTeam.id,
      showAllTeams: state.showAllTeams,
    });

    const normalizedQuery = state.stickerQuery.trim().toLowerCase();

    const stickers = selectedTeam.stickers.filter((sticker) => {
      const matchesFilter =
        state.activeFilter === "all" || sticker.status === state.activeFilter;

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

  function toggleStickerStatus(stickerNumber: string): void {
    const team = state.albumTeams[state.selectedTeamIndex];

    const sticker = team.stickers.find((item) => item.number === stickerNumber);

    if (!sticker) return;

    sticker.status = getNextStatus(sticker.status);

    saveProgress(state.albumTeams);
    updateSelectedTeam(state.selectedTeamIndex);
    updateProgress();
    updateAlbumSummary();
    updateFilterUI();
    stickerSearch.value = state.stickerQuery;
  }

  updateSelectedTeam(state.selectedTeamIndex);
  updateAlbumSummary();
  updateFilterUI();
  updateProgress();
  stickerSearch.value = state.stickerQuery;

  bindAppEvents({
    matrix,
    stickerMatrix,
    stickerFilters,
    stickerSearch,
    albumTeams: state.albumTeams,
    toggleStickerStatus,

    getSelectedTeamIndex: () => state.selectedTeamIndex,
    setSelectedTeamIndex: (index) => {
      state.selectedTeamIndex = index;
      persistUI()
    },

    getActiveFilter: () => state.activeFilter,
    setActiveFilter: (filter) => {
      state.activeFilter = filter;
      updateFilterUI();
      persistUI();
    },

    setStickerQuery: (query) => {
      state.stickerQuery = query;
      persistUI();
    },

    toggleShowAllTeams: () => {
      state.showAllTeams = !state.showAllTeams;
      updateSelectedTeam(state.selectedTeamIndex);
    },

    updateSelectedTeam,
    updateProgress,
    updateAlbumSummary,
  });
}
