/**
 * Стили для диалога с подсказками
 */
export const dialogContentStyles = "max-w-[95vw] max-h-[85vh] w-full overflow-y-auto"

export const dialogContainerStyles = "space-y-6"

export const badgeContainerStyles = "flex items-center justify-between"

export const numberBadgeStyles = "text-base font-bold px-3 py-1"

export const directionBadgeStyles = "text-sm px-3 py-1"

export const imageContainerStyles = "w-full"

export const imageStyles = "w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"

export const textContainerStyles = "text-center px-2"

export const textStyles = "text-gray-700 text-base leading-relaxed"

export const footerStyles = "mt-6"

export const closeButtonStyles = "w-full h-12 text-base font-medium"

/**
 * Генерирует направление стрелки и текст для badge
 */
export function getDirectionText(direction: "across" | "down", wordLength: number): string {
  const arrow = direction === "across" ? "→" : "↓"
  return `${arrow} ${wordLength} букв`
}
