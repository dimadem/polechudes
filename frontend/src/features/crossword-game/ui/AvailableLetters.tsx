interface AvailableLettersProps {
  letters: string[]
  onDragStart: (letter: string) => void
}

export function AvailableLetters({ letters, onDragStart }: AvailableLettersProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Available Letters</h3>
      <div className="flex flex-wrap gap-2">
        {letters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            draggable
            onDragStart={() => onDragStart(letter)}
            className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg font-bold cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors duration-200 shadow-md"
          >
            {letter}
          </div>
        ))}
      </div>
      {letters.length === 0 && (
        <p className="text-gray-500 text-center py-4">All letters used!</p>
      )}
    </div>
  )
}
