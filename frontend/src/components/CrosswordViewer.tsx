import { useState, useEffect } from 'react'
import type { ApiCrosswordData, CrosswordGrid, GridCell, ApiWord } from '@/shared/types'

interface CrosswordViewerProps {
  difficulty?: 'easy' | 'medium' | 'hard'
}

// Функция для создания сетки кроссворда
function createCrosswordGrid(data: ApiCrosswordData): CrosswordGrid {
  const size = data.size || data.board_size || { rows: 10, cols: 10 }
  
  // Создаем пустую сетку
  const grid: (GridCell | null)[][] = Array(size.rows).fill(null).map(() =>
    Array(size.cols).fill(null).map(() => null)
  )

  // Размещаем слова на сетке
  data.words.forEach((word) => {
    const { row, col, direction } = word.coordinate
    const letters = word.word.split('')
    
    letters.forEach((letter, index) => {
      const currentRow = direction === 'down' ? row + index : row
      const currentCol = direction === 'across' ? col + index : col
      
      if (currentRow < size.rows && currentCol < size.cols) {
        if (!grid[currentRow][currentCol]) {
          grid[currentRow][currentCol] = {
            letter: letter.toUpperCase(),
            isCorrect: false,
            isEmpty: false,
            wordIds: []
          }
        }
        
        // Добавляем ID слова к этой ячейке
        grid[currentRow][currentCol]!.wordIds.push(word.id)
        // Если ячейка была пустая, добавляем букву
        if (grid[currentRow][currentCol]!.letter === '') {
          grid[currentRow][currentCol]!.letter = letter.toUpperCase()
        }
      }
    })
  })

  return {
    size,
    grid,
    words: data.words
  }
}

export function CrosswordViewer({ difficulty = 'medium' }: CrosswordViewerProps) {
  const [crosswordData, setCrosswordData] = useState<CrosswordGrid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWord, setSelectedWord] = useState<ApiWord | null>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchCrossword = async () => {
      try {
        console.log('🔄 Начинаем загрузку кроссворда...', { difficulty })
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:8000/api/crosswords/random?difficulty=${difficulty}`)
        
        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`)
        }
        
        const data: ApiCrosswordData = await response.json()
        console.log('✅ Данные кроссворда получены:', data)
        
        // Проверяем, не был ли компонент размонтирован
        if (isCancelled) {
          console.log('⏹️ Запрос отменен')
          return
        }
        
        const crosswordGrid = createCrosswordGrid(data)
        setCrosswordData(crosswordGrid)
        console.log('✅ Кроссворд успешно создан')
        
      } catch (err) {
        if (!isCancelled) {
          console.error('❌ Ошибка загрузки:', err)
          setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchCrossword()

    // Cleanup функция для отмены запроса при размонтировании
    return () => {
      isCancelled = true
    }
  }, [difficulty])

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!crosswordData) return
    
    const cell = crosswordData.grid[rowIndex][colIndex]
    if (!cell || cell.wordIds.length === 0) return
    
    // Найти слово, которое содержит эту ячейку
    const wordId = cell.wordIds[0] // Берем первое слово для простоты
    const word = crosswordData.words.find(w => w.id === wordId)
    
    if (word) {
      setSelectedWord(selectedWord?.id === word.id ? null : word)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка кроссворда...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="mb-4">Ошибка загрузки: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!crosswordData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Кроссворд недоступен</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Кроссворд
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Сетка кроссворда */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div 
                className="grid gap-1 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${crosswordData.size.cols}, 1fr)`,
                  maxWidth: '600px'
                }}
              >
                {crosswordData.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square border-2 flex items-center justify-center text-lg font-bold cursor-pointer relative
                        ${cell 
                          ? 'bg-white border-gray-400 hover:bg-blue-50' 
                          : 'bg-gray-100 border-gray-200'
                        }
                        ${selectedWord && cell?.wordIds.includes(selectedWord.id)
                          ? 'bg-blue-200 border-blue-500'
                          : ''
                        }
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell && (
                        <>
                          {/* Номер слова в левом верхнем углу */}
                          {crosswordData.words.some(word => 
                            word.coordinate.row === rowIndex && 
                            word.coordinate.col === colIndex
                          ) && (
                            <span className="absolute top-0 left-0 text-xs text-blue-600 font-normal leading-none p-0.5">
                              {crosswordData.words.find(word => 
                                word.coordinate.row === rowIndex && 
                                word.coordinate.col === colIndex
                              )?.id}
                            </span>
                          )}
                          {/* Буква */}
                          <span className="text-gray-800">
                            {cell.letter}
                          </span>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Список слов */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Слова</h2>
              <div className="space-y-3">
                {crosswordData.words.map((word) => (
                  <div 
                    key={word.id}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-colors
                      ${selectedWord?.id === word.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSelectedWord(
                      selectedWord?.id === word.id ? null : word
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {word.id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {word.coordinate.direction === 'across' ? '→' : '↓'}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {word.word.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {word.definition}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Позиция: ({word.coordinate.row}, {word.coordinate.col})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
