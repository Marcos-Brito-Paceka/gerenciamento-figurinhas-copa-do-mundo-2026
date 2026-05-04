export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
  <div class="app">
  <header class="header">
    <div>
      <h1>Álbum 2026</h1>
      <p id="progressText">Progresso: ...</p>
    </div>

    <button class="settings-button" type="button" id="settingsButton" aria-label="Configurações">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.7V21a2 2 0 0 1-4 0v-.1a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1H3a2 2 0 0 1 0-4h.1a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.7V3a2 2 0 0 1 4 0v.1a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1h.1a2 2 0 0 1 0 4h-.1a1.8 1.8 0 0 0-1.7 1Z" />
      </svg>
    </button>
  </header>

  <aside class="sidebar">
    <div id="albumSummary"></div>
    <section class="section">
      
      <h2>Seleções</h2>
        <input
         id="teamSearch"
         type="search"
         placeholder="Buscar seção, seleção ou sigla"
         />
      <div id="teamMatrix" class="team-matrix"></div>
    </section>
  </aside>

  <main class="content">
    <section class="section">
      <div id="teamHeader"></div>
    </section>

    <section class="section">
      <p id="stickerResults"></p>

      <div id="stickerMatrix" class="sticker-matrix"></div>
    </section>
  </main>
</div>

<div class="modal-backdrop" id="settingsModal" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">
  <div class="settings-modal">
    <p class="kicker">Preferências</p>
    <h2 id="settingsTitle">Configurações</h2>

    <div class="settings-list">
      <div class="setting-row">
        <div>
          <strong>Backup</strong>
          <span>Salve ou carregue seu progresso em JSON.</span>
        </div>
        <div class="backup-actions">
          <button class="ghost" type="button" id="exportJson">Exportar JSON</button>
          <button class="ghost" type="button" id="importJson">Importar JSON</button>
        </div>
      </div>

      <div class="setting-row">
        <div>
          <strong>Matriz de seleções</strong>
          <span>Escolha quantas bandeiras aparecem por página no celular.</span>
        </div>
        <div class="segmented">
          <button type="button" data-matrix-option="4x3">4 x 3</button>
          <button type="button" data-matrix-option="5x3">5 x 3</button>
          <button type="button" data-matrix-option="6x4">6 x 4</button>
        </div>
      </div>

      <div class="setting-row">
        <div>
          <strong>Animações</strong>
          <span>Modo leve reduz transições e microinterações.</span>
        </div>
        <div class="segmented">
          <button type="button" data-motion-option="full">Normal</button>
          <button type="button" data-motion-option="light">Leve</button>
        </div>
      </div>

      <div class="setting-row">
        <div>
          <strong>Som</strong>
          <span>Ative ou desative o feedback sonoro.</span>
        </div>
        <div class="segmented">
          <button type="button" data-sound-option="on">Ligado</button>
          <button type="button" data-sound-option="off">Desligado</button>
        </div>
      </div>

      <div class="setting-row">
        <div>
          <strong>Vibração</strong>
          <span>Feedback tátil para ações rápidas.</span>
        </div>
        <div class="segmented">
          <button type="button" data-vibration-option="on">Ligado</button>
          <button type="button" data-vibration-option="off">Desligado</button>
        </div>
      </div>

      <div class="setting-row">
        <div>
          <strong>Status ao tocar</strong>
          <span>Controle se o ciclo passa por repetidas.</span>
        </div>
        <div class="segmented">
          <button type="button" data-cycle-option="full">Completo</button>
          <button type="button" data-cycle-option="simple">Simples</button>
        </div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="ghost" type="button" id="closeSettings">Fechar</button>
      <button class="solid" type="button" id="resetSettings">Restaurar</button>
    </div>
  </div>
</div>

<input type="file" id="importJsonFile" accept="application/json,.json" hidden />
`;
}
