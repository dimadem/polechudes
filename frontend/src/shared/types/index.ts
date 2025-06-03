export interface GridCell {
  id: number
  letter: string
  correct: string
}

export interface Word {
  id: string
  word: string
  startPos: [number, number]
  direction: "across" | "down"
  clueImage: string
}

export interface CrosswordData {
  id: string
  grid: (GridCell | null)[][]
  words: Word[]
  availableLetters: string[]
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
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameSession {
  id: string
  crosswordId: string
  userId?: string
  startTime: string
  endTime?: string
  score: number
  completed: boolean
}
