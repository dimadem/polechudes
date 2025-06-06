import { CheckCircle } from "lucide-react"
import { useDroppable } from '@dnd-kit/core'
import type { GridCell, Word } from "@/entities/crossword/types"

interface CrosswordGridProps {
  grid: (GridCell | null)[][]
  selectedClue?: Word | null
  onCellClick?: (row: number, col: number) => void
}

interface DroppableCellProps {
  cell: GridCell | null
  row: number
  col: number
  selectedClue?: Word | null
  onCellClick?: (row: number, col: number) => void
}

function DroppableCell({ cell, row, col, selectedClue, onCellClick }: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${row}-${col}`,
    data: {
      row,
      col,
      accepts: cell ? ['letter'] : [],
    },
  })

  const handleCellClick = () => {
    onCellClick?.(row, col)
  }

  if (!cell) {
    return (
      <div className="w-12 h-12 bg-black border border-black" />
    )
  }

  // Белая ячейка (для букв)
  const isCorrect = cell.isCorrect && cell.letter !== ""
  const isIncorrect = cell.letter !== "" && !cell.isCorrect
  const isEmpty = cell.letter === ""
  const isHighlighted = selectedClue && cell.wordIds.includes(selectedClue.id)

  const baseClass = "w-12 h-12 bg-white border-2 border-gray-900 flex items-center justify-center font-bold cursor-pointer relative transition-all duration-200 select-none"
  let cellClass = baseClass

  if (isCorrect) {
    cellClass += " bg-green-50 border-green-600 text-green-800"
  } else if (isIncorrect) {
    cellClass += " bg-red-50 border-red-600 text-red-800"
  } else if (isEmpty) {
    cellClass += " hover:border-blue-500 hover:bg-blue-50"
  } else {
    cellClass += " text-gray-800"
  }

  if (isHighlighted) {
    cellClass += " bg-blue-200 border-blue-500 shadow-md"
  }

  if (isOver && isEmpty) {
    cellClass += " bg-blue-100 border-blue-400 shadow-lg"
  }

  return (
    <div
      ref={setNodeRef}
      className={cellClass}
      onClick={handleCellClick}
    >
      {cell.isWordStart && cell.wordNumber && (
        <span className="absolute top-0.5 left-0.5 text-xs font-bold text-black leading-none bg-transparent min-w-0">
          {cell.wordNumber}
        </span>
      )}
      
      <span className="text-xl font-bold">
        {cell.letter}
      </span>
      
      {cell.isCorrect && cell.letter !== "" && (
        <CheckCircle className="absolute top-0 right-0 w-3 h-3 text-green-600 -mt-1 -mr-1" />
      )}
    </div>
  )
}

export function CrosswordGrid({ 
  grid, 
  selectedClue,
  onCellClick
}: CrosswordGridProps) {
  
  const gridCols = grid[0]?.length || 10
  
  return (
    <div 
      className="grid gap-1 mx-auto p-4"
      style={{ 
        gridTemplateColumns: `repeat(${gridCols}, 48px)`,
        maxWidth: '800px',
        width: 'fit-content'
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <DroppableCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
            selectedClue={selectedClue}
            onCellClick={onCellClick}
          />
        ))
      )}
    </div>
  )
}