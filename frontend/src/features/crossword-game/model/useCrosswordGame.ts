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
    return currentGrid.map(row => 
      row.map(cell => {
        if (!cell) return null
        
        const isCorrect = words.some(word => {
          const { row: startRow, col: startCol } = word.coordinate
          const letters = word.word.split('')
          
          return letters.some((correctLetter, index) => {
            const cellRow = word.direction === 'down' ? startRow + index : startRow
            const cellCol = word.direction === 'across' ? startCol + index : startCol
            return cellRow === currentGrid.indexOf(row) && 
                   cellCol === row.indexOf(cell) && 
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

  // Размещение буквы на сетке
  const placeLetter = useCallback((
    letter: string,
    rowIndex: number,
    colIndex: number,
    letterIndex: number,
    words: Word[]
  ) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell) return false

    // Проверяем, есть ли буква в доступных
    if (letterIndex >= gameState.availableLetters.length) return false

    // Обновляем сетку
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter: letter.toUpperCase() }
        }
        return cell
      })
    )

    // Обновляем правильность букв
    const gridWithCorrectness = updateLetterCorrectness(newGrid, words)

    // Удаляем букву из доступных
    const newAvailableLetters = [...gameState.availableLetters]
    newAvailableLetters.splice(letterIndex, 1)

    // Проверяем завершенные слова
    const { completedWords, score } = checkCompletedWords(gridWithCorrectness, words)

    setGameState(prev => ({
      ...prev,
      grid: gridWithCorrectness,
      availableLetters: newAvailableLetters,
      completedWords,
      score,
    }))

    return true
  }, [gameState.grid, gameState.availableLetters, updateLetterCorrectness, checkCompletedWords])

  // Удаление буквы с сетки
  const removeLetter = useCallback((rowIndex: number, colIndex: number, words: Word[]) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell || !cell.letter) return false

    const removedLetter = cell.letter

    // Обновляем сетку
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter: "", isCorrect: false }
        }
        return cell
      })
    )

    // Обновляем правильность букв
    const gridWithCorrectness = updateLetterCorrectness(newGrid, words)

    // Возвращаем букву в доступные
    const newAvailableLetters = [...gameState.availableLetters, removedLetter]

    // Проверяем завершенные слова
    const { completedWords, score } = checkCompletedWords(gridWithCorrectness, words)

    setGameState(prev => ({
      ...prev,
      grid: gridWithCorrectness,
      availableLetters: newAvailableLetters,
      completedWords,
      score,
    }))

    return true
  }, [gameState.grid, gameState.availableLetters, updateLetterCorrectness, checkCompletedWords])

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