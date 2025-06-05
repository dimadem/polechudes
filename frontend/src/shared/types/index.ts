// API Response types (от бэкенда)
export interface ApiWord {
  id: string
  word: string
  coordinate: {
    row: number
    col: number
    direction: "across" | "down"
  }
  definition: string
}

export interface ApiCrosswordData {
  words: ApiWord[]
  size?: {
    rows: number
    cols: number
  }
  board_size?: {
    rows: number
    cols: number
  }
}

// Frontend display types
export interface GridCell {
  letter: string
  isCorrect: boolean
  isEmpty: boolean
  wordIds: string[]
}

export interface CrosswordGrid {
  size: { rows: number; cols: number }
  grid: (GridCell | null)[][]
  words: ApiWord[]
}
