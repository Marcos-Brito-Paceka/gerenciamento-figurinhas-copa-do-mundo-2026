import "./style.css";
import { teams } from "./data/team.ts";
import { loadProgress, saveProgress } from "./services/storage";
import { getAllStickers, getProgressPercent } from "./utils/albumStats";
import { renderTeams } from "./render/renderTeams";
import { renderStickers } from "./render/renderStickers";
import { getNextStatus } from "./utils/stickerStatus";
import { renderTeamHeader } from "./render/renderTeamHeader";
import { renderAlbumSummary } from "./render/renderAlbumSummary";

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Elemento ${selector} não encontrado`);
  }

  return element;
}

const app = getElement<HTMLDivElement>("#app");

const albumTeams = loadProgress(teams);
let selectedTeamIndex = 0;

function getStickers() {
  return getAllStickers(albumTeams);
}

let activeFilter: 'all' | 'have' | 'missing' | 'duplicate' = 'all'

app.innerHTML = `
  <h1>Álbum 2026</h1>
  <p id="progressText">Progresso salvo: ${getProgressPercent(getStickers())}%</p>

  <div id="albumSummary"></div>

  <section>
    <h2>Seleções</h2>
    <div id="teamMatrix"></div>
  </section>

  <section>
    <h2>Seleção ativa</h2>
    <div id="teamHeader"></div>
  </section>

  <div id="stickerFilters">
    <button data-filter="all">Todas</button>
    <button data-filter="have">Tenho</button>
    <button data-filter="missing">Faltam</button>
    <button data-filter="duplicate">Repetidas</button>
  </div>

  <section>
    <h2>Figurinhas</h2>
    <div id="stickerMatrix"></div>
  </section>
`;

const albumSummary = getElement<HTMLDivElement>('#albumSummary')

function updateAlbumSummary(): void {
  renderAlbumSummary(albumSummary, albumTeams)
}


const matrix = getElement<HTMLDivElement>("#teamMatrix");
const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
const teamHeader = getElement<HTMLDivElement>("#teamHeader");

function updateSelectedTeam(index: number): void {
  selectedTeamIndex = index;

  const selectedTeam = albumTeams[selectedTeamIndex];

  renderTeamHeader(teamHeader, selectedTeam);
  const stickers =
  activeFilter === 'all'
    ? selectedTeam.stickers
    : selectedTeam.stickers.filter((sticker) => sticker.status === activeFilter)

renderStickers(stickerMatrix, {
  ...selectedTeam,
  stickers,
});
}

const stickerFilters = getElement<HTMLDivElement>('#stickerFilters')

stickerFilters.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const filterButton = target.closest('[data-filter]')

  if (!filterButton) return

  const filter = filterButton.getAttribute('data-filter')

  if (
    filter !== 'all' &&
    filter !== 'have' &&
    filter !== 'missing' &&
    filter !== 'duplicate'
  ) {
    return
  }

  activeFilter = filter
  updateSelectedTeam(selectedTeamIndex)
})

renderTeams(matrix, albumTeams);
updateSelectedTeam(0);
updateAlbumSummary();

matrix.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const teamButton = target.closest("[data-team]");

  if (!teamButton) return;

  const teamId = teamButton.getAttribute("data-team");

  const index = albumTeams.findIndex((team) => team.id === teamId);

  if (index !== -1) {
    updateSelectedTeam(index);
  }
});

function updateProgress(): void {
  const progressText =
    document.querySelector<HTMLParagraphElement>("#progressText");

  if (!progressText) return;

  progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`;
}

stickerMatrix.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const stickerButton = target.closest("[data-sticker]");

  if (!stickerButton) return;

  const stickerNumber = stickerButton.getAttribute("data-sticker");
  const team = albumTeams[selectedTeamIndex];

  const sticker = team.stickers.find((item) => item.number === stickerNumber);

  if (!sticker) return;

  sticker.status = getNextStatus(sticker.status);

  saveProgress(albumTeams);
  updateSelectedTeam(selectedTeamIndex);
  updateProgress();
  updateAlbumSummary();
});
