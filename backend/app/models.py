from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
    DECIMAL,
    BigInteger,
)
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database import Base


# SQLAlchemy ORM 模型
class NFTDB(Base):
    __tablename__ = "nft"

    token_id = Column(Integer, primary_key=True, index=True, unique=True)
    owner_address = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    evaluate_price = Column(DECIMAL(20, 8), nullable=True)
    current_price = Column(DECIMAL(20, 8), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


# SQLAlchemy ORM 模型
class NFTPolkadotDB(Base):
    __tablename__ = "nft_polkadot"

    token_id = Column(String(255), primary_key=True, index=True)
    owner_address = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    evaluate_price = Column(DECIMAL(20, 12), nullable=True)
    current_price = Column(DECIMAL(20, 12), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


# Pydantic 模型
class NFTResponse(BaseModel):
    token_id: int
    owner_address: str
    content: str
    evaluate_price: Optional[float] = None
    current_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Pydantic 模型
class NFTPolkadotResponse(BaseModel):
    token_id: str
    owner_address: str
    content: str
    evaluate_price: Optional[float] = None
    current_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Pydantic 模型
class NFTListResponse(BaseModel):
    token_id: int
    owner_address: str
    content: str
    evaluate_price: Optional[float] = None
    current_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Pydantic 模型
class NFTPolkadotListResponse(BaseModel):
    token_id: str
    owner_address: str
    content: str
    evaluate_price: Optional[float] = None
    current_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# 统一的多链NFT响应模型
class MultiChainNFTResponse(BaseModel):
    chain_type: str
    token_id: str
    owner_address: str
    content: str
    evaluate_price: Optional[float] = None
    current_price: Optional[float] = None
    chain_specific_data: Optional[dict] = None  # 链特定的额外数据
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
