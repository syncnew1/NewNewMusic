# NewNewMusic

## 项目简介
NewNewMusic 是一个现代音乐播放器应用，采用 React 前端框架构建，提供流畅的音乐播放体验和直观的用户界面。

## 功能特性
- 歌曲列表展示
- 音乐播放控制
- 响应式设计
- 现代UI风格

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
4. 启动开发服务器
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
1. 构建前端项目
```
npm run build
```
2. 打包后端项目
```
mvn clean package
```
3. 启动服务
```
java -jar target/newnewmusic.jar
```