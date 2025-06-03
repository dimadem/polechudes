import { useState, useCallback } from 'react'
import type { GridCell, Word, GameState, CrosswordData } from '@/shared/types'

export function useCrosswordGame(initialData?: CrosswordData) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: initialData?.grid || [],
    availableLetters: initialData?.availableLetters || [],
    completedWords: new Set(),
    score: 0,
    selectedClue: null,
  }))

  const [draggedLetter, setDraggedLetter] = useState<string | null>(null)

  // Инициализация игры с новыми данными
  const initializeGame = useCallback((data: CrosswordData) => {
    setGameState({
      grid: data.grid.map(row => 
        row.map(cell => cell ? { ...cell, letter: "" } : null)
      ),
      availableLetters: [...data.availableLetters],
      completedWords: new Set(),
      score: 0,
      selectedClue: null,
    })
    setDraggedLetter(null)
  }, [])

  // Проверка завершенных слов
  const checkCompletedWords = useCallback((
    currentGrid: (GridCell | null)[][],
    words: Word[]
  ) => {
    const newCompletedWords = new Set(gameState.completedWords)
    let newScore = gameState.score

    words.forEach((word) => {
      const isComplete = word.word.split("").every((letter, index) => {
        const [startRow, startCol] = word.startPos
        const row = word.direction === "down" ? startRow + index : startRow
        const col = word.direction === "across" ? startCol + index : startCol
        const cell = currentGrid[row]?.[col]
        return cell && cell.letter === letter
      })

      if (isComplete && !gameState.completedWords.has(word.id)) {
        newCompletedWords.add(word.id)
        newScore += word.word.length * 10
      }
    })

    if (newCompletedWords.size !== gameState.completedWords.size) {
      setGameState(prev => ({
        ...prev,
        completedWords: newCompletedWords,
        score: newScore,
      }))
      return true // Новые слова завершены
    }
    
    return false
  }, [gameState.completedWords, gameState.score])

  // Размещение буквы на сетке
  const placeLetter = useCallback((
    rowIndex: number,
    colIndex: number,
    letter: string,
    words: Word[]
  ) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell) return false

    // Проверяем, есть ли буква в доступных
    const letterIndex = gameState.availableLetters.indexOf(letter)
    if (letterIndex === -1) return false

    // Обновляем сетку
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter }
        }
        return cell
      })
    )

    // Удаляем букву из доступных
    const newAvailableLetters = [...gameState.availableLetters]
    newAvailableLetters.splice(letterIndex, 1)

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      availableLetters: newAvailableLetters,
    }))

    // Проверяем завершенные слова
    checkCompletedWords(newGrid, words)
    return true
  }, [gameState.grid, gameState.availableLetters, checkCompletedWords])

  // Удаление буквы с сетки
  const removeLetter = useCallback((rowIndex: number, colIndex: number) => {
    const cell = gameState.grid[rowIndex]?.[colIndex]
    if (!cell || !cell.letter) return false

    const removedLetter = cell.letter

    // Обновляем сетку
    const newGrid = gameState.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex && cell) {
          return { ...cell, letter: "" }
        }
        return cell
      })
    )

    // Возвращаем букву в доступные
    const newAvailableLetters = [...gameState.availableLetters, removedLetter]

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      availableLetters: newAvailableLetters,
    }))

    return true
  }, [gameState.grid, gameState.availableLetters])

  // Сброс игры
  const resetGame = useCallback((data: CrosswordData) => {
    initializeGame(data)
  }, [initializeGame])

  // Выбор подсказки
  const selectClue = useCallback((word: Word | null) => {
    setGameState(prev => ({
      ...prev,
      selectedClue: prev.selectedClue?.id === word?.id ? null : word,
    }))
  }, [])

  // Drag & Drop handlers
  const handleDragStart = useCallback((letter: string) => {
    setDraggedLetter(letter)
  }, [])

  const handleDrop = useCallback((
    rowIndex: number,
    colIndex: number,
    words: Word[]
  ) => {
    if (!draggedLetter) return false
    
    const success = placeLetter(rowIndex, colIndex, draggedLetter, words)
    setDraggedLetter(null)
    return success
  }, [draggedLetter, placeLetter])

  const isGameComplete = useCallback((totalWords: number) => {
    return gameState.completedWords.size === totalWords
  }, [gameState.completedWords.size])

  return {
    gameState,
    draggedLetter,
    initializeGame,
    placeLetter,
    removeLetter,
    resetGame,
    selectClue,
    handleDragStart,
    handleDrop,
    isGameComplete,
    checkCompletedWords,
  }
}
