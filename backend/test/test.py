import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.evaluate import (
    calculate_price,
)
from app.config import settings
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_calculate_price():
    print("=" * 50)

    test_cases = [
        "Hello World",
        "这是一个简单的中文测试文本",
        "A very long text that should have a higher price because it contains more content and complexity. This text includes multiple sentences and should trigger the length factor in our pricing algorithm.",
        "🚀 创新的NFT内容，包含表情符号和特殊字符！💎✨",
        "Short",
        "",
        "AI人工智能区块链NFT元宇宙Web3去中心化智能合约数字资产虚拟现实增强现实机器学习深度学习神经网络",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ]

    for i, content in enumerate(test_cases, 1):
        try:
            print(f"\n测试案例 {i}:")
            print(f"内容: '{content}'")
            print(f"长度: {len(content)} 字符")

            # 测试异步函数
            price = await calculate_price(content)
            print(f"AI智能估价: {price} ETH")

            # 验证价格合理性
            assert isinstance(
                price, (int, float)
            ), f"价格应该是数字类型，实际: {type(price)}"
            assert price > 0, f"价格应该大于0，实际: {price}"
            assert price <= 1.0, f"价格应该不超过1.0 ETH，实际: {price}"

            print(f"✅ 测试通过")

        except Exception as e:
            print(f"❌ 测试失败: {e}")
            logger.error(f"测试案例 {i} 失败: {e}")


async def main():
    """主测试函数"""
    print("🚀 开始价格计算函数测试")
    print(f"当前工作目录: {os.getcwd()}")

    try:
        await test_calculate_price()
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        logger.error(f"测试失败: {e}")


if __name__ == "__main__":
    # 运行测试
    asyncio.run(main())
