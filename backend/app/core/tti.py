"""
Text-to-Image (TTI) service for generating images using OpenAI DALL-E API.

This module provides a robust, thread-safe implementation for generating 
images from text descriptions, with support for batch processing and 
comprehensive error handling.
"""

from __future__ import annotations

import asyncio
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional, Protocol

from openai import OpenAI
from openai.types.images_response import ImagesResponse

from app.core.openai import client

logger = logging.getLogger(__name__)


class ImageSize(str, Enum):
    """Supported image sizes for DALL-E API."""
    SQUARE = "1024x1024"
    LANDSCAPE = "1792x1024"  
    PORTRAIT = "1024x1792"


class ImageQuality(str, Enum):
    """Supported image quality levels for DALL-E API."""
    STANDARD = "standard"
    HD = "hd"


@dataclass(frozen=True)
class ImageGenerationConfig:
    """Configuration for image generation."""
    size: ImageSize = ImageSize.SQUARE
    quality: ImageQuality = ImageQuality.STANDARD
    max_workers: int = 5
    timeout_seconds: float = 30.0


@dataclass(frozen=True)
class ImageGenerationResult:
    """Result of image generation operation."""
    text: str
    url: Optional[str]
    error: Optional[str] = None
    
    @property
    def is_success(self) -> bool:
        """Check if image generation was successful."""
        return self.url is not None and self.error is None


