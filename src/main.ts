// import "./style.css";
// import { teams } from "./data/team.ts";
// import { loadProgress, saveProgress } from "./services/storage";
// import { getAllStickers, getProgressPercent } from "./utils/albumStats";
// import { renderTeams } from "./render/renderTeams";
// import { renderStickers } from "./render/renderStickers";
// import { getNextStatus } from "./utils/stickerStatus";
// import { renderTeamHeader } from "./render/renderTeamHeader";
// import { renderAlbumSummary } from "./render/renderAlbumSummary";

// function getElement<T extends HTMLElement>(selector: string): T {
//   const element = document.querySelector<T>(selector);

//   if (!element) {
//     throw new Error(`Elemento ${selector} não encontrado`);
//   }

//   return element;
// }

// const app = getElement<HTMLDivElement>("#app");

// const albumTeams = loadProgress(teams);
// let selectedTeamIndex = 0;

// function getStickers() {
//   return getAllStickers(albumTeams);
// }

// let activeFilter: "all" | "have" | "missing" | "duplicate" = "all";
// let stickerQuery = "";

// function updateFilterUI(): void {
//   const buttons = document.querySelectorAll<HTMLButtonElement>(
//     "#stickerFilters button",
//   );

//   buttons.forEach((button) => {
//     const filter = button.getAttribute("data-filter");

//     if (filter === activeFilter) {
//       button.classList.add("active");
//     } else {
//       button.classList.remove("active");
//     }
//   });
// }

// app.innerHTML = `
//   <div class="app">
//   <header class="header">
//     <h1>Álbum 2026</h1>
//     <p id="progressText">Progresso: ...</p>
//   </header>

//   <aside class="sidebar">
//     <div id="albumSummary"></div>

//     <section class="section">
//       <h2>Seleções</h2>
//       <div id="teamMatrix" class="team-matrix"></div>
//     </section>
//   </aside>

//   <main class="content">
//     <section class="section">
//       <div id="teamHeader"></div>
//     </section>

//     <section class="section">
//       <input
//         id="stickerSearch"
//         type="search"
//         placeholder="Buscar..."
//       />

//       <div id="stickerFilters"></div>

//       <p id="stickerResults"></p>

//       <div id="stickerMatrix" class="sticker-matrix"></div>
//     </section>
//   </main>
// </div>
// `;

// const albumSummary = getElement<HTMLDivElement>("#albumSummary");
// const stickerSearch = getElement<HTMLInputElement>('#stickerSearch')

// function updateAlbumSummary(): void {
//   renderAlbumSummary(albumSummary, albumTeams);
// }

// const matrix = getElement<HTMLDivElement>("#teamMatrix");
// const stickerMatrix = getElement<HTMLDivElement>("#stickerMatrix");
// const teamHeader = getElement<HTMLDivElement>("#teamHeader");
// const stickerResults = getElement<HTMLParagraphElement>("#stickerResults");

// function updateSelectedTeam(index: number): void {
//   selectedTeamIndex = index;

//   const selectedTeam = albumTeams[selectedTeamIndex];

//   renderTeamHeader(teamHeader, selectedTeam);

//   renderTeams(matrix, albumTeams, selectedTeam.id);

//   const normalizedQuery = stickerQuery.trim().toLowerCase();

//   const stickers = selectedTeam.stickers.filter((sticker) => {
//     const matchesFilter =
//       activeFilter === "all" || sticker.status === activeFilter;

//     const matchesSearch =
//       !normalizedQuery ||
//       `${sticker.number} ${sticker.name} ${sticker.type}`
//         .toLowerCase()
//         .includes(normalizedQuery);

//     return matchesFilter && matchesSearch;
//   });

  
//   stickerResults.textContent = `Mostrando ${stickers.length} de ${selectedTeam.stickers.length} figurinhas`;

//   renderStickers(stickerMatrix, {
//     ...selectedTeam,
//     stickers,
//   });
// }

// const stickerFilters = getElement<HTMLDivElement>("#stickerFilters");

// stickerFilters.addEventListener("click", (event) => {
//   const target = event.target as HTMLElement;
//   const filterButton = target.closest("[data-filter]");

//   if (!filterButton) return;

//   const filter = filterButton.getAttribute("data-filter");

//   if (
//     filter !== "all" &&
//     filter !== "have" &&
//     filter !== "missing" &&
//     filter !== "duplicate"
//   ) {
//     return;
//   }

//   activeFilter = filter;
//   updateSelectedTeam(selectedTeamIndex);
//   updateFilterUI();
// });

// renderTeams(matrix, albumTeams, albumTeams[selectedTeamIndex].id);
// updateSelectedTeam(0);
// updateAlbumSummary();
// updateFilterUI();

// matrix.addEventListener("click", (event) => {
//   const target = event.target as HTMLElement;
//   const teamButton = target.closest("[data-team]");

//   if (!teamButton) return;

//   const teamId = teamButton.getAttribute("data-team");

//   const index = albumTeams.findIndex((team) => team.id === teamId);

//   if (index !== -1) {
//     updateSelectedTeam(index);
//   }
// });

// function updateProgress(): void {
//   const progressText =
//     document.querySelector<HTMLParagraphElement>("#progressText");

//   if (!progressText) return;

//   progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`;
// }

// stickerMatrix.addEventListener("click", (event) => {
//   const target = event.target as HTMLElement;
//   const stickerButton = target.closest("[data-sticker]");

//   if (!stickerButton) return;

//   const stickerNumber = stickerButton.getAttribute("data-sticker");
//   const team = albumTeams[selectedTeamIndex];

//   const sticker = team.stickers.find((item) => item.number === stickerNumber);

//   if (!sticker) return;

//   sticker.status = getNextStatus(sticker.status);

//   saveProgress(albumTeams);
//   updateSelectedTeam(selectedTeamIndex);
//   updateProgress();
//   updateAlbumSummary();
// });

// stickerSearch.addEventListener('input', (event) => {
//   const target = event.target as HTMLInputElement

//   stickerQuery = target.value
//   updateSelectedTeam(selectedTeamIndex)
// })


import './style.css'
import { createApp } from './app/createApp'

createApp()