# NewNewMusic 🎵

一个现代化的全栈音乐播放器应用，提供完整的音乐流媒体体验。

## ✨ 特性

### 🎵 音乐功能
- **音乐播放** - 支持多种音频格式（MP3, WAV, FLAC, AAC, OGG）
- **播放列表管理** - 创建、编辑、删除个人播放列表
- **收藏功能** - 收藏喜爱的歌曲
- **音乐上传** - 用户可上传自己的音乐文件
- **搜索功能** - 快速搜索歌曲和艺术家

### 👤 用户系统
- **用户认证** - 注册、登录、个人资料管理
- **用户关注** - 关注其他用户，发现新音乐
- **个性化推荐** - 基于用户喜好的音乐推荐

### 🎨 界面设计
- **响应式设计** - 完美适配桌面和移动设备
- **主题切换** - 支持明暗主题切换
- **现代化UI** - 使用Tailwind CSS构建的美观界面
- **拖拽排序** - 播放列表歌曲拖拽重排

## 🏗️ 技术栈

### 前端
- **React 18** - 现代化的用户界面框架
- **Vite** - 快速的构建工具
- **React Router** - 客户端路由
- **Tailwind CSS** - 实用优先的CSS框架
- **Heroicons** - 精美的SVG图标库
- **Hello Pangea DND** - 拖拽功能实现

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **MongoDB** - NoSQL数据库
- **Mongoose** - MongoDB对象建模
- **JWT** - 用户认证
- **Multer** - 文件上传处理
- **Bcrypt** - 密码加密

### 开发工具
- **ESLint** - 代码质量检查
- **Jest** - 单元测试框架
- **Nodemon** - 开发时自动重启
- **Morgan** - HTTP请求日志

## 📁 项目结构

```
NewNewMusic-electron1/
├── frontend-app/          # React前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── contexts/      # React Context
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── styles/        # 样式文件
│   │   └── utils/         # 工具函数
│   ├── package.json
│   └── vite.config.js
├── node-backend/          # Node.js后端应用
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   └── utils/         # 工具函数
│   ├── uploads/           # 文件上传目录
│   ├── tests/             # 测试文件
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 4.4
- Yarn >= 1.22.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd NewNewMusic-electron1
   ```

2. **安装后端依赖**
   ```bash
   cd node-backend
   yarn install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   ```
   
   编辑 `.env` 文件，配置以下变量：
   ```env
   # 数据库配置
   MONGODB_URI=mongodb://localhost:27017/newnewmusic
   
   # JWT配置
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # 服务器配置
   PORT=8080
   HOST=localhost
   NODE_ENV=development
   
   # 速率限制配置
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **安装前端依赖**
   ```bash
   cd ../frontend-app
   yarn install
   ```

5. **启动开发服务器**
   
   启动后端服务器：
   ```bash
   cd node-backend
   yarn dev
   ```
   
   启动前端开发服务器：
   ```bash
   cd frontend-app
   yarn dev
   ```

6. **访问应用**
   - 前端应用：http://localhost:5173
   - 后端API：http://localhost:8080

## 📝 可用脚本

### 后端脚本
```bash
# 开发模式启动
yarn dev

# 生产模式启动
yarn start

# 运行测试
yarn test

# 运行测试并监听变化
yarn test:watch

# 生成测试覆盖率报告
yarn test:coverage

# CI环境测试
yarn test:ci
```

### 前端脚本
```bash
# 开发模式启动
yarn dev

# 构建生产版本
yarn build

# 预览构建结果
yarn preview

# 代码质量检查
yarn lint
```

## 🔧 配置说明

### 数据库配置
确保MongoDB服务正在运行，并根据需要修改连接字符串。

### 文件上传配置
- 支持的音频格式：MP3, WAV, FLAC, AAC, OGG
- 最大文件大小：10MB
- 上传目录：`node-backend/uploads/`

### CORS配置
开发环境下允许所有来源，生产环境请根据需要配置允许的域名。

## 🧪 测试

### 运行后端测试
```bash
cd node-backend
yarn test
```

### 运行前端测试
```bash
cd frontend-app
yarn test
```

## 📦 部署

### 构建生产版本

1. **构建前端**
   ```bash
   cd frontend-app
   yarn build
   ```

2. **配置生产环境变量**
   ```bash
   cd node-backend
   cp .env.example .env.production
   # 编辑 .env.production 文件
   ```

3. **启动生产服务器**
   ```bash
   NODE_ENV=production yarn start
   ```

### Docker部署（可选）
项目支持Docker容器化部署，详细配置请参考Docker相关文档。

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🐛 问题反馈

如果您发现任何问题或有改进建议，请在 [Issues](../../issues) 页面提交。

## 📞 联系方式

- 项目维护者：Azur
- 邮箱：synchron7777@gmail.com

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
