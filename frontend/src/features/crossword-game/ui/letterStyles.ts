/**
 * Стили для перетаскиваемых букв
 */
export const letterBaseStyles = "w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold cursor-grab touch-manipulation transition-all duration-150 user-select-none shadow-md transform active:scale-110"

export const letterHoverStyles = "hover:scale-105 hover:shadow-lg active:shadow-xl"

export const letterDraggingStyles = "opacity-60 cursor-grabbing z-50 scale-110 shadow-xl"

/**
 * Стили для контейнера букв
 */
export const containerStyles = "space-y-2"

export const titleStyles = "text-sm font-semibold text-gray-800"

export const lettersGridStyles = "flex flex-wrap gap-1 justify-center"

export const emptyMessageStyles = "text-gray-500 text-center py-2 italic text-xs"
