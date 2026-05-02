import './style.css'
import { teams } from './data/team.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado')
}

app.innerHTML = `
  <h1>Álbum 2026</h1>
  <p>Total de seleções: ${teams.length}</p>
  <p>Total de figurinhas: ${teams.flatMap((team) => team.stickers).length}</p>
`