import { useDraggable } from '@dnd-kit/core'

interface AvailableLettersProps {
  letters: string[]
}

interface DraggableLetterProps {
  letter: string
  index: number
  onLetterUse?: (letter: string, index: number) => void
}

function DraggableLetter({ letter, index }: DraggableLetterProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `letter-${letter}-${index}`,
    data: {
      type: 'letter',
      letter,
      index,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl 
        flex items-center justify-center text-xl font-bold cursor-grab 
        hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
        ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
      `}
    >
      {letter}
    </div>
  )
}

export function AvailableLetters({ letters }: AvailableLettersProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Доступные буквы</h3>
      <div className="flex flex-wrap gap-3">
        {letters.map((letter, index) => (
          <DraggableLetter
            key={`${letter}-${index}`}
            letter={letter}
            index={index}
          />
        ))}
      </div>
      {letters.length === 0 && (
        <p className="text-gray-500 text-center py-4 italic">Все буквы использованы!</p>
      )}
    </div>
  )
}