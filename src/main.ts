import './style.css'
import { teams } from './data/team.ts'
import {
  countByStatus,
  countOwned,
  getAllStickers,
  getProgressPercent,
} from './utils/albumStats'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado')
}

const stickers = getAllStickers(teams)

app.innerHTML = `
  <h1>Álbum 2026</h1>
  <p>Total de seleções: ${teams.length}</p>
  <p>Total de figurinhas: ${stickers.length}</p>
  <p>Tenho: ${countOwned(stickers)}</p>
  <p>Faltam: ${countByStatus(stickers, 'missing')}</p>
  <p>Repetidas: ${countByStatus(stickers, 'duplicate')}</p>
  <p>Progresso: ${getProgressPercent(stickers)}%</p>
`