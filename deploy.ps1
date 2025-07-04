# 在线工具箱 Docker 部署脚本
# 使用方法: .\deploy.ps1 [dev|prod]

param(
    [string]$Environment = "dev"
)

Write-Host "🚀 开始部署在线工具箱..." -ForegroundColor Green
Write-Host "环境: $Environment" -ForegroundColor Yellow

# 检查Docker是否安装
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安装，请先安装 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 检查docker-compose是否可用
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ docker-compose 未安装，请先安装 docker-compose" -ForegroundColor Red
    exit 1
}

try {
    # 构建镜像
    Write-Host "🔨 构建 Docker 镜像..." -ForegroundColor Blue
    docker-compose build --no-cache

    # 停止现有容器
    Write-Host "🛑 停止现有容器..." -ForegroundColor Yellow
    docker-compose down

    # 根据环境选择配置文件
    if ($Environment -eq "prod") {
        Write-Host "🌐 启动生产环境..." -ForegroundColor Green
        docker-compose -f docker-compose.prod.yml up -d
        $Port = "80"
    } else {
        Write-Host "🔧 启动开发环境..." -ForegroundColor Green
        docker-compose up -d
        $Port = "8999"
    }

    # 检查容器状态
    Start-Sleep -Seconds 5
    $ContainerStatus = docker ps --filter "name=tools-web" --format "table {{.Status}}"
    
    if ($ContainerStatus -like "*Up*") {
        Write-Host "✅ 部署成功！" -ForegroundColor Green
        Write-Host "📱 应用地址: http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "🔍 查看日志: docker-compose logs -f" -ForegroundColor Gray
    } else {
        Write-Host "❌ 部署失败，请检查日志" -ForegroundColor Red
        docker-compose logs
    }

} catch {
    Write-Host "❌ 部署过程中发生错误: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 部署脚本执行完成！" -ForegroundColor Green 