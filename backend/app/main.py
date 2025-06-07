from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.generate_crossword import router as generate_crossword_router
import uvicorn

app = FastAPI(title="Crossword API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Временно для отладки
    allow_credentials=False,  # Должно быть False при allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(generate_crossword_router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000,
        timeout_keep_alive=600,  # 10 минут
        timeout_graceful_shutdown=600  # 10 минут
    )

