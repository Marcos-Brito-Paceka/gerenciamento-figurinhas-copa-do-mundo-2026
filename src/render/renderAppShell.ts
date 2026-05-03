export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
  <div class="app">
  <header class="header">
    <h1>Álbum 2026</h1>
    <p id="progressText">Progresso: ...</p>
  </header>

  <aside class="sidebar">
    <div id="albumSummary"></div>
    <section class="section">
      
      <h2>Seleções</h2>
        <input
         id="teamSearch"
         type="search"
         placeholder="Buscar seleção por nome ou sigla"
         />
      <div id="teamMatrix" class="team-matrix"></div>
    </section>
  </aside>

  <main class="content">
    <section class="section">
      <div id="teamHeader"></div>
    </section>

    <section class="section">
      <input
        id="stickerSearch"
        type="search"
        placeholder="Buscar..."
      />
      <div id="stickerFilters">
        <button data-filter="all">Todas</button>
        <button data-filter="have">Tenho</button>
        <button data-filter="missing">Faltam</button>
        <button data-filter="duplicate">Repetidas</button>
      </div>

      <p id="stickerResults"></p>

      <div id="stickerMatrix" class="sticker-matrix"></div>
    </section>
  </main>
</div>
`;
}
