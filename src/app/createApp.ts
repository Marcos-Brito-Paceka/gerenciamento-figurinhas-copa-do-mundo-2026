import { teams } from "../data/team.ts";
import {
  clearProgress,
  loadPreferences,
  loadProgress,
  savePreferences,
  saveProgress,
  debouncedSaveProgress,
} from "../services/storage";
import {
  getAllStickers,
  getProgressPercent,
  isTeamComplete,
} from "../utils/albumStats";
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
import {
  applyRemoteSnapshot,
  buildRemoteSnapshot,
  getCurrentUser,
  isSupabaseConfigured,
  loadRemoteSnapshot,
  onAuthChange,
  saveRemoteSnapshot,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "../services/remoteStorage";
import { debounce } from "../utils/debounce";
import { normalizeScannedStickerNumber } from "../utils/scannerCode";
import type { AppPreferences, StickerStatus } from "../types/album";
import type { User } from "@supabase/supabase-js";

type CameraStream = Awaited<
  ReturnType<typeof navigator.mediaDevices.getUserMedia>
>;

type OcrWorker = {
  recognize: (image: unknown) => Promise<{
    data: {
      text: string;
    };
  }>;
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<unknown>;
};

type TesseractModule = {
  createWorker: (language?: string) => Promise<OcrWorker>;
  PSM?: {
    SINGLE_LINE?: string;
  };
};

type ScannerVideoElement = HTMLElement & {
  readyState: number;
  videoWidth: number;
  videoHeight: number;
  srcObject: CameraStream | null;
  play: () => Promise<void>;
};

type ScannerCanvasContext = {
  fillStyle: string;
  filter: string;
  drawImage: (image: ScannerVideoElement, ...args: number[]) => void;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  getImageData: (
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  ) => {
    data: Uint8ClampedArray;
  };
  putImageData: (
    imageData: ReturnType<ScannerCanvasContext["getImageData"]>,
    dx: number,
    dy: number,
  ) => void;
};

type ScannerCanvasElement = HTMLElement & {
  width: number;
  height: number;
  getContext: (
    contextId: "2d",
    options?: { willReadFrequently: boolean },
  ) => ScannerCanvasContext | null;
  toDataURL: (type?: string) => string;
};

type ScannerImageElement = HTMLElement & {
  src: string;
  removeAttribute: (qualifiedName: string) => void;
};

type ScannerFrameVariant = {
  label: string;
  image: string;
};

type ScannerCrop = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ScannerBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento ${selector} não encontrado`);
  }

  return element;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Erro desconhecido.";
}

export function createApp(): void {
  const app = getElement<HTMLDivElement>("#app");
  const state = createAppState(loadProgress(teams));
  const savedUI = loadUIState();
  let preferences = loadPreferences();
  let lastChangedStickerNumber = "";
  let currentUser: User | null = null;
  let scannerStream: CameraStream | null = null;
  let scannerOcrWorker: Promise<OcrWorker> | null = null;
  let scannerOcrBusy = false;
  let scannerDetectedNumber = "";

  state.selectedTeamIndex = savedUI.selectedTeamIndex ?? 0

  function persistUI(): void {
    saveUIState({
      selectedTeamIndex: state.selectedTeamIndex,
    })
    scheduleCloudSave();
  }

  function persistPreferences(): void {
    savePreferences(preferences);
    scheduleCloudSave();
  }

  function applyPreferences(): void {
    document.documentElement.dataset.motion = preferences.motion;
    document.documentElement.dataset.teamMatrix = preferences.teamMatrix;
    scannerButton.hidden = preferences.scanner === "off";

    if (preferences.scanner === "off") {
      closeScanner();
    }

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

    document.querySelectorAll<HTMLButtonElement>("[data-scanner-option]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.scannerOption === preferences.scanner,
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

  function getRemoteSnapshot() {
    return buildRemoteSnapshot(
      state.albumTeams,
      preferences,
      state.selectedTeamIndex,
    );
  }

  function scheduleCloudSave(): void {
    debouncedCloudSave();
  }

  renderAppShell(app);

  const albumSummary = getElement<HTMLDivElement>("#albumSummary");
  const teamSearch = getElement<HTMLInputElement>("#teamSearch");
  const teamSearchClear = getElement<HTMLButtonElement>("#teamSearchClear");
  const incompleteFilter = getElement<HTMLButtonElement>("#incompleteFilter");
  const completedTeamsCount =
    getElement<HTMLElement>("#completedTeamsCount");
  const matrix = getElement<HTMLDivElement>("#teamMatrix");
  const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
  const teamHeader = getElement<HTMLDivElement>("#teamHeader");
  const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");
  const accountButton = getElement<HTMLButtonElement>("#accountButton");
  const accountModal = getElement<HTMLDivElement>("#accountModal");
  const closeAccount = getElement<HTMLButtonElement>("#closeAccount");
  const accountStatus = getElement<HTMLParagraphElement>("#accountStatus");
  const authForm = getElement<HTMLDivElement>("#authForm");
  const accountCard = getElement<HTMLDivElement>("#accountCard");
  const accountEmail = getElement<HTMLElement>("#accountEmail");
  const authEmail = getElement<HTMLInputElement>("#authEmail");
  const authPassword = getElement<HTMLInputElement>("#authPassword");
  const signInButton = getElement<HTMLButtonElement>("#signInButton");
  const signUpButton = getElement<HTMLButtonElement>("#signUpButton");
  const googleSignInButton =
    getElement<HTMLButtonElement>("#googleSignInButton");
  const syncActions = getElement<HTMLDivElement>("#syncActions");
  const saveCloudButton = getElement<HTMLButtonElement>("#saveCloudButton");
  const loadCloudButton = getElement<HTMLButtonElement>("#loadCloudButton");
  const signOutButton = getElement<HTMLButtonElement>("#signOutButton");
  const syncMessage = getElement<HTMLParagraphElement>("#syncMessage");
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
  const scannerButton = getElement<HTMLButtonElement>("#scannerButton");
  const scannerDrawer = getElement<HTMLDivElement>("#scannerDrawer");
  const scannerClose = getElement<HTMLButtonElement>("#scannerClose");
  const scannerVideo = getElement<ScannerVideoElement>("#scannerVideo");
  const scannerCanvas = getElement<ScannerCanvasElement>("#scannerCanvas");
  const scannerMessage = getElement<HTMLParagraphElement>("#scannerMessage");
  const scannerDebugImage =
    getElement<ScannerImageElement>("#scannerDebugImage");
  const scannerDebugText =
    getElement<HTMLElement>("#scannerDebugText");
  const scannerManualCode =
    getElement<HTMLInputElement>("#scannerManualCode");
  const scannerReadFrame =
    getElement<HTMLButtonElement>("#scannerReadFrame");
  const scannerCheckCode =
    getElement<HTMLButtonElement>("#scannerCheckCode");
  const scannerResult = getElement<HTMLDivElement>("#scannerResult");
  const scannerResultCode =
    getElement<HTMLElement>("#scannerResultCode");
  const scannerResultTitle =
    getElement<HTMLElement>("#scannerResultTitle");
  const scannerResultDescription =
    getElement<HTMLParagraphElement>("#scannerResultDescription");
  const scannerResultActions =
    getElement<HTMLDivElement>("#scannerResultActions");
  const scannerConfirmHave =
    getElement<HTMLButtonElement>("#scannerConfirmHave");

  const debouncedCloudSave = debounce(() => {
    void syncCurrentToCloud(false);
  }, 800);

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

  function updateIncompleteFilterUI(): void {
    const nationalTeams = state.albumTeams.filter((team) => team.kind === "team");
    const completedTeams = nationalTeams.filter(isTeamComplete).length;

    incompleteFilter.setAttribute(
      "aria-pressed",
      String(state.showIncompleteOnly),
    );
    incompleteFilter.classList.toggle("active", state.showIncompleteOnly);
    incompleteFilter.setAttribute(
      "aria-label",
      `Ocultar seleções completas, ${completedTeams} de ${nationalTeams.length} completas`,
    );
    completedTeamsCount.textContent = `${completedTeams}/${nationalTeams.length}`;
  }

  function renderTeamMatrix(): void {
    const selectedTeam = state.albumTeams[state.selectedTeamIndex];
    const visibleTeams = getVisibleTeams();

    updateIncompleteFilterUI();

    renderTeams(matrix, visibleTeams, {
      selectedTeamId: selectedTeam.id,
      matrix: preferences.teamMatrix,
      emptyMessage: state.teamQuery.trim()
        ? "Nenhuma seleção encontrada para essa busca."
        : state.showIncompleteOnly
          ? "Todas as seleções já estão completas."
          : undefined,
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
    scheduleCloudSave();
    updateTeamHeaderProgress(teamHeader, team);
    if (state.showIncompleteOnly && isTeamComplete(team)) {
      selectFirstVisibleTeam();
      renderTeamMatrix();
      renderSelectedTeamDetails();
    } else {
      renderSelectedStickersOnly();
      updateActiveTeamProgressCell();
    }
    updateIncompleteFilterUI();
    updateProgress();
    updateAlbumSummary();
  }

  function getVisibleTeams() {
    const query = state.teamQuery.trim().toLowerCase();
    const teams = state.showIncompleteOnly
      ? state.albumTeams.filter((team) => !isTeamComplete(team))
      : state.albumTeams;

    if (!query) return teams;

    return teams.filter((team) =>
      `${team.name} ${team.code}`.toLowerCase().includes(query),
    );
  }

  function selectFirstVisibleTeam(): void {
    const visibleTeams = getVisibleTeams();

    if (visibleTeams.some((team) => team.id === state.albumTeams[state.selectedTeamIndex]?.id)) {
      return;
    }

    const firstVisibleTeam = visibleTeams[0];

    if (!firstVisibleTeam) return;

    const firstVisibleIndex = state.albumTeams.findIndex(
      (team) => team.id === firstVisibleTeam.id,
    );

    if (firstVisibleIndex === -1) return;

    state.selectedTeamIndex = firstVisibleIndex;
    persistUI();
  }

  function toggleIncompleteFilter(): void {
    state.showIncompleteOnly = !state.showIncompleteOnly;
    selectFirstVisibleTeam();
    renderTeamMatrix();
    renderSelectedTeamDetails();
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

  function setSyncMessage(message: string): void {
    syncMessage.textContent = message;
  }

  function getNormalizedStickerNumber(value: string): string | null {
    return normalizeScannedStickerNumber(value, state.albumTeams);
  }

  function getScannerStatusText(status: StickerStatus): string {
    if (status === "have") return "Você já tem essa figurinha.";
    if (status === "duplicate") return "Você marcou essa figurinha como repetida.";

    return "Essa figurinha ainda está faltando.";
  }

  function showScannerResult(rawCode: string, stable = false): void {
    const stickerNumber = getNormalizedStickerNumber(rawCode);

    scannerResult.hidden = false;
    scannerResultActions.hidden = true;

    if (!stickerNumber) {
      scannerDetectedNumber = "";
      scannerResultCode.textContent = rawCode.trim().toUpperCase() || "--";
      scannerResultTitle.textContent = "Código não reconhecido";
      scannerResultDescription.textContent =
        "Tente aproximar o verso da figurinha ou digite o código manualmente.";
      return;
    }

    const team = state.albumTeams.find((item) =>
      item.stickers.some((sticker) => sticker.number === stickerNumber),
    );
    const sticker = team?.stickers.find(
      (item) => item.number === stickerNumber,
    );

    scannerDetectedNumber = stickerNumber;
    scannerResultCode.textContent = stickerNumber;

    if (!team || !sticker) {
      scannerResultTitle.textContent = "Figurinha não encontrada";
      scannerResultDescription.textContent =
        "O código foi lido, mas não existe no catálogo atual do álbum.";
      return;
    }

    scannerResultTitle.textContent = team.name;
    scannerResultDescription.textContent = `${getScannerStatusText(sticker.status)}${
      stable ? " Leitura confirmada pela câmera." : ""
    }`;
    scannerResultActions.hidden = sticker.status !== "missing";
  }

  function confirmScannedSticker(): void {
    if (!scannerDetectedNumber) return;

    const team = state.albumTeams.find((item) =>
      item.stickers.some((sticker) => sticker.number === scannerDetectedNumber),
    );
    const sticker = team?.stickers.find(
      (item) => item.number === scannerDetectedNumber,
    );

    if (!team || !sticker) return;

    sticker.status = "have";
    lastChangedStickerNumber = sticker.number;
    debouncedSaveProgress(state.albumTeams);
    scheduleCloudSave();
    if (state.showIncompleteOnly && isTeamComplete(team)) {
      selectFirstVisibleTeam();
    }
    renderCurrentState();
    showScannerResult(sticker.number);
  }

  function applyScannerThreshold(
    context: ScannerCanvasContext,
    inverted: boolean,
    threshold: number,
  ): void {
    const imageData = context.getImageData(
      0,
      0,
      scannerCanvas.width,
      scannerCanvas.height,
    );
    const { data } = imageData;

    for (let index = 0; index < data.length; index += 4) {
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const value = gray > threshold ? 255 : 0;
      const output = inverted ? 255 - value : value;

      data[index] = output;
      data[index + 1] = output;
      data[index + 2] = output;
    }

    context.putImageData(imageData, 0, 0);
  }

  function findScannerBadgeBounds(
    context: ScannerCanvasContext,
  ): ScannerBounds | null {
    const width = scannerCanvas.width;
    const height = scannerCanvas.height;
    const imageData = context.getImageData(0, 0, width, height);
    const { data } = imageData;
    const visited = new Uint8Array(width * height);
    let bestBounds: ScannerBounds | null = null;
    let bestArea = 0;

    function isDarkPixel(x: number, y: number): boolean {
      const index = (y * width + x) * 4;
      const gray =
        data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;

      return gray < 92;
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const startIndex = y * width + x;

        if (visited[startIndex] || !isDarkPixel(x, y)) continue;

        const stack = [startIndex];
        visited[startIndex] = 1;
        let area = 0;
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;

        while (stack.length) {
          const current = stack.pop() ?? 0;
          const currentX = current % width;
          const currentY = Math.floor(current / width);

          area += 1;
          minX = Math.min(minX, currentX);
          maxX = Math.max(maxX, currentX);
          minY = Math.min(minY, currentY);
          maxY = Math.max(maxY, currentY);

          const neighbors = [
            current - 1,
            current + 1,
            current - width,
            current + width,
          ];

          neighbors.forEach((neighbor) => {
            if (neighbor < 0 || neighbor >= visited.length) return;

            const neighborX = neighbor % width;
            const neighborY = Math.floor(neighbor / width);

            if (
              Math.abs(neighborX - currentX) + Math.abs(neighborY - currentY) !==
                1 ||
              visited[neighbor] ||
              !isDarkPixel(neighborX, neighborY)
            ) {
              return;
            }

            visited[neighbor] = 1;
            stack.push(neighbor);
          });
        }

        const bounds = {
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        };
        const isLikelyBadge =
          bounds.width > width * 0.18 &&
          bounds.height > height * 0.22 &&
          area > bestArea;

        if (isLikelyBadge) {
          bestArea = area;
          bestBounds = bounds;
        }
      }
    }

    return bestBounds;
  }

  function isolateScannerBadge(context: ScannerCanvasContext): boolean {
    const bounds = findScannerBadgeBounds(context);

    if (!bounds) return false;

    const padding = 14;
    const x = Math.max(0, bounds.x - padding);
    const y = Math.max(0, bounds.y - padding);
    const width = Math.min(scannerCanvas.width - x, bounds.width + padding * 2);
    const height = Math.min(scannerCanvas.height - y, bounds.height + padding * 2);
    const badgeImage = context.getImageData(x, y, width, height);

    scannerCanvas.width = width + padding * 2;
    scannerCanvas.height = height + padding * 2;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, scannerCanvas.width, scannerCanvas.height);
    context.putImageData(badgeImage, padding, padding);

    return true;
  }

  function createScannerFrameVariant(
    crop: ScannerCrop,
    context: ScannerCanvasContext,
    options: {
      filter: string;
      inverted?: boolean;
      isolateBadge?: boolean;
      threshold?: number;
      suffix: string;
    },
  ): ScannerFrameVariant {
    context.filter = options.filter;
    context.drawImage(
      scannerVideo,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      scannerCanvas.width,
      scannerCanvas.height,
    );
    context.filter = "none";

    const isolated = options.isolateBadge
      ? isolateScannerBadge(context)
      : false;

    if (typeof options.threshold === "number") {
      applyScannerThreshold(context, Boolean(options.inverted), options.threshold);
    }

    return {
      label: `${crop.label} ${isolated ? "pílula " : ""}${options.suffix}`,
      image: scannerCanvas.toDataURL("image/png"),
    };
  }

  function getScannerFrameVariants(): ScannerFrameVariant[] | null {
    if (scannerVideo.readyState < 2) return null;

    const context = scannerCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) return null;

    const width = scannerVideo.videoWidth;
    const height = scannerVideo.videoHeight;

    if (!width || !height) return null;

    const stickerFrameHeight = Math.min(height * 0.82, (width * 0.78) / 0.72);
    const stickerFrameWidth = stickerFrameHeight * 0.72;
    const stickerFrameX = (width - stickerFrameWidth) / 2;
    const stickerFrameY = (height - stickerFrameHeight) / 2;
    const crops: ScannerCrop[] = [
      {
        label: "canto",
        x: stickerFrameX + stickerFrameWidth * 0.54,
        y: stickerFrameY + stickerFrameHeight * 0.02,
        width: stickerFrameWidth * 0.44,
        height: stickerFrameHeight * 0.15,
      },
      {
        label: "topo",
        x: stickerFrameX + stickerFrameWidth * 0.08,
        y: stickerFrameY + stickerFrameHeight * 0.02,
        width: stickerFrameWidth * 0.9,
        height: stickerFrameHeight * 0.17,
      },
      {
        label: "canto ampliado",
        x: stickerFrameX + stickerFrameWidth * 0.48,
        y: stickerFrameY,
        width: stickerFrameWidth * 0.5,
        height: stickerFrameHeight * 0.2,
      },
    ];
    const scale = 4;
    const variants: ScannerFrameVariant[] = [];

    crops.forEach((crop) => {
      scannerCanvas.width = Math.round(crop.width * scale);
      scannerCanvas.height = Math.round(crop.height * scale);

      variants.push(
        createScannerFrameVariant(crop, context, {
          filter: "grayscale(1) contrast(2.2)",
          isolateBadge: true,
          suffix: "contraste",
        }),
      );
      variants.push(
        createScannerFrameVariant(crop, context, {
          filter: "grayscale(1) contrast(3)",
          isolateBadge: true,
          threshold: 120,
          suffix: "limiar baixo",
        }),
      );
      variants.push(
        createScannerFrameVariant(crop, context, {
          filter: "grayscale(1) contrast(3)",
          isolateBadge: true,
          threshold: 150,
          suffix: "limiar alto",
        }),
      );
      variants.push(
        createScannerFrameVariant(crop, context, {
          filter: "grayscale(1) contrast(3)",
          isolateBadge: true,
          inverted: true,
          threshold: 150,
          suffix: "invertido",
        }),
      );
    });

    scannerDebugImage.src = variants[0]?.image ?? "";

    return variants;
  }

  async function getScannerOcrWorker(): Promise<OcrWorker> {
    if (!scannerOcrWorker) {
      scannerMessage.textContent =
        "Preparando OCR no aparelho. Na primeira vez pode levar alguns segundos.";

      scannerOcrWorker = import("tesseract.js").then(async (module) => {
        const tesseract = module as unknown as TesseractModule;
        const worker = await tesseract.createWorker("eng");

        await worker.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
          tessedit_pageseg_mode: tesseract.PSM?.SINGLE_LINE ?? "7",
          preserve_interword_spaces: "1",
        });

        return worker;
      });
    }

    return scannerOcrWorker;
  }

  function handleScannerDetectedCode(rawText: string): void {
    const normalizedCode = getNormalizedStickerNumber(rawText);
    const cleanText = rawText.replace(/\s+/g, " ").trim();

    scannerDebugText.textContent = cleanText || "Sem texto detectado";

    if (!normalizedCode) {
      scannerMessage.textContent = cleanText
        ? `Li "${cleanText}", mas ainda não reconheci um código válido.`
        : "OCR rodou, mas não encontrou texto legível nessa área.";
      return;
    }

    showScannerResult(normalizedCode, true);
  }

  async function recognizeScannerVariant(
    worker: OcrWorker,
    variant: ScannerFrameVariant,
  ): Promise<boolean> {
    scannerDebugImage.src = variant.image;

    const result = await worker.recognize(variant.image);
    const cleanText = result.data.text.replace(/\s+/g, " ").trim();
    const normalizedCode = getNormalizedStickerNumber(result.data.text);

    scannerDebugText.textContent = `${variant.label}: ${
      cleanText || "sem texto"
    }`;

    if (!normalizedCode) return false;

    handleScannerDetectedCode(result.data.text);
    return true;
  }

  async function scanCameraFrame(): Promise<void> {
    if (scannerOcrBusy) return;

    const frameVariants = getScannerFrameVariants();

    if (!frameVariants) return;

    scannerOcrBusy = true;
    scannerMessage.textContent = "Lendo a área marcada...";

    try {
      const worker = await getScannerOcrWorker();
      let matched = false;

      for (const variant of frameVariants) {
        matched = await recognizeScannerVariant(worker, variant);

        if (matched) break;
      }

      if (!matched) {
        scannerMessage.textContent =
          "OCR rodou nas versões normal e invertida, mas não reconheceu um código válido.";
      }
    } catch {
      scannerMessage.textContent =
        "Não consegui ler automaticamente agora. Digite o código abaixo para verificar.";
      scannerOcrWorker = null;
    } finally {
      scannerOcrBusy = false;
    }
  }

  function stopScannerOcr(): void {
    if (!scannerOcrWorker) return;

    void scannerOcrWorker
      .then((worker) => worker.terminate())
      .catch(() => undefined);
    scannerOcrWorker = null;
    scannerOcrBusy = false;
  }

  function stopScannerCamera(): void {
    scannerStream?.getTracks().forEach((track) => track.stop());
    scannerStream = null;
    scannerVideo.srcObject = null;
    stopScannerOcr();
  }

  async function openScanner(): Promise<void> {
    scannerDrawer.classList.add("open");
    scannerDrawer.setAttribute("aria-hidden", "false");
    scannerResult.hidden = true;
    scannerResultActions.hidden = true;
    scannerManualCode.value = "";
    scannerDebugImage.removeAttribute("src");
    scannerDebugText.textContent = "Aguardando leitura...";
    scannerDetectedNumber = "";
    scannerMessage.textContent =
      "Alinhe o código com a marcação e toque em Ler imagem.";

    try {
      scannerStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
        },
      });
      scannerVideo.srcObject = scannerStream;
      await scannerVideo.play();
    } catch {
      scannerMessage.textContent =
        "Não foi possível abrir a câmera. Digite o código da figurinha para verificar.";
    }
  }

  function closeScanner(): void {
    stopScannerCamera();
    scannerDrawer.classList.remove("open");
    scannerDrawer.setAttribute("aria-hidden", "true");
  }

  function updateAccountUI(): void {
    const isLoggedIn = Boolean(currentUser);

    if (!isSupabaseConfigured) {
      accountStatus.textContent =
        "Supabase ainda não foi configurado. O app segue salvando tudo no seu navegador.";
      authForm.hidden = true;
      accountCard.hidden = true;
      syncActions.hidden = true;
      setSyncMessage("");
      return;
    }

    authForm.hidden = isLoggedIn;
    accountCard.hidden = !isLoggedIn;
    syncActions.hidden = !isLoggedIn;

    accountEmail.textContent = currentUser?.email ?? "Usuário autenticado";
    accountStatus.textContent = isLoggedIn
      ? "Conta ativa. Agora você pode salvar e carregar seu progresso pela nuvem."
      : "Você pode usar o app sem login. Entre ou crie uma conta para salvar seu progresso também na nuvem.";
  }

  async function syncCurrentToCloud(showMessage = true): Promise<void> {
    if (!currentUser) return;

    try {
      await saveRemoteSnapshot(currentUser.id, getRemoteSnapshot());

      if (showMessage) {
        setSyncMessage("Progresso salvo na nuvem.");
      }
    } catch {
      if (showMessage) {
        setSyncMessage("Não foi possível salvar na nuvem agora.");
      }
    }
  }

  async function loadCloudIntoApp(showMessage = true): Promise<void> {
    if (!currentUser) return;

    try {
      const snapshot = await loadRemoteSnapshot(currentUser.id);

      if (!snapshot) {
        await syncCurrentToCloud(false);
        if (showMessage) {
          setSyncMessage("Nenhum progresso na nuvem ainda. Seu progresso local foi enviado.");
        }
        return;
      }

      applyRemoteSnapshot(state.albumTeams, snapshot);
      preferences = {
        ...defaultPreferences,
        ...snapshot.preferences,
      };
      state.selectedTeamIndex = snapshot.ui.selectedTeamIndex;

      if (
        state.selectedTeamIndex < 0 ||
        state.selectedTeamIndex >= state.albumTeams.length
      ) {
        state.selectedTeamIndex = 0;
      }

      saveProgress(state.albumTeams);
      savePreferences(preferences);
      saveUIState({
        selectedTeamIndex: state.selectedTeamIndex,
      });
      applyPreferences();
      renderCurrentState();

      if (showMessage) {
        setSyncMessage("Progresso carregado da nuvem.");
      }
    } catch {
      if (showMessage) {
        setSyncMessage("Não foi possível carregar os dados da nuvem agora.");
      }
    }
  }

  async function handlePasswordAuth(mode: "sign-in" | "sign-up"): Promise<void> {
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !password) {
      setSyncMessage("Informe email e senha para continuar.");
      return;
    }

    try {
      setSyncMessage("Conectando...");

      if (mode === "sign-in") {
        await signInWithPassword(email, password);
      } else {
        await signUpWithPassword(email, password);
      }

      currentUser = await getCurrentUser();
      updateAccountUI();
      await loadCloudIntoApp(false);
      setSyncMessage(
        mode === "sign-in"
          ? "Login realizado."
          : "Conta criada. Se a confirmação por email estiver ativa, confirme o email antes de entrar.",
      );
    } catch (error) {
      setSyncMessage(`Não foi possível autenticar: ${getErrorMessage(error)}`);
    }
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
        scheduleCloudSave();
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

  function openAccountModal(): void {
    updateAccountUI();
    accountModal.classList.add("open");
  }

  function closeAccountModal(): void {
    accountModal.classList.remove("open");
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
    void syncCurrentToCloud(false);
    closeSettingsModal();
  }

  applyPreferences();
  renderTeamMatrix();
  renderSelectedTeamDetails();
  updateAlbumSummary();
  updateProgress();
  updateAccountUI();

  void getCurrentUser().then((user) => {
    currentUser = user;
    updateAccountUI();

    if (currentUser) {
      void loadCloudIntoApp(false);
    }
  });

  onAuthChange((authState) => {
    currentUser = authState.user;
    updateAccountUI();
  });

  accountButton.addEventListener("click", openAccountModal);
  closeAccount.addEventListener("click", closeAccountModal);
  accountModal.addEventListener("click", (event) => {
    if (event.target === accountModal) {
      closeAccountModal();
    }
  });
  signInButton.addEventListener("click", () => {
    void handlePasswordAuth("sign-in");
  });
  signUpButton.addEventListener("click", () => {
    void handlePasswordAuth("sign-up");
  });
  googleSignInButton.addEventListener("click", () => {
    setSyncMessage("Redirecionando para o Google...");
    void signInWithGoogle();
  });
  saveCloudButton.addEventListener("click", () => {
    void syncCurrentToCloud(true);
  });
  loadCloudButton.addEventListener("click", () => {
    void loadCloudIntoApp(true);
  });
  signOutButton.addEventListener("click", () => {
    void signOut().then(() => {
      currentUser = null;
      updateAccountUI();
      setSyncMessage("Você saiu da conta. O progresso local continua neste navegador.");
    });
  });

  scannerButton.addEventListener("click", () => {
    void openScanner();
  });
  scannerClose.addEventListener("click", closeScanner);
  scannerDrawer.addEventListener("click", (event) => {
    if (event.target === scannerDrawer) {
      closeScanner();
    }
  });
  scannerCheckCode.addEventListener("click", () => {
    showScannerResult(scannerManualCode.value);
  });
  scannerReadFrame.addEventListener("click", () => {
    void scanCameraFrame();
  });
  scannerManualCode.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      showScannerResult(scannerManualCode.value);
    }
  });
  scannerConfirmHave.addEventListener("click", confirmScannedSticker);

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
    const scannerOption = target.closest<HTMLButtonElement>("[data-scanner-option]");
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

    if (scannerOption?.dataset.scannerOption === "on" || scannerOption?.dataset.scannerOption === "off") {
      updatePreference("scanner", scannerOption.dataset.scannerOption);
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
    teamSearchClear,
    incompleteFilter,
    toggleIncompleteFilter,
    setTeamQuery: (query) => {
      state.teamQuery = query;
      selectFirstVisibleTeam();
      renderSelectedTeamDetails();
    },
    getVisibleTeams,
    renderTeamMatrix,

    updateSelectedTeam,
    updateProgress,
    updateAlbumSummary,
  });
}
