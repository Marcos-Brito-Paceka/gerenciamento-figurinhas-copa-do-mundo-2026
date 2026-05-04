import type { Team, StickerStatus } from "../types/album";
import { teamCatalog } from "./teamCatalog";
import { playerPool } from "./playerPool";

const mockCompletionPattern = [19, 20, 17, 14, 11, 8];

const openingSections: Team[] = [
  {
    id: "album-especiais",
    name: "Figurinhas especiais",
    code: "00-04",
    kind: "section",
    stickers: Array.from({ length: 5 }, (_, index) => {
      const number = String(index).padStart(2, "0");

      return {
        number,
        name: `Especial ${number}`,
        type: "Especial",
        status: "missing",
      };
    }),
  },
  {
    id: "fwc-bola-paises",
    name: "FWC - Bola e países",
    code: "05-08",
    kind: "section",
    stickers: Array.from({ length: 4 }, (_, index) => {
      const number = String(index + 5).padStart(2, "0");

      return {
        number: `FWC ${number}`,
        name: `Bola e países ${number}`,
        type: "FWC - Bola e países",
        status: "missing",
      };
    }),
  },
  {
    id: "fwc-historia",
    name: "FWC - História",
    code: "09-19",
    kind: "section",
    stickers: Array.from({ length: 11 }, (_, index) => {
      const number = String(index + 9).padStart(2, "0");

      return {
        number: `FWC ${number}`,
        name: `História ${number}`,
        type: "FWC - História",
        status: "missing",
      };
    }),
  },
];

const nationalTeams: Team[] = teamCatalog.map(([id, name, code], teamIndex) => ({
  id,
  name,
  code,
  kind: "team",
  stickers: Array.from({ length: 20 }, (_, stickerIndex) => {
    const number = String(stickerIndex + 1).padStart(2, "0");
    const ownedTarget = mockCompletionPattern[teamIndex] ?? 0;
    const isOwned = stickerIndex < ownedTarget;

    const status: StickerStatus = isOwned
      ? stickerIndex % 5 === 0
        ? "duplicate"
        : "have"
      : "missing";

    const type =
      stickerIndex === 0
        ? "Escudo"
        : stickerIndex > 16 ? "Especial" : "Jogador";

    return {
      number: `${code} ${number}`,
      name: playerPool[stickerIndex],
      type,
      status,
    };
  }),
}));

export const teams: Team[] = [...openingSections, ...nationalTeams];
