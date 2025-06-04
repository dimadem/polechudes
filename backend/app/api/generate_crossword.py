from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from typing import Literal

from app.workflow.generate_words import generate_words
from app.workflow.generate_coordinates import generate_coordinates

router = APIRouter()

class GridCell(BaseModel):
    id: int
    letter: str

class Word(BaseModel):
    id: int
    word: str
    start_pos: tuple[int, int]
    direction: Literal["across", "down"]
    clue_image: str

class CrosswordData(BaseModel):
    id: int
    grid: list[list[Optional[GridCell]]]
    words: list[Word]
    available_letters: list[str]

@router.post("/api/generate_crossword", response_model=CrosswordData)
async def generate_crossword(request: Request):
    """
    Endpoint to generate a crossword puzzle based on the provided request data.
    """
    # Extract data from the request
    data = await request.json()
    print("Received data:", data)

    generated_words = generate_words(
        theme=data.get("theme", "default"),
        language=data.get("language", "en"),
        level=data.get("level", "easy")
    )
    print("Generated words:", generated_words)

    generated_coordinates = generate_coordinates(generated_words)
    print("Generated coordinates:", generated_coordinates)


    # Here you would implement the logic to generate a crossword puzzle
    # For now, we will just return a placeholder response
    return CrosswordData(
        id="1",
        grid=[],
        words=[],
        available_letters=[]
    )