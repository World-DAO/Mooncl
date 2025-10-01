from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()


class Settings(BaseSettings):
    # MySQL数据库配置
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "43.156.89.66")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "tpc20020602")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "mooncl_db")

    # 构建数据库URL
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    # JWT配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天

    # EVM 配置
    EVM_RPC_URL: str = os.getenv("EVM_RPC_URL", "")
    POLKADOT_RPC_URL: str = os.getenv("POLKADOT_RPC_URL", "")
    NFT_CONTRACT_ADDRESS: str = os.getenv("NFT_CONTRACT_ADDRESS", "")
    POLKADOT_NFT_CONTRACT_ADDRESS: str = os.getenv("POLKADOT_NFT_CONTRACT_ADDRESS", "")
    LAUNCHPAD_CONTRACT_ADDRESS: str = os.getenv("LAUNCHPAD_CONTRACT_ADDRESS", "")
    POLKADOT_LAUNCHPAD_CONTRACT_ADDRESS: str = os.getenv(
        "POLKADOT_LAUNCHPAD_CONTRACT_ADDRESS", ""
    )
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")

    # AI评估配置
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
