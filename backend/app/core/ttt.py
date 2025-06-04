from openai.types.chat import (
    ChatCompletion,
    ChatCompletionMessage,
    ChatCompletionMessageParam,
    ChatCompletionToolParam,
    ChatCompletionToolChoiceOptionParam
)
from openai.types.chat.chat_completion_message_tool_call import ChatCompletionMessageToolCall

from typing import Optional, Union

from app.core.openai import client

import json
import logging


logger = logging.getLogger(__name__)


class TTT:
    """
    Text to Text
    """
    
    def __init__(self, model: str = "gpt-4o-mini"):
        """
        Initialize OpenAI client
        
        Args:
            model: OpenAI model name
        """
        self.client = client
        self.model = model

    def generate_response(
        self, 
        messages: list[ChatCompletionMessageParam], 
        **kwargs
    ) -> str:
        """
        Generate text response using OpenAI Chat Completions API
        
        Args:
            messages: List of properly typed chat completion messages
            **kwargs: Additional parameters for the API call
            
        Returns:
            Generated text response
        """
        try:
            response: ChatCompletion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                # temperature=kwargs.get('temperature', 0.7),
                # max_tokens=kwargs.get('max_tokens', 1000),
                top_p=kwargs.get('top_p', 1.0),
                frequency_penalty=kwargs.get('frequency_penalty', 0.0),
                presence_penalty=kwargs.get('presence_penalty', 0.0)
            )
            
            return response.choices[0].message.content or ""

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise Exception(f"Error generating response: {str(e)}")

    def generate_response_with_tools(
        self, 
        messages: list[ChatCompletionMessageParam], 
        tools: Optional[list[ChatCompletionToolParam]] = None,
        tool_choice: Optional[ChatCompletionToolChoiceOptionParam] = "auto",
        **kwargs
    ) -> Union[str, dict[str, any]]:
        """
        Generate response with function/tool calling capability
        
        Args:
            messages: List of properly typed chat completion messages
            tools: List of properly typed tool definitions
            tool_choice: "auto", "none", or specific tool choice
            **kwargs: Additional parameters
            
        Returns:
            Either text response or function call arguments
        """
        try:
            if not tools:
                # If no tools provided, use regular chat completion
                return self.generate_response(messages, **kwargs)

            response: ChatCompletion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=tools,
                tool_choice=tool_choice,
                # temperature=kwargs.get('temperature', 0.7),
                # max_tokens=kwargs.get('max_tokens', 1000)
            )
            
            choice = response.choices[0]
            message: ChatCompletionMessage = choice.message
            
            # Check if AI wants to call a function
            if message.tool_calls:
                tool_call: ChatCompletionMessageToolCall = message.tool_calls[0]
                logger.info(f"Tool call: {tool_call.function.name}")
                
                try:
                    # Parse function arguments
                    args = json.loads(tool_call.function.arguments)
                    return {
                        "function_name": tool_call.function.name,
                        "arguments": args,
                        "tool_call_id": tool_call.id
                    }
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse function arguments: {e}")
                    return {"error": f"Invalid function arguments: {str(e)}"}
            
            # Return regular text response if no function call
            return message.content or ""
            
        except Exception as e:
            logger.error(f"Error generating response with function: {str(e)}")
            raise Exception(f"Error generating response with function: {str(e)}")

    def create_chat_message(
        self, 
        role: str, 
        content: str
    ) -> ChatCompletionMessageParam:
        """
        Create a properly formatted and typed chat message
        
        Args:
            role: Message role ('system', 'user', or 'assistant')
            content: Message content
            
        Returns:
            Properly typed message for OpenAI API
        """
        if role not in ['system', 'user', 'assistant']:
            raise ValueError(f"Invalid role: {role}. Must be 'system', 'user', or 'assistant'")
        
        return {
            "role": role,  # type: ignore
            "content": content
        }

    def create_function_tool(
        self, 
        name: str, 
        description: str, 
        parameters: dict[str, any]
    ) -> ChatCompletionToolParam:
        """
        Create a properly formatted and typed function tool definition
        
        Args:
            name: Function name
            description: Function description
            parameters: JSON Schema for function parameters
            
        Returns:
            Properly typed tool definition for OpenAI API
        """
        return {
            "type": "function",
            "function": {
                "name": name,
                "description": description,
                "parameters": parameters
            }
        }
    
    def create_system_message(self, content: str) -> ChatCompletionMessageParam:
        """
        Create a system message with proper typing
        
        Args:
            content: System message content
            
        Returns:
            Properly typed system message
        """
        return {"role": "system", "content": content}
    
    def create_user_message(self, content: str) -> ChatCompletionMessageParam:
        """
        Create a user message with proper typing
        
        Args:
            content: User message content
            
        Returns:
            Properly typed user message
        """
        return {"role": "user", "content": content}
    
    def create_assistant_message(self, content: str) -> ChatCompletionMessageParam:
        """
        Create an assistant message with proper typing
        
        Args:
            content: Assistant message content
            
        Returns:
            Properly typed assistant message
        """
        return {"role": "assistant", "content": content}