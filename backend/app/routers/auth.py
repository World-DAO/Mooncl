from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Union, Dict, Any
from app.utils.jwt_auth import (
    generate_challenge,
    verify_sui_signature,
    generate_jwt,
    verify_jwt,
    authenticate,
)


router = APIRouter()

login_challenges: Dict[str, str] = {}


class LoginRequest(BaseModel):
    address: Union[str, bytes]


class LoginSignatureRequest(BaseModel):
    address: Union[str, bytes]
    signature: str
    challenge: str


class LoginResponse(BaseModel):
    success: bool
    challenge: str = None
    token: str = None
    reason: str = None


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    POST /login
    Generate login challenge, params: { address }
    """
    address = request.address
    if not address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Address is required."
        )

    # 生成一个随机挑战
    challenge = generate_challenge()
    address_key = address if isinstance(address, str) else address.hex()
    login_challenges[address_key] = challenge

    if isinstance(address, bytes):
        hex_address = "0x" + address.hex()
        print(f"Player {hex_address} login initiated with challenge {challenge}")
    else:
        print(f"Player {address} login initiated with challenge {challenge}")

    return LoginResponse(success=True, challenge=challenge)


@router.post("/login_signature", response_model=LoginResponse)
async def login_signature(request: LoginSignatureRequest):
    """
    POST /login_signature
    用户使用私钥对挑战签名，验证签名后返回JWT
    params: { address, signature, challenge }
    """
    address = request.address
    signature = request.signature
    challenge = request.challenge

    if not challenge or not address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address and challenge are required.",
        )

    # 验证挑战是否匹配
    address_key = address if isinstance(address, str) else address.hex()
    if login_challenges.get(address_key) != challenge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Challenge mismatch. Please initiate login again.",
        )

    try:
        if not await verify_sui_signature(address, challenge, signature):
            raise Exception("Signature verification failed.")

        # 读取用户信息
        # user = await UserService.get_user(address)
        # user_state = await UserService.get_daily_state(address)

        # 签名通过，生成JWT
        token = generate_jwt({"address": address_key})

        # 清除挑战
        del login_challenges[address_key]
        return LoginResponse(success=True, token=token)

    except Exception as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))
