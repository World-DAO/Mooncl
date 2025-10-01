from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from app.models import NFTResponse, NFTListResponse
from app.services.nft_service import NFTService
from app.database import get_db
from typing import List


router = APIRouter()


@router.get("/ranking", response_model=List[NFTListResponse])
def get_nft_ranking(
    limit: int = Query(20, description="返回数量限制"),
    db: Session = Depends(get_db),
):
    """获取NFT排行榜（按价格排序）"""
    try:
        return NFTService.get_nft_ranking(db, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get NFT ranking: {str(e)}",
        )


@router.get("/detail/{token_id}", response_model=NFTResponse)
def get_nft_detail(token_id: int, db: Session = Depends(get_db)):
    """获取NFT详情"""
    nft = NFTService.get_nft_by_token_id(db, token_id)
    if not nft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="NFT not found"
        )
    return nft


@router.get("/user/{user_address}", response_model=List[NFTListResponse])
def get_user_nfts(user_address: str, db: Session = Depends(get_db)):
    """获取用户NFT列表"""
    try:
        return NFTService.get_nfts_by_owner(db, user_address)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user NFTs: {str(e)}",
        )
