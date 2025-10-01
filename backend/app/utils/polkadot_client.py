from web3 import Web3
from typing import Optional, Dict, Any
import json
from app.config import settings


class PolkadotClient:
    """
    Polkadot客户端，用于与区块链进行交互。
    - 封装了Web3的初始化和合约加载
    - 提供事件监听所需的核心功能
    - 提供NFT价格设置功能
    """

    def __init__(self):
        self._w3: Optional[Web3] = None
        self._contract: Optional[Any] = None
        self._chain_id: Optional[int] = None
        self._initialized = False

    def _initialize(self):
        """
        初始化Web3和合约实例。
        - 从配置文件加载RPC URL、合约地址、私钥
        - 连接到以太坊节点并加载合约ABI
        """
        if self._initialized:
            return

        try:
            self.rpc_url = settings.POLKADOT_RPC_URL
            self.contract_address = settings.POLKADOT_NFT_CONTRACT_ADDRESS
            self.private_key = settings.PRIVATE_KEY

            if not all([self.rpc_url, self.contract_address, self.private_key]):
                raise ValueError("缺少必要的Polkadot配置，请检查 .env 文件")

            self._w3 = Web3(Web3.HTTPProvider(self.rpc_url))

            if not self._w3.is_connected():
                raise ConnectionError(f"无法连接到RPC: {self.rpc_url}")

            self._chain_id = self._w3.eth.chain_id

            with open("contracts/AiTextNFT.json", "r") as f:
                contract_abi = json.load(f)

            self._contract = self._w3.eth.contract(
                address=self.contract_address, abi=contract_abi
            )

            self._initialized = True
            print("EVM客户端初始化成功")

        except (
            ValueError,
            ConnectionError,
            FileNotFoundError,
            json.JSONDecodeError,
        ) as e:
            self._w3 = None
            self._contract = None
            self._chain_id = None
            self._initialized = False
            print(f"EVM客户端初始化失败: {e}")
            raise

    @property
    def w3(self) -> Web3:
        """获取Web3实例，如果未初始化则先进行初始化"""
        if not self._initialized:
            self._initialize()
        return self._w3

    @property
    def contract(self) -> Any:
        """获取合约实例，如果未初始化则先进行初始化"""
        if not self._initialized:
            self._initialize()
        return self._contract

    @property
    def chain_id(self) -> int:
        """获取链ID，如果未初始化则先进行初始化"""
        if not self._initialized:
            self._initialize()
        return self._chain_id

    def _get_gas_price(self) -> int:
        """获取合适的Gas价格"""
        try:
            current_price = self.w3.eth.gas_price
            max_price = self.w3.to_wei("1000", "gwei")
            min_price = self.w3.to_wei("10", "gwei")
            return max(min_price, min(current_price, max_price))
        except Exception:
            return self.w3.to_wei("50", "gwei")

    def set_nft_price(self, token_id: int, price_wei: int) -> Dict[str, Any]:
        """
        设置NFT价格
        - 调用合约的setPrice方法
        - 返回交易结果
        """
        try:
            if not self._initialized:
                self._initialize()

            account = self.w3.eth.account.from_key(self.private_key)
            gas_price = self._get_gas_price()

            # 检查余额
            balance = self.w3.eth.get_balance(account.address)
            estimated_cost = 100000 * gas_price

            if balance < estimated_cost:
                return {
                    "success": False,
                    "error": f"余额不足，需要 {self.w3.from_wei(estimated_cost, 'ether')} ETH",
                }

            # 构建交易
            transaction = self.contract.functions.setPrice(
                token_id, price_wei
            ).build_transaction(
                {
                    "from": account.address,
                    "gas": 100000,
                    "gasPrice": gas_price,
                    "nonce": self.w3.eth.get_transaction_count(account.address),
                    "chainId": self.chain_id,
                }
            )

            # 签名并发送交易
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction, self.private_key
            )

            try:
                raw_tx = signed_txn.raw_transaction
            except AttributeError:
                raw_tx = signed_txn.rawTransaction

            tx_hash = self.w3.eth.send_raw_transaction(raw_tx)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            if receipt.status == 0:
                return {
                    "success": False,
                    "error": "交易执行失败",
                    "transaction_hash": tx_hash.hex(),
                }

            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "gas_used": receipt.gasUsed,
                "token_id": token_id,
                "price_wei": price_wei,
                "price_eth": float(self.w3.from_wei(price_wei, "ether")),
            }

        except Exception as e:
            error_msg = str(e)
            if "insufficient funds" in error_msg.lower():
                return {"success": False, "error": "账户余额不足"}
            elif "nonce too low" in error_msg.lower():
                return {"success": False, "error": "交易nonce过低，请重试"}
            else:
                return {"success": False, "error": f"设置价格失败: {error_msg}"}

    def is_connected(self) -> bool:
        """检查是否成功连接到以太坊节点"""
        try:
            return self._w3 is not None and self._w3.is_connected()
        except Exception:
            return False

    def get_network_info(self) -> Dict[str, Any]:
        """
        获取当前连接的网络信息。
        - 链ID、网络名称、最新区块号、Gas价格
        """
        if not self.is_connected():
            return {"success": False, "error": "未连接到EVM网络"}

        try:
            chain_id = self.chain_id
            network_name = {
                42220: "Celo Mainnet",
                44787: "Celo Alfajores",
            }.get(chain_id, "Unknown")

            return {
                "success": True,
                "chain_id": chain_id,
                "network_name": network_name,
                "latest_block": self.w3.eth.block_number,
                "gas_price_gwei": float(
                    self.w3.from_wei(self.w3.eth.gas_price, "gwei")
                ),
            }
        except Exception as e:
            return {"success": False, "error": f"获取网络信息失败: {str(e)}"}


polkadot_client = PolkadotClient()
