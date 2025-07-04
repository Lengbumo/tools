# Docker 环境检查脚本
# 使用方法: .\check-docker.ps1

Write-Host "🔍 检查 Docker 环境..." -ForegroundColor Green

$errors = @()

# 检查 Docker 是否安装
Write-Host "`n📦 检查 Docker..." -ForegroundColor Blue
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker 已安装: $dockerVersion" -ForegroundColor Green
} catch {
    $errors += "❌ Docker 未安装或未启动"
    Write-Host "❌ Docker 未安装或未启动" -ForegroundColor Red
}

# 检查 Docker Compose 是否安装
Write-Host "`n📦 检查 Docker Compose..." -ForegroundColor Blue
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose 已安装: $composeVersion" -ForegroundColor Green
} catch {
    $errors += "❌ Docker Compose 未安装"
    Write-Host "❌ Docker Compose 未安装" -ForegroundColor Red
}

# 检查 Docker 守护进程是否运行
Write-Host "`n🔧 检查 Docker 守护进程..." -ForegroundColor Blue
try {
    docker info | Out-Null
    Write-Host "✅ Docker 守护进程正在运行" -ForegroundColor Green
} catch {
    $errors += "❌ Docker 守护进程未运行"
    Write-Host "❌ Docker 守护进程未运行，请启动 Docker Desktop" -ForegroundColor Red
}

# 检查端口是否被占用
Write-Host "`n🌐 检查端口占用..." -ForegroundColor Blue
$ports = @(80, 8999)
foreach ($port in $ports) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
        Write-Host "⚠️  端口 $port 已被占用" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ 端口 $port 可用" -ForegroundColor Green
    }
}

# 检查项目文件
Write-Host "`n📁 检查项目文件..." -ForegroundColor Blue
$requiredFiles = @("Dockerfile", "docker-compose.yml", "package.json")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file 存在" -ForegroundColor Green
    } else {
        $errors += "❌ $file 不存在"
        Write-Host "❌ $file 不存在" -ForegroundColor Red
    }
}

# 总结
Write-Host "`n📊 检查结果:" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "🎉 所有检查通过！可以开始 Docker 部署" -ForegroundColor Green
    Write-Host "`n🚀 建议的下一步操作:" -ForegroundColor Yellow
    Write-Host "   .\deploy.ps1 dev   # 启动开发环境" -ForegroundColor White
    Write-Host "   .\deploy.ps1 prod  # 启动生产环境" -ForegroundColor White
} else {
    Write-Host "❌ 发现 $($errors.Count) 个问题需要解决:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   $error" -ForegroundColor Red
    }
    Write-Host "`n💡 解决建议:" -ForegroundColor Yellow
    Write-Host "   1. 安装 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "   2. 启动 Docker Desktop 应用" -ForegroundColor White
    Write-Host "   3. 确保所有必需文件存在" -ForegroundColor White
} 