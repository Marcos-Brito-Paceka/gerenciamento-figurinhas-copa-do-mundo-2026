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

      <div id="stickerFilters"></div>

      <p id="stickerResults"></p>

      <div id="stickerMatrix" class="sticker-matrix"></div>
    </section>
  </main>
</div>
`;
}
