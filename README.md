# 我的导航 - 个人网站链接导航页

这是一个现代化的个人网站链接导航页，使用Next.js和Neon PostgreSQL数据库构建。它允许您组织和访问您的个人站点、家庭局域网站点和各类工具站点，支持标签和分类筛选，区分内网和公网链接。

## 功能特点

- 🌐 支持内网和公网链接管理
- 🏷️ 标签和分类系统，方便筛选
- 🔍 全文搜索功能
- 🔒 管理员登录和权限控制
- 📱 响应式设计，适配各种设备
- 🎨 现代化UI设计

## 技术栈

- **前端框架**: Next.js 15
- **样式**: Tailwind CSS
- **数据库**: Neon PostgreSQL
- **ORM**: Prisma
- **认证**: NextAuth.js
- **部署**: Vercel

## 快速开始

### 前提条件

- Node.js 18+
- npm 或 yarn
- Neon PostgreSQL 数据库账号

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/my-home-page.git
cd my-home-page
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制`.env.example`文件为`.env`，并填写您的数据库连接信息和其他配置：

```
# Neon PostgreSQL Database
DATABASE_URL="postgresql://username:password@hostname:port/database"
DIRECT_URL="postgresql://username:password@hostname:port/database"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Admin User
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

4. 初始化数据库

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看您的应用。

## 部署到Vercel

1. 在Vercel上创建一个新项目
2. 连接您的GitHub仓库
3. 配置环境变量（与`.env`文件相同）
4. 部署项目

## 使用指南

### 管理员登录

访问 `/login` 页面，使用您在环境变量中设置的管理员邮箱和密码登录。

### 添加新链接

1. 登录后，访问管理面板
2. 点击"添加链接"按钮
3. 填写链接信息，包括标题、URL、描述、分类和标签
4. 点击"添加链接"保存

### 搜索链接

使用顶部导航栏中的搜索图标，或访问 `/search` 页面进行搜索。

## 许可证

MIT
