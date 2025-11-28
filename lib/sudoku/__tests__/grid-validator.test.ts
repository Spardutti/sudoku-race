import { isValidGrid, gridsEqual, isValidSudoku } from "../grid-validator";

describe("grid-validator", () => {
  describe("isValidGrid", () => {
    it("accepts valid 9x9 grid", () => {
      const valid = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
      ];

      expect(isValidGrid(valid)).toBe(true);
    });

    it("rejects grid with wrong row count", () => {
      const invalid = [[1, 2, 3, 4, 5, 6, 7, 8, 9]];
      expect(isValidGrid(invalid)).toBe(false);
    });

    it("rejects grid with wrong column count", () => {
      const invalid = Array(9).fill([1, 2, 3]);
      expect(isValidGrid(invalid)).toBe(false);
    });

    it("rejects grid with values outside 1-9", () => {
      const invalid = [
        [1, 2, 3, 4, 5, 6, 7, 8, 10],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
      ];

      expect(isValidGrid(invalid)).toBe(false);
    });
  });

  describe("gridsEqual", () => {
    it("returns true for identical grids", () => {
      const grid1 = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
      ];
      const grid2 = [...grid1.map((row) => [...row])];

      expect(gridsEqual(grid1, grid2)).toBe(true);
    });

    it("returns false for different grids", () => {
      const grid1 = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
      ];
      const grid2 = [
        [9, 2, 3, 4, 5, 6, 7, 8, 1],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [1, 1, 2, 3, 4, 5, 6, 7, 9],
      ];

      expect(gridsEqual(grid1, grid2)).toBe(false);
    });
  });

  describe("isValidSudoku", () => {
    const validSolution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    it("accepts valid Sudoku solution", () => {
      expect(isValidSudoku(validSolution)).toBe(true);
    });

    it("rejects solution with duplicate in row", () => {
      const invalidRow = [
        [1, 1, 4, 6, 7, 8, 9, 2, 3],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [5, 9, 8, 3, 4, 2, 1, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 3, 1, 9, 2, 4, 8, 5, 6],
        [9, 6, 3, 5, 1, 7, 2, 8, 4],
        [2, 8, 7, 4, 3, 9, 6, 1, 5],
        [3, 4, 5, 2, 8, 6, 9, 7, 2],
      ];

      expect(isValidSudoku(invalidRow)).toBe(false);
    });

    it("rejects solution with duplicate in column", () => {
      const invalidCol = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [5, 7, 2, 1, 9, 6, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 6, 5, 7],
        [8, 6, 9, 7, 5, 1, 4, 2, 3],
        [4, 2, 5, 8, 6, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 6, 5],
        [9, 5, 1, 4, 3, 7, 2, 8, 6],
        [2, 8, 7, 5, 1, 9, 5, 3, 4],
        [3, 4, 6, 2, 8, 5, 1, 7, 9],
      ];

      expect(isValidSudoku(invalidCol)).toBe(false);
    });

    it("rejects solution with duplicate in 3x3 subgrid", () => {
      const invalidBox = [
        [1, 1, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 2, 2, 3, 4, 5, 6, 7, 8],
      ];

      expect(isValidSudoku(invalidBox)).toBe(false);
    });

    it("rejects invalid grid format", () => {
      const invalidGrid = [[1, 2, 3]];
      expect(isValidSudoku(invalidGrid as number[][])).toBe(false);
    });
  });
});
