from fastapi import APIRouter, Request
from typing import Optional, Dict, Any, List
import asyncio
import time
import logging

from app.agent.tools.generate_words import generate_words
from app.agent.agent import generate_crossword_agent
from app.core.tti import generate_images_for_crossword

logger = logging.getLogger(__name__)
router = APIRouter()

DEFAULT_BOARD_SIZE = {"rows": 10, "cols": 10}
DIFFICULTY_MAPPING = {
    "easy": {"level": "easy", "theme": "animals"},
    "medium": {"level": "medium", "theme": "nature"},
    "hard": {"level": "hard", "theme": "science"}
}

async def _generate_crossword_data(theme: str, language: str, level: str) -> Dict[str, Any]:
    # Step 1: Generate words first
    generated_words = await generate_words(theme=theme, language=language, level=level)
    print("Generated words:", generated_words)

    # Step 2: Extract definitions for image generation  
    definitions = [word_data["definition"] for word_data in generated_words]
    
    # Step 3: Start image generation and coordinate generation in parallel
    image_task = asyncio.create_task(generate_images_for_crossword(definitions))
    coordinates_task = asyncio.create_task(generate_crossword_agent(generated_words))
    
    # Wait for both tasks to complete
    image_urls, generated_coordinates = await asyncio.gather(image_task, coordinates_task)
    
    print("Generated coordinates:", generated_coordinates)
    print("Generated image URLs:", len([url for url in image_urls if url is not None]), "successful out of", len(image_urls))

    return _transform_crossword_data(generated_words, generated_coordinates, image_urls)

def _transform_crossword_data(generated_words: List[Dict], generated_coordinates, image_urls: List[str]) -> Dict[str, Any]:
    # Create mappings
    word_to_definition = {word_data["word"]: word_data["definition"] for word_data in generated_words}
    word_to_image = {
        generated_words[i]["word"]: image_urls[i] 
        for i in range(min(len(generated_words), len(image_urls))) 
        if image_urls[i]
    }
    
    # Transform data to match frontend expectations
    transformed_words = [
        {
            "id": word.id,
            "word": word.word,
            "coordinate": {
                "row": word.row,
                "col": word.col,
                "direction": word.direction
            },
            "definition": word_to_definition.get(word.word, ""),
            "clueImage": word_to_image.get(word.word, "")
        }
        for word in generated_coordinates.words
    ]

    return {
        "words": transformed_words,
        "board_size": DEFAULT_BOARD_SIZE
    }

@router.post("/api/generate_crossword")
async def generate_crossword(request: Request):
    """Endpoint to generate a crossword puzzle based on the provided request data."""
    data = await request.json()
    logger.info(f"Generating crossword with theme: {data.get('theme', 'default')}")

    crossword_data = await _generate_crossword_data(
        theme=data.get("theme", "default"),
        language=data.get("language", "en"),
        level=data.get("level", "easy")
    )

    return crossword_data

@router.get("/api/crosswords/random")
async def get_random_crossword(difficulty: Optional[str] = "medium"):
    """Endpoint to get a random crossword puzzle with specified difficulty."""
    start_time = time.time()
    logger.info(f"Starting random crossword generation with difficulty: {difficulty}")

    params = DIFFICULTY_MAPPING.get(difficulty, DIFFICULTY_MAPPING["medium"])
    
    crossword_data = await _generate_crossword_data(
        theme=params["theme"],
        language="english",
        level=params["level"]
    )
    
    elapsed_time = time.time() - start_time
    logger.info(f"Random crossword generation completed in {elapsed_time:.2f}s")

    return crossword_data