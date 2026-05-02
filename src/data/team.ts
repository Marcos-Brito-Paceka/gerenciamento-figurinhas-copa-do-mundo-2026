import type { Team, StickerStatus } from "../types/album";
import { teamCatalog } from "./teamCatalog";
import { playerPool } from "./playerPool";

const mockCompletionPattern = [19, 20, 17, 14, 11, 8];

export const teams: Team[] = teamCatalog.map(([id, name, code], teamIndex) => ({
  id,
  name,
  code,
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
        : stickerIndex > 16
          ? "Especial"
          : "Jogador";

    return {
      number: `${code} ${number}`,
      name: playerPool[stickerIndex],
      type,
      status,
    };
  }),
}));
