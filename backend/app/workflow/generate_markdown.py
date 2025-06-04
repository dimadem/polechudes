# filepath: /Users/dimadem/Documents/projects/polechudes/backend/app/workflow/generate_markdown.py
from app.core.ttt import TTT
from app.prompts.utils import load_prompts, replace_multiple_placeholders

prompts = load_prompts("generate_crossword_markdown.yml")

def generate_markdown(coordinates_list: list[dict]) -> str:
    """ Generate markdown crossword grid from coordinates data.
    Args:
        coordinates_list (list[dict]): A list of dictionaries with word placement information from generate_coordinates.
    Returns:
        str: Markdown formatted crossword grid.
    """
    ttt = TTT(model="o4-mini")
    
    # Convert coordinates list to string format for the prompt
    words_data = []
    for item in coordinates_list:
        word_info = f"- Word: {item['word']}"
        word_info += f"\n  Definition: {item['definition']}"
        word_info += f"\n  Coordinate: {item['coordinate']}"
        words_data.append(word_info)
    
    words_text = "\n\n".join(words_data)
    
    system_prompt = prompts["system_prompt"]
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"], 
        {
            "words_data": words_text
        }
    )

    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]
    
    tools = [
        ttt.create_function_tool(
            name="generate_crossword_markdown",
            description="Generate a markdown formatted crossword grid with completed and empty versions.",
            parameters={
                "type": "object",
                "properties": {
                    "completed_grid": {
                        "type": "string",
                        "description": "Markdown table with all letters filled in"
                    },
                    "empty_grid": {
                        "type": "string",
                        "description": "Markdown table with only numbers for starting positions"
                    },
                    "clues": {
                        "type": "array",
                        "description": "List of clues with numbers and directions",
                        "items": {
                            "type": "object",
                            "properties": {
                                "number": {
                                    "type": "integer",
                                    "description": "Clue number"
                                },
                                "direction": {
                                    "type": "string",
                                    "enum": ["across", "down"],
                                    "description": "Direction of the word"
                                },
                                "clue": {
                                    "type": "string",
                                    "description": "The clue text"
                                }
                            },
                            "required": ["number", "direction", "clue"]
                        }
                    }
                },
                "required": ["completed_grid", "empty_grid", "clues"]
            }
        )
    ]
    
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    
    if response and isinstance(response, dict):
        if response.get("function_name") == "generate_crossword_markdown":
            arguments = response.get("arguments", {})
            
            # Combine all parts into a single markdown string
            markdown_result = "# Crossword Puzzle\n\n"
            markdown_result += "## Completed Grid\n\n"
            markdown_result += arguments.get("completed_grid", "") + "\n\n"
            markdown_result += "## Empty Grid\n\n"
            markdown_result += arguments.get("empty_grid", "") + "\n\n"
            markdown_result += "## Clues\n\n"
            
            clues = arguments.get("clues", [])
            across_clues = [c for c in clues if c.get("direction") == "across"]
            down_clues = [c for c in clues if c.get("direction") == "down"]
            
            if across_clues:
                markdown_result += "### Across\n"
                for clue in across_clues:
                    markdown_result += f"{clue['number']}. {clue['clue']}\n"
                markdown_result += "\n"
            
            if down_clues:
                markdown_result += "### Down\n"
                for clue in down_clues:
                    markdown_result += f"{clue['number']}. {clue['clue']}\n"
            
            return markdown_result
    
    return "Error: Could not generate crossword markdown"