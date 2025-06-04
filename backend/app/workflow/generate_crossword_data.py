from app.core.ttt import TTT
from app.prompts.utils import load_prompts, replace_multiple_placeholders

prompts = load_prompts("generate_data.yml")

def generate_crossword_data(words_with_coordinates: list[dict]) -> dict:
    """ Generate final crossword data for frontend rendering.
    Args:
        words_with_coordinates (list[dict]): A list of words with coordinates from generate_coordinates function.
    Returns:
        dict: Structured crossword data with grid and word information for frontend.
    """
    ttt = TTT(model="o4-mini")
    
    # Convert words data to string format for the prompt
    words_data = "\n".join([
        f"- ID: {item['id']}, Word: {item['word']}, "
        f"Position: row {item['coordinate']['row']}, col {item['coordinate']['col']}, "
        f"Direction: {item['coordinate']['direction']}, Definition: {item['definition']}"
        for item in words_with_coordinates
    ])
    
    system_prompt = prompts["system_prompt"]
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"], 
        {
            "words_data": words_data
        }
    )

    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]
    
    tools = [
        ttt.create_function_tool(
            name="create_crossword_grid",
            description="Create a structured crossword grid with properly placed words and intersections.",
            parameters={
                "type": "object",
                "properties": {
                    "words": {
                        "type": "array",
                        "description": "List of words with their final positions",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "string",
                                    "description": "Number identifier for the word (0-9)"
                                },
                                "word": {
                                    "type": "string",
                                    "description": "The word for the crossword"
                                },
                                "coordinate": {
                                    "type": "object",
                                    "properties": {
                                        "row": {
                                            "type": "integer",
                                            "description": "Starting row position (0-9)"
                                        },
                                        "col": {
                                            "type": "integer",
                                            "description": "Starting column position (0-9)"
                                        },
                                        "direction": {
                                            "type": "string",
                                            "enum": ["across", "down"],
                                            "description": "Direction of the word placement"
                                        }
                                    },
                                    "required": ["row", "col", "direction"]
                                },
                                "definition": {
                                    "type": "string",
                                    "description": "Definition/clue for the word"
                                }
                            },
                            "required": ["id", "word", "coordinate", "definition"]
                        }
                    }
                },
                "required": ["words"]
            }
        )
    ]
    
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    print("Response from TTT:", response)
    if response and isinstance(response, dict):
        if response.get("function_name") == "create_crossword_grid":
            arguments = response.get("arguments", {})
            
            crossword_data = {
                "words": arguments.get("words", []),
                "board_size": {"rows": 10, "cols": 10}
            }

            return crossword_data

    return {
        "words": [],
        "board_size": {"rows": 10, "cols": 10}
    }