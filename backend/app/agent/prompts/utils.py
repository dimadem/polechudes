import os
import yaml

def load_prompts(filename: str) -> dict:
    """
    Loads prompts from a YAML file located in the utils directory.
    """
    current_dir = os.path.dirname(os.path.dirname(__file__))
    prompts_file = os.path.join(current_dir, "prompts", filename)
    with open(prompts_file, "r") as file:
        return yaml.safe_load(file)

def replace_placeholder(text: str, placeholder: str, value: str) -> str:
    """
    Replaces all occurrences of a placeholder with the given value.

    Args:
        text (str): The text containing placeholders.
        placeholder (str): The placeholder name to replace (without braces).
        value (str): The value to replace the placeholder with.

    Returns:
        str: The text with all placeholders replaced.
    """
    pattern = f'{{{placeholder}}}'
    return text.replace(pattern, value)

def replace_multiple_placeholders(text: str, replacements: dict) -> str:
    """
    Replaces multiple placeholders in the text with their corresponding values.

    Args:
        text (str): The text containing placeholders.
        replacements (dict): A dictionary mapping placeholder names to their values.

    Returns:
        str: The text with all placeholders replaced.
    """
    result = text
    for placeholder, value in replacements.items():
        result = replace_placeholder(result, placeholder, value)
    return result