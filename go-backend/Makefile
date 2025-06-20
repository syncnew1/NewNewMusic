# NewNewMusic Go Backend Makefile

# 变量定义
APP_NAME=newnewmusic
GO_VERSION=1.21
DOCKER_IMAGE=$(APP_NAME):latest
DOCKER_COMPOSE=docker-compose

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
.PHONY: help
help: ## 显示帮助信息
	@echo "NewNewMusic Go Backend - 可用命令:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 开发相关命令
.PHONY: install
install: ## 安装Go依赖
	go mod download
	go mod tidy

.PHONY: run
run: ## 运行应用
	go run main.go

.PHONY: build
build: ## 构建应用
	go build -o bin/$(APP_NAME) main.go

.PHONY: test
test: ## 运行测试
	go test -v ./...

.PHONY: test-coverage
test-coverage: ## 运行测试并生成覆盖率报告
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

.PHONY: lint
lint: ## 运行代码检查
	golangci-lint run

.PHONY: fmt
fmt: ## 格式化代码
	go fmt ./...

.PHONY: vet
vet: ## 运行go vet
	go vet ./...

.PHONY: clean
clean: ## 清理构建文件
	rm -rf bin/
	rm -f coverage.out coverage.html

# Docker相关命令
.PHONY: docker-build
docker-build: ## 构建Docker镜像
	docker build -t $(DOCKER_IMAGE) .

.PHONY: docker-run
docker-run: ## 运行Docker容器
	docker run -p 8080:8080 --name $(APP_NAME) $(DOCKER_IMAGE)

.PHONY: docker-stop
docker-stop: ## 停止Docker容器
	docker stop $(APP_NAME) || true
	docker rm $(APP_NAME) || true

.PHONY: docker-logs
docker-logs: ## 查看Docker容器日志
	docker logs -f $(APP_NAME)

# Docker Compose相关命令
.PHONY: up
up: ## 启动所有服务 (Docker Compose)
	$(DOCKER_COMPOSE) up -d

.PHONY: down
down: ## 停止所有服务 (Docker Compose)
	$(DOCKER_COMPOSE) down

.PHONY: logs
logs: ## 查看所有服务日志
	$(DOCKER_COMPOSE) logs -f

.PHONY: restart
restart: ## 重启所有服务
	$(DOCKER_COMPOSE) restart

.PHONY: rebuild
rebuild: ## 重新构建并启动服务
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

# 数据库相关命令
.PHONY: db-up
db-up: ## 仅启动数据库服务
	$(DOCKER_COMPOSE) up -d mongodb redis

.PHONY: db-down
db-down: ## 停止数据库服务
	$(DOCKER_COMPOSE) stop mongodb redis

.PHONY: db-reset
db-reset: ## 重置数据库数据
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d mongodb

.PHONY: mongo-shell
mongo-shell: ## 连接到MongoDB shell
	$(DOCKER_COMPOSE) exec mongodb mongosh -u admin -p password --authenticationDatabase admin newnewmusic

# 开发环境命令
.PHONY: dev-setup
dev-setup: ## 设置开发环境
	mkdir -p uploads
	make install
	make db-up
	@echo "开发环境设置完成！"
	@echo "运行 'make run' 启动应用"

.PHONY: dev
dev: ## 启动开发环境
	make db-up
	sleep 5
	make run

# 生产环境命令
.PHONY: prod-build
prod-build: ## 生产环境构建
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-w -s' -o bin/$(APP_NAME) main.go

.PHONY: prod-deploy
prod-deploy: ## 生产环境部署
	make docker-build
	make up

# 健康检查
.PHONY: health
health: ## 检查应用健康状态
	curl -f http://localhost:8080/health || exit 1

# 备份和恢复
.PHONY: backup
backup: ## 备份数据库
	$(DOCKER_COMPOSE) exec mongodb mongodump --uri="mongodb://admin:password@localhost:27017/newnewmusic?authSource=admin" --out=/data/backup/$(shell date +%Y%m%d_%H%M%S)

.PHONY: restore
restore: ## 恢复数据库 (需要指定BACKUP_DIR)
	@if [ -z "$(BACKUP_DIR)" ]; then echo "请指定BACKUP_DIR，例如: make restore BACKUP_DIR=20231201_120000"; exit 1; fi
	$(DOCKER_COMPOSE) exec mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/newnewmusic?authSource=admin" /data/backup/$(BACKUP_DIR)/newnewmusic

# 监控和调试
.PHONY: ps
ps: ## 查看运行中的容器
	$(DOCKER_COMPOSE) ps

.PHONY: stats
stats: ## 查看容器资源使用情况
	docker stats

.PHONY: shell
shell: ## 进入应用容器shell
	$(DOCKER_COMPOSE) exec go-backend sh

# 代码质量
.PHONY: security
security: ## 运行安全检查
	gosec ./...

.PHONY: deps-check
deps-check: ## 检查依赖更新
	go list -u -m all

.PHONY: deps-update
deps-update: ## 更新依赖
	go get -u ./...
	go mod tidy

# 完整的CI/CD流程
.PHONY: ci
ci: fmt vet lint test ## 运行CI检查

.PHONY: pre-commit
pre-commit: fmt vet lint test ## 提交前检查
	@echo "所有检查通过，可以提交代码！"