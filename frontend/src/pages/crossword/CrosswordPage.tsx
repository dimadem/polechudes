import { CrosswordWidget } from "@/widgets/crossword"

interface CrosswordPageProps {
  crosswordId?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export function CrosswordPage({ crosswordId, difficulty }: CrosswordPageProps = {}) {
  const handleGameComplete = (score: number) => {
    console.log('Game completed with score:', score)
    // Здесь можно добавить логику для обработки завершения игры
    // Например, показать модальное окно с результатами, сохранить статистику и т.д.
  }

  return (
    <CrosswordWidget
      crosswordId={crosswordId}
      difficulty={difficulty}
      onGameComplete={handleGameComplete}
    />
  )
}
