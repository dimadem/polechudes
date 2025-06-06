import type { CrosswordData, Word, GridCell } from '@/entities/crossword/types'

/**
 * Валидация данных кроссворда
 */
export function validateCrosswordData(data: CrosswordData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Проверка размера сетки
  if (!data.size || data.size.rows < 1 || data.size.cols < 1) {
    errors.push('Некорректный размер сетки кроссворда')
  }

  // Проверка соответствия сетки заявленному размеру
  if (data.grid.length !== data.size.rows) {
    errors.push('Количество строк не соответствует размеру')
  }

  if (data.grid.some(row => row.length !== data.size.cols)) {
    errors.push('Количество колонок не соответствует размеру')
  }

  // Проверка слов
  if (!data.words || data.words.length === 0) {
    errors.push('Кроссворд должен содержать хотя бы одно слово')
  }

  // Валидация каждого слова
  data.words.forEach((word, index) => {
    const wordErrors = validateWord(word, data.size, index)
    errors.push(...wordErrors)
  })

  // Проверка доступных букв
  if (!data.availableLetters || data.availableLetters.length === 0) {
    errors.push('Должны быть доступные буквы для размещения')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Валидация отдельного слова
 */
export function validateWord(word: Word, gridSize: { rows: number; cols: number }, index: number): string[] {
  const errors: string[] = []

  // Проверка основных полей
  if (!word.id) {
    errors.push(`Слово ${index + 1}: отсутствует ID`)
  }

  if (!word.word || word.word.length === 0) {
    errors.push(`Слово ${index + 1}: пустое слово`)
  }

  if (!word.clue) {
    errors.push(`Слово ${index + 1}: отсутствует подсказка`)
  }

  if (!['across', 'down'].includes(word.direction)) {
    errors.push(`Слово ${index + 1}: некорректное направление (${word.direction})`)
  }

  // Проверка координат
  if (!word.coordinate) {
    errors.push(`Слово ${index + 1}: отсутствуют координаты`)
  } else {
    const { row, col } = word.coordinate

    if (row < 0 || row >= gridSize.rows) {
      errors.push(`Слово ${index + 1}: некорректная строка (${row})`)
    }

    if (col < 0 || col >= gridSize.cols) {
      errors.push(`Слово ${index + 1}: некорректная колонка (${col})`)
    }

    // Проверка, что слово помещается в сетку
    const wordLength = word.word.length
    if (word.direction === 'across' && col + wordLength > gridSize.cols) {
      errors.push(`Слово ${index + 1}: выходит за границы сетки по горизонтали`)
    }

    if (word.direction === 'down' && row + wordLength > gridSize.rows) {
      errors.push(`Слово ${index + 1}: выходит за границы сетки по вертикали`)
    }
  }

  // Проверка номера слова
  if (typeof word.number !== 'number' || word.number <= 0) {
    errors.push(`Слово ${index + 1}: некорректный номер (${word.number})`)
  }

  return errors
}

/**
 * Валидация состояния игры
 */
export function validateGameState(
  grid: (GridCell | null)[][],
  words: Word[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Проверка соответствия букв в сетке
  words.forEach((word) => {
    const { row, col } = word.coordinate
    const letters = word.word.split('')

    letters.forEach((expectedLetter, index) => {
      const currentRow = word.direction === 'down' ? row + index : row
      const currentCol = word.direction === 'across' ? col + index : col

      const cell = grid[currentRow]?.[currentCol]
      if (cell && cell.letter && cell.letter !== expectedLetter.toUpperCase()) {
        errors.push(`Неправильная буква в позиции [${currentRow}, ${currentCol}] для слова "${word.word}"`)
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Проверка завершенности слова
 */
export function isWordComplete(word: Word, grid: (GridCell | null)[][]): boolean {
  const { row, col } = word.coordinate
  const letters = word.word.split('')

  return letters.every((expectedLetter, index) => {
    const currentRow = word.direction === 'down' ? row + index : row
    const currentCol = word.direction === 'across' ? col + index : col

    const cell = grid[currentRow]?.[currentCol]
    return cell && cell.letter === expectedLetter.toUpperCase()
  })
}

/**
 * Проверка завершенности всего кроссворда
 */
export function isCrosswordComplete(words: Word[], grid: (GridCell | null)[][]): boolean {
  return words.every(word => isWordComplete(word, grid))
}