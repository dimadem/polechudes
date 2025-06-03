import { RotateCcw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

interface GameControlsProps {
  onReset: () => void
  loading?: boolean
}

export function GameControls({ onReset, loading = false }: GameControlsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onReset} 
        variant="outline" 
        className="flex-1"
        disabled={loading}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Game
      </Button>
    </div>
  )
}
