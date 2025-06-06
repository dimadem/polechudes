import { Lightbulb, CheckCircle } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import type { Word } from "@/entities/crossword/types"

interface VisualCluesProps {
  words: Word[]
  completedWords: Set<string>
  selectedClue: Word | null
  onClueSelect: (word: Word | null) => void
}

export function VisualClues({ 
  words, 
  completedWords, 
  selectedClue, 
  onClueSelect 
}: VisualCluesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Визуальные подсказки
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {words.map((word) => (
          <div
            key={word.id}
            className={`relative cursor-pointer transition-all duration-200 ${
              completedWords.has(word.id) ? "opacity-50" : "hover:scale-105"
            } ${selectedClue?.id === word.id ? "ring-2 ring-blue-400" : ""}`}
            onClick={() => onClueSelect(selectedClue?.id === word.id ? null : word)}
          >
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <img
                src={word.clueImage || "/placeholder.svg"}
                alt={`Подсказка для слова ${word.word}`}
                className="w-full h-20 object-cover rounded-t-lg"
              />
              <div className="p-2">
                <p className="text-xs text-gray-600 text-center" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {word.clue}
                </p>
              </div>
            </div>
            <div className="absolute top-1 left-1">
              <Badge variant="secondary" className="text-xs font-bold">
                {word.number}
              </Badge>
            </div>
            <div className="absolute top-1 right-1">
              <Badge variant="outline" className="text-xs">
                {word.direction === "across" ? "→" : "↓"} {word.word.length}
              </Badge>
            </div>
            {completedWords.has(word.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80 rounded-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
