# MoonCL Server API 测试文档

## 基础信息
- **生产服务器地址**: `https://distributor-professionals-same-speakers.trycloudflare.com`

## 1. 认证模块测试

### 1.1 发起登录挑战
```shell
curl -X POST "https://distributor-professionals-same-speakers.trycloudflare.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "challenge": "ab39b26fa59e68aaf0596abe4844c95b9f28c5e38d9951b03eba24f851ec7802",
  "token": null,
  "reason": null
}
```

### 1.2 验证签名并获取Token
```shell
curl -X POST "https://distributor-professionals-same-speakers.trycloudflare.com/api/v1/auth/login_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338",
    "challenge": "ab39b26fa59e68aaf0596abe4844c95b9f28c5e38d9951b03eba24f851ec7802",
    "signature": "0x123456789"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "challenge": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "reason": null
}
```

## 2. NFT模块测试

### 2.1 获取NFT排行榜
```shell
curl -X GET "https://distributor-professionals-same-speakers.trycloudflare.com/api/v1/nfts/ranking?limit=10" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
[
  {
    "token_id": 1,
    "owner_address": "0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338",
    "content": "这是一个NFT内容示例",
    "evaluate_price": 0.01,
    "current_price": 0.5,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### 2.2 获取NFT详情
```shell
curl -X GET "https://distributor-professionals-same-speakers.trycloudflare.com/api/v1/nfts/detail/1" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
{
  "token_id": 1,
  "owner_address": "0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338",
  "content": "这是一个NFT内容示例",
  "evaluate_price": 0.01,
  "current_price": 0.5,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### 2.3 获取用户NFT列表
```shell
curl -X GET "https://distributor-professionals-same-speakers.trycloudflare.com/api/v1/nfts/user/0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338" \
  -H "Content-Type: application/json"
```

**预期响应**:
```json
[
  {
    "token_id": 1,
    "owner_address": "0x566ebc2a42a92bbfea494fce84b6f3b3ce1feab284eab6a6f38435866c1e8338",
    "content": "这是一个NFT内容示例",
    "evaluate_price": 0.01,
    "current_price": 0.5,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

