from app.core.ttt import TTT
from app.prompts.utils import load_prompts, replace_multiple_placeholders

prompts = load_prompts("generate_coordinates.yml")

def generate_coordinates(words_list: list[dict]) -> list[dict]:
    """ Generate crossword coordinates for a list of words.
    Args:
        words_list (list[dict]): A list of dictionaries with 'word' and 'definition' keys.
    Returns:
        list[dict]: A list of dictionaries with word placement information including coordinates.
    """
    ttt = TTT(model="gpt-4.1")
    
    # Convert words list to string format for the prompt
    words_text = "\n".join([f"- {item['word']}: {item['definition']}" for item in words_list])
    
    system_prompt = prompts["system_prompt"]
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"], 
        {
            "words_list": words_text
        }
    )

    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]
    
    tools = [
        ttt.create_function_tool(
            name="generate_crossword_coordinates",
            description="Generate a structured crossword grid with coordinates for word placement.",
            parameters={
                "type": "object",
                "properties": {
                    "crossword": {
                        "type": "array",
                        "description": "List of words with their positions and coordinates",
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
                                    "description": "Concise definition of the word"
                                },
                            },
                            "required": ["id", "word", "definition", "coordinate"]
                        }
                    }
                },
                "required": ["crossword"]
            }
        )
    ]
    
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    
    if response and isinstance(response, dict):
        if response.get("function_name") == "generate_crossword_coordinates":
            arguments = response.get("arguments", {})
            return arguments.get("crossword", [])
    
    return []