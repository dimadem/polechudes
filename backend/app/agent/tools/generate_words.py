from app.core.ttt import TTT
from app.agent.prompts.utils import load_prompts, replace_multiple_placeholders

prompts = load_prompts("generate_words.yml")

async def generate_words(theme: str, language: str, level: str) -> list[dict]:
    """ Generate a list of words based on the given theme, language, and level.
    Args:
        theme (str): The theme for the words.
        language (str): The language of the words.
        level (str): The difficulty level of the words.
    Returns:
        list[dict]: A list of dictionaries with 'word' and 'definition' keys.
    """
    ttt = TTT(model="gpt-4.1")
    
    system_prompt = prompts["system_prompt"]
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"], 
        {
            "theme": theme,
            "language": language, 
            "level": level
        }
    )

    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]
    
    tools = [
        ttt.create_function_tool(
            name="generate_words_list",
            description="Generate a structured list of words with their definitions for a crossword puzzle.",
            parameters={
                "type": "object",
                "properties": {
                    "words": {
                        "type": "array",
                        "description": "List of words with their definitions",
                        "items": {
                            "type": "object",
                            "properties": {
                                "word": {
                                    "type": "string",
                                    "description": "The word for the crossword"
                                },
                                "definition": {
                                    "type": "string", 
                                    "description": "Concise definition of the word"
                                }
                            },
                            "required": ["word", "definition"]
                        }
                    }
                },
                "required": ["words"]
            }
        )
    ]
    
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    
    if response and isinstance(response, dict):
        if response.get("function_name") == "generate_words_list":
            arguments = response.get("arguments", {})
            return arguments.get("words", [])
    
    return []