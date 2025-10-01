import asyncio
import logging
from typing import Dict, Any, Optional
from web3 import Web3
from web3.contract import Contract
from sqlalchemy.orm import Session
from app.database import get_db
from app.dao.nft_dao import NFTDAO
from app.utils.evm_client import evm_client
from app.utils.evaluate import calculate_price
from app.config import settings
import json
import hashlib

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EventListener:
    def __init__(self):
        self.w3: Optional[Web3] = None
        self.nft_contract: Optional[Contract] = None
        self.launchpad_contract: Optional[Contract] = None
        self.is_running = False
        self.last_processed_block = 0

    def initialize(self):
        """初始化事件监听器"""
        try:
            self.w3 = evm_client.w3
            self.nft_contract = evm_client.contract

            # 初始化AiLaunchpad合约
            launchpad_address = settings.LAUNCHPAD_CONTRACT_ADDRESS
            with open("contracts/AiLaunchpad.json", "r") as f:
                launchpad_abi = json.load(f)

            self.launchpad_contract = self.w3.eth.contract(
                address=launchpad_address, abi=launchpad_abi
            )

            if not self.w3 or not self.nft_contract or not self.launchpad_contract:
                raise Exception("Failed to initialize Web3 or contracts")

            # 获取当前区块号作为起始点
            self.last_processed_block = self.w3.eth.block_number
            logger.info(
                f"Event listener initialized at block {self.last_processed_block}"
            )

        except Exception as e:
            logger.error(f"Failed to initialize event listener: {e}")
            raise

    async def start_listening(self):
        """开始监听事件"""
        if not self.w3 or not self.nft_contract or not self.launchpad_contract:
            self.initialize()

        self.is_running = True
        logger.info("Starting event listener...")

        while self.is_running:
            try:
                await self._process_new_blocks()
                await asyncio.sleep(60)  # 每60秒检查一次新区块
            except Exception as e:
                logger.error(f"Error in event listener: {e}")
                await asyncio.sleep(10)  # 出错时等待10秒再重试

    def stop_listening(self):
        """停止监听事件"""
        self.is_running = False
        logger.info("Event listener stopped")

    async def _process_new_blocks(self):
        """处理新区块中的事件"""
        try:
            current_block = self.w3.eth.block_number

            if current_block <= self.last_processed_block:
                return

            # 处理从上次处理的区块到当前区块的所有事件
            from_block = self.last_processed_block + 1
            to_block = current_block

            logger.info(f"Processing blocks {from_block} to {to_block}")

            # 只处理关键事件
            await self._process_minted_events(from_block, to_block)
            await self._process_bought_events(from_block, to_block)

            self.last_processed_block = current_block

        except Exception as e:
            logger.error(f"Error processing new blocks: {e}")

    async def _process_minted_events(self, from_block: int, to_block: int):
        """处理Minted事件"""
        try:
            # 使用 getLogs 方法获取 Minted 事件
            events = self.nft_contract.events.Minted.get_logs(
                from_block=from_block, to_block=to_block
            )

            for event in events:
                await self._handle_minted_event(event)

        except Exception as e:
            logger.error(f"Error processing Minted events: {e}")

    async def _process_bought_events(self, from_block: int, to_block: int):
        """处理Bought事件"""
        try:
            # 使用 getLogs 方法获取 Bought 事件
            events = self.launchpad_contract.events.Bought.get_logs(
                from_block=from_block, to_block=to_block
            )

            for event in events:
                await self._handle_bought_event(event)

        except Exception as e:
            logger.error(f"Error processing Bought events: {e}")

    async def _handle_minted_event(self, event):
        """处理单个Minted事件"""
        try:
            token_id = event["args"]["tokenId"]
            minter = event["args"]["minter"]
            content = event["args"]["content"]

            # 获取数据库会话
            db = next(get_db())

            try:
                # 检查NFT是否已存在
                existing_nft = NFTDAO.get_by_token_id(db, token_id)
                if existing_nft:
                    logger.info(f"NFT with token_id {token_id} already exists")
                    return

                # 将bytes转换为字符串
                if isinstance(content, bytes):
                    content_text = content.decode("utf-8")
                else:
                    content_text = str(content)

                logger.info(
                    f"Processing mint event for content: {content_text[:100]}..."
                )

                # 使用AI智能评估价格
                base_price = await calculate_price(content=content_text)
                print(f"evaluate success！Base_price: {base_price}")

                # 创建NFT记录
                nft_data = {
                    "token_id": token_id,
                    "owner_address": minter,
                    "content": content_text,
                    "evaluate_price": base_price,
                    "current_price": base_price,
                }

                db_nft = NFTDAO.create(db, nft_data)

                # 计算NFT价格
                gas_factor = 0.001
                final_price_eth = base_price + gas_factor

                # 转换为wei
                price_wei = int(self.w3.to_wei(final_price_eth, "ether"))

                # 调用合约设置价格
                logger.info(
                    f"Setting price for token {token_id}: {final_price_eth} ETH"
                )
                price_result = evm_client.set_nft_price(token_id, price_wei)

                if price_result["success"]:
                    logger.info(
                        f"Successfully set price for token {token_id}: {price_result['transaction_hash']}"
                    )
                    # 更新数据库中的当前价格
                    NFTDAO.update_current_price(db, token_id, final_price_eth)
                else:
                    logger.error(
                        f"Failed to set price for token {token_id}: {price_result['error']}"
                    )

                logger.info(
                    f"✅ Successfully processed Minted event for token {token_id}, "
                )

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error handling Minted event: {e}")

    async def _handle_bought_event(self, event):
        """处理单个Bought事件"""
        try:
            token_id = event["args"]["tokenId"]
            buyer = event["args"]["buyer"]
            price = event["args"]["price"]

            # 获取数据库会话
            db = next(get_db())

            try:
                # 更新NFT所有者
                success = NFTDAO.update_owner(db, token_id, buyer)

                if success:
                    logger.info(
                        f"✅ Successfully processed Bought event for token {token_id}: "
                        f"-> {buyer}, price: {self.w3.from_wei(price, 'ether')} ETH"
                    )
                else:
                    logger.warning(f"Failed to update NFT owner for token {token_id}")

            finally:
                db.close()

        except Exception as e:
            logger.error(f"Error handling Bought event: {e}")


# 创建全局事件监听器实例
event_listener = EventListener()
