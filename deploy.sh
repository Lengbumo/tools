#!/bin/bash

# 在线工具箱 Docker 部署脚本
# 使用方法: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 开始部署在线工具箱..."
echo "环境: $ENVIRONMENT"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查docker-compose是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装，请先安装 docker-compose"
    exit 1
fi

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 根据环境选择配置文件
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "🌐 启动生产环境..."
    docker-compose -f docker-compose.prod.yml up -d
    PORT=80
else
    echo "🔧 启动开发环境..."
    docker-compose up -d
    PORT=8999
fi

# 检查容器状态
echo "⏳ 等待容器启动..."
sleep 5

if docker ps --filter "name=tools-web" --format "table {{.Status}}" | grep -q "Up"; then
    echo "✅ 部署成功！"
    echo "📱 应用地址: http://localhost:$PORT"
    echo "🔍 查看日志: docker-compose logs -f"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose logs
    exit 1
fi

echo "🎉 部署脚本执行完成！" 