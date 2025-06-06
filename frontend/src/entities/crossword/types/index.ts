export interface Word {
  id: string
  word: string
  clue: string
  clueImage?: string
  direction: "across" | "down"
  coordinate: {
    row: number
    col: number
  }
  number: number
}

export interface ApiWord {
  id: string
  word: string
  definition: string
  clueImage?: string
  coordinate: {
    row: number
    col: number
    direction: "across" | "down"
  }
}

export interface GridCell {
  letter: string
  isCorrect: boolean
  isEmpty: boolean
  wordIds: string[]
  correct?: string
  isWordStart?: boolean
  wordNumber?: number
}

export interface CrosswordApiResponse {
  words: ApiWord[]
  board_size: {
    rows: number
    cols: number
  }
}

export interface CrosswordData {
  grid: (GridCell | null)[][]
  words: Word[]
  availableLetters: string[]
  size: { rows: number; cols: number }
  difficulty?: 'easy' | 'medium' | 'hard'
  id?: string
}

export interface GameState {
  grid: (GridCell | null)[][]
  availableLetters: string[]
  completedWords: Set<string>
  score: number
  selectedClue: Word | null
}

export interface CreateCrosswordRequest {
  words: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  title?: string
  description?: string
}

export interface GameSession {
  id: string
  crosswordId: string
  userId?: string
  score: number
  completed: boolean
  startTime: string
  endTime?: string
  createdAt: string
  updatedAt: string
}