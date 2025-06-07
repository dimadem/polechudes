


DEFAULT_BOARD_SIZE = {"rows": 10, "cols": 10}
DIFFICULTY_MAPPING = {
    "easy": {"level": "easy", "theme": "animals"},
    "medium": {"level": "medium", "theme": "nature"},
    "hard": {"level": "hard", "theme": "science"}
}

async def _generate_crossword_data(theme: str, language: str, level: str) -> Dict[str, Any]:
    # Generate words
    generated_words = await generate_words(theme=theme, language=language, level=level)
    logger.info(f"Generated {len(generated_words)} words")

    # Extract definitions for image generation
    definitions = [word_data["definition"] for word_data in generated_words]
    
    # Start image generation and coordinate generation in parallel
    image_task = asyncio.create_task(generate_images_for_crossword(definitions))
    coordinates_task = asyncio.create_task(generate_crossword_agent(generated_words))
    
    # Wait for both tasks to complete
    image_urls, generated_coordinates = await asyncio.gather(image_task, coordinates_task)
    
    logger.info(f"Generated {len([url for url in image_urls if url])} successful images out of {len(image_urls)}")

    return _transform_crossword_data(generated_words, generated_coordinates, image_urls)

def _transform_crossword_data(generated_words: List[Dict], generated_coordinates, image_urls: List[str]) -> Dict[str, Any]:
    """Трансформация данных в формат для фронтенда"""
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