from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import NFTDB
from typing import List, Optional, Dict, Any


class NFTDAO:
    @staticmethod
    def create(db: Session, nft_data: Dict[str, Any]) -> NFTDB:
        """创建新NFT"""
        db_nft = NFTDB(**nft_data)
        db.add(db_nft)
        db.commit()
        db.refresh(db_nft)
        return db_nft

    @staticmethod
    def get_by_token_id(db: Session, token_id: int) -> Optional[NFTDB]:
        """根据token_id获取NFT"""
        return db.query(NFTDB).filter(NFTDB.token_id == token_id).first()

    @staticmethod
    def get_by_owner(db: Session, owner_address: str, limit: int = 100) -> List[NFTDB]:
        """通过所有者地址获取NFT列表"""
        return (
            db.query(NFTDB)
            .filter(NFTDB.owner_address == owner_address)
            .order_by(desc(NFTDB.created_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_ranking_by_price(db: Session, limit: int = 20) -> List[NFTDB]:
        """获取NFT排行榜（按价格排序）"""
        return db.query(NFTDB).order_by(desc(NFTDB.current_price)).limit(limit).all()

    @staticmethod
    def update_owner(db: Session, token_id: int, new_owner: str) -> bool:
        """更新NFT所有者"""
        result = (
            db.query(NFTDB)
            .filter(NFTDB.token_id == token_id)
            .update({"owner_address": new_owner})
        )
        db.commit()
        return result > 0

    @staticmethod
    def update_evaluate_price(db: Session, token_id: int, price: float) -> bool:
        """更新NFT评估价格"""
        result = (
            db.query(NFTDB)
            .filter(NFTDB.token_id == token_id)
            .update({"evaluate_price": price})
        )
        db.commit()
        return result > 0

    @staticmethod
    def update_current_price(db: Session, token_id: int, price: float) -> bool:
        """更新NFT当前价格"""
        result = (
            db.query(NFTDB)
            .filter(NFTDB.token_id == token_id)
            .update({"current_price": price})
        )
        db.commit()
        return result > 0
