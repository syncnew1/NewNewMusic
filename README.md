# NewNewMusic

## 项目简介
NewNewMusic 是一个功能丰富的现代音乐播放器应用，结合了强大的后端服务和直观的前端界面。它旨在提供无缝的音乐播放体验，支持用户管理、歌曲收藏等核心功能。

## 功能特性
- **用户认证与授权**：安全的用户注册、登录和基于JWT的身份验证。
- **歌曲管理**：展示、播放和搜索音乐。
- **用户收藏**：用户可以收藏自己喜欢的歌曲。
- **响应式设计**：适应不同设备的屏幕尺寸。
- **现代UI风格**：提供美观、直观的用户界面。

## 安装步骤
1. 克隆项目仓库
```
git clone https://github.com/yourusername/NewNewMusic.git
```
2. 进入项目目录
```
cd NewNewMusic
```
3. 安装依赖
```
npm install
```
4. 启动开发服务器 (Web)
```
npm run dev
```


## 使用方法
1. 访问 http://localhost:5173/
2. 浏览歌曲列表
3. 点击歌曲开始播放
4. 使用播放器控件控制播放

## 技术栈
- React
- Tailwind CSS
- Vite
- Spring Boot (后端框架)
- MongoDB (数据库)
- RESTful API (接口规范)

## 贡献指南
1. 在提交 issue 前，请先搜索是否已有类似问题
2. 提交 pull request 时，请确保代码风格一致并附带测试
3. 遵循 Git 提交规范，使用 Conventional Commits
4. 新功能开发前请先创建 feature 分支

## API 文档
访问 [API 文档](http://localhost:8080/swagger-ui.html) 查看详细接口说明

## 部署步骤

### 1. 构建前端项目
```bash
cd frontend-app
npm install
npm run build
```

### 2. 打包后端项目
```bash
mvn clean package
```

### 3. 启动服务
```bash
java -jar target/newnewmusic.jar
```

### 4. 解决Git SSL证书问题 (可选)
如果在克隆或拉取项目时遇到 `SSL certificate problem: unable to get local issuer certificate` 错误，可以通过以下命令配置Git忽略SSL验证：
```bash
git config --global http.sslVerify false
```
**注意**：此操作会降低Git操作的安全性，建议仅在开发环境或明确了解风险的情况下使用。在生产环境中，应配置正确的SSL证书。