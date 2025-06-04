from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from typing import Literal

from app.workflow.generate_words import generate_words
from app.workflow.generate_coordinates import generate_coordinates
from app.workflow.generate_crossword_data import generate_crossword_data

router = APIRouter()

@router.post("/api/generate_crossword")
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

    generated_crossword_data = generate_crossword_data(generated_coordinates)
    print("Generated crossword data:", generated_crossword_data)

    # Return structured crossword data for frontend
    return generated_crossword_data

@router.get("/api/crosswords/random")
async def get_random_crossword(difficulty: Optional[str] = "medium"):
    """
    Endpoint to get a random crossword puzzle with specified difficulty.
    """
    print(f"Generating random crossword with difficulty: {difficulty}")

    # Map difficulty to appropriate parameters
    difficulty_mapping = {
        "easy": {"level": "easy", "theme": "animals"},
        "medium": {"level": "medium", "theme": "nature"},
        "hard": {"level": "hard", "theme": "science"}
    }
    
    params = difficulty_mapping.get(difficulty, difficulty_mapping["medium"])
    
    generated_words = generate_words(
        theme=params["theme"],
        language="en",
        level=params["level"]
    )
    print("Generated words:", generated_words)

    generated_coordinates = generate_coordinates(generated_words)
    print("Generated coordinates:", generated_coordinates)

    generated_crossword_data = generate_crossword_data(generated_coordinates)
    print("Generated crossword data:", generated_crossword_data)

    return generated_crossword_data