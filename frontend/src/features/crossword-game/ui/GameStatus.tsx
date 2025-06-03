import { CheckCircle } from "lucide-react"
import { Card } from "@/shared/components/ui/card"

interface GameStatusProps {
  isComplete: boolean
  score: number
}

export function GameStatus({ isComplete, score }: GameStatusProps) {
  if (!isComplete) return null

  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="text-center space-y-2">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
        <h3 className="text-xl font-bold text-green-800">Congratulations!</h3>
        <p className="text-green-700">You completed the crossword puzzle!</p>
        <p className="text-lg font-semibold text-green-800">Final Score: {score}</p>
      </div>
    </Card>
  )
}
