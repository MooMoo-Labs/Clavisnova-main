# Clavisnova Docker 部署指南

本指南将帮助您使用Docker快速部署Clavisnova钢琴捐赠平台。

## 前置要求

- Docker (版本 20.10+)
- Docker Compose (版本 1.29+)
- 至少 1GB 可用内存
- 至少 2GB 可用磁盘空间

## 快速开始

### 1. 环境准备

```bash
# 克隆项目（如果还没有的话）
git clone https://github.com/andyzhou222/Clavisnova.git
cd Clavisnova

# 复制环境变量文件
cp env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，设置生产环境的配置：

```bash
# 生成安全的密钥
openssl rand -hex 32

# 编辑 .env 文件
nano .env
```

至少需要设置：
- `SECRET_KEY`: 生产环境的密钥（必须修改）
- `DATABASE_URL`: 数据库连接字符串

### 3. 一键部署

使用部署脚本：

```bash
# 使脚本可执行（如果还没有的话）
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

选择选项 1 进行部署。

## 手动部署

如果您喜欢手动控制部署过程：

```bash
# 构建和启动应用
docker-compose up --build -d

# 查看启动日志
docker-compose logs -f

# 检查健康状态
curl http://localhost:8080/api/health
```

## 访问应用

部署成功后，您可以通过以下地址访问：

- **主页面**: http://localhost:8080
- **管理后台**: http://localhost:8080/admin.html
- **健康检查**: http://localhost:8080/api/health
- **注册页面**: http://localhost:8080/registration.html
- **需求页面**: http://localhost:8080/requirements.html

## 管理命令

### 查看应用状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs clavisnova
```

### 重启应用

```bash
docker-compose restart
```

### 停止应用

```bash
docker-compose down
```

### 停止并删除数据卷

```bash
docker-compose down -v
```

## 生产环境部署

### 使用外部数据库

对于生产环境，推荐使用PostgreSQL替代SQLite：

1. 在 `.env` 文件中设置：
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

2. 确保数据库服务器可访问

### 使用反向代理

在生产环境中，建议使用Nginx或Caddy作为反向代理：

```nginx
# nginx 配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL证书

使用Let's Encrypt获取免费SSL证书：

```bash
# 使用 certbot
certbot --nginx -d your-domain.com
```

## 备份和恢复

### 数据库备份

```bash
# 对于SQLite（默认）
docker-compose exec clavisnova cp /app/data/Clavisnova.db /app/data/Clavisnova.db.backup

# 从容器复制到宿主机
docker cp $(docker-compose ps -q clavisnova):/app/data/Clavisnova.db ./backup/
```

### 日志备份

```bash
# 复制日志文件
docker cp $(docker-compose ps -q clavisnova):/app/logs ./backup/logs/
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口使用情况
   lsof -i :8080

   # 修改端口映射
   # 编辑 docker-compose.yml 中的端口配置
   ```

2. **权限问题**
   ```bash
   # 确保数据目录权限正确
   sudo chown -R 1000:1000 ./data ./logs
   ```

3. **内存不足**
   ```bash
   # 检查内存使用情况
   docker stats

   # 增加Docker内存限制
   # Docker Desktop: 设置 > 资源 > 高级
   ```

4. **数据库连接问题**
   ```bash
   # 检查数据库配置
   docker-compose exec clavisnova python -c "from config import settings; print(settings.database_url)"
   ```

### 健康检查

```bash
# 手动健康检查
curl -f http://localhost:8080/api/health

# 检查容器健康状态
docker-compose ps
docker inspect $(docker-compose ps -q clavisnova) | grep -A 5 "Health"
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建和启动
docker-compose up --build -d

# 检查更新是否成功
docker-compose logs --tail=50
```

## 监控和日志

应用会自动生成以下日志：

- `/app/logs/access.log`: 访问日志
- `/app/logs/error.log`: 错误日志
- `/app/logs/combined.log`: 综合日志

查看实时日志：
```bash
docker-compose logs -f clavisnova
```

## 性能优化

### 生产环境建议

1. **资源限制**
   ```yaml
   # 在 docker-compose.yml 中添加
   services:
     clavisnova:
       deploy:
         resources:
           limits:
             memory: 1G
           reservations:
             memory: 512M
   ```

2. **使用生产WSGI服务器**
   - 应用已配置使用Gunicorn
   - 工作进程数设置为4，可根据CPU核心数调整

3. **静态文件服务**
   - 生产环境建议使用Nginx服务静态文件
   - 当前配置中Flask直接服务静态文件

## 支持

如果您遇到问题：

1. 查看应用日志：`docker-compose logs`
2. 检查容器状态：`docker-compose ps`
3. 验证环境变量：`docker-compose exec clavisnova env`
4. 查看健康检查：`curl http://localhost:8080/api/health`

---

*最后更新: 2025年1月*
