import React, { useEffect } from "react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { useCrossword, useGameSession } from "@/entities/crossword"
import { 
  useCrosswordGame,
  CrosswordGrid,
  AvailableLetters,
  VisualClues,
  GameStatus,
  GameControls
} from "@/features/crossword-game"

interface CrosswordWidgetProps {
  crosswordId?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  onGameComplete?: (score: number) => void
  className?: string
}

export function CrosswordWidget({ 
  crosswordId, 
  difficulty, 
  onGameComplete,
  className = ""
}: CrosswordWidgetProps) {
  const { 
    crossword, 
    loading: crosswordLoading, 
    error: crosswordError,
    getRandomCrossword 
  } = useCrossword(crosswordId)

  const {
    session,
    startSession,
    updateSession,
    endSession,
    loading: sessionLoading
  } = useGameSession()

  const {
    gameState,
    initializeGame,
    resetGame,
    selectClue,
    handleDragStart,
    handleDrop,
    isGameComplete,
  } = useCrosswordGame(crossword || undefined)

  // Инициализация игры при загрузке кроссворда
  useEffect(() => {
    if (crossword) {
      initializeGame(crossword)
    }
  }, [crossword, initializeGame])

  // Начало игровой сессии
  useEffect(() => {
    if (crossword && !session) {
      startSession(crossword.id)
    }
  }, [crossword, session, startSession])

  // Обновление счета в сессии
  useEffect(() => {
    if (session && gameState.score > 0) {
      updateSession({ score: gameState.score })
    }
  }, [session, gameState.score, updateSession])

  // Завершение игры
  useEffect(() => {
    if (crossword && isGameComplete(crossword.words.length)) {
      endSession(gameState.score).then(() => {
        onGameComplete?.(gameState.score)
      })
    }
  }, [crossword, isGameComplete, gameState.score, endSession, onGameComplete])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnGrid = (e: React.DragEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault()
    if (crossword) {
      handleDrop(rowIndex, colIndex, crossword.words)
    }
  }

  const handleReset = () => {
    if (crossword) {
      resetGame(crossword)
      if (session) {
        startSession(crossword.id)
      }
    }
  }

  const handleGetRandomCrossword = () => {
    getRandomCrossword(difficulty)
  }

  // Загрузка случайного кроссворда если нет ID
  useEffect(() => {
    if (!crosswordId && !crossword) {
      handleGetRandomCrossword()
    }
  }, [crosswordId, crossword])

  if (crosswordLoading || sessionLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading crossword...</p>
          </div>
        </div>
      </div>
    )
  }

  if (crosswordError) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <p className="text-red-600 mb-4">Error loading crossword: {crosswordError}</p>
            <button 
              onClick={handleGetRandomCrossword}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </Card>
        </div>
      </div>
    )
  }

  if (!crossword) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <p className="text-gray-600 mb-4">No crossword available</p>
            <button 
              onClick={handleGetRandomCrossword}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load Random Crossword
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">Crossword Puzzle</h1>
          <div className="flex justify-center items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Score: {gameState.score}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {gameState.completedWords.size}/{crossword.words.length} Words
            </Badge>
          </div>
        </div>

        {/* Crossword Grid */}
        <Card className="p-4">
          <CrosswordGrid
            grid={gameState.grid}
            onDragOver={handleDragOver}
            onDrop={handleDropOnGrid}
          />
        </Card>

        {/* Visual Clues */}
        <Card className="p-4">
          <VisualClues
            words={crossword.words}
            completedWords={gameState.completedWords}
            selectedClue={gameState.selectedClue}
            onClueSelect={selectClue}
          />
        </Card>

        {/* Available Letters */}
        <Card className="p-4">
          <AvailableLetters
            letters={gameState.availableLetters}
            onDragStart={handleDragStart}
          />
        </Card>

        {/* Controls */}
        <GameControls onReset={handleReset} />

        {/* Game Status */}
        <GameStatus
          isComplete={isGameComplete(crossword.words.length)}
          score={gameState.score}
        />
      </div>
    </div>
  )
}
