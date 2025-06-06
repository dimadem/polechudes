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
        w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg 
        flex items-center justify-center text-sm font-bold cursor-grab touch-manipulation
        transition-all duration-150 user-select-none
        shadow-md transform active:scale-110
        ${isDragging ? 'opacity-60 cursor-grabbing z-50 scale-110 shadow-xl' : 'hover:scale-105 hover:shadow-lg active:shadow-xl'}
      `}
    >
      {letter}
    </div>
  )
}

export function AvailableLetters({ letters }: AvailableLettersProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 justify-center">
        {letters.map((letter, index) => (
          <DraggableLetter
            key={`${letter}-${index}`}
            letter={letter}
            index={index}
          />
        ))}
      </div>
      {letters.length === 0 && (
        <p className="text-gray-500 text-center py-2 italic text-xs">Все буквы использованы!</p>
      )}
    </div>
  )
}