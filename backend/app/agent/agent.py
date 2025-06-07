from app.agent.prompts.utils import load_prompts

from pydantic import BaseModel, Field
import time
import logging

from agents import Agent, Runner

from app.agent.tools.generate_coordinates_tool import generate_coordinates
from app.agent.tools.validate_crossword_tool import validate_crossword

logger = logging.getLogger(__name__)
prompts = load_prompts("generate_coordinates.yml")

class CrosswordWord(BaseModel):
    id: str = Field(description="Number identifier for the word")
    word: str = Field(description="The word for the crossword")
    row: int = Field(description="Starting row position (0-9)")
    col: int = Field(description="Starting column position (0-9)")
    direction: str = Field(description="Direction: 'across' or 'down'")

class CrosswordOutput(BaseModel):
    words: list[CrosswordWord] = Field(
        description="List of words with their positions and coordinates"
    )

class ValidationResult(BaseModel):
    is_valid_crossword: bool
    reasoning: str

orchestrator = Agent(
        name="Orchestrator",
        instructions="""
        You are the crossword generation coordinator.
        Follow this workflow:
        1. Send ALL words to generate_coordinates to create maximum coverage
        2. Validate the structured result from generate_coordinates using validate_crossword
        3. If invalid due to conflicts, iteratively remove problematic words
        4. Goal: maximize the number of words placed while maintaining validity
        """,
        model="gpt-4.1-mini-2025-04-14",
        tools=[
            generate_coordinates,
            validate_crossword
        ],
        output_type=CrosswordOutput
)


async def generate_crossword_agent(words: list[dict]) -> CrosswordOutput:
    """ Generate crossword coordinates for a list of words.
    Args:
        words_list (list[dict]): A list of dictionaries with 'word' and 'definition' keys.
    Returns:
        CrosswordOutput: Raw agent output with crossword coordinates.
    """

    start_time = time.time()
    logger.info(f"Starting crossword generation for {len(words)} words")
    print("\n\nGenerate Crossword Agent\n")

    # Convert words list to string format for the prompt
    input_message = "\n".join([f"- {item['word']}" for item in words])

    # Use the gen_coords_agent to generate crossword coordinates
    runner = await Runner.run(starting_agent=orchestrator, input=input_message)

    elapsed_time = time.time() - start_time
    logger.info(f"Crossword generation completed in {elapsed_time:.2f}s")
    print("Generated coordinates:", runner.final_output)

    return runner.final_output