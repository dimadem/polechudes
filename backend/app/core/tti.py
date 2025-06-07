from openai.types.images_response import ImagesResponse
from typing import Optional, Literal
from app.core.openai import client
import logging
import asyncio
import time

logger = logging.getLogger(__name__)

class TTI:
    def __init__(self, model: str = "dall-e-3"):
        self.client = client
        self.model = model

    def generate_image(
        self, 
        prompt: str,
        size: Optional[Literal["1024x1024", "1792x1024", "1024x1792"]] = "1024x1024",
        quality: Optional[Literal["standard", "hd"]] = "standard"
    ) -> str:
        try:
            response: ImagesResponse = self.client.images.generate(
                model=self.model,
                prompt=prompt,
                size=size,
                quality=quality,
                response_format="url",
                n=1
            )
            
            return response.data[0].url

        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            raise Exception(f"Error generating image: {str(e)}")
    
    async def generate_image_async(
        self, 
        prompt: str,
        size: Optional[Literal["1024x1024", "1792x1024", "1024x1792"]] = "1024x1024",
        quality: Optional[Literal["standard", "hd"]] = "standard"
    ) -> str:
        try:
            response: ImagesResponse = self.client.images.generate(
                model=self.model,
                prompt=prompt,
                size=size,
                quality=quality,
                response_format="url",
                n=1
            )
            
            return response.data[0].url

        except Exception as e:
            logger.error(f"Error generating image async: {str(e)}")
            raise Exception(f"Error generating image async: {str(e)}")

    async def generate_image_for_text(
        self, 
        text: str, 
        prompt_template: str = "Generate a simple, clear illustration for: {text}",
        size: Optional[Literal["1024x1024", "1792x1024", "1024x1792"]] = "1024x1024",
        quality: Optional[Literal["standard", "hd"]] = "standard"
    ) -> Optional[str]:
        try:
            prompt = prompt_template.format(text=text)
            image_url = await self.generate_image_async(prompt, size, quality)
            return image_url
        except Exception as e:
            logger.error(f"Error generating image for text '{text}': {e}")
            return None

    async def generate_images_parallel(
        self, 
        texts: list[str],
        prompt_template: str = "Generate a simple, clear illustration for: {text}",
        size: Optional[Literal["1024x1024", "1792x1024", "1024x1792"]] = "1024x1024",
        quality: Optional[Literal["standard", "hd"]] = "standard"
    ) -> list[Optional[str]]:
        """
        Generate images for multiple texts in parallel with customizable prompt template
        """
        start_time = time.time()
        logger.info(f"Starting parallel image generation for {len(texts)} texts")
        
        # Create tasks for parallel execution
        tasks = [
            self.generate_image_for_text(text, prompt_template, size, quality) 
            for text in texts
        ]
        
        image_urls = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions and convert to None
        processed_urls = []
        for i, result in enumerate(image_urls):
            if isinstance(result, Exception):
                logger.error(f"Failed to generate image for text '{texts[i]}': {result}")
                processed_urls.append(None)
            else:
                processed_urls.append(result)
        
        elapsed_time = time.time() - start_time
        successful_count = len([url for url in processed_urls if url is not None])
        logger.info(f"Image generation completed in {elapsed_time:.2f}s: {successful_count}/{len(texts)} successful")
        
        return processed_urls

    async def generate_images_for_definitions(self, definitions: list[str]) -> list[Optional[str]]:
        return await self.generate_images_parallel(
            definitions, 
            "Generate a simple, clear illustration for: {text}"
        )

async def generate_images_for_crossword(definitions: list[str]) -> list[Optional[str]]:
    tti = TTI()
    return await tti.generate_images_for_definitions(definitions)
