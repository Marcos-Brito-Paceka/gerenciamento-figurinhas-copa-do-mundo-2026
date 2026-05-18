export function renderAppShell(container: HTMLElement): void {
  container.innerHTML = `
  <div class="beta-badge" aria-label="Versão beta 0.0.2">beta 0.0.2</div>

  <div class="app">
  <header class="header">
    <div>
      <h1>Álbum 2026</h1>
      <p id="progressText">Progresso: ...</p>
    </div>

    <div class="header-actions">
      <button class="settings-button scanner-button" type="button" id="scannerButton" aria-label="Escanear figurinha pela câmera" hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M4 8V6a2 2 0 0 1 2-2h2.2l1.2 2h5.2l1.2-2H18a2 2 0 0 1 2 2v2" />
          <rect x="3" y="8" width="18" height="12" rx="2.4" />
          <circle cx="12" cy="14" r="3.2" />
        </svg>
      </button>

      <button class="settings-button account-button" type="button" id="accountButton" aria-label="Abrir conta e sincronização">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </button>

      <button class="settings-button" type="button" id="helpButton" aria-label="Abrir dúvidas sobre o app">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M9.2 9a3 3 0 0 1 5.82 1c0 2-3 2.25-3 4.25" />
          <path d="M12 17.5h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </button>

      <a class="settings-button" href="https://www.linkedin.com/in/marcos-debrito/" target="_blank" rel="noreferrer" aria-label="Abrir LinkedIn de Marcos de Brito">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.94 8.9H3.66v10.45h3.28V8.9ZM5.3 4.65a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.34 13.36c0-3.16-1.68-4.63-3.93-4.63a3.39 3.39 0 0 0-3.05 1.68h-.04V8.9h-3.15v10.45h3.28v-5.17c0-1.36.26-2.68 1.94-2.68 1.66 0 1.68 1.55 1.68 2.76v5.09h3.27v-5.99Z" />
        </svg>
      </a>

      <button class="settings-button" type="button" id="shareButton" aria-label="Abrir QR code do site">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.4" />
          <rect x="14" y="3" width="7" height="7" rx="1.4" />
          <rect x="3" y="14" width="7" height="7" rx="1.4" />
          <path d="M14 14h3v3h-3zM19 14h2M14 21h2M18 18h3v3" />
        </svg>
      </button>

      <button class="settings-button" type="button" id="settingsButton" aria-label="Configurações">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.7V21a2 2 0 0 1-4 0v-.1a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1H3a2 2 0 0 1 0-4h.1a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1-1.7V3a2 2 0 0 1 4 0v.1a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1h.1a2 2 0 0 1 0 4h-.1a1.8 1.8 0 0 0-1.7 1Z" />
        </svg>
      </button>
    </div>
  </header>

  <aside class="sidebar">
    <div id="albumSummary"></div>
    <section class="section">
      
      <h2>Seleções</h2>
       <button
        class="incomplete-toggle"
        type="button"
        id="incompleteFilter"
        aria-pressed="false"
      >
        <span class="incomplete-toggle-track" aria-hidden="true">
          <span class="incomplete-toggle-thumb"></span>
        </span>
        <span class="incomplete-toggle-label">Ocultar seleções completas</span>
        <span class="incomplete-toggle-count" id="completedTeamsCount">0/48</span>
      </button>  
      <div class="team-search-control">
        <input
          id="teamSearch"
          type="search"
          placeholder="Buscar seção, seleção ou sigla"
        />
        <button
          class="team-search-clear"
          type="button"
          id="teamSearchClear"
          aria-label="Limpar busca"
          hidden
        >
          ×
        </button>
      </div>
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

<div class="scanner-drawer" id="scannerDrawer" aria-hidden="true">
  <div class="scanner-panel" role="dialog" aria-modal="true" aria-labelledby="scannerTitle">
    <div class="scanner-panel-header">
      <div>
        <p class="kicker">Scanner</p>
        <h2 id="scannerTitle">Ler verso da figurinha</h2>
      </div>
      <button class="scanner-close" type="button" id="scannerClose" aria-label="Fechar scanner">×</button>
    </div>

    <div class="scanner-camera">
      <video id="scannerVideo" playsinline muted></video>
      <canvas id="scannerCanvas" hidden></canvas>

      <div class="scanner-guide" aria-hidden="true">
        <span>HAI 20</span>
      </div>
    </div>

    <p class="scanner-message" id="scannerMessage" role="status">Alinhe o código do topo do verso com a marcação. Exemplo: HAI 20.</p>

    <div class="scanner-manual">
      <input id="scannerManualCode" type="text" inputmode="text" autocomplete="off" placeholder="Ex: BRA10" />
      <button class="ghost" type="button" id="scannerCheckCode">Verificar</button>
    </div>

    <div class="scanner-result" id="scannerResult" hidden>
      <span id="scannerResultCode">HAI 20</span>
      <strong id="scannerResultTitle">Figurinha encontrada</strong>
      <p id="scannerResultDescription"></p>
      <div class="scanner-result-actions" id="scannerResultActions" hidden>
        <button class="primary-action" type="button" id="scannerConfirmHave">Confirmar que tenho</button>
      </div>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="accountModal" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
  <div class="account-modal">
    <p class="kicker">Conta</p>
    <h2 id="accountTitle">Login e sincronização</h2>

    <p class="account-status" id="accountStatus">Você pode usar o app sem login. Com uma conta, seu progresso também fica salvo na nuvem.</p>

    <div class="auth-form" id="authForm">
      <button class="google-auth-button" type="button" id="googleSignInButton">
        <span aria-hidden="true">G</span>
        Entrar com Google
      </button>

      <div class="auth-divider"><span>ou use email e senha</span></div>

      <label>
        Email
        <input id="authEmail" type="email" autocomplete="email" placeholder="seu@email.com" />
      </label>

      <label>
        Senha
        <input id="authPassword" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres" />
      </label>

      <div class="auth-actions">
        <button class="primary-action" type="button" id="signInButton">Entrar</button>
        <button class="ghost" type="button" id="signUpButton">Criar conta</button>
      </div>
    </div>

    <div class="account-card" id="accountCard" hidden>
      <span>Conectado</span>
      <strong id="accountEmail">Usuário autenticado</strong>
      <p>Seu progresso continua salvo neste navegador. Use a nuvem para manter tudo sincronizado entre dispositivos.</p>
    </div>

    <div class="sync-actions" id="syncActions" hidden>
      <button class="primary-action" type="button" id="saveCloudButton">Salvar na nuvem</button>
      <button class="ghost" type="button" id="loadCloudButton">Carregar da nuvem</button>
      <button class="danger-soft" type="button" id="signOutButton">Sair</button>
    </div>

    <p class="sync-message" id="syncMessage" role="status"></p>

    <div class="modal-actions">
      <button class="ghost" type="button" id="closeAccount">Fechar</button>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
  <div class="help-modal">
    <p class="kicker">Dúvidas</p>
    <h2 id="helpTitle">Como usar o app</h2>

    <div class="help-content">
      <p>Este app ajuda você a acompanhar seu álbum da Copa do Mundo 2026 por seleção, marcando figurinhas que faltam, que você já tem e que estão repetidas.</p>

      <ul>
        <li>Busque seleções pelo nome ou sigla.</li>
        <li>Toque em uma figurinha para mudar o status dela.</li>
        <li>Acompanhe o progresso geral e por seleção.</li>
        <li>Use as configurações para backup em JSON, som, vibração, animações e modo de marcação.</li>
        <li>Compartilhe o app pelo QR code no topo.</li>
      </ul>

      <p>Encontrou algum bug? Envie um email para <a href="mailto:marcos.debrito@outlook.com">marcos.debrito@outlook.com</a>.</p>
      <p>Pode me chamar no LinkedIn também para mandar feedbacks, sugestões ou ideias de melhoria.</p>
    </div>

    <div class="modal-actions">
      <a class="ghost" href="https://www.linkedin.com/in/marcos-debrito/" target="_blank" rel="noreferrer">LinkedIn</a>
      <button class="solid" type="button" id="closeHelp">Fechar</button>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="shareModal" role="dialog" aria-modal="true" aria-labelledby="shareTitle">
  <div class="share-modal">
    <p class="kicker">Compartilhar</p>
    <h2 id="shareTitle">QR code do site</h2>
    <a class="qr-card" href="https://marcos-brito-copa-do-mundo-2026.vercel.app/" target="_blank" rel="noreferrer">
      <img src="/site-qr.svg" alt="QR code para acessar o site do Álbum 2026" />
    </a>
    <p class="share-link">marcos-brito-copa-do-mundo-2026.vercel.app</p>
    <div class="modal-actions">
      <button class="solid" type="button" id="closeShare">Fechar</button>
    </div>
  </div>
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
          <strong>Progresso</strong>
          <span>Limpe todas as figurinhas marcadas e comece do zero.</span>
        </div>
        <div class="backup-actions">
          <button class="danger" type="button" id="clearProgress">Limpar tudo</button>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <strong>Scanner da câmera</strong>
          <span>Recurso em fase de testes para verificar figurinhas pelo verso. Nem todos os navegadores ou dispositivos possuem suporte.</span>
        </div>
        <div class="segmented">
          <button type="button" data-scanner-option="on">Ativar</button>
          <button type="button" data-scanner-option="off">Desativar</button>
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
