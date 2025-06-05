from app.core.ttt import TTT
from app.agent.prompts.utils import load_prompts, replace_multiple_placeholders
from agents import function_tool

prompts = load_prompts("generate_coordinates.yml")

@function_tool
async def generate_coordinates(input: str) -> dict:
    """
    Generate crossword coordinates for a list of words.

    Args:
        input (str): A string containing a list of words, each with its definition, formatted as:

    Returns:
        dict: A dictionary with crossword data including words and board_size for frontend.
    """
    print("\n\nGenerate Coordinates tool\n")

    ttt = TTT(model="o4-mini")

    system_prompt = prompts["system_prompt"]
    print("input:\n", input)
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"],
        {
            "words": input
        }
    )
    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]

    tools = [
        ttt.create_function_tool(
            name="generate_coordinates",
            description="Generate crossword coordinates for a list of words.",
            parameters={
                "type": "object",
                "properties": {
                    "words": {
                        "type": "array",
                        "description": "List of words with their positions and coordinates",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {
                                    "type": "string",
                                    "description": "Number identifier for the word"
                                },
                                "word": {
                                    "type": "string", 
                                    "description": "The word for the crossword"
                                },
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
                                    "description": "Direction: 'across' or 'down'",
                                    "enum": ["across", "down"]
                                }
                            },
                            "required": ["id", "word", "row", "col", "direction"]
                        }
                    }
                },
                "required": ["words"]
            }
        )
    ]
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    print("Response from generate_coordinates:", response)
    if response and isinstance(response, dict):
        if response.get("function_name") == "generate_coordinates":
            arguments = response.get("arguments", {})
            return {
                "words": arguments.get("words", []),
                "board_size": {"rows": 10, "cols": 10}
            }
    return response
