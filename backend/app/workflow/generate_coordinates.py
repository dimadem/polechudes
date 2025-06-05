from app.prompts.utils import load_prompts, replace_multiple_placeholders

from pydantic import BaseModel, Field
from typing import Literal

from agents import Agent, Runner, handoff


prompts = load_prompts("generate_coordinates.yml")


class CrosswordWord(BaseModel):
    id: str = Field(description="Number identifier for the word")
    word: str = Field(description="The word for the crossword")
    row: int = Field(description="Starting row position (0-9)")
    col: int = Field(description="Starting column position (0-9)")
    direction: str = Field(description="Direction: 'across' or 'down'")
    definition: str = Field(description="Concise definition of the word")

class CrosswordOutput(BaseModel):
    words: list[CrosswordWord] = Field(
        description="List of words with their positions and coordinates"
    )

class ValidationResult(BaseModel):
    status: Literal["empty", "invalid", "valid"] = Field(description="Validation status")
    errors: list[str] = Field(description="List of validation errors", default=[])

gen_coords = Agent(
        name="Generate_Coordinates",
        instructions=prompts["user_prompt"],
        model="o4-mini",
        output_type=CrosswordOutput
)

val_cross = Agent(
        name="Validate_Crossword",
        instructions="""
        You are a crossword validation agent. Your task is to validate the crossword data provided by the Generate_Coordinates.
        - The crossword grid must be exactly 10×10 cells.
        - All words must fit entirely inside the 10×10 grid. Do not allow any word to go beyond the grid boundaries.
        - Do not simply stack words; ensure that vertical and horizontal words intersect at shared letters whenever possible.
        - Number each word’s starting cell according to the list provided.
        - Do not allow any words to be split or truncated.
        - All words must be fully inside the grid, without any overflow or misplacement.
        - If word is not fit the rules return "error" and description of the problem.
        - If all rules validated, return "valid".
        """,
        model="o4-mini",
        output_type=ValidationResult
)

orchestrator = Agent(
        name="Orchestrator",
        instructions="""
        1. Take a list of words from the user.
        2. Send the words to the Generate_Coordinates and return the generated coordinates.
        3. Send result to Validate_Crossword for validation.
        4. If status != 'valid', repeat the generation with Generate_Coordinates with attached errors.
        5. If status == 'valid', return the crossword data.
        """,
        model="o4-mini",
        handoffs=[
            handoff(gen_coords, tool_name_override="Generate_Coordinates"),
            handoff(val_cross, tool_name_override="Validate_Crossword")
        ],
        output_type=CrosswordOutput
)



async def generate_coordinates(words_list: list[dict]) -> dict:
    """ Generate crossword coordinates for a list of words.
    Args:
        words_list (list[dict]): A list of dictionaries with 'word' and 'definition' keys.
    Returns:
        dict: A dictionary with crossword data including words and board_size for frontend.
    """
    # Convert words list to string format for the prompt
    words_text = "\n".join([f"- {item['word']}: {item['definition']}" for item in words_list])
    
    # Use the gen_coords_agent to generate crossword coordinates
    runner = await Runner.run(starting_agent=orchestrator, input=words_text)

    print("Generated coordinates:", runner.final_output)

    crossword_data = {
        "words": runner.final_output,
        "board_size": {"rows": 10, "cols": 10}
    }

    return crossword_data