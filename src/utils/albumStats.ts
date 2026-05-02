import type { Sticker, StickerStatus, Team } from "../types/album";

export function getAllStickers(teams: Team[]): Sticker[] {
  return teams.flatMap((team) => team.stickers);
}

export function countByStatus(
  stickers: Sticker[],
  status: StickerStatus,
): number {
  return stickers.filter((sticker) => sticker.status === status).length;
}

export function countOwned(stickers: Sticker[]): number {
  return countByStatus(stickers, "have") + countByStatus(stickers, "duplicate");
}

export function getProgressPercent(stickers: Sticker[]): number {
  if (stickers.length === 0) return 0;

  const owned = countOwned(stickers);

  if (owned === stickers.length) return 100;

  return Math.floor((owned / stickers.length) * 100);
}

export function isTeamComplete(team: Team): boolean {
  return countOwned(team.stickers) === team.stickers.length;
}
