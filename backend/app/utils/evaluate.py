import asyncio
import json
import logging
import hashlib
import aiohttp
from datetime import datetime
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

PRICING_API_URL = "https://api.example.com/v1/nft/evaluate"


async def call_pricing_api(content: str) -> Optional[float]:
    """
    调用外部估价 API

    Args:
        content: 要评估的内容

    Returns:
        估价结果
    """
    try:
        async with aiohttp.ClientSession() as session:
            payload = {"content": content}

            headers = {
                "Content-Type": "application/json",
            }

            async with session.post(
                PRICING_API_URL,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    price = result.get("price", 0.01)

                    # 确保价格在合理范围内
                    logger.info(f"估价成功: {price}")
                    return price
                else:
                    logger.error(f"估价失败，状态码: {response.status}")
                    return None

    except asyncio.TimeoutError:
        logger.error("估价超时")
        return None
    except Exception as e:
        logger.error(f"估价异常: {e}")
        return None


def calculate_price_traditional(content: str) -> float:
    """
    传统算法估价（作为备用方案）

    Args:
        content: 要评估的内容

    Returns:
        估价结果
    """
    if not content:
        return 0.001

    # 基础价格
    base_price = 0.01

    # 长度因子
    length_factor = min(len(content) / 1000, 0.5)

    # 复杂度因子（基于字符种类）
    unique_chars = len(set(content))
    complexity_factor = min(unique_chars / 100, 0.3)

    # 特殊字符因子
    special_chars = sum(1 for c in content if not c.isalnum() and not c.isspace())
    special_factor = min(special_chars / 50, 0.2)

    total_price = base_price + length_factor + complexity_factor + special_factor

    # 确保价格在合理范围内
    return max(0.001, min(total_price, 1.0))


async def calculate_price(content: str) -> float:
    """
    智能价格评估算法

    Args:
        content: 要评估的内容
    """
    try:
        price = await call_pricing_api(content)
        if price is not None:
            return price

    except Exception as e:
        logger.error(f"API估价失败: {e}")

    traditional_price = calculate_price_traditional(content)
    logger.info(f"使用传统算法估价: {traditional_price}")
    return traditional_price
