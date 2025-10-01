from openai import AsyncOpenAI
import os

class TOKEN2049Agent:
    def __init__(self, model: str = "qwen-turbo", enable_thinking: bool = False, temperature: float = 0.7):
        self.model = model
        self.enable_thinking = enable_thinking
        self.temperature = temperature

        self.aclient = AsyncOpenAI(
            api_key=os.environ.get("OPENAI_API_KEY", ""),
            base_url=os.environ.get("BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1"),
            default_headers={"x-api-key": os.environ.get("OPENAI_API_KEY", "")},
        )

    async def review(self, inputs: dict) -> dict:
        """Json input from splitter, json output for chairman"""
        pass