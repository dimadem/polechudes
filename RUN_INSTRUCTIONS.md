# Запуск проекта

## Backend (FastAPI)

1. Перейдите в папку backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Запустите сервер:
```bash
python crossword_api.py
```

Сервер будет доступен по адресу: http://localhost:8000

API документация доступна по адресу: http://localhost:8000/docs

## Frontend (React + Vite)

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Скопируйте файл с переменными окружения:
```bash
cp .env.example .env
```

4. Запустите dev сервер:
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Использование

После запуска обоих серверов:

1. Откройте http://localhost:5173 в браузере
2. Вы увидите интерфейс кроссворда
3. Перетаскивайте буквы из нижней панели на сетку кроссворда
4. Собирайте слова по подсказкам-картинкам
5. Получайте очки за каждое правильно собранное слово

## API Endpoints

- `GET /api/crosswords/random` - Получить случайный кроссворд
- `GET /api/crosswords/{id}` - Получить кроссворд по ID
- `POST /api/game-sessions` - Начать игровую сессию
- `PUT /api/game-sessions/{id}` - Обновить игровую сессию
- `GET /api/stats` - Получить статистику игрока

## Структура данных

### CrosswordData
```json
{
  "id": "crossword-1",
  "grid": [...],
  "words": [...],
  "available_letters": ["C", "A", "T"]
}
```

### GameSession
```json
{
  "id": "session-1",
  "crossword_id": "crossword-1",
  "start_time": "2025-06-03T10:00:00",
  "score": 30,
  "completed": false
}
```
