<template>
  <div class="base64-container">
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">Base64 图片转换器</h1>
        <p class="page-desc">在线实现图片与Base64编码的相互转换</p>
      </div>
    </div>
    
    <el-row :gutter="24">
      <!-- 左侧：图片转Base64 -->
      <el-col :span="12">
        <el-card class="converter-card">
          <template #header>
            <div class="card-header">
              <span>图片转 Base64</span>
              <el-button 
                type="primary" 
                :disabled="!imageBase64"
                @click="copyBase64"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制编码
              </el-button>
            </div>
          </template>
          
          <!-- 上传区域 -->
          <div class="upload-section">
            <div 
              v-if="!imagePreview" 
              class="upload-area"
              @drop.prevent="handleDrop"
              @dragover.prevent
              @dragenter.prevent
            >
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">拖拽图片到这里，或</div>
              <el-button type="primary" @click="triggerFileSelect">选择图片</el-button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-tip">
                支持 JPG、PNG、GIF、WebP 等格式，最大 10MB
              </div>
            </div>
            
            <div v-else class="image-preview-section">
              <div class="preview-header">
                <span class="preview-title">图片预览</span>
                <el-button @click="resetImage">
                  <el-icon><RefreshLeft /></el-icon>
                  重新选择
                </el-button>
              </div>
              
              <div class="image-preview">
                <img :src="imagePreview" alt="预览图片" />
              </div>
              
              <div class="image-info">
                <div class="info-row">
                  <span class="info-label">文件名：</span>
                  <span class="info-value">{{ imageInfo.name }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">文件大小：</span>
                  <span class="info-value">{{ formatFileSize(imageInfo.size) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">图片尺寸：</span>
                  <span class="info-value">{{ imageInfo.width }} × {{ imageInfo.height }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Base64大小：</span>
                  <span class="info-value">{{ formatFileSize(imageBase64.length) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Base64输出 -->
          <div v-if="imageBase64" class="base64-output">
            <label class="output-label">Base64 编码：</label>
            <el-input
              v-model="imageBase64"
              type="textarea"
              :rows="6"
              readonly
              placeholder="Base64编码将在这里显示..."
              class="base64-textarea"
            />
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：Base64转图片 -->
      <el-col :span="12">
        <el-card class="converter-card">
          <template #header>
            <div class="card-header">
              <span>Base64 转图片</span>
              <el-button 
                type="primary" 
                :disabled="!decodedImage"
                @click="downloadImage"
              >
                <el-icon><Download /></el-icon>
                下载图片
              </el-button>
            </div>
          </template>
          
          <!-- Base64输入 -->
          <div class="base64-input-section">
            <label class="input-label">Base64 编码：</label>
            <el-input
              v-model="base64Input"
              type="textarea"
              :rows="6"
              placeholder="请粘贴Base64编码..."
              @input="decodeBase64"
              class="base64-textarea"
            />
            <div class="input-actions">
              <el-button @click="clearBase64Input">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
              <el-button @click="pasteFromClipboard">
                <el-icon><DocumentCopy /></el-icon>
                粘贴
              </el-button>
            </div>
          </div>
          
          <!-- 解码结果 -->
          <div class="decode-result">
            <div v-if="decodeError" class="error-message">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ decodeError }}</span>
            </div>
            
            <div v-else-if="decodedImage" class="decoded-image-section">
              <div class="decoded-header">
                <span class="decoded-title">解码图片</span>
              </div>
              
              <div class="decoded-image">
                <img :src="decodedImage" alt="解码图片" />
              </div>
              
              <div class="decoded-info">
                <div class="info-row">
                  <span class="info-label">图片格式：</span>
                  <span class="info-value">{{ decodedImageInfo.type }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">编码大小：</span>
                  <span class="info-value">{{ formatFileSize(base64Input.length) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else-if="!base64Input.trim()" class="empty-state">
              <el-icon class="empty-icon"><Picture /></el-icon>
              <span>请输入Base64编码</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const fileInput = ref(null)
const imagePreview = ref('')
const imageBase64 = ref('')
const imageInfo = ref({})

const base64Input = ref('')
const decodedImage = ref('')
const decodedImageInfo = ref({})
const decodeError = ref('')

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

// 处理拖拽上传
const handleDrop = (event) => {
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      processImageFile(file)
    } else {
      ElMessage.error('请上传图片文件')
    }
  }
}

// 处理图片文件
const processImageFile = (file) => {
  // 检查文件大小
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }
  
  const reader = new FileReader()
  
  reader.onload = (e) => {
    const dataUrl = e.target.result
    imagePreview.value = dataUrl
    imageBase64.value = dataUrl
    
    // 获取图片信息
    const img = new Image()
    img.onload = () => {
      imageInfo.value = {
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
        type: file.type
      }
    }
    img.src = dataUrl
  }
  
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  
  reader.readAsDataURL(file)
}

// 重置图片
const resetImage = () => {
  imagePreview.value = ''
  imageBase64.value = ''
  imageInfo.value = {}
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 复制Base64编码
const copyBase64 = async () => {
  try {
    await navigator.clipboard.writeText(imageBase64.value)
    ElMessage.success('Base64编码已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = imageBase64.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('Base64编码已复制到剪贴板')
  }
}

// 解码Base64
const decodeBase64 = () => {
  decodeError.value = ''
  decodedImage.value = ''
  
  if (!base64Input.value.trim()) {
    return
  }
  
  try {
    let base64Data = base64Input.value.trim()
    
    // 检查是否是完整的data URL
    if (!base64Data.startsWith('data:')) {
      // 尝试自动添加常见的图片头部
      if (base64Data.startsWith('/9j/')) {
        base64Data = 'data:image/jpeg;base64,' + base64Data
      } else if (base64Data.startsWith('iVBORw0KGgo')) {
        base64Data = 'data:image/png;base64,' + base64Data
      } else if (base64Data.startsWith('R0lGOD')) {
        base64Data = 'data:image/gif;base64,' + base64Data
      } else {
        base64Data = 'data:image/png;base64,' + base64Data
      }
    }
    
    // 验证base64格式
    const img = new Image()
    img.onload = () => {
      decodedImage.value = base64Data
      
      // 提取图片信息
      const mimeMatch = base64Data.match(/data:image\/([^;]+)/)
      decodedImageInfo.value = {
        type: mimeMatch ? mimeMatch[1].toUpperCase() : 'Unknown',
        width: img.width,
        height: img.height
      }
    }
    
    img.onerror = () => {
      decodeError.value = '无效的Base64编码，请检查输入内容'
    }
    
    img.src = base64Data
    
  } catch (error) {
    decodeError.value = '解码失败，请检查Base64格式是否正确'
  }
}

// 清空输入
const clearBase64Input = () => {
  base64Input.value = ''
  decodedImage.value = ''
  decodedImageInfo.value = {}
  decodeError.value = ''
}

// 从剪贴板粘贴
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    base64Input.value = text
    await nextTick()
    decodeBase64()
    ElMessage.success('已粘贴剪贴板内容')
  } catch (error) {
    ElMessage.error('无法访问剪贴板，请手动粘贴')
  }
}

// 下载图片
const downloadImage = () => {
  if (!decodedImage.value) return
  
  const link = document.createElement('a')
  link.download = `decoded_image_${Date.now()}.${decodedImageInfo.value.type?.toLowerCase() || 'png'}`
  link.href = decodedImage.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.base64-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-desc {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.converter-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafbfc;
  transition: border-color 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.upload-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 16px;
}

.upload-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
}

/* 图片预览样式 */
.image-preview-section {
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-weight: 500;
  color: #374151;
}

.image-preview {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9fafb;
  text-align: center;
  margin-bottom: 16px;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 信息显示样式 */
.image-info, .decoded-info {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

/* Base64输入输出样式 */
.base64-output, .base64-input-section {
  margin-bottom: 20px;
}

.output-label, .input-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.base64-textarea {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.input-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 解码结果样式 */
.decode-result {
  min-height: 200px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.decoded-image-section {
  margin-bottom: 20px;
}

.decoded-header {
  margin-bottom: 12px;
}

.decoded-title {
  font-weight: 500;
  color: #374151;
}

.decoded-image {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9fafb;
  text-align: center;
  margin-bottom: 16px;
}

.decoded-image img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .base64-container {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .upload-area {
    padding: 30px 15px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .upload-text {
    font-size: 14px;
  }
  
  .image-preview img,
  .decoded-image img {
    max-height: 150px;
  }
}
</style>
