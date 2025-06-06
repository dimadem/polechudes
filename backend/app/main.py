from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.generate_crossword import router as generate_crossword_router

app = FastAPI(title="Crossword API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "https://polechudes.vercel.app"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(generate_crossword_router)

