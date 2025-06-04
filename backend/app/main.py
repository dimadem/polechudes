# Пример FastAPI Backend для кроссворда

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
import uuid
import random

app = FastAPI(title="Crossword API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модели данных
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

class CreateCrosswordRequest(BaseModel):
    words: List[str]
    difficulty: str

class GameSession(BaseModel):
    id: str
    crossword_id: str
    user_id: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    score: int = 0
    completed: bool = False

class UpdateGameSessionRequest(BaseModel):
    score: Optional[int] = None
    completed: Optional[bool] = None
    end_time: Optional[str] = None

# Временное хранилище данных (в продакшне используйте базу данных)
crosswords_db: Dict[str, CrosswordData] = {}
sessions_db: Dict[str, GameSession] = {}

# Моковые данные для демонстрации
MOCK_CROSSWORDS = [
    {
        "id": "crossword-1",
        "grid": [
            [None, None, {"id": 1, "letter": "", "correct": "C"}, {"id": 2, "letter": "", "correct": "A"}, {"id": 3, "letter": "", "correct": "T"}, None],
            [None, None, {"id": 4, "letter": "", "correct": "A"}, None, {"id": 5, "letter": "", "correct": "R"}, None],
            [{"id": 6, "letter": "", "correct": "D"}, {"id": 7, "letter": "", "correct": "O"}, {"id": 8, "letter": "", "correct": "G"}, None, {"id": 9, "letter": "", "correct": "E"}, None],
            [None, None, {"id": 10, "letter": "", "correct": "E"}, None, {"id": 11, "letter": "", "correct": "E"}, None],
            [None, None, None, None, None, None]
        ],
        "words": [
            {
                "id": "across-1",
                "word": "CAT",
                "start_pos": [0, 2],
                "direction": "across",
                "clue_image": "/placeholder.svg?height=120&width=120"
            },
            {
                "id": "across-2",
                "word": "DOG",
                "start_pos": [2, 0],
                "direction": "across",
                "clue_image": "/placeholder.svg?height=120&width=120"
            },
            {
                "id": "down-1",
                "word": "CAGE",
                "start_pos": [0, 2],
                "direction": "down",
                "clue_image": "/placeholder.svg?height=120&width=120"
            },
            {
                "id": "down-2",
                "word": "TREE",
                "start_pos": [0, 4],
                "direction": "down",
                "clue_image": "/placeholder.svg?height=120&width=120"
            }
        ],
        "available_letters": ["C", "A", "T", "D", "O", "G", "E", "R"]
    }
]

# Инициализация моковых данных
for mock_crossword in MOCK_CROSSWORDS:
    crosswords_db[mock_crossword["id"]] = CrosswordData(**mock_crossword)

print(f"✅ Loaded {len(crosswords_db)} crosswords: {list(crosswords_db.keys())}")

# API endpoints
@app.get("/")
async def root():
    return {"message": "Crossword API"}

# Debug endpoint для проверки
@app.get("/api/debug")
async def debug():
    return {
        "crosswords_count": len(crosswords_db),
        "crosswords_ids": list(crosswords_db.keys()),
        "sessions_count": len(sessions_db)
    }

# Простой тест endpoint
@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "Backend работает!", "crosswords": list(crosswords_db.keys())}

# ВАЖНО: /random должен быть ПЕРЕД /{crossword_id}
@app.get("/api/crosswords/random", response_model=CrosswordData)
async def get_random_crossword(difficulty: Optional[str] = None):
    print(f"🎲 Random crossword request, difficulty: {difficulty}")
    print(f"📦 Available crosswords: {list(crosswords_db.keys())}")
    
    if not crosswords_db:
        print("❌ No crosswords available!")
        raise HTTPException(status_code=404, detail="No crosswords available")
    
    # Просто возвращаем первый кроссворд для простоты
    crossword_id = "crossword-1"
    print(f"🎯 Selected: {crossword_id}")
    
    if crossword_id not in crosswords_db:
        print(f"❌ Crossword {crossword_id} not found in database!")
        raise HTTPException(status_code=404, detail="Selected crossword not found")
    
    result = crosswords_db[crossword_id]
    print(f"✅ Returning crossword: {result.id}")
    return result

@app.get("/api/crosswords/{crossword_id}", response_model=CrosswordData)
async def get_crossword(crossword_id: str):
    print(f"🔍 Get crossword by ID: {crossword_id}")
    
    # Защита от перехвата /random
    if crossword_id == "random":
        print("⚠️ Intercepted 'random' as crossword_id, redirecting...")
        return await get_random_crossword()
    
    if crossword_id not in crosswords_db:
        print(f"❌ Crossword {crossword_id} not found")
        raise HTTPException(status_code=404, detail="Crossword not found")
    
    print(f"✅ Found crossword: {crossword_id}")
    return crosswords_db[crossword_id]

@app.get("/api/crosswords")
async def get_crosswords(page: int = 1, limit: int = 10):
    crosswords_list = list(crosswords_db.values())
    start = (page - 1) * limit
    end = start + limit
    
    return {
        "crosswords": crosswords_list[start:end],
        "total": len(crosswords_list),
        "page": page,
        "total_pages": (len(crosswords_list) + limit - 1) // limit
    }

@app.post("/api/crosswords", response_model=CrosswordData)
async def create_crossword(request: CreateCrosswordRequest):
    # В реальном приложении здесь была бы логика генерации кроссворда
    crossword_id = str(uuid.uuid4())
    
    # Простой пример создания кроссворда
    crossword = CrosswordData(
        id=crossword_id,
        grid=MOCK_CROSSWORDS[0]["grid"],  # Используем шаблон
        words=MOCK_CROSSWORDS[0]["words"],
        available_letters=request.words[0] if request.words else ["A", "B", "C"]
    )
    
    crosswords_db[crossword_id] = crossword
    return crossword

@app.post("/api/game-sessions", response_model=GameSession)
async def start_game_session(request: dict):
    crossword_id = request.get("crosswordId")
    
    if crossword_id not in crosswords_db:
        raise HTTPException(status_code=404, detail="Crossword not found")
    
    session_id = str(uuid.uuid4())
    session = GameSession(
        id=session_id,
        crossword_id=crossword_id,
        start_time=datetime.now().isoformat()
    )
    
    sessions_db[session_id] = session
    return session

@app.put("/api/game-sessions/{session_id}", response_model=GameSession)
async def update_game_session(session_id: str, request: UpdateGameSessionRequest):
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    session = sessions_db[session_id]
    
    if request.score is not None:
        session.score = request.score
    if request.completed is not None:
        session.completed = request.completed
    if request.end_time is not None:
        session.end_time = request.end_time
    
    sessions_db[session_id] = session
    return session

@app.get("/api/stats")
async def get_player_stats(user_id: Optional[str] = None):
    # В реальном приложении здесь была бы логика подсчета статистики
    user_sessions = [s for s in sessions_db.values() if s.user_id == user_id or user_id is None]
    
    total_games = len(user_sessions)
    completed_games = len([s for s in user_sessions if s.completed])
    scores = [s.score for s in user_sessions if s.completed]
    
    return {
        "total_games": total_games,
        "completed_games": completed_games,
        "average_score": sum(scores) / len(scores) if scores else 0,
        "best_score": max(scores) if scores else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
