# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 全局安装serve
RUN npm install -g serve

# 复制构建好的文件
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 80

# 启动静态文件服务器，支持SPA路由
CMD ["serve", "-s", "dist", "-l", "80"] 