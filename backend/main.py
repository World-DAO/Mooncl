from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, nft, nft_polkadot
from app.database import create_tables, test_connection
from app.utils.event_listener import event_listener
from app.utils.polkadot_listener import polkadot_event_listener

import uvicorn
import asyncio


# 创建FastAPI应用实例
app = FastAPI(title="MoonCL Server API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 启动时测试数据库连接并创建表
@app.on_event("startup")
async def startup_event():
    print("Starting MoonCL Server...")
    if test_connection():
        create_tables()
        print("Database tables created successfully!")
    else:
        print("Failed to connect to database!")

    # 启动事件监听器
    try:
        event_listener.initialize()
        polkadot_event_listener.initialize()
        asyncio.create_task(event_listener.start_listening())
        asyncio.create_task(polkadot_event_listener.start_listening())
        print("Event listener started successfully!")
    except Exception as e:
        print(f"Failed to start event listener: {e}")


# 关闭时停止事件监听器
@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down MoonCL Server...")
    event_listener.stop_listening()
    polkadot_event_listener.stop_listening()
    print("Event listener stopped")


# 注册路由 - 移除opinion路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(nft.router, prefix="/api/v1/nfts", tags=["nfts"])
app.include_router(
    nft_polkadot.router, prefix="/api/v1/nfts/polkadot", tags=["nfts_polkadot"]
)


# 根路径
@app.get("/")
def root():
    return {"message": "MoonCL Server API"}


# 健康检查端点
@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
