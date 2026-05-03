import "../styles/main.css";
import { teams } from "../data/team.ts";
import {
  loadPreferences,
  loadProgress,
  savePreferences,
  saveProgress,
} from "../services/storage";
import { getAllStickers, getProgressPercent } from "../utils/albumStats";
import { renderTeams } from "../render/renderTeams";
import { renderStickers } from "../render/renderStickers";
import { getNextStatus } from "../utils/stickerStatus";
import { renderTeamHeader } from "../render/renderTeamHeader";
import { renderAlbumSummary } from "../render/renderAlbumSummary";
import { renderAppShell } from "../render/renderAppShell";
import { bindAppEvents } from "../events/bindAppEvents";
import { createAppState, defaultPreferences } from "../state/appState";
import { loadUIState, saveUIState } from '../services/uiStorage';
import { playTapSound } from "../services/audioFeedback";
import type { AppPreferences, StickerStatus } from "../types/album";

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
  const savedUI = loadUIState();
  let preferences = loadPreferences();
  let lastChangedStickerNumber = "";

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

  function persistPreferences(): void {
    savePreferences(preferences);
  }

  function applyPreferences(): void {
    document.documentElement.dataset.motion = preferences.motion;
    updateSettingsUI();
  }

  function updateSettingsUI(): void {
    document.querySelectorAll<HTMLButtonElement>("[data-motion-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.motionOption === preferences.motion,
      );
    });

    document.querySelectorAll<HTMLButtonElement>("[data-sound-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.soundOption === preferences.sound,
      );
    });

    document.querySelectorAll<HTMLButtonElement>("[data-vibration-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.vibrationOption === preferences.vibration,
      );
    });

    document.querySelectorAll<HTMLButtonElement>("[data-cycle-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.cycleOption === preferences.statusCycle,
      );
    });
  }

  function updatePreference<Key extends keyof AppPreferences>(
    key: Key,
    value: AppPreferences[Key],
  ): void {
    preferences = {
      ...preferences,
      [key]: value,
    };

    persistPreferences();
    applyPreferences();
  }


  function getStickers() {
    return getAllStickers(state.albumTeams);
  }

  renderAppShell(app);

  const albumSummary = getElement<HTMLDivElement>("#albumSummary");
  const stickerSearch = getElement<HTMLInputElement>("#stickerSearch");
  const teamSearch = getElement<HTMLInputElement>("#teamSearch");
  const matrix = getElement<HTMLDivElement>("#teamMatrix");
  const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
  const teamHeader = getElement<HTMLDivElement>("#teamHeader");
  const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");
  const stickerFilters = getElement<HTMLDivElement>("#stickerFilters");
  const settingsButton = getElement<HTMLButtonElement>("#settingsButton");
  const settingsModal = getElement<HTMLDivElement>("#settingsModal");
  const closeSettings = getElement<HTMLButtonElement>("#closeSettings");
  const resetSettings = getElement<HTMLButtonElement>("#resetSettings");
  const exportJson = getElement<HTMLButtonElement>("#exportJson");
  const importJson = getElement<HTMLButtonElement>("#importJson");
  const importJsonFile = getElement<HTMLInputElement>("#importJsonFile");

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
    const visibleTeams = getVisibleTeams();


    renderTeamHeader(teamHeader, selectedTeam);
    renderTeams(matrix, visibleTeams, {
      selectedTeamId: selectedTeam.id,
      showAllTeams: state.showAllTeams || state.teamQuery.trim().length > 0,
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
    }, lastChangedStickerNumber);
  lastChangedStickerNumber = "";
  }

  function toggleStickerStatus(stickerNumber: string): void {
    const team = state.albumTeams[state.selectedTeamIndex];

    const sticker = team.stickers.find((item) => item.number === stickerNumber);

    if (!sticker) return;

    sticker.status = getNextStatus(sticker.status, preferences.statusCycle);

    if (preferences.sound === "on") {
      playTapSound();
    }

    if (preferences.vibration === "on") {
      navigator.vibrate?.(10);
    }

    lastChangedStickerNumber = stickerNumber;

    saveProgress(state.albumTeams);
    updateSelectedTeam(state.selectedTeamIndex);
    updateProgress();
    updateAlbumSummary();
    updateFilterUI();
    stickerSearch.value = state.stickerQuery;
  }

  function getVisibleTeams() {
    const query = state.teamQuery.trim().toLowerCase();

    if (!query) return state.albumTeams;

    return state.albumTeams.filter((team) =>
      `${team.name} ${team.code}`.toLowerCase().includes(query),
    );
  }

  function isStickerStatus(value: unknown): value is StickerStatus {
    return value === "missing" || value === "have" || value === "duplicate";
  }

  function renderCurrentState(): void {
    updateSelectedTeam(state.selectedTeamIndex);
    updateAlbumSummary();
    updateFilterUI();
    updateProgress();
    stickerSearch.value = state.stickerQuery;
  }

  function buildBackupJson(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        preferences,
        ui: {
          selectedTeamIndex: state.selectedTeamIndex,
          activeFilter: state.activeFilter,
          stickerQuery: state.stickerQuery,
        },
        progress: state.albumTeams.map((team) => ({
          id: team.id,
          stickers: team.stickers.map((sticker) => ({
            number: sticker.number,
            status: sticker.status,
          })),
        })),
      },
      null,
      2,
    );
  }

  function downloadJson(filename: string, content: string): void {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function exportBackupJson(): void {
    const date = new Date().toISOString().slice(0, 10);

    downloadJson(`album2026-backup-${date}.json`, buildBackupJson());
  }

  function importBackupJson(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));

        if (payload.preferences) {
          preferences = {
            ...preferences,
            ...payload.preferences,
          };
          persistPreferences();
          applyPreferences();
        }

        if (Array.isArray(payload.progress)) {
          payload.progress.forEach((savedTeam: unknown) => {
            if (!savedTeam || typeof savedTeam !== "object") return;

            const teamPayload = savedTeam as {
              id?: unknown;
              stickers?: unknown;
            };
            const team = state.albumTeams.find(
              (item) => item.id === teamPayload.id,
            );

            if (!team || !Array.isArray(teamPayload.stickers)) return;

            teamPayload.stickers.forEach((savedSticker: unknown) => {
              if (!savedSticker || typeof savedSticker !== "object") return;

              const stickerPayload = savedSticker as {
                number?: unknown;
                status?: unknown;
              };
              const sticker = team.stickers.find(
                (item) => item.number === stickerPayload.number,
              );

              if (sticker && isStickerStatus(stickerPayload.status)) {
                sticker.status = stickerPayload.status;
              }
            });
          });
        }

        if (payload.ui) {
          const ui = payload.ui as Partial<{
            selectedTeamIndex: number;
            activeFilter: typeof state.activeFilter;
            stickerQuery: string;
          }>;

          if (
            typeof ui.selectedTeamIndex === "number" &&
            ui.selectedTeamIndex >= 0 &&
            ui.selectedTeamIndex < state.albumTeams.length
          ) {
            state.selectedTeamIndex = ui.selectedTeamIndex;
          }

          if (
            ui.activeFilter === "all" ||
            ui.activeFilter === "have" ||
            ui.activeFilter === "missing" ||
            ui.activeFilter === "duplicate"
          ) {
            state.activeFilter = ui.activeFilter;
          }

          if (typeof ui.stickerQuery === "string") {
            state.stickerQuery = ui.stickerQuery;
          }
        }

        saveProgress(state.albumTeams);
        persistUI();
        renderCurrentState();
        settingsModal.classList.remove("open");
      } catch {
        window.alert("Não foi possível importar este JSON.");
      }
    };

    reader.readAsText(file, "UTF-8");
  }

  function openSettings(): void {
    settingsModal.classList.add("open");
  }

  function closeSettingsModal(): void {
    settingsModal.classList.remove("open");
  }

  applyPreferences();
  updateSelectedTeam(state.selectedTeamIndex);
  updateAlbumSummary();
  updateFilterUI();
  updateProgress();
  stickerSearch.value = state.stickerQuery;

  settingsButton.addEventListener("click", openSettings);
  closeSettings.addEventListener("click", closeSettingsModal);
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettingsModal();
    }
  });

  resetSettings.addEventListener("click", () => {
    preferences = { ...defaultPreferences };
    persistPreferences();
    applyPreferences();
  });

  exportJson.addEventListener("click", exportBackupJson);
  importJson.addEventListener("click", () => importJsonFile.click());
  importJsonFile.addEventListener("change", () => {
    const file = importJsonFile.files?.[0];

    if (file) {
      importBackupJson(file);
    }

    importJsonFile.value = "";
  });

  settingsModal.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const motionOption = target.closest<HTMLButtonElement>("[data-motion-option]");
    const soundOption = target.closest<HTMLButtonElement>("[data-sound-option]");
    const vibrationOption = target.closest<HTMLButtonElement>(
      "[data-vibration-option]",
    );
    const cycleOption = target.closest<HTMLButtonElement>("[data-cycle-option]");

    if (motionOption?.dataset.motionOption === "full" || motionOption?.dataset.motionOption === "light") {
      updatePreference("motion", motionOption.dataset.motionOption);
      return;
    }

    if (soundOption?.dataset.soundOption === "on" || soundOption?.dataset.soundOption === "off") {
      updatePreference("sound", soundOption.dataset.soundOption);
      return;
    }

    if (
      vibrationOption?.dataset.vibrationOption === "on" ||
      vibrationOption?.dataset.vibrationOption === "off"
    ) {
      updatePreference("vibration", vibrationOption.dataset.vibrationOption);
      return;
    }

    if (cycleOption?.dataset.cycleOption === "full" || cycleOption?.dataset.cycleOption === "simple") {
      updatePreference("statusCycle", cycleOption.dataset.cycleOption);
    }
  });

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

    teamSearch,
    setTeamQuery: (query) => {
      state.teamQuery = query;
    },
    getVisibleTeams,

    updateSelectedTeam,
    updateProgress,
    updateAlbumSummary,
  });
}