@dataclass(frozen=True)
class BatchGenerationResult:
    """Result of batch image generation operation."""
    results: List[ImageGenerationResult]
    total_count: int
    successful_count: int
    failed_count: int
    execution_time_seconds: float
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate as percentage."""
        if self.total_count == 0:
            return 0.0
        return (self.successful_count / self.total_count) * 100


class ImageGenerationError(Exception):
    """Custom exception for image generation failures."""
    
    def __init__(self, message: str, text: Optional[str] = None, original_error: Optional[Exception] = None):
        super().__init__(message)
        self.text = text
        self.original_error = original_error


class ImageGeneratorProtocol(Protocol):
    """Protocol for image generators."""
    
    def generate_single_image(
        self, 
        prompt: str, 
        config: ImageGenerationConfig
    ) -> str:
        """Generate a single image from prompt."""
        ...


class DallEImageGenerator:
    """DALL-E implementation of image generator."""
    
    def __init__(self, client: OpenAI, model: str = "dall-e-3"):
        self._client = client
        self._model = model
        
    def generate_single_image(
        self, 
        prompt: str, 
        config: ImageGenerationConfig
    ) -> str:
        """
        Generate a single image using DALL-E API.
        
        Args:
            prompt: Text prompt for image generation
            config: Configuration for generation
            
        Returns:
            URL of generated image
            
        Raises:
            ImageGenerationError: If generation fails
        """
        try:
            logger.debug(f"Generating image with prompt: {prompt}")
            
            response: ImagesResponse = self._client.images.generate(
                model=self._model,
                prompt=prompt,
                size=config.size.value,
                quality=config.quality.value,
                response_format="url",
                n=1
            )
            
            if not response.data or not response.data[0].url:
                raise ImageGenerationError("No image URL returned from API")
                
            return response.data[0].url
            
        except Exception as e:
            error_msg = f"Failed to generate image: {str(e)}"
            logger.error(error_msg)
            raise ImageGenerationError(error_msg, original_error=e)


class TextToImageService:
    """
    Professional text-to-image service with thread-safe batch processing.
    
    This service provides robust image generation capabilities using OpenAI's
    DALL-E API with comprehensive error handling, logging, and performance monitoring.
    """
    
    DEFAULT_PROMPT_TEMPLATE = "Generate a simple, clear illustration for: {text}"
    
    def __init__(
        self, 
        image_generator: Optional[ImageGeneratorProtocol] = None,
        default_config: Optional[ImageGenerationConfig] = None
    ):
        """
        Initialize the text-to-image service.
        
        Args:
            image_generator: Image generator implementation (defaults to DALL-E)
            default_config: Default configuration for image generation
        """
        self._image_generator = image_generator or DallEImageGenerator(client)
        self._default_config = default_config or ImageGenerationConfig()
        
    def generate_image_for_text(
        self,
        text: str,
        prompt_template: str = DEFAULT_PROMPT_TEMPLATE,
        config: Optional[ImageGenerationConfig] = None
    ) -> ImageGenerationResult:
        """
        Generate an image for a single text using the specified template.
        
        Args:
            text: Input text to generate image for
            prompt_template: Template for formatting the prompt (must contain {text})
            config: Generation configuration (uses default if not provided)
            
        Returns:
            ImageGenerationResult containing the result and metadata
        """
        config = config or self._default_config
        
        try:
            if "{text}" not in prompt_template:
                raise ValueError("Prompt template must contain {text} placeholder")
                
            prompt = prompt_template.format(text=text)
            url = self._image_generator.generate_single_image(prompt, config)
            
            logger.debug(f"Successfully generated image for text: {text}")
            return ImageGenerationResult(text=text, url=url)
            
        except Exception as e:
            error_msg = f"Failed to generate image for text '{text}': {str(e)}"
            logger.warning(error_msg)
            return ImageGenerationResult(text=text, url=None, error=error_msg)
    
    def generate_images_batch(
        self,
        texts: List[str],
        prompt_template: str = DEFAULT_PROMPT_TEMPLATE,
        config: Optional[ImageGenerationConfig] = None
    ) -> BatchGenerationResult:
        """
        Generate images for multiple texts using thread pool for parallel processing.
        
        Args:
            texts: List of texts to generate images for
            prompt_template: Template for formatting prompts
            config: Generation configuration
            
        Returns:
            BatchGenerationResult with detailed metrics and results
        """
        if not texts:
            return BatchGenerationResult(
                results=[], 
                total_count=0, 
                successful_count=0, 
                failed_count=0,
                execution_time_seconds=0.0
            )
            
        config = config or self._default_config
        start_time = time.time()
        
        logger.info(f"Starting batch image generation for {len(texts)} texts with {config.max_workers} workers")
        
        # Initialize results list to maintain order
        results: List[Optional[ImageGenerationResult]] = [None] * len(texts)
        
        with ThreadPoolExecutor(max_workers=config.max_workers) as executor:
            # Submit all tasks
            future_to_index = {
                executor.submit(
                    self.generate_image_for_text,
                    text,
                    prompt_template,
                    config
                ): index
                for index, text in enumerate(texts)
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    result = future.result(timeout=config.timeout_seconds)
                    results[index] = result
                    
                    if result.is_success:
                        logger.debug(f"Generated image {index + 1}/{len(texts)}")
                    else:
                        logger.warning(f"Failed to generate image {index + 1}/{len(texts)}: {result.error}")
                        
                except Exception as e:
                    error_msg = f"Thread execution failed for text '{texts[index]}': {str(e)}"
                    logger.error(error_msg)
                    results[index] = ImageGenerationResult(
                        text=texts[index], 
                        url=None, 
                        error=error_msg
                    )
        
        # Calculate metrics
        final_results = [r for r in results if r is not None]
        successful_count = sum(1 for r in final_results if r.is_success)
        failed_count = len(final_results) - successful_count
        execution_time = time.time() - start_time
        
        batch_result = BatchGenerationResult(
            results=final_results,
            total_count=len(texts),
            successful_count=successful_count,
            failed_count=failed_count,
            execution_time_seconds=execution_time
        )
        
        logger.info(
            f"Batch generation completed in {execution_time:.2f}s: "
            f"{successful_count}/{len(texts)} successful ({batch_result.success_rate:.1f}%)"
        )
        
        return batch_result
    
    async def generate_images_async(
        self,
        texts: List[str],
        prompt_template: str = DEFAULT_PROMPT_TEMPLATE,
        config: Optional[ImageGenerationConfig] = None
    ) -> BatchGenerationResult:
        """
        Async wrapper for batch image generation.
        
        Args:
            texts: List of texts to generate images for
            prompt_template: Template for formatting prompts
            config: Generation configuration
            
        Returns:
            BatchGenerationResult with detailed metrics and results
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.generate_images_batch,
            texts,
            prompt_template,
            config
        )


# Factory function for backward compatibility and ease of use
def create_tti_service(
    model: str = "dall-e-3",
    config: Optional[ImageGenerationConfig] = None
) -> TextToImageService:
    """
    Factory function to create a TTI service instance.
    
    Args:
        model: DALL-E model to use
        config: Default configuration
        
    Returns:
        Configured TextToImageService instance
    """
    generator = DallEImageGenerator(client, model)
    return TextToImageService(generator, config)


# Convenience function for crossword generation (backward compatibility)
async def generate_images_for_crossword(definitions: List[str]) -> List[Optional[str]]:
    """
    Generate images for crossword definitions.
    
    Args:
        definitions: List of crossword clue definitions
        
    Returns:
        List of image URLs (None for failed generations)
    """
    service = create_tti_service()
    result = await service.generate_images_async(definitions)
    
    # Convert to legacy format for backward compatibility
    return [r.url for r in result.results]
