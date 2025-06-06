import type { CrosswordApiResponse, CrosswordData, GridCell, Word, ApiWord } from '@/entities/crossword/types'

function transformWords(apiWords: ApiWord[]): Word[] {
  const transformedWords = apiWords.map((apiWord: ApiWord) => ({
    id: apiWord.id,
    word: apiWord.word,
    clue: apiWord.definition,
    clueImage: apiWord.clueImage,
    direction: apiWord.coordinate.direction,
    coordinate: {
      row: apiWord.coordinate.row,
      col: apiWord.coordinate.col
    },
    number: 0
  }))
  
  const sortedWords = [...transformedWords].sort((a, b) => {
    if (a.coordinate.row !== b.coordinate.row) {
      return a.coordinate.row - b.coordinate.row
    }
    return a.coordinate.col - b.coordinate.col
  })

  return sortedWords.map((word, index) => ({
    ...word,
    number: index + 1
  }))
}

function createGrid(words: Word[], size: { rows: number; cols: number }): (GridCell | null)[][] {
  const grid: (GridCell | null)[][] = Array(size.rows)
    .fill(null)
    .map(() => Array(size.cols).fill(null))

  words.forEach((word) => {
    const { row, col } = word.coordinate
    const letters = word.word.split('')
    
    letters.forEach((letter, index) => {
      const currentRow = word.direction === 'down' ? row + index : row
      const currentCol = word.direction === 'across' ? col + index : col
      
      if (currentRow < size.rows && currentCol < size.cols) {
        if (!grid[currentRow][currentCol]) {
          grid[currentRow][currentCol] = {
            letter: '',
            isCorrect: false,
            isEmpty: true,
            wordIds: [],
            correct: letter.toUpperCase(),
            isWordStart: false
          }
        }
        
        if (index === 0) {
          grid[currentRow][currentCol]!.isWordStart = true
          grid[currentRow][currentCol]!.wordNumber = word.number
        }
        
        grid[currentRow][currentCol]!.wordIds.push(word.id)
      }
    })
  })

  return grid
}

function generateAvailableLetters(grid: (GridCell | null)[][]): string[] {
  const availableLetters: string[] = []
  
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell.correct) {
        availableLetters.push(cell.correct)
      }
    })
  })
  
  availableLetters.sort(() => Math.random() - 0.5)
  return availableLetters
}

export function transformApiData(apiData: CrosswordApiResponse): CrosswordData {
  const size = apiData.board_size
  const words = transformWords(apiData.words)
  const grid = createGrid(words, size)
  const availableLetters = generateAvailableLetters(grid)

  return {
    grid,
    words,
    availableLetters,
    size,
    id: `crossword-${Date.now()}`
  }
}

export function createDisplayGrid(data: CrosswordData): (GridCell | null)[][] {
  return data.grid.map(row => 
    row.map(cell => cell ? { ...cell } : null)
  )
}