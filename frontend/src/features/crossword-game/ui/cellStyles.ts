import type { GridCell, Word } from "@/entities/crossword/types"

/**
 * Генерирует CSS классы для ячейки кроссворда на основе её состояния
 */
export function getCellClassName(
  cell: GridCell,
  selectedClue: Word | null | undefined,
  isOver: boolean
): string {
  const baseClass = "w-8 h-8 bg-white border border-gray-900 flex items-center justify-center font-bold cursor-pointer relative transition-all duration-150 select-none text-sm"
  
  const classes = [baseClass]
  
  // Состояние буквы
  if (cell.isCorrect && cell.letter !== "") {
    classes.push("bg-green-100 text-green-800 border-green-400")
  } else if (cell.letter !== "" && !cell.isCorrect) {
    classes.push("bg-red-100 text-red-800 border-red-400")
  }
  
  // Подсветка выбранного слова
  if (selectedClue && cell.wordIds.includes(selectedClue.id)) {
    classes.push("bg-blue-100 border-blue-500")
  }
  
  // Состояние hover при drag & drop
  if (isOver) {
    classes.push("bg-yellow-200 border-yellow-600 shadow-md scale-105")
  }
  
  return classes.join(" ")
}

/**
 * Стили для номера слова в ячейке
 */
export const numberStyles = "absolute top-0 left-0 text-xs font-bold text-black leading-none bg-white bg-opacity-80 rounded-sm px-0.5 cursor-pointer hover:bg-blue-200 transition-colors duration-150 z-10"

/**
 * Стили для пустой (черной) ячейки
 */
export const emptyCellStyles = "w-8 h-8 bg-gray-900 border border-gray-700"
