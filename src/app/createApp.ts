import { teams } from "../data/team.ts";
import {
  clearProgress,
  loadPreferences,
  loadProgress,
  savePreferences,
  saveProgress,
  debouncedSaveProgress,
} from "../services/storage";
import { getAllStickers, getProgressPercent } from "../utils/albumStats";
import { renderTeams } from "../render/renderTeams";
import { renderStickers } from "../render/renderStickers";
import { getNextStatus } from "../utils/stickerStatus";
import {
  renderTeamHeader,
  updateTeamHeaderProgress,
} from "../render/renderTeamHeader";
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

  function persistUI(): void {
    saveUIState({
      selectedTeamIndex: state.selectedTeamIndex,
    })
  }

  function persistPreferences(): void {
    savePreferences(preferences);
  }

  function applyPreferences(): void {
    document.documentElement.dataset.motion = preferences.motion;
    document.documentElement.dataset.teamMatrix = preferences.teamMatrix;
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

    document.querySelectorAll<HTMLButtonElement>("[data-matrix-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.matrixOption === preferences.teamMatrix,
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
  const teamSearch = getElement<HTMLInputElement>("#teamSearch");
  const matrix = getElement<HTMLDivElement>("#teamMatrix");
  const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
  const teamHeader = getElement<HTMLDivElement>("#teamHeader");
  const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");
  const helpButton = getElement<HTMLButtonElement>("#helpButton");
  const helpModal = getElement<HTMLDivElement>("#helpModal");
  const closeHelp = getElement<HTMLButtonElement>("#closeHelp");
  const shareButton = getElement<HTMLButtonElement>("#shareButton");
  const shareModal = getElement<HTMLDivElement>("#shareModal");
  const closeShare = getElement<HTMLButtonElement>("#closeShare");
  const settingsButton = getElement<HTMLButtonElement>("#settingsButton");
  const settingsModal = getElement<HTMLDivElement>("#settingsModal");
  const closeSettings = getElement<HTMLButtonElement>("#closeSettings");
  const resetSettings = getElement<HTMLButtonElement>("#resetSettings");
  const exportJson = getElement<HTMLButtonElement>("#exportJson");
  const importJson = getElement<HTMLButtonElement>("#importJson");
  const importJsonFile = getElement<HTMLInputElement>("#importJsonFile");
  const clearProgressButton = getElement<HTMLButtonElement>("#clearProgress");

  function updateAlbumSummary(): void {
    renderAlbumSummary(albumSummary, state.albumTeams);
  }

  function updateProgress(): void {
    const progressText =
      document.querySelector<HTMLParagraphElement>("#progressText");

    if (!progressText) return;

    progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`;
  }

  function progressDotColor(value: number): string {
    if (value >= 80) return "var(--have)";
    if (value >= 45) return "var(--accent)";

    return "var(--missing)";
  }

  function updateActiveTeamProgressCell(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];
    const completion = getProgressPercent(selectedTeam.stickers);
    const teamButton = matrix.querySelector<HTMLElement>(
      `[data-team="${selectedTeam.id}"]`,
    );

    if (!teamButton) return;

    teamButton.dataset.progressAngle = `${completion * 3.6}deg`;
    teamButton.style.setProperty("--angle", `${completion * 3.6}deg`);
    teamButton.style.setProperty("--dot", progressDotColor(completion));
    teamButton.setAttribute(
      "aria-label",
      `${selectedTeam.name}, ${completion}% completo`,
    );
  }

  function updateActiveTeamCell(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];

    matrix.querySelectorAll<HTMLElement>("[data-team]").forEach((teamButton) => {
      teamButton.classList.toggle(
        "active",
        teamButton.dataset.team === selectedTeam.id,
      );
    });

    updateActiveTeamProgressCell();
  }

  function renderSelectedTeamDetails(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];

    renderTeamHeader(teamHeader, selectedTeam);
    stickerResults.textContent = `${selectedTeam.stickers.length} figurinhas`;

    renderStickers(
      stickerMatrix,
      {
        ...selectedTeam,
        stickers: selectedTeam.stickers,
      },
      lastChangedStickerNumber,
    );

    lastChangedStickerNumber = "";
  }

  function renderSelectedStickersOnly(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];

    stickerResults.textContent = `${selectedTeam.stickers.length} figurinhas`;

    renderStickers(
      stickerMatrix,
      {
        ...selectedTeam,
        stickers: selectedTeam.stickers,
      },
      lastChangedStickerNumber,
    );

    lastChangedStickerNumber = "";
  }

  function renderTeamMatrix(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];
    const visibleTeams = getVisibleTeams();

    renderTeams(matrix, visibleTeams, {
      selectedTeamId: selectedTeam.id,
      matrix: preferences.teamMatrix,
    });
  }

  function updateSelectedTeam(index: number): void {
    state.selectedTeamIndex = index;
    updateActiveTeamCell();

    renderSelectedTeamDetails();
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

    debouncedSaveProgress(state.albumTeams);
    updateTeamHeaderProgress(teamHeader, team);
    renderSelectedStickersOnly();
    updateActiveTeamProgressCell();
    updateProgress();
    updateAlbumSummary();
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
    renderTeamMatrix();
    renderSelectedTeamDetails();
    updateAlbumSummary();
    updateProgress();
  }

  function buildBackupJson(): string {
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        preferences,
        ui: {
          selectedTeamIndex: state.selectedTeamIndex,
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
          }>;

          if (
            typeof ui.selectedTeamIndex === "number" &&
            ui.selectedTeamIndex >= 0 &&
            ui.selectedTeamIndex < state.albumTeams.length
          ) {
            state.selectedTeamIndex = ui.selectedTeamIndex;
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

  function openShareModal(): void {
    shareModal.classList.add("open");
  }

  function closeShareModal(): void {
    shareModal.classList.remove("open");
  }

  function openHelpModal(): void {
    helpModal.classList.add("open");
  }

  function closeHelpModal(): void {
    helpModal.classList.remove("open");
  }

  function resetAllProgress(): void {
    const confirmed = window.confirm(
      "Tem certeza que deseja limpar todo o progresso do álbum?",
    );

    if (!confirmed) return;

    state.albumTeams.forEach((team) => {
      team.stickers.forEach((sticker) => {
        sticker.status = "missing";
      });
    });

    clearProgress();
    renderCurrentState();
    closeSettingsModal();
  }

  applyPreferences();
  renderTeamMatrix();
  renderSelectedTeamDetails();
  updateAlbumSummary();
  updateProgress();

  helpButton.addEventListener("click", openHelpModal);
  closeHelp.addEventListener("click", closeHelpModal);
  helpModal.addEventListener("click", (event) => {
    if (event.target === helpModal) {
      closeHelpModal();
    }
  });

  shareButton.addEventListener("click", openShareModal);
  closeShare.addEventListener("click", closeShareModal);
  shareModal.addEventListener("click", (event) => {
    if (event.target === shareModal) {
      closeShareModal();
    }
  });

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
  clearProgressButton.addEventListener("click", resetAllProgress);
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
    const matrixOption = target.closest<HTMLButtonElement>("[data-matrix-option]");

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
      return;
    }

    if (
      matrixOption?.dataset.matrixOption === "4x3" ||
      matrixOption?.dataset.matrixOption === "5x3" ||
      matrixOption?.dataset.matrixOption === "6x4"
    ) {
      updatePreference("teamMatrix", matrixOption.dataset.matrixOption);
      renderTeamMatrix();
    }
  });

  bindAppEvents({
    matrix,
    stickerMatrix,
    albumTeams: state.albumTeams,
    toggleStickerStatus,

    getSelectedTeamIndex: () => state.selectedTeamIndex,
    setSelectedTeamIndex: (index) => {
      state.selectedTeamIndex = index;
      persistUI()
    },

    teamSearch,
    setTeamQuery: (query) => {
      state.teamQuery = query;
    },
    getVisibleTeams,
    renderTeamMatrix,

    updateSelectedTeam,
    updateProgress,
    updateAlbumSummary,
  });
}
