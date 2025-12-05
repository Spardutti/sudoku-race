export const createEmptyGrid = (): number[][] => {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
};

export const autoClearPencilMarks = (
  pencilMarks: Record<string, number[]>,
  row: number,
  col: number,
  value: number
): Record<string, number[]> => {
  const newMarks = { ...pencilMarks };

  for (let i = 0; i < 9; i++) {
    const rowKey = `${row}-${i}`;
    if (newMarks[rowKey]) {
      newMarks[rowKey] = newMarks[rowKey].filter(n => n !== value);
      if (newMarks[rowKey].length === 0) delete newMarks[rowKey];
    }

    const colKey = `${i}-${col}`;
    if (newMarks[colKey]) {
      newMarks[colKey] = newMarks[colKey].filter(n => n !== value);
      if (newMarks[colKey].length === 0) delete newMarks[colKey];
    }
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const boxKey = `${r}-${c}`;
      if (newMarks[boxKey]) {
        newMarks[boxKey] = newMarks[boxKey].filter(n => n !== value);
        if (newMarks[boxKey].length === 0) delete newMarks[boxKey];
      }
    }
  }

  return newMarks;
};
