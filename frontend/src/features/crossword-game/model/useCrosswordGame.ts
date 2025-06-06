import { useState, useCallback } from 'react'
import type { GridCell, Word, GameState, CrosswordData } from '@/entities/crossword/types'
import { isWordComplete } from '@/entities/crossword/model/validation'

export function useCrosswordGame(initialData?: CrosswordData) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: initialData?.grid || [],
    availableLetters: initialData?.availableLetters || [],
    completedWords: new Set(),
    score: 0,
    selectedClue: null,
  }))

  // Инициализация игры с новыми данными
  const initializeGame = useCallback((data: CrosswordData) => {
    setGameState({
      grid: data.grid.map(row => 
        row.map(cell => cell ? { ...cell, letter: "", isCorrect: false } : null)
      ),
      availableLetters: [...data.availableLetters],
      completedWords: new Set(),
      score: 0,
      selectedClue: null,
    })
  }, [])

  const updateLetterCorrectness = useCallback((
    currentGrid: (GridCell | null)[][],
    words: Word[]
  ) => {
    return currentGrid.map((row, rowIndex) => 
      row.map((cell, colIndex) => {
        if (!cell || !cell.letter) return cell
        
        const isCorrect = words.some(word => {
          const { row: startRow, col: startCol } = word.coordinate
          const letters = word.word.split('')
          
          return letters.some((correctLetter, letterIndex) => {
            const cellRow = word.direction === 'down' ? startRow + letterIndex : startRow
            const cellCol = word.direction === 'across' ? startCol + letterIndex : startCol
            return cellRow === rowIndex && 
                   cellCol === colIndex && 
                   cell.letter === correctLetter.toUpperCase()
          })
        })
        
        return { ...cell, isCorrect }
      })
    )
  }, [])

  const checkCompletedWords = useCallback((
    currentGrid: (GridCell | null)[][],
    words: Word[]
  ) => {
    const completedWords = new Set(gameState.completedWords)
    let score = gameState.score

    words.forEach((word) => {
      if (isWordComplete(word, currentGrid) && !completedWords.has(word.id)) {
        completedWords.add(word.id)
        score += word.word.length * 10
      }
    })

    return { completedWords, score }
  }, [gameState.completedWords, gameState.score])

  // Вспомогательная функция для обновления состояния игры
  const updateGameState = useCallback((
    newGrid: (GridCell | null)[][],
    newAvailableLetters: string[],
    words: Word[]
  ) => {
    const gridWithCorrectness = updateLetterCorrectness(newGrid, words)
    const { completedWords, score } = checkCompletedWords(gridWithCorrectness, words)

    setGameState(prev => ({
      ...prev,
      grid: gridWithCorrectness,
      availableLetters: newAvailableLetters,
      completedWords,
      score,
    }))

    return true
  }, [updateLetterCorrectness, checkCompletedWords])

  // Размещение буквы на сетке
  const placeLetter = useCallback((
    letter: string,
    rowIndex: number,
    colIndex: number,
    letterIndex: number,
    words: Word[]
  ) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell || letterIndex >= gameState.availableLetters.length) return false

    // Запоминаем старую букву для возврата в доступные
    const oldLetter = cell.letter

    // Создаем новую сетку с обновленной ячейкой
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter: letter.toUpperCase() }
        }
        return cell
      })
    )

    // Обновляем доступные буквы
    const newAvailableLetters = [...gameState.availableLetters]
    newAvailableLetters.splice(letterIndex, 1)
    if (oldLetter) {
      newAvailableLetters.push(oldLetter)
    }

    return updateGameState(newGrid, newAvailableLetters, words)
  }, [gameState.grid, gameState.availableLetters, updateGameState])

  // Удаление буквы с сетки
  const removeLetter = useCallback((rowIndex: number, colIndex: number, words: Word[]) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell?.letter) return false

    const removedLetter = cell.letter

    // Создаем новую сетку с очищенной ячейкой
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter: "", isCorrect: false }
        }
        return cell
      })
    )

    // Возвращаем букву в доступные
    const newAvailableLetters = [...gameState.availableLetters, removedLetter]

    return updateGameState(newGrid, newAvailableLetters, words)
  }, [gameState.grid, gameState.availableLetters, updateGameState])

  // Обработчик drag & drop
  const handleLetterDrop = useCallback((
    letter: string,
    rowIndex: number,
    colIndex: number,
    letterIndex: number,
    words: Word[]
  ) => {
    return placeLetter(letter, rowIndex, colIndex, letterIndex, words)
  }, [placeLetter])

  // Выбор подсказки
  const selectClue = useCallback((word: Word | null) => {
    setGameState(prev => ({
      ...prev,
      selectedClue: prev.selectedClue?.id === word?.id ? null : word,
    }))
  }, [])

  // Проверка завершения игры
  const isGameComplete = useCallback((totalWords: number) => {
    return gameState.completedWords.size === totalWords
  }, [gameState.completedWords.size])

  return {
    gameState,
    initializeGame,
    placeLetter,
    removeLetter,
    handleLetterDrop,
    selectClue,
    isGameComplete,
  }
}