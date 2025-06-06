import { CrosswordWidget } from "@/widgets/crossword"

interface CrosswordPageProps {
  crosswordId?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export function CrosswordPage({ crosswordId, difficulty }: CrosswordPageProps = {}) {
  const handleGameComplete = () => {
  }

  return (
    <CrosswordWidget
      crosswordId={crosswordId}
      difficulty={difficulty}
      onGameComplete={handleGameComplete}
    />
  )
}
