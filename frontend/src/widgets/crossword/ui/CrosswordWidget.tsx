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
  onGameComplete?: (score: number) => void
}

export function CrosswordWidget({ 
  crosswordId, 
  difficulty = "medium",
  onGameComplete
}: CrosswordWidgetProps) {
  
  const { crossword: apiData, loading, error, getRandomCrossword } = useCrossword(crosswordId)
  
  const crosswordData = useMemo(() => {
    const dataToTransform = apiData || mockCrosswordData
    return transformApiData(dataToTransform)
  }, [apiData])
  
  const { 
    gameState, 
    initializeGame, 
    handleLetterDrop,
    selectClue, 
    isGameComplete,
    removeLetter 
  } = useCrosswordGame(crosswordData || undefined)

  const [clueDialogWord, setClueDialogWord] = useState<Word | null>(null)
  const [isClueDialogOpen, setIsClueDialogOpen] = useState(false)

  const sensors = useDragSensors()
  useEffect(() => {
    if (!crosswordId) {
      getRandomCrossword(difficulty)
    }
  }, [crosswordId, difficulty, getRandomCrossword])

  useEffect(() => {
    if (crosswordData) {
      initializeGame(crosswordData)
    }
  }, [crosswordData, initializeGame])

  useEffect(() => {
    if (crosswordData && isGameComplete(crosswordData.words.length)) {
      onGameComplete?.(gameState.score)
    }
  }, [crosswordData, gameState.score, isGameComplete, onGameComplete])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !crosswordData) return

    const dragData = active.data.current
    const dropData = over.data.current

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"
      style={{
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"
      style={{
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4"
        style={{
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3"
      style={{
        backgroundImage: 'url("/images/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="max-w-sm mx-auto">
          <div className="space-y-4">
            <Card className="p-3 bg-transparent border-none shadow-none">
              <div className="flex justify-between items-center mb-3">
                <Badge variant="secondary" className="text-xs">
                  Счет: {gameState.score}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {gameState.completedWords.size}/{crosswordData.words.length} слов
                </Badge>
              </div>
              
              <CrosswordGrid
                grid={gameState.grid}
                selectedClue={gameState.selectedClue}
                onCellClick={(row, col) => {
                  const cell = gameState.grid[row]?.[col]
                  if (cell) {
                    if (cell.isWordStart && cell.wordIds.length > 0) {
                      const word = crosswordData.words.find(w => 
                        w.id && cell.wordIds.includes(w.id) && 
                        w.coordinate.row === row && w.coordinate.col === col
                      )
                      if (word) {
                        setClueDialogWord(word)
                        setIsClueDialogOpen(true)
                        return
                      }
                    }
                    if (cell.letter) {
                      removeLetter(row, col, crosswordData.words)
                    } else {
                      if (cell.wordIds.length > 0) {
                        const wordId = cell.wordIds[0]
                        const word = crosswordData.words.find(w => w.id === wordId)
                        if (word) {
                          selectClue(gameState.selectedClue?.id === word.id ? null : word)
                        }
                      }
                    }
                  }
                }}
              />
            </Card>

            <AvailableLetters
              letters={gameState.availableLetters}
            />

            {/* <VisualClues
              words={crosswordData.words}
              completedWords={gameState.completedWords}
              selectedClue={gameState.selectedClue}
              onClueSelect={selectClue}
            /> */}
          </div>
        </div>

        <ClueDialog
          word={clueDialogWord}
          open={isClueDialogOpen}
          onOpenChange={setIsClueDialogOpen}
        />
      </div>
    </DndContext>
  )
}