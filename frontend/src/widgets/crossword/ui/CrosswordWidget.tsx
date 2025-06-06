import { useEffect, useMemo, useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { useCrossword } from "@/entities/crossword"
import { useCrosswordGame } from "@/features/crossword-game/model/useCrosswordGame"
import { useDragSensors } from "@/features/crossword-game/model/useDragSensors"
import { transformApiData } from "@/entities/crossword/lib/utils"
import { mockCrosswordData } from "@/features/crossword-game/lib/mockData"
import { CrosswordGrid } from "@/features/crossword-game/ui/CrosswordGrid"
import { AvailableLetters } from "@/features/crossword-game/ui/AvailableLetters"
import { ClueDialog } from "@/features/crossword-game/ui/ClueDialog"
import type { Word } from "@/entities/crossword/types"

interface CrosswordWidgetProps {
  crosswordId?: string
  difficulty?: "easy" | "medium" | "hard"
  className?: string
  onGameComplete?: (score: number) => void
}

export function CrosswordWidget({ 
  crosswordId, 
  difficulty = "medium", 
  className = "",
  onGameComplete
}: CrosswordWidgetProps) {
  
  // Используем унифицированный хук для загрузки
  const { crossword: apiData, loading, error, getRandomCrossword } = useCrossword(crosswordId)
  
  // Трансформируем данные от API в формат для игры
  const crosswordData = useMemo(() => {
    const dataToTransform = apiData || mockCrosswordData // Используем мок если нет API данных
    return transformApiData(dataToTransform)
  }, [apiData])
  
  // Инициализируем игровую логику
  const { 
    gameState, 
    initializeGame, 
    handleLetterDrop,
    selectClue, 
    isGameComplete,
    removeLetter 
  } = useCrosswordGame(crosswordData || undefined)

  // Состояние для диалога с подсказкой
  const [clueDialogWord, setClueDialogWord] = useState<Word | null>(null)
  const [isClueDialogOpen, setIsClueDialogOpen] = useState(false)

  // Настройка sensors для поддержки мобильных устройств
  const sensors = useDragSensors()

  // Загружаем случайный кроссворд если нет ID
  useEffect(() => {
    // Временно отключено для использования мок-данных
    // if (!crosswordId) {
    //   getRandomCrossword(difficulty)
    // }
  }, [crosswordId, difficulty, getRandomCrossword])

  // Инициализируем игру когда данные загружены
  useEffect(() => {
    if (crosswordData) {
      initializeGame(crosswordData)
    }
  }, [crosswordData, initializeGame])

  // Проверяем завершение игры
  useEffect(() => {
    if (crosswordData && isGameComplete(crosswordData.words.length)) {
      onGameComplete?.(gameState.score)
    }
  }, [crosswordData, gameState.score, isGameComplete, onGameComplete])

  // Обработчик окончания drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !crosswordData) return

    const dragData = active.data.current
    const dropData = over.data.current

    // Проверяем что перетаскиваем букву на ячейку
    if (dragData?.type === 'letter' && dropData?.accepts?.includes('letter')) {
      const letter = dragData.letter
      const letterIndex = dragData.index
      const row = dropData.row
      const col = dropData.col

      handleLetterDrop(letter, row, col, letterIndex, crosswordData.words)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка кроссворда...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки: {error}</p>
            <button 
              onClick={() => getRandomCrossword(difficulty)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Попробовать снова
            </button>
          </Card>
        </div>
      </div>
    )
  }

  if (!crosswordData) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">Кроссворд недоступен</p>
            <button 
              onClick={() => getRandomCrossword(difficulty)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Загрузить кроссворд
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3 ${className}`}>
        <div className="max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-center mb-4 text-gray-800">
            Кроссворд
          </h1>
          
          <div className="space-y-4">
            {/* Сетка кроссворда */}
            <Card className="p-3">
              <div className="flex justify-between items-center mb-3">
                <Badge variant="secondary" className="text-xs">
                  Счет: {gameState.score}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {gameState.completedWords.size}/{crosswordData.words.length} слов
                </Badge>
              </div>
              
              <CrosswordGrid
                grid={gameState.grid}
                selectedClue={gameState.selectedClue}
                onCellClick={(row, col) => {
                  const cell = gameState.grid[row]?.[col]
                  if (cell) {
                    // Если в ячейке есть буква, удаляем ее
                    if (cell.letter) {
                      removeLetter(row, col, crosswordData.words)
                    } else {
                      // Иначе выбираем подсказку
                      if (cell.wordIds.length > 0) {
                        const wordId = cell.wordIds[0] // Берем первое слово
                        const word = crosswordData.words.find(w => w.id === wordId)
                        if (word) {
                          selectClue(gameState.selectedClue?.id === word.id ? null : word)
                        }
                      }
                    }
                  }
                }}
                onNumberClick={(row, col) => {
                  const cell = gameState.grid[row]?.[col]
                  if (cell && cell.isWordStart && cell.wordIds.length > 0) {
                    const wordId = cell.wordIds[0] // Берем первое слово
                    const word = crosswordData.words.find(w => w.id === wordId)
                    if (word) {
                      setClueDialogWord(word)
                      setIsClueDialogOpen(true)
                    }
                  }
                }}
              />
            </Card>

            {/* Доступные буквы */}
            <AvailableLetters
              letters={gameState.availableLetters}
            />

            {/* Визуальные подсказки */}
            {/* <VisualClues
              words={crosswordData.words}
              completedWords={gameState.completedWords}
              selectedClue={gameState.selectedClue}
              onClueSelect={selectClue}
            /> */}
          </div>
        </div>

        {/* Диалог с подсказкой */}
        <ClueDialog
          word={clueDialogWord}
          open={isClueDialogOpen}
          onOpenChange={setIsClueDialogOpen}
        />
      </div>
    </DndContext>
  )
}