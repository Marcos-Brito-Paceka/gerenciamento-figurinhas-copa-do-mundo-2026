import './style.css'

import { teams } from './data/team.ts'
import { loadProgress, saveProgress } from './services/storage'
import { getAllStickers, getProgressPercent } from './utils/albumStats'
import { renderTeams } from './render/renderTeams'
import { renderStickers } from './render/renderStickers'
import { getNextStatus } from './utils/stickerStatus'

function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector)

  if (!element) {
    throw new Error(`Elemento ${selector} não encontrado`)
  }

  return element
}

const app = getElement<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado')
}

const albumTeams = loadProgress(teams)
let selectedTeamIndex = 0

function getStickers() {
  return getAllStickers(albumTeams)
}

app.innerHTML = `
  <h1>Álbum 2026</h1>
  <p id="progressText">Progresso salvo: ${getProgressPercent(getStickers())}%</p>
  <button id="save-test">Salvar teste</button>

  <section>
    <h2>Seleções</h2>
    <div id="teamMatrix"></div>
  </section>

  <section>
    <h2>Figurinhas</h2>
    <div id="stickerMatrix"></div>
  </section>
`

const matrix = getElement<HTMLDivElement>('#teamMatrix')
const stickerMatrix = getElement<HTMLDivElement>('#stickerMatrix')

function updateSelectedTeam(index: number): void {
  selectedTeamIndex = index

  const selectedTeam = albumTeams[selectedTeamIndex]

  renderStickers(stickerMatrix, selectedTeam)
}

renderTeams(matrix, albumTeams)
updateSelectedTeam(0)

matrix.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const teamButton = target.closest('[data-team]')

  if (!teamButton) return

  const teamId = teamButton.getAttribute('data-team')

  const index = albumTeams.findIndex((team) => team.id === teamId)

  if (index !== -1) {
    updateSelectedTeam(index)
  }
})

document.querySelector('#save-test')?.addEventListener('click', () => {
  albumTeams[0].stickers[0].status = 'have'
  saveProgress(albumTeams)
  location.reload()
})

function updateProgress(): void {
  const progressText = document.querySelector<HTMLParagraphElement>('#progressText')

  if (!progressText) return

  progressText.textContent = `Progresso salvo: ${getProgressPercent(getStickers())}%`
}

stickerMatrix.addEventListener('click', (event) => {
  const target = event.target as HTMLElement
  const stickerButton = target.closest('[data-sticker]')

  if (!stickerButton) return

  const stickerNumber = stickerButton.getAttribute('data-sticker')
  const team = albumTeams[selectedTeamIndex]

  const sticker = team.stickers.find((item) => item.number === stickerNumber)

  if (!sticker) return

  sticker.status = getNextStatus(sticker.status)

  saveProgress(albumTeams)
  updateSelectedTeam(selectedTeamIndex)
  updateProgress()
})

