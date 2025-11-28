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

export function isValidSudoku(grid: number[][]): boolean {
  if (!isValidGrid(grid)) return false;

  for (let i = 0; i < 9; i++) {
    const rowSet = new Set<number>();
    const colSet = new Set<number>();

    for (let j = 0; j < 9; j++) {
      if (rowSet.has(grid[i][j])) return false;
      rowSet.add(grid[i][j]);

      if (colSet.has(grid[j][i])) return false;
      colSet.add(grid[j][i]);
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxSet = new Set<number>();

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const value = grid[boxRow * 3 + i][boxCol * 3 + j];
          if (boxSet.has(value)) return false;
          boxSet.add(value);
        }
      }
    }
  }

  return true;
}
