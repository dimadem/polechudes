import type React from "react"
import { CheckCircle } from "lucide-react"
import type { GridCell } from "@/shared/types"

interface CrosswordGridProps {
  grid: (GridCell | null)[][]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, rowIndex: number, colIndex: number) => void
  getCellClassName?: (cell: GridCell | null) => string
}

const defaultGetCellClassName = (cell: GridCell | null) => {
  if (!cell) return "bg-gray-100"

  const isCorrect = cell.letter === cell.correct && cell.letter !== ""
  const isIncorrect = cell.letter !== "" && cell.letter !== cell.correct
  const isEmpty = cell.letter === ""

  let baseClass =
    "bg-white border-2 border-gray-300 flex items-center justify-center text-lg font-bold transition-all duration-200 "

  if (isCorrect) {
    baseClass += "bg-green-100 border-green-400 text-green-800"
  } else if (isIncorrect) {
    baseClass += "bg-red-100 border-red-400 text-red-800"
  } else if (isEmpty) {
    baseClass += "border-dashed border-gray-400 hover:border-blue-400"
  }

  return baseClass
}

export function CrosswordGrid({ 
  grid, 
  onDragOver, 
  onDrop,
  getCellClassName = defaultGetCellClassName
}: CrosswordGridProps) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`aspect-square ${getCellClassName(cell)}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, rowIndex, colIndex)}
          >
            {cell && (
              <>
                {cell.letter}
                {cell.letter === cell.correct && cell.letter !== "" && (
                  <CheckCircle className="absolute top-0 right-0 w-3 h-3 text-green-600 -mt-1 -mr-1" />
                )}
              </>
            )}
          </div>
        )),
      )}
    </div>
  )
}
