from dotenv import load_dotenv
from openai import AsyncOpenAI
import os

def load_env_variables():
    load_dotenv()

    return {
        "BASE_URL": os.getenv("BASE_URL", "https://eigenai.eigencloud.xyz/v1"),
        "API_KEY": os.getenv("OPENAI_API_KEY", ""),
        "FAST_MODEL": os.getenv("FAST_MODEL", "gpt-4o-mini"),
        "THINK_MODEL": os.getenv("THINK_MODEL", "gpt-4o"),
    }


def create_async_client():
    """This function will create an async client"""

    return AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY", ""),
        base_url=os.getenv("BASE_URL", "https://eigenai.eigencloud.xyz/v1"),
        default_headers={"x-api-key": os.getenv("OPENAI_API_KEY", "")},  # OpenAI 官方会忽略这个头；EigenAI 需要
    )