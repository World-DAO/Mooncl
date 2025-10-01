from sqlalchemy.orm import Session
from app.dao.nft_dao_polkadot import NFTPolkadotDAO
from app.models import (
    NFTPolkadotResponse,
    NFTPolkadotListResponse,
)
from typing import List, Optional


class NFTPolkadotService:
    @staticmethod
    def get_nft_by_token_id(
        db: Session, token_id: int
    ) -> Optional[NFTPolkadotResponse]:
        """获取Polkadot链上NFT详情"""
        db_nft = NFTPolkadotDAO.get_by_token_id(db, token_id)
        if not db_nft:
            return None

        return NFTPolkadotResponse(
            token_id=db_nft.token_id,
            owner_address=db_nft.owner_address,
            content=db_nft.content,
            evaluate_price=(
                float(db_nft.evaluate_price) if db_nft.evaluate_price else None
            ),
            current_price=float(db_nft.current_price) if db_nft.current_price else None,
            created_at=db_nft.created_at,
            updated_at=db_nft.updated_at,
        )

    @staticmethod
    def get_nfts_by_owner(
        db: Session, owner_address: str
    ) -> List[NFTPolkadotListResponse]:
        """获取用户的所有Polkadot链上NFT"""
        db_nfts = NFTPolkadotDAO.get_by_owner(db, owner_address)
        return [
            NFTPolkadotListResponse(
                token_id=nft.token_id,
                owner_address=nft.owner_address,
                content=nft.content,
                evaluate_price=(
                    float(nft.evaluate_price) if nft.evaluate_price else None
                ),
                current_price=float(nft.current_price) if nft.current_price else None,
                created_at=nft.created_at,
            )
            for nft in db_nfts
        ]

    @staticmethod
    def get_nft_ranking(db: Session, limit: int = 20) -> List[NFTPolkadotListResponse]:
        """获取Polkadot链上NFT排行榜（按价格排序）"""
        db_nfts = NFTPolkadotDAO.get_ranking_by_price(db, limit)
        return [
            NFTPolkadotListResponse(
                token_id=nft.token_id,
                owner_address=nft.owner_address,
                content=nft.content,
                evaluate_price=(
                    float(nft.evaluate_price) if nft.evaluate_price else None
                ),
                current_price=float(nft.current_price) if nft.current_price else None,
                created_at=nft.created_at,
            )
            for nft in db_nfts
        ]

    @staticmethod
    def transfer_nft(db: Session, token_id: int, to_address: str, from_address: str):
        """转移Polkadot链上NFT"""
        db_nft = NFTPolkadotDAO.get_by_token_id(db, token_id)
        if not db_nft:
            raise ValueError("NFT not found")

        if db_nft.owner_address != from_address:
            raise ValueError("Not the owner of this NFT")

        # 更新owner_address
        NFTDAO.update_owner(db, token_id, to_address)
        return {"success": True, "message": "NFT transferred successfully"}

    @staticmethod
    def update_evaluate_price(db: Session, token_id: int, price: float) -> bool:
        """更新Polkadot链上NFT评估价格"""
        return NFTPolkadotDAO.update_evaluate_price(db, token_id, price)

    @staticmethod
    def update_current_price(db: Session, token_id: int, price: float) -> bool:
        """更新Polkadot链上NFT当前价格"""
        return NFTPolkadotDAO.update_current_price(db, token_id, price)
