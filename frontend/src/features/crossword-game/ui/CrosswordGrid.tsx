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
      <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20" />
    )
  }

  const isCorrect = cell.isCorrect && cell.letter !== ""
  const isIncorrect = cell.letter !== "" && !cell.isCorrect
  const isHighlighted = selectedClue && cell.wordIds.includes(selectedClue.id)

  const baseClass = "w-8 h-8 bg-white border border-gray-900 flex items-center justify-center font-bold cursor-pointer relative transition-all duration-150 select-none text-sm"
  let cellClass = baseClass

  if (isCorrect) {
    cellClass += " bg-green-100 text-green-800 border-green-400"
  } else if (isIncorrect) {
    cellClass += " bg-red-100 text-red-800 border-red-400"
  }

  if (isHighlighted) {
    cellClass += " bg-blue-100 border-blue-500"
  }

  if (isOver) {
    cellClass += " bg-yellow-200 border-yellow-600 shadow-md scale-105"
  }

  return (
    <div
      ref={setNodeRef}
      className={cellClass}
      onClick={handleCellClick}
    >
      {cell.isWordStart && cell.wordNumber && (
        <span 
          className="absolute top-0 left-0 text-xs font-bold text-black leading-none bg-white bg-opacity-80 rounded-sm px-0.5 cursor-pointer hover:bg-blue-200 transition-colors duration-150 z-10"
        >
          {cell.wordNumber}
        </span>
      )}
      
      <span className="text-sm font-bold">
        {cell.letter}
      </span>
      
      {isCorrect && (
        <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-600" />
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
      className="grid gap-0.5 mx-auto"
      style={{ 
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        maxWidth: 'min(100%, 320px)'
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