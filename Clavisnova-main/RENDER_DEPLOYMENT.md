# Render + Supabase + Cloudflare Pages 部署指南

本指南将帮助您将Clavisnova应用部署到Render，使用Supabase作为数据库，Cloudflare Pages作为前端。

## 📋 前置要求

- GitHub仓库
- Supabase账户和项目
- Cloudflare账户和Pages项目
- Render账户

## 🚀 部署步骤

### 1. Supabase数据库设置

1. **创建Supabase项目**
   - 访问 [Supabase](https://supabase.com)
   - 创建新项目
   - 等待项目初始化完成

2. **获取数据库连接信息**
   - 在Supabase控制台进入 "Settings" -> "Database"
   - 复制 "Connection string"（选择URI格式）
   - 格式类似：`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **初始化数据库表**
   - 在Supabase控制台进入 "SQL Editor"
   - 复制并执行以下SQL来创建表：

```sql
-- 创建registrations表
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial VARCHAR(255),
    year INTEGER,
    height VARCHAR(255),
    finish VARCHAR(255),
    color_wood VARCHAR(255),
    access VARCHAR(255),
    city_state VARCHAR(255),
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建requirements表
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255),
    current_pianos TEXT,
    preferred_type VARCHAR(255),
    teacher_name VARCHAR(255),
    background TEXT,
    commitment TEXT,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建contacts表
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT,
    ip_address VARCHAR(255),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Cloudflare Pages前端部署

确保您的前端已经部署到Cloudflare Pages，并且配置了正确的API端点。

### 3. Render后端部署

1. **连接GitHub仓库**
   - 登录 [Render](https://render.com)
   - 点击 "New" -> "Web Service"
   - 选择您的GitHub仓库

2. **配置服务**
   - **Name**: `clavisnova-backend`
   - **Runtime**: `Docker`
   - **Region**: 选择离您用户最近的区域（如Singapore或Frankfurt）
   - **Branch**: `main`（或您的主分支）
   - **Build Command**:
     ```bash
     docker build -f backend/Dockerfile -t clavisnova-backend .
     ```
   - **Start Command**:
     ```bash
     gunicorn -w 4 -b 0.0.0.0:$PORT --access-logfile /app/logs/access.log --error-logfile /app/logs/error.log main:app
     ```

3. **配置环境变量**
   在Render控制台的"Environment"部分添加以下变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` | Supabase数据库连接字符串 |
   | `FRONTEND_URL` | `https://your-frontend-domain.pages.dev` | Cloudflare Pages URL |
   | `SECRET_KEY` | 生成一个安全的密钥 | Flask应用密钥 |
   | `FLASK_ENV` | `production` | 环境设置 |
   | `DEBUG` | `false` | 调试模式 |

4. **高级设置**
   - **Health Check Path**: `/api/health`
   - **Plan**: Starter（免费额度足够）
   - **Auto-Deploy**: 开启（推送代码自动部署）

5. **部署应用**
   - 点击 "Create Web Service"
   - 等待构建和部署完成

### 4. 配置CORS和连接

1. **更新前端API地址**
   在您的前端代码中，确保API调用指向Render提供的URL：
   ```javascript
   const API_BASE_URL = 'https://your-render-app.onrender.com/api';
   ```

2. **测试连接**
   - 访问您的Render应用URL + `/api/health`
   - 应该返回JSON格式的健康检查信息

## 🔧 故障排除

### 数据库连接问题

1. **检查DATABASE_URL格式**
   - 确保包含正确的密码和项目引用
   - 格式：`postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres`

2. **Supabase网络限制**
   - Render可能需要添加到Supabase的白名单中
   - 在Supabase控制台检查网络设置

### 构建失败

1. **检查Dockerfile**
   - 确保backend/Dockerfile存在且语法正确
   - 检查Python版本兼容性

2. **依赖问题**
   - 检查requirements.txt中的包是否都可用
   - 某些包可能需要特定的系统依赖

### 运行时错误

1. **检查日志**
   - 在Render控制台查看应用日志
   - 查找数据库连接或配置错误

2. **环境变量**
   - 确保所有必需的环境变量都已设置
   - SECRET_KEY必须是安全的随机字符串

## 🔄 更新部署

当您推送代码到GitHub时，Render会自动重新构建和部署应用。

## 💰 成本考虑

- **Render**: Starter计划每月$7（包含750小时）
- **Supabase**: 免费额度足够小型应用
- **Cloudflare Pages**: 完全免费

## 🔒 安全建议

1. **环境变量**
   - 永远不要将敏感信息提交到代码仓库
   - 使用Render的环境变量管理

2. **数据库安全**
   - 定期更新Supabase密码
   - 配置适当的行级安全策略

3. **API安全**
   - 实现适当的输入验证
   - 考虑添加API密钥验证

## 📊 监控和维护

1. **Render控制台**
   - 监控应用状态和日志
   - 查看资源使用情况

2. **Supabase控制台**
   - 监控数据库性能
   - 查看查询统计

3. **健康检查**
   - 定期访问 `/api/health` 端点
   - 设置监控告警

---

*最后更新: 2025年1月*
