export function isValidGrid(grid: number[][]): boolean {
  if (grid.length !== 9) return false;
  if (!grid.every((row) => row.length === 9)) return false;

  const allValid = grid.flat().every((n) => n >= 1 && n <= 9);
  return allValid;
}

export function gridsEqual(grid1: number[][], grid2: number[][]): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid1[i][j] !== grid2[i][j]) {
        return false;
      }
    }
  }
  return true;
}
