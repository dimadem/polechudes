"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle, RotateCcw, Lightbulb } from "lucide-react"

// Mock crossword data structure
const mockCrosswordData = {
  grid: [
    [
      null,
      null,
      { id: 1, letter: "", correct: "C" },
      { id: 2, letter: "", correct: "A" },
      { id: 3, letter: "", correct: "T" },
      null,
    ],
    [null, null, { id: 4, letter: "", correct: "A" }, null, { id: 5, letter: "", correct: "R" }, null],
    [
      { id: 6, letter: "", correct: "D" },
      { id: 7, letter: "", correct: "O" },
      { id: 8, letter: "", correct: "G" },
      null,
      { id: 9, letter: "", correct: "E" },
      null,
    ],
    [null, null, { id: 10, letter: "", correct: "E" }, null, { id: 11, letter: "", correct: "E" }, null],
    [null, null, null, null, null, null],
  ],
  words: [
    {
      id: "across-1",
      word: "CAT",
      startPos: [0, 2],
      direction: "across",
      clueImage: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "across-2",
      word: "DOG",
      startPos: [2, 0],
      direction: "across",
      clueImage: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "down-1",
      word: "CAGE",
      startPos: [0, 2],
      direction: "down",
      clueImage: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "down-2",
      word: "TREE",
      startPos: [0, 4],
      direction: "down",
      clueImage: "/placeholder.svg?height=120&width=120",
    },
  ],
  availableLetters: ["C", "A", "T", "D", "O", "G", "E", "R"],
}

interface GridCell {
  id: number
  letter: string
  correct: string
}

interface Word {
  id: string
  word: string
  startPos: [number, number]
  direction: "across" | "down"
  clueImage: string
}

export default function CrosswordMiniApp() {
  const [grid, setGrid] = useState<(GridCell | null)[][]>(mockCrosswordData.grid)
  const [availableLetters, setAvailableLetters] = useState<string[]>(mockCrosswordData.availableLetters)
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null)
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [selectedClue, setSelectedClue] = useState<Word | null>(null)

  const handleDragStart = (letter: string) => {
    setDraggedLetter(letter)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, rowIndex: number, colIndex: number) => {
    e.preventDefault()
    if (!draggedLetter) return

    const cell = grid[rowIndex][colIndex]
    if (!cell) return

    // Update grid
    const newGrid = [...grid]
    newGrid[rowIndex][colIndex] = { ...cell, letter: draggedLetter }
    setGrid(newGrid)

    // Remove letter from available letters
    const letterIndex = availableLetters.indexOf(draggedLetter)
    if (letterIndex > -1) {
      const newAvailableLetters = [...availableLetters]
      newAvailableLetters.splice(letterIndex, 1)
      setAvailableLetters(newAvailableLetters)
    }

    setDraggedLetter(null)
    checkCompletedWords(newGrid)
  }

  const checkCompletedWords = (currentGrid: (GridCell | null)[][]) => {
    const newCompletedWords = new Set(completedWords)

    mockCrosswordData.words.forEach((word) => {
      const isComplete = word.word.split("").every((letter, index) => {
        const [startRow, startCol] = word.startPos
        const row = word.direction === "down" ? startRow + index : startRow
        const col = word.direction === "across" ? startCol + index : startCol
        const cell = currentGrid[row]?.[col]
        return cell && cell.letter === letter
      })

      if (isComplete && !completedWords.has(word.id)) {
        newCompletedWords.add(word.id)
        setScore((prev) => prev + word.word.length * 10)
      }
    })

    setCompletedWords(newCompletedWords)
  }

  const resetGame = () => {
    setGrid(mockCrosswordData.grid.map((row) => row.map((cell) => (cell ? { ...cell, letter: "" } : null))))
    setAvailableLetters(mockCrosswordData.availableLetters)
    setCompletedWords(new Set())
    setScore(0)
    setSelectedClue(null)
  }

  const getCellClassName = (cell: GridCell | null, rowIndex: number, colIndex: number) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">Crossword Puzzle</h1>
          <div className="flex justify-center items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              Score: {score}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {completedWords.size}/{mockCrosswordData.words.length} Words
            </Badge>
          </div>
        </div>

        {/* Crossword Grid */}
        <Card className="p-4">
          <div className="grid grid-cols-6 gap-1 mb-4">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square ${getCellClassName(cell, rowIndex, colIndex)}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
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
        </Card>

        {/* Image Clues */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Visual Clues
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {mockCrosswordData.words.map((word) => (
              <div
                key={word.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  completedWords.has(word.id) ? "opacity-50" : "hover:scale-105"
                } ${selectedClue?.id === word.id ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => setSelectedClue(selectedClue?.id === word.id ? null : word)}
              >
                <img
                  src={word.clueImage || "/placeholder.svg"}
                  alt={`Clue for ${word.word}`}
                  className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute top-1 left-1">
                  <Badge variant="secondary" className="text-xs">
                    {word.direction === "across" ? "→" : "↓"} {word.word.length}
                  </Badge>
                </div>
                {completedWords.has(word.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Available Letters */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Available Letters</h3>
          <div className="flex flex-wrap gap-2">
            {availableLetters.map((letter, index) => (
              <div
                key={`${letter}-${index}`}
                draggable
                onDragStart={() => handleDragStart(letter)}
                className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg font-bold cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors duration-200 shadow-md"
              >
                {letter}
              </div>
            ))}
          </div>
          {availableLetters.length === 0 && <p className="text-gray-500 text-center py-4">All letters used!</p>}
        </Card>

        {/* Controls */}
        <div className="flex gap-2">
          <Button onClick={resetGame} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </div>

        {/* Game Status */}
        {completedWords.size === mockCrosswordData.words.length && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-xl font-bold text-green-800">Congratulations!</h3>
              <p className="text-green-700">You completed the crossword puzzle!</p>
              <p className="text-lg font-semibold text-green-800">Final Score: {score}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
