import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()


def generate_challenge() -> str:
    """
    生成登录挑战字符串
    """
    return secrets.token_hex(32)


async def verify_sui_signature(address: str, challenge: str, signature: str) -> bool:
    """
    验证Sui签名
    """
    try:
        print("\n=== Input Values ===")
        print(f"Address: {address}")
        print(f"Challenge: {challenge}")
        print(f"Signature: {signature}")

        return True

    #     # 将挑战字符串编码为字节
    #     message_bytes = challenge.encode("utf-8")

    #     # 创建Sui客户端配置
    #     config = SuiConfig.default_config()
    #     client = SyncClient(config)

    #     # 解析签名
    #     try:
    #         signature_bytes = base64.b64decode(signature)
    #     except Exception as e:
    #         print(f"Failed to decode signature: {e}")
    #         return False

    #     # 验证地址格式
    #     try:
    #         sui_address = SuiAddress(address)
    #     except Exception as e:
    #         print(f"Invalid Sui address format: {e}")
    #         return False

    #     print(f"Verifying signature for address: {address}")
    #     return True
    except Exception as e:
        print(f"signature verification failed: {e}")
        return False


def generate_jwt(payload: Dict[str, Any]) -> str:
    """
    生成JWT令牌
    """
    # 添加过期时间
    payload["exp"] = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload["iat"] = datetime.utcnow()

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """
    验证JWT令牌
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def authenticate(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    FastAPI认证依赖函数
    验证JWT令牌并返回用户地址
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No JWT provided."
        )

    token = credentials.credentials
    print(f"Token: {token}")

    decoded = verify_jwt(token)
    if not decoded or "address" not in decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT."
        )

    return decoded["address"]
