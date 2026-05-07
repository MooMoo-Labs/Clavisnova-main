# Clavisnova - Piano Donation & Sharing Platform

一个志愿者领导的钢琴捐赠与分享平台，帮助学校和社区获取钢琴资源。

## 项目简介

Clavisnova 是一个专注于钢琴捐赠与分享的平台，连接捐赠者和学校，让每一架钢琴都能找到合适的归宿。

## 功能特性

- **钢琴捐赠**：个人或机构可以轻松登记捐赠钢琴
- **学校需求**：学校可以提交钢琴需求信息
- **管理员面板**：完整的后台管理功能
- **数据导出**：支持 Excel 和 CSV 格式导出
- **联系表单**：用户可以通过联系表单与我们沟通

## 技术栈

- **前端**：HTML, CSS (Tailwind CSS), JavaScript
- **后端**：Python Flask
- **数据库**：SQLite
- **部署**：Cloudflare Pages (前端) + Railway (后端)

## 本地开发

### 环境要求

- Python 3.8+
- Node.js (可选，用于前端开发)

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/andyzhou222/Clavisnova.git
cd Clavisnova
```

2. 安装后端依赖：
```bash
cd backend
pip install -r requirements.txt
```

3. 运行后端服务器：
```bash
python main.py
```

4. 在浏览器中打开 `http://localhost:8080`

## 部署说明

### 前端部署 (Cloudflare Pages)

1. 登录 Cloudflare Dashboard
2. 连接 GitHub 仓库
3. 设置构建配置：
   - Build command: (留空)
   - Build output directory: `frontend`
   - Root directory: `/`

### 后端部署 (Railway)

1. 登录 Railway
2. 连接 GitHub 仓库
3. 设置环境变量：
   - `FLASK_ENV=production`
   - `SECRET_KEY=your_secret_key`
4. 数据库会自动配置

## 项目结构

```
Clavisnova/
├── frontend/           # 前端文件
│   ├── index.html     # 主页面
│   ├── admin.html     # 管理员页面
│   ├── script.js      # 前端逻辑
│   └── styles.css     # 样式文件
├── backend/           # 后端代码
│   ├── main.py       # Flask 应用
│   ├── models.py     # 数据库模型
│   ├── schemas.py    # 数据验证
│   └── data/         # 数据库文件
├── .gitignore        # Git 忽略文件
└── README.md         # 项目说明
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

- 项目主页：[https://clavisnova.yourdomain.com](https://clavisnova.yourdomain.com)
- 邮箱：info@pianoforschools.org

---

由志愿者团队维护 | Made with ❤️ for music education