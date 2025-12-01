export interface SolvePathEntry {
  row: number
  col: number
  value: number
  timestamp: number
  isCorrection: boolean
}

export type SolvePath = SolvePathEntry[]
