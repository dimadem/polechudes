from app.core.ttt import TTT
from app.agent.prompts.utils import load_prompts, replace_multiple_placeholders
from agents import function_tool

prompts = load_prompts("validate_crossword.yml")

@function_tool
async def validate_crossword(input: str) -> dict:
    """
    Validate the structure of a crossword grid.

    Args:
        input (str): The input string containing the crossword grid data.

    Returns:
        dict: A dictionary indicating whether the crossword is valid and any error messages.
    """
    print("\n\nValidate Crossword tool\n")

    ttt = TTT(model="gpt-4.1")

    system_prompt = prompts["system_prompt"]
    print("input:", input)
    user_prompt = replace_multiple_placeholders(
        prompts["user_prompt"],
        {
            "words_data": input
        }
    )
    messages = [
        ttt.create_system_message(system_prompt),
        ttt.create_user_message(user_prompt)
    ]

    tools = [
        ttt.create_function_tool(
            name="validate_crossword",
            description="Validate the structure of a crossword grid.",
            parameters={
                "type": "object",
                "properties": {
                    "is_valid_crossword": {
                        "type": "boolean",
                        "description": "Indicates if the crossword is valid"
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Reasoning behind the validation result"
                    }
                },
                "required": ["is_valid_crossword", "reasoning"]
            }
        )
    ]
    response = ttt.generate_response_with_tools(messages=messages, tools=tools)
    print("Response from validate_crossword:", response)
    if response and isinstance(response, dict):
        if response.get("function_name") == "validate_crossword":
            arguments = response.get("arguments", {})
            return {
                "is_valid_crossword": arguments.get("is_valid_crossword", False),
                "reasoning": arguments.get("reasoning", "")
            }
    return response
