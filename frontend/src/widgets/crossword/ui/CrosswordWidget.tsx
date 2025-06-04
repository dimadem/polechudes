import { useEffect, useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

interface CrosswordWidgetProps {
  crosswordId?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  onGameComplete?: (score: number) => void
  className?: string
}

export function CrosswordWidget({ 
  crosswordId, 
  difficulty = "medium", 
  className = ""
}: CrosswordWidgetProps) 
{

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crossword, setCrossword] = useState<any>(null)

  useEffect(() => {
    const loadCrossword = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🎯 Loading crossword with difficulty:', difficulty)
        
        const apiUrl = `http://localhost:8000/api/crosswords/random?difficulty=${difficulty}`
        console.log('🌐 API Request:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✅ API Response:', data)
        
        setCrossword(data)
      } catch (err) {
        console.error('❌ API Request failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    // Загружаем кроссворд только если нет ID (случайный) или есть конкретный ID
    if (!crosswordId || crosswordId) {
      loadCrossword()
    }
  }, [crosswordId, difficulty]) // Простые зависимости

  if (loading) {
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

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 ${className}`}>
        <div className="max-w-md mx-auto flex items-center justify-center h-64">
          <Card className="p-6 text-center">
            <p className="text-red-600 mb-4">Error loading crossword: {error}</p>
            <button 
              onClick={() => window.location.reload()}
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
              onClick={() => window.location.reload()}
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
              Score: 0
            </Badge>
            <Badge variant="outline" className="text-sm">
              0/{crossword.words?.length || 0} Words
            </Badge>
          </div>
        </div>

        {/* 
        // Crossword Data Display (temporary)
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Crossword Data:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(crossword, null, 2)}
          </pre>
        </Card> */}

        {/* Simple Grid Display */}
        {crossword.grid && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Grid:</h3>
            <div className="grid grid-cols-10 gap-1 max-w-xs mx-auto">
              {crossword.grid.flat().map((cell: any, index: number) => (
                <div
                  key={index}
                  className={`w-6 h-6 border text-xs flex items-center justify-center 
                      ${cell ? 'bg-white border-gray-400' : 'bg-gray-200 border-gray-200'}
                    `}>
                  {cell?.number || ''}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Available Letters */}
        {crossword.availableLetters && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Available Letters:</h3>
            <div className="flex flex-wrap gap-2">
              {crossword.availableLetters.map((letter: string, index: number) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-blue-100 border border-blue-300 rounded flex items-center justify-center font-semibold text-blue-800"
                >
                  {letter}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Words List */}
        {crossword.words && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Words:</h3>
            <div className="space-y-2">
              {crossword.words.map((word: any, index: number) => (
                <div key={index} className="text-sm">
                  <strong>{word.word}</strong> - {word.clue}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}