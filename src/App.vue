<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import QrCodeIcon from '@/components/icons/QrCodeIcon.vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="230px" class="sidebar">
      <div class="logo">
        <el-icon><Tools /></el-icon>
        <span>在线工具箱</span>
      </div>
      
      <!-- 工具导航菜单 -->
      <el-menu
        :router="true"
        :default-active="activeMenu"
        class="menu"
        :collapse="false"
        unique-opened
      >
        <!-- 图片工具 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>图片工具</span>
          </template>
          <el-menu-item index="/image/ocr">
            <el-icon><Document /></el-icon>
            <span>OCR文字识别</span>
          </el-menu-item>
          <el-menu-item index="/image/compression">
            <el-icon><ScaleToOriginal /></el-icon>
            <span>图片压缩</span>
          </el-menu-item>
          <el-menu-item index="/image/qr-generator">
            <el-icon><QrCodeIcon /></el-icon>
            <span>二维码生成</span>
          </el-menu-item>
          <el-menu-item index="/image/base64-converter">
            <el-icon><Switch /></el-icon>
            <span>Base64转换</span>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 文本工具 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><DocumentCopy /></el-icon>
            <span>文本工具</span>
          </template>
          <el-menu-item index="/text/json">
            <el-icon><Tickets /></el-icon>
            <span>JSON格式化</span>
          </el-menu-item>
          <el-menu-item index="/text/comparison">
            <el-icon><Files /></el-icon>
            <span>文本对比</span>
          </el-menu-item>
        </el-sub-menu>
        
        <!-- 视频工具 -->
        <!-- <el-sub-menu index="3">
          <template #title>
            <el-icon><VideoPlay /></el-icon>
            <span>视频工具</span>
          </template>
          <el-menu-item index="/video/compression">
            <el-icon><Film /></el-icon>
            <span>视频压缩</span>
          </el-menu-item>
        </el-sub-menu> -->
        
        <!-- 日期工具 -->
        <el-sub-menu index="4">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>日期工具</span>
          </template>
          <el-menu-item index="/date/timestamp">
            <el-icon><Clock /></el-icon>
            <span>时间戳转换</span>
          </el-menu-item>
          <el-menu-item index="/date/calculator">
            <el-icon><Stopwatch /></el-icon>
            <span>日期计算</span>
          </el-menu-item>
          <el-menu-item index="/date/cron">
            <el-icon><Timer /></el-icon>
            <span>Cron表达式</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f7fa;
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8fafc;
}

.logo .el-icon {
  margin-right: 10px;
  font-size: 24px;
}

.menu {
  border-right: none;
  flex: 1;
}

.el-menu-item, .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
}

.el-menu-item .el-icon, .el-sub-menu__title .el-icon {
  margin-right: 10px;
  font-size: 18px;
  vertical-align: middle;
}

.el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
  border-right: 3px solid #409eff;
}

.main-container {
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
  width: calc(100% - 230px);
}

.el-main {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.el-empty {
  padding: 40px 0;
}
</style>
