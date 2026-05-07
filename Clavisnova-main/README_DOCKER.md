# Docker部署快速指南

## 🚀 部署选项

### 选项1: Render部署（推荐用于生产环境）

1. **连接GitHub仓库到Render**
   - 登录 [Render](https://render.com)
   - 点击 "New" -> "Web Service"
   - 连接您的GitHub仓库

2. **配置环境变量**
   ```bash
   # 在Render控制台设置以下环境变量：
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   FRONTEND_URL=https://your-frontend-domain.pages.dev
   SECRET_KEY=your-secure-secret-key-here
   FLASK_ENV=production
   ```

3. **部署设置**
   - Runtime: Docker
   - Build Command: `docker build -f backend/Dockerfile -t clavisnova-backend .`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT --access-logfile /app/logs/access.log --error-logfile /app/logs/error.log main:app`

### 选项2: 本地Docker部署

1. **准备环境**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，设置 SECRET_KEY 和 DATABASE_URL
   ```

2. **一键部署**
   ```bash
   ./deploy.sh
   # 选择选项 1
   ```

3. **访问应用**
   - API端点: http://localhost:8080/api/
   - 前端已部署到Cloudflare，不在此容器中

## 📁 文件说明

- `render.yaml` - Render部署配置文件
- `RENDER_DEPLOYMENT.md` - Render + Supabase + Cloudflare Pages部署指南
- `check_render_config.py` - 部署配置检查脚本
- `docker-compose.yml` - Docker Compose 配置（本地开发）
- `backend/Dockerfile` - Docker 镜像构建文件
- `env.example` - 环境变量示例
- `deploy.sh` - 部署管理脚本
- `DOCKER_DEPLOYMENT.md` - 详细的Docker部署文档

## 🔧 管理命令

```bash
# 启动应用
docker-compose up -d

# 停止应用
docker-compose down

# 查看日志
docker-compose logs -f

# 重启应用
docker-compose restart
```

## ⚠️ 生产环境注意事项

1. 修改 `SECRET_KEY` 为强密码
2. 考虑使用 PostgreSQL 替代 SQLite
3. 配置反向代理 (Nginx/Caddy)
4. 设置 SSL 证书
5. 配置备份策略

## 📖 详细文档

请查看 `DOCKER_DEPLOYMENT.md` 获取完整的部署指南和故障排除信息。
