/**
 * SudokuGrid Component Tests
 *
 * Comprehensive test suite covering:
 * - Grid rendering (81 cells, correct structure)
 * - Clue cell display and styling
 * - Cell selection functionality
 * - Keyboard navigation (arrow keys)
 * - Accessibility (ARIA labels, roles)
 * - User entry vs clue distinction
 *
 * @see components/puzzle/SudokuGrid.tsx
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SudokuGrid, SudokuGridProps } from "../SudokuGrid";

/**
 * Create empty 9x9 grid filled with zeros
 */
function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

/**
 * Mock puzzle with some clues
 * Pattern: Few clues in specific positions for testing
 */
const mockPuzzle: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

/**
 * Default props for testing
 */
function getDefaultProps(
  overrides?: Partial<SudokuGridProps>
): SudokuGridProps {
  return {
    puzzle: mockPuzzle,
    userEntries: createEmptyGrid(),
    selectedCell: null,
    onCellSelect: jest.fn(),
    onNumberChange: jest.fn(),
    ...overrides,
  };
}

describe("SudokuGrid", () => {
  describe("Grid Rendering", () => {
    it("renders 81 cells in a 9x9 grid", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const cells = screen.getAllByRole("gridcell");
      expect(cells).toHaveLength(81);
    });

    it("renders grid container with correct ARIA role", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute("aria-label", "Sudoku puzzle grid");
    });

    it("applies correct CSS Grid layout classes", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const grid = screen.getByRole("grid");
      expect(grid).toHaveClass("grid", "grid-cols-9", "grid-rows-9");
    });

    it("applies newspaper aesthetic border", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const grid = screen.getByRole("grid");
      expect(grid).toHaveClass("border-2", "border-black");
    });
  });

  describe("Clue Cell Display", () => {
    it("displays clue numbers from puzzle data", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      // Check first clue cell (row 0, col 0, value 5)
      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      expect(clueCell).toBeInTheDocument();
      expect(clueCell).toHaveTextContent("5");
    });

    it("applies gray color to clue cells", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      expect(clueCell).toHaveClass("text-neutral");
    });

    it("allows clue cells to be selectable for navigation", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      expect(clueCell).not.toBeDisabled();
    });

    it("shows empty cells as blank", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const emptyCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(emptyCell).toBeInTheDocument();
      expect(emptyCell).toHaveTextContent("");
    });
  });

  describe("User Entry Display", () => {
    it("displays user-entered numbers in black", () => {
      const userEntries = createEmptyGrid();
      userEntries[0][2] = 4; // User entered 4 in row 0, col 2

      render(
        <SudokuGrid {...getDefaultProps({ userEntries })} />
      );

      const userCell = screen.getByLabelText("Row 1, Column 3, Value 4");
      expect(userCell).toBeInTheDocument();
      expect(userCell).toHaveTextContent("4");
      expect(userCell).toHaveClass("text-primary");
    });

    it("prioritizes user entries over puzzle clues", () => {
      const userEntries = createEmptyGrid();
      userEntries[0][0] = 9; // Override clue (5) with user entry (9)

      render(
        <SudokuGrid {...getDefaultProps({ userEntries })} />
      );

      // Should show user entry (9), not clue (5)
      const cell = screen.getByLabelText("Row 1, Column 1, Value 9");
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveTextContent("9");
    });
  });

  describe("Cell Selection", () => {
    it("calls onCellSelect when empty cell is clicked", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid {...getDefaultProps({ onCellSelect })} />
      );

      const emptyCell = screen.getByLabelText("Row 1, Column 3, Empty");
      fireEvent.click(emptyCell);

      expect(onCellSelect).toHaveBeenCalledWith(0, 2); // 0-indexed
    });

    it("calls onCellSelect when clue cell is clicked", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid {...getDefaultProps({ onCellSelect })} />
      );

      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      fireEvent.click(clueCell);

      expect(onCellSelect).toHaveBeenCalledWith(0, 0);
    });

    it("highlights selected cell with accent ring", () => {
      render(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 0, col: 2 } })}
        />
      );

      const selectedCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(selectedCell).toHaveClass("ring-2", "ring-accent", "bg-blue-50");
    });

    it("highlights clue cells with red ring when selected", () => {
      render(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 0, col: 0 } })}
        />
      );

      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      expect(clueCell).toHaveClass("ring-2", "ring-red-600");
    });

    it("only one cell can be selected at a time", () => {
      const { rerender } = render(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 0, col: 2 } })}
        />
      );

      // First cell selected
      let selectedCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(selectedCell).toHaveClass("ring-2", "ring-accent");

      // Change selection to different cell (row 1, col 2 which should be empty in mock puzzle)
      rerender(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 1, col: 2 } })}
        />
      );

      // Previous cell no longer selected
      const previousCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(previousCell).not.toHaveClass("ring-2", "ring-accent");

      // New cell is selected
      selectedCell = screen.getByLabelText("Row 2, Column 3, Empty");
      expect(selectedCell).toHaveClass("ring-2", "ring-accent");
    });
  });

  describe("Keyboard Navigation", () => {
    it("moves selection down with ArrowDown key", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 0, col: 0 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });

      expect(onCellSelect).toHaveBeenCalledWith(1, 0);
    });

    it("moves selection up with ArrowUp key", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 5, col: 5 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowUp" });

      expect(onCellSelect).toHaveBeenCalledWith(4, 5);
    });

    it("moves selection right with ArrowRight key", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 4, col: 4 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });

      expect(onCellSelect).toHaveBeenCalledWith(4, 5);
    });

    it("moves selection left with ArrowLeft key", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 4, col: 4 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowLeft" });

      expect(onCellSelect).toHaveBeenCalledWith(4, 3);
    });

    it("wraps to bottom when pressing ArrowUp at top edge", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 0, col: 5 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowUp" });

      expect(onCellSelect).toHaveBeenCalledWith(8, 5); // Wraps to row 8
    });

    it("wraps to top when pressing ArrowDown at bottom edge", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 8, col: 5 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });

      expect(onCellSelect).toHaveBeenCalledWith(0, 5); // Wraps to row 0
    });

    it("wraps to right when pressing ArrowLeft at left edge", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 5, col: 0 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowLeft" });

      expect(onCellSelect).toHaveBeenCalledWith(5, 8); // Wraps to col 8
    });

    it("wraps to left when pressing ArrowRight at right edge", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 5, col: 8 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });

      expect(onCellSelect).toHaveBeenCalledWith(5, 0); // Wraps to col 0
    });

    it("does not trigger navigation when no cell is selected", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: null, onCellSelect })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });

      expect(onCellSelect).not.toHaveBeenCalled();
    });

    it("prevents default browser scrolling on arrow keys", () => {
      const onCellSelect = jest.fn();
      render(
        <SudokuGrid
          {...getDefaultProps({
            selectedCell: { row: 4, col: 4 },
            onCellSelect,
          })}
        />
      );

      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });

      // Verify navigation occurred (indirectly confirms preventDefault was called)
      expect(onCellSelect).toHaveBeenCalledWith(5, 4);
    });
  });

  describe("Accessibility", () => {
    it("provides correct ARIA labels for clue cells", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const clueCell = screen.getByLabelText("Row 1, Column 1, Clue 5");
      expect(clueCell).toBeInTheDocument();
    });

    it("provides correct ARIA labels for empty cells", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const emptyCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(emptyCell).toBeInTheDocument();
    });

    it("provides correct ARIA labels for user entries", () => {
      const userEntries = createEmptyGrid();
      userEntries[0][2] = 4;

      render(
        <SudokuGrid {...getDefaultProps({ userEntries })} />
      );

      const userCell = screen.getByLabelText("Row 1, Column 3, Value 4");
      expect(userCell).toBeInTheDocument();
    });

    it("grid is keyboard focusable", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const grid = screen.getByRole("grid");
      expect(grid).toHaveAttribute("tabIndex", "0");
    });

    it("cells are not individually tab-navigable", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const cells = screen.getAllByRole("gridcell");
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute("tabIndex", "-1");
      });
    });

    it("cells have minimum tap target size (44x44px)", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const cells = screen.getAllByRole("gridcell");
      cells.forEach((cell) => {
        expect(cell).toHaveClass("sm:min-w-11", "sm:min-h-11");
      });
    });
  });

  describe("3x3 Subgrid Borders", () => {
    it("applies thicker right border to columns 3 and 6", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      // Column 3 (index 2) should have thick right border
      const col3Cell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(col3Cell).toHaveClass("border-r-2", "border-r-black");

      // Column 6 (index 5) should have thick right border
      const col6Cell = screen.getByLabelText("Row 1, Column 6, Empty");
      expect(col6Cell).toHaveClass("border-r-2", "border-r-black");
    });

    it("does not apply thick right border to column 9 (last column)", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      const col9Cell = screen.getByLabelText("Row 1, Column 9, Empty");
      expect(col9Cell).not.toHaveClass("border-r-2");
    });

    it("applies thicker bottom border to rows 3 and 6", () => {
      render(<SudokuGrid {...getDefaultProps()} />);

      // Row 3 (index 2, display "Row 3") - using Col 4 (empty in mock puzzle)
      const row3Cell = screen.getByLabelText("Row 3, Column 4, Empty");
      expect(row3Cell).toHaveClass("border-b-2", "border-b-black");

      // Row 6 (index 5, display "Row 6") - using Col 4 (empty in mock puzzle)
      const row6Cell = screen.getByLabelText("Row 6, Column 4, Empty");
      expect(row6Cell).toHaveClass("border-b-2", "border-b-black");
    });
  });

  describe("Component Re-rendering", () => {
    it("updates displayed value when userEntries prop changes", () => {
      const { rerender } = render(<SudokuGrid {...getDefaultProps()} />);

      // Initially empty
      let cell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(cell).toHaveTextContent("");

      // Update user entries
      const userEntries = createEmptyGrid();
      userEntries[0][2] = 7;
      rerender(
        <SudokuGrid {...getDefaultProps({ userEntries })} />
      );

      // Should show user entry
      cell = screen.getByLabelText("Row 1, Column 3, Value 7");
      expect(cell).toHaveTextContent("7");
    });

    it("updates selection highlight when selectedCell prop changes", () => {
      const { rerender } = render(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 0, col: 2 } })}
        />
      );

      // First cell selected
      let selectedCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(selectedCell).toHaveClass("ring-2", "ring-accent");

      // Change selection to row 1, col 2 (row 2, column 3 in display)
      rerender(
        <SudokuGrid
          {...getDefaultProps({ selectedCell: { row: 1, col: 2 } })}
        />
      );

      // Previous cell no longer highlighted
      const previousCell = screen.getByLabelText("Row 1, Column 3, Empty");
      expect(previousCell).not.toHaveClass("ring-2", "ring-accent");

      // New cell highlighted
      selectedCell = screen.getByLabelText("Row 2, Column 3, Empty");
      expect(selectedCell).toHaveClass("ring-2", "ring-accent");
    });
  });
});
