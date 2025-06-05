from app.prompts.utils import load_prompts, replace_multiple_placeholders

from pydantic import BaseModel, Field

from agents import Agent, Runner

from app.workflow.generate_coordinates_tool import generate_coordinates
from app.workflow.validate_crossword_tool import validate_crossword

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
    is_valid_crossword: bool
    reasoning: str

orchestrator = Agent(
        name="Orchestrator",
        instructions="""
        You are the crossword generation coordinator. Follow this workflow:
        
        1. First, send the word list to generate_coordinates to create the crossword layout
        2. Then, send the generated crossword to validate_crossword for validation
        3. Based on validation results:
        - If valid: return the crossword to the user
        - If invalid: you can try to regenerate up to 2 more times with validator feedback
        
        Always provide the final crossword output, whether validated or not.
        Keep track of validation attempts and include reasoning.
        """,
        model="o4-mini",
        tools=[
            generate_coordinates,
            validate_crossword
        ],
        output_type=CrosswordOutput
)


async def process_crossword(words_list: list[dict]) -> dict:
    """ Generate crossword coordinates for a list of words.
    Args:
        words_list (list[dict]): A list of dictionaries with 'word' and 'definition' keys.
    Returns:
        dict: A dictionary with crossword data including words and board_size for frontend.
    """

    # Create a mapping of words to their definitions
    word_to_definition = {item['word']: item['definition'] for item in words_list}
    
    # Convert words list to string format for the prompt
    words_text = "\n".join([f"- {item['word']}" for item in words_list])
    
    input_message = words_text
    print("Input message for gen_coords_agent:", input_message)
    # Use the gen_coords_agent to generate crossword coordinates
    runner = await Runner.run(starting_agent=orchestrator, input=input_message)

    print("Generated coordinates:", runner.final_output)

    # Transform data to match frontend expectations
    transformed_words = []
    for word in runner.final_output.words:
        transformed_word = {
            "id": word.id,
            "word": word.word,
            "coordinate": {
                "row": word.row,
                "col": word.col,
                "direction": word.direction
            },
            "definition": word_to_definition.get(word.word, "")
        }
        transformed_words.append(transformed_word)

    crossword_data = {
        "words": transformed_words,
        "board_size": {"rows": 10, "cols": 10}
    }

    return crossword_data