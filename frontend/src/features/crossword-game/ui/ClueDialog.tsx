import { Badge } from "@/shared/components/ui/badge"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog"
import type { Word } from "@/entities/crossword/types"

interface ClueDialogProps {
  word: Word | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDirectionText(direction: "across" | "down", wordLength: number): string {
  const arrow = direction === "across" ? "→" : "↓"
  return `${arrow} ${wordLength} букв`
}

export function ClueDialog({ word, open, onOpenChange }: ClueDialogProps) {
  if (!word) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] max-h-[85vh] w-full overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-base font-bold px-3 py-1">
              {word.number}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {getDirectionText(word.direction, word.word.length)}
            </Badge>
          </div>

          <div className="w-full">
            <img
              src={word.clueImage || "/placeholder.svg"}
              alt={`Clue for ${word.word}`}
              className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          </div>

          <div className="text-center px-2">
            <p className="text-gray-700 text-base leading-relaxed">
              {word.clue}
            </p>
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <AlertDialogAction 
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-base font-medium"
          >
            Закрыть
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
