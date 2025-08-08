# 入库材料审核 API 文档

## 审核入库材料

### 请求

**PUT** `/api/inbound-materials/{id}/audit`

#### 请求头
```
Content-Type: application/json
Authorization: Bearer {token}
```

#### 请求参数
- `id` (路径参数): 材料ID

#### 请求体
```json
{
  "action": "approve" | "reject",
  "remarks": "审核意见（可选）"
}
```

#### 字段说明
- `action`: 审核操作，`approve` 表示批准，`reject` 表示拒绝
- `remarks`: 审核意见（可选字段）

### 响应

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "_id": "材料ID",
    "orderNumber": "入库单号",
    "materialName": "材料名称",
    "status": "active" | "inactive",
    // ... 其他材料字段
    "auditHistory": [
      {
        "action": "approve" | "reject",
        "status": "active" | "inactive",
        "auditorId": "审核员ID",
        "auditorName": "审核员姓名",
        "remarks": "审核意见",
        "auditDate": "2024-01-18T10:30:00.000Z"
      }
    ]
  },
  "message": "材料 \"材料名称\" 已审核通过",
  "auditInfo": {
    "action": "approve",
    "auditor": "审核员姓名",
    "date": "2024-01-18T10:30:00.000Z",
    "remarks": "审核意见"
  }
}
```

#### 错误响应

**401 未授权**
```json
{
  "success": false,
  "error": "未授权访问"
}
```

**403 权限不足**
```json
{
  "success": false,
  "error": "权限不足，只有管理员可以审核材料"
}
```

**400 请求参数错误**
```json
{
  "success": false,
  "error": "审核操作无效，必须是 approve 或 reject"
}
```

**404 材料不存在**
```json
{
  "success": false,
  "error": "未找到该材料记录"
}
```

**400 状态错误**
```json
{
  "success": false,
  "error": "该材料当前状态不是待审核，无法审核"
}
```

## 获取审核历史

### 请求

**GET** `/api/inbound-materials/{id}/audit`

#### 请求头
```
Authorization: Bearer {token}
```

#### 请求参数
- `id` (路径参数): 材料ID

### 响应

#### 成功响应 (200)
```json
{
  "success": true,
  "data": {
    "materialId": "材料ID",
    "materialName": "材料名称",
    "auditHistory": [
      {
        "action": "approve" | "reject",
        "status": "active" | "inactive",
        "auditorId": "审核员ID",
        "auditorName": "审核员姓名",
        "remarks": "审核意见",
        "auditDate": "2024-01-18T10:30:00.000Z"
      }
    ]
  }
}
```

## 权限要求

- **审核操作 (PUT)**: 仅限 `admin` 角色用户
- **查看审核历史 (GET)**: 所有已认证用户

## 状态变化规则

- **批准 (approve)**: `pending` → `active`
- **拒绝 (reject)**: `pending` → `inactive`

## 使用示例

### 批准材料
```bash
curl -X PUT "http://localhost:3000/api/inbound-materials/60f7b8c8d5e6f7a8b9c0d1e2/audit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "action": "approve",
    "remarks": "材料质量符合要求，批准入库"
  }'
```

### 拒绝材料
```bash
curl -X PUT "http://localhost:3000/api/inbound-materials/60f7b8c8d5e6f7a8b9c0d1e2/audit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "action": "reject",
    "remarks": "材料规格不符合要求，拒绝入库"
  }'
```

### 查看审核历史
```bash
curl -X GET "http://localhost:3000/api/inbound-materials/60f7b8c8d5e6f7a8b9c0d1e2/audit" \
  -H "Authorization: Bearer your-token-here"
```