import { BookOpen, CheckCircle } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import type { Word } from "@/entities/crossword/types"

interface TextCluesProps {
  words: Word[]
  completedWords: Set<string>
  selectedClue: Word | null
  onClueSelect: (word: Word | null) => void
}

export function TextClues({ 
  words, 
  completedWords, 
  selectedClue, 
  onClueSelect 
}: TextCluesProps) {
  const acrossWords = words.filter(word => word.direction === "across").sort((a, b) => a.number - b.number)
  const downWords = words.filter(word => word.direction === "down").sort((a, b) => a.number - b.number)

  const renderWordsList = (wordsList: Word[], title: string, icon: string) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <div className="space-y-1">
        {wordsList.map((word) => (
          <div
            key={word.id}
            className={`
              p-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedClue?.id === word.id ? 'bg-blue-100 border-blue-300 border' : 'bg-gray-50 hover:bg-gray-100'}
              ${completedWords.has(word.id) ? 'opacity-60' : ''}
            `}
            onClick={() => onClueSelect(selectedClue?.id === word.id ? null : word)}
          >
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs font-bold min-w-6 justify-center">
                {word.number}
              </Badge>
              <span className="text-sm text-gray-700 flex-1">
                {word.clue}
              </span>
              <Badge variant="secondary" className="text-xs">
                {word.word.length}
              </Badge>
              {completedWords.has(word.id) && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
        <BookOpen className="w-5 h-5 text-blue-500" />
        Подсказки
      </h3>
      
      <div className="space-y-6">
        {renderWordsList(acrossWords, "По горизонтали", "→")}
        {renderWordsList(downWords, "По вертикали", "↓")}
      </div>
    </Card>
  )
}
