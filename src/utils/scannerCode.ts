import type { Team } from "../types/album";

function editDistance(left: string, right: string): number {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => 0),
  );

  for (let row = 0; row < rows; row += 1) matrix[row][0] = row;
  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function visualCodeDistance(left: string, right: string): number {
  if (left === "WA" && right === "HAI") return 1;

  return editDistance(left, right);
}

function normalizeNumber(value: string): string | null {
  const normalized = value.replace(/[OQ]/g, "0").replace(/[IL]/g, "1");
  const match = normalized.match(/\d+/);

  if (!match) return null;

  const numericValue =
    match[0].length > 2 ? match[0].slice(-2) : match[0];
  const stickerIndex = Number(numericValue);

  if (stickerIndex < 1 || stickerIndex > 20) return null;

  return String(stickerIndex).padStart(2, "0");
}

type CodeCandidate = {
  value: string;
  allowFuzzy: boolean;
};

function getCodeCandidates(compact: string): CodeCandidate[] {
  const candidates: CodeCandidate[] = [];
  const letterRuns = compact.match(/[A-Z]{2,4}/g) ?? [];
  const mixedRuns = compact.match(/[A-Z0-9]{2,5}/g) ?? [];

  letterRuns.forEach((run) => {
    candidates.push({ value: run, allowFuzzy: true });

    if (run.length > 3) {
      for (let index = 0; index <= run.length - 3; index += 1) {
        candidates.push({ value: run.slice(index, index + 3), allowFuzzy: true });
      }
    }
  });

  mixedRuns.forEach((run) => {
    const normalizedRun = run.replace(/[1L]/g, "I").replace(/[0Q]/g, "O");

    for (let index = 0; index <= normalizedRun.length - 3; index += 1) {
      const value = normalizedRun.slice(index, index + 3);

      if (!/^[A-Z]{3}$/.test(value)) continue;

      candidates.push({
        value,
        allowFuzzy: !/\d/.test(run.slice(index, index + 3)),
      });
    }
  });

  return candidates;
}

function canUseFuzzyCandidate(candidate: CodeCandidate, code: string): boolean {
  if (candidate.value === code) return true;
  if (candidate.value === "WA" && code === "HAI") return true;
  if (!candidate.allowFuzzy) return false;

  return candidate.value.length >= 3;
}

export function normalizeScannedStickerNumber(
  value: string,
  teams: Team[],
): string | null {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const nationalTeams = teams.filter((team) => team.kind === "team");

  for (const team of nationalTeams) {
    const codeIndex = compact.indexOf(team.code);

    if (codeIndex === -1) continue;

    const number = normalizeNumber(
      compact.slice(codeIndex + team.code.length, codeIndex + team.code.length + 3),
    );

    if (number) return `${team.code} ${number}`;
  }

  const number = normalizeNumber(compact);

  if (!number) return null;

  const codeCandidates = getCodeCandidates(compact);
  let bestMatchCode = "";
  let bestMatchDistance = Number.POSITIVE_INFINITY;

  nationalTeams.forEach((team) => {
    codeCandidates.forEach((candidate) => {
      if (!canUseFuzzyCandidate(candidate, team.code)) return;

      const distance = visualCodeDistance(candidate.value, team.code);

      if (distance < bestMatchDistance) {
        bestMatchCode = team.code;
        bestMatchDistance = distance;
      }
    });
  });

  if (!bestMatchCode || bestMatchDistance > 1) return null;

  return `${bestMatchCode} ${number}`;
}
