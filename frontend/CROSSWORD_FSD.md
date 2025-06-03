# Кроссворд - Архитектура FSD

Этот проект реорганизован по архитектуре Feature-Sliced Design (FSD) для лучшей масштабируемости и поддержки.

## Структура проекта

```
src/
├── shared/           # Переиспользуемые компоненты и утилиты
│   ├── api/         # API клиент
│   ├── types/       # Общие типы
│   ├── hooks/       # Общие хуки
│   └── components/  # UI компоненты
├── entities/        # Бизнес-сущности
│   └── crossword/   # Сущность кроссворда
│       ├── api/     # API для кроссвордов
│       └── model/   # Хуки и модели
├── features/        # Функциональность
│   └── crossword-game/ # Игра в кроссворд
│       ├── model/   # Логика игры
│       └── ui/      # UI компоненты игры
├── widgets/         # Составные блоки
│   └── crossword/   # Виджет кроссворда
└── pages/          # Страницы
    └── crossword/   # Страница кроссворда
```

## Использование

### Базовое использование виджета

```tsx
import { CrosswordWidget } from "@/widgets/crossword"

export function MyApp() {
  return (
    <CrosswordWidget
      difficulty="medium"
      onGameComplete={(score) => {
        console.log('Игра завершена, счет:', score)
      }}
    />
  )
}
```

### Использование с конкретным кроссвордом

```tsx
import { CrosswordWidget } from "@/widgets/crossword"

export function MyApp() {
  return (
    <CrosswordWidget
      crosswordId="crossword-123"
      onGameComplete={(score) => {
        // Обработка завершения игры
        alert(`Поздравляем! Ваш счет: ${score}`)
      }}
    />
  )
}
```

### Использование страницы кроссворда

```tsx
import { CrosswordPage } from "@/pages/crossword"
import { BrowserRouter, Routes, Route } from "react-router-dom"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/crossword" element={<CrosswordPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

URL параметры:
- `?id=crossword-123` - загрузить конкретный кроссворд
- `?difficulty=easy` - загрузить случайный кроссворд указанной сложности

### Работа с API

#### Получение кроссворда

```tsx
import { useCrossword } from "@/entities/crossword"

export function MyCrosswordComponent() {
  const { crossword, loading, error } = useCrossword("crossword-123")
  
  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>
  if (!crossword) return <div>Кроссворд не найден</div>
  
  return <div>{/* Ваш компонент */}</div>
}
```

#### Работа с игровой сессией

```tsx
import { useGameSession } from "@/entities/crossword"

export function MyGameComponent() {
  const { session, startSession, updateSession, endSession } = useGameSession()
  
  const handleStartGame = async () => {
    await startSession("crossword-123")
  }
  
  const handleUpdateScore = async (score: number) => {
    await updateSession({ score })
  }
  
  const handleEndGame = async (finalScore: number) => {
    await endSession(finalScore)
  }
  
  return <div>{/* Ваш компонент */}</div>
}
```

### Кастомизация игровой логики

```tsx
import { useCrosswordGame } from "@/features/crossword-game"

export function CustomCrosswordGame({ crosswordData }) {
  const {
    gameState,
    initializeGame,
    placeLetter,
    resetGame,
    isGameComplete
  } = useCrosswordGame(crosswordData)
  
  // Ваша кастомная логика
  
  return <div>{/* Ваш UI */}</div>
}
```

## API Backend (FastAPI)

Для работы с backend вам нужно настроить следующие endpoints:

### Кроссворды

- `GET /api/crosswords/{id}` - Получить кроссворд по ID
- `GET /api/crosswords/random?difficulty=easy` - Получить случайный кроссворд
- `POST /api/crosswords` - Создать новый кроссворд
- `GET /api/crosswords?page=1&limit=10` - Получить список кроссвордов

### Игровые сессии

- `POST /api/game-sessions` - Начать игровую сессию
- `PUT /api/game-sessions/{id}` - Обновить игровую сессию
- `GET /api/stats?userId=123` - Получить статистику игрока

### Пример FastAPI модели

```python
from pydantic import BaseModel
from typing import List, Optional, Tuple

class GridCell(BaseModel):
    id: int
    letter: str
    correct: str

class Word(BaseModel):
    id: str
    word: str
    start_pos: Tuple[int, int]
    direction: str  # "across" | "down"
    clue_image: str

class CrosswordData(BaseModel):
    id: str
    grid: List[List[Optional[GridCell]]]
    words: List[Word]
    available_letters: List[str]

class GameSession(BaseModel):
    id: str
    crossword_id: str
    user_id: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    score: int = 0
    completed: bool = False
```

## Конфигурация

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8000/api
```

## Компоненты

### UI Компоненты

- `CrosswordGrid` - Сетка кроссворда
- `AvailableLetters` - Доступные буквы
- `VisualClues` - Визуальные подсказки
- `GameStatus` - Статус игры
- `GameControls` - Элементы управления

### Хуки

- `useCrossword` - Для работы с данными кроссворда
- `useGameSession` - Для управления игровой сессией
- `useCrosswordGame` - Для игровой логики
- `useAsync` - Для асинхронных операций

### Типы

Все типы определены в `@/shared/types`:
- `CrosswordData`
- `GridCell`
- `Word`
- `GameState`
- `GameSession`

## Миграция с старого кода

Если у вас есть старый компонент `Crossword`, замените его использование:

```tsx
// Старый способ
import { Crossword } from "@/widgets/crossword/ui/crossword"

// Новый способ
import { CrosswordWidget } from "@/widgets/crossword"
```
