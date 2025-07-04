<template>
  <div class="qr-container">
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">二维码生成器</h1>
        <p class="page-desc">在线生成自定义二维码，支持文本、网址等内容</p>
      </div>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧：输入和设置区域 -->
      <el-col :span="12">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span>二维码设置</span>
            </div>
          </template>
          
          <div class="form-section">
            <label class="form-label">输入内容 *</label>
            <el-input
              v-model="qrText"
              type="textarea"
              :rows="4"
              placeholder="请输入要生成二维码的内容，如文本、网址、邮箱等..."
              maxlength="500"
              show-word-limit
              @input="generateQrCode"
            />
          </div>
          
          <div class="form-section">
            <label class="form-label">二维码尺寸：{{ qrSettings.size }}x{{ qrSettings.size }}px</label>
            <el-slider
              v-model="qrSettings.size"
              :min="200"
              :max="600"
              :step="50"
              show-stops
              @change="generateQrCode"
            />
            <div class="form-tip">拖动调整二维码的像素大小</div>
          </div>
          
          <div class="form-section">
            <label class="form-label">错误纠正级别：{{ getErrorCorrectionLabel(qrSettings.errorCorrectionLevel) }}</label>
            <el-slider
              v-model="errorCorrectionIndex"
              :min="0"
              :max="3"
              :step="1"
              show-stops
              @change="onErrorCorrectionChange"
            />
            <div class="form-tip">
              错误纠正级别越高，二维码越复杂，但容错能力越强
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">二维码边距：{{ qrSettings.margin }}px</label>
            <el-slider
              v-model="qrSettings.margin"
              :min="1"
              :max="10"
              :step="1"
              show-stops
              @change="generateQrCode"
            />
            <div class="form-tip">调整二维码周围的空白边距</div>
          </div>
          
          <div class="form-section">
            <label class="form-label">预设颜色</label>
            <div class="color-presets">
              <div 
                v-for="preset in colorPresets" 
                :key="preset.name"
                class="color-preset-item"
                :class="{ active: isActivePreset(preset) }"
                @click="applyColorPreset(preset)"
              >
                <div class="preset-colors">
                  <div class="preset-color" :style="{ backgroundColor: preset.dark }"></div>
                  <div class="preset-color" :style="{ backgroundColor: preset.light }"></div>
                </div>
                <span class="preset-name">{{ preset.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">自定义颜色</label>
            <div class="color-row">
              <div class="color-item">
                <span class="color-label">前景色</span>
                <div class="color-input-group">
                  <el-color-picker 
                    v-model="qrSettings.color.dark" 
                    @change="onDarkColorChange" 
                    class="color-picker"
                  />
                  <el-input
                    v-model="darkColorInput"
                    placeholder="#000000"
                    maxlength="7"
                    @input="onDarkColorInputChange"
                    @blur="validateDarkColor"
                    class="color-input"
                  >
                    <template #prepend>#</template>
                  </el-input>
                </div>
              </div>
              
              <div class="color-item">
                <span class="color-label">背景色</span>
                <div class="color-input-group">
                  <el-color-picker 
                    v-model="qrSettings.color.light" 
                    @change="onLightColorChange" 
                    class="color-picker"
                  />
                  <el-input
                    v-model="lightColorInput"
                    placeholder="#FFFFFF"
                    maxlength="7"
                    @input="onLightColorInputChange"
                    @blur="validateLightColor"
                    class="color-input"
                  >
                    <template #prepend>#</template>
                  </el-input>
                </div>
              </div>
            </div>
          </div>



        </el-card>

        <!-- 快速模板 -->
        <el-card class="template-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>快速模板</span>
            </div>
          </template>
          
          <div class="template-buttons">
            <el-button 
              size="small" 
              @click="applyTemplate('wifi')"
              type="primary"
              plain
            >
              <el-icon><Connection /></el-icon>
              WiFi 信息
            </el-button>
            <el-button 
              size="small" 
              @click="applyTemplate('contact')"
              type="success"
              plain
            >
              <el-icon><User /></el-icon>
              联系人
            </el-button>
            <el-button 
              size="small" 
              @click="applyTemplate('sms')"
              type="warning"
              plain
            >
              <el-icon><ChatDotSquare /></el-icon>
              短信
            </el-button>
            <el-button 
              size="small" 
              @click="applyTemplate('email')"
              type="info"
              plain
            >
              <el-icon><Message /></el-icon>
              邮件
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：预览和下载区域 -->
      <el-col :span="12">
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <span>二维码预览</span>
              <el-button 
                type="primary" 
                size="small" 
                :disabled="!qrDataUrl"
                @click="downloadQrCode"
              >
                <el-icon><Download /></el-icon>
                下载二维码
              </el-button>
            </div>
          </template>
          
          <div class="preview-section">
            <div v-if="loading" class="loading-container">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>生成中...</span>
            </div>
            
            <div v-else-if="qrDataUrl" class="qr-preview">
              <img :src="qrDataUrl" :alt="qrText" class="qr-image" />
              <div class="qr-info">
                <div class="info-item">
                  <span class="info-label">尺寸：</span>
                  <span class="info-value">{{ qrSettings.size }}x{{ qrSettings.size }}px</span>
                </div>
                <div class="info-item">
                  <span class="info-label">内容长度：</span>
                  <span class="info-value">{{ qrText.length }} 字符</span>
                </div>
                <div class="info-item">
                  <span class="info-label">纠错级别：</span>
                  <span class="info-value">{{ qrSettings.errorCorrectionLevel }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-preview">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <span>请输入内容开始生成二维码</span>
            </div>
          </div>
        </el-card>
        
        <!-- Logo 设置 -->
        <el-card class="logo-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>Logo 设置</span>
            </div>
          </template>
          
          <div class="logo-upload-section">
            <el-upload
              v-model:file-list="logoFileList"
              :limit="1"
              :auto-upload="false"
              :on-change="handleLogoChange"
              :on-remove="handleLogoRemove"
              accept="image/*"
              drag
              class="logo-upload"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将Logo图片拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JPG、PNG 格式，建议使用正方形图片，文件大小不超过5MB
                </div>
              </template>
            </el-upload>
            
            <div v-if="logoSettings.imageUrl" class="logo-preview-section">
              <div class="logo-preview-container">
                <img :src="logoSettings.imageUrl" alt="Logo预览" class="logo-preview-image" />
              </div>
              
              <div class="logo-controls">
                <div class="control-item">
                  <label class="form-label">Logo大小：{{ logoSettings.size }}%</label>
                  <el-slider
                    v-model="logoSettings.size"
                    :min="10"
                    :max="50"
                    :step="5"
                    show-stops
                    @change="generateQrCode"
                  />
                  <div class="form-tip">调整Logo相对于二维码的大小比例</div>
                </div>
                
                <div class="control-item">
                  <label class="form-label">透明度：{{ logoSettings.opacity }}%</label>
                  <el-slider
                    v-model="logoSettings.opacity"
                    :min="10"
                    :max="100"
                    :step="10"
                    show-stops
                    @change="generateQrCode"
                  />
                  <div class="form-tip">调整Logo的透明度</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

      </el-col>
    </el-row>
    
    <!-- 模板对话框 -->
    <el-dialog v-model="templateDialogVisible" :title="templateDialogTitle" width="500px">
      <el-form :model="templateForm" label-width="100px">
        <!-- WiFi 模板 -->
        <template v-if="currentTemplate === 'wifi'">
          <el-form-item label="网络名称">
            <el-input v-model="templateForm.ssid" placeholder="请输入WiFi名称" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="templateForm.password" placeholder="请输入WiFi密码" />
          </el-form-item>
          <el-form-item label="加密类型">
            <el-select v-model="templateForm.security">
              <el-option label="WPA/WPA2" value="WPA" />
              <el-option label="WEP" value="WEP" />
              <el-option label="无密码" value="nopass" />
            </el-select>
          </el-form-item>
        </template>
        
        <!-- 联系人模板 -->
        <template v-if="currentTemplate === 'contact'">
          <el-form-item label="姓名">
            <el-input v-model="templateForm.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="templateForm.phone" placeholder="请输入电话号码" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="templateForm.email" placeholder="请输入邮箱地址" />
          </el-form-item>
          <el-form-item label="公司">
            <el-input v-model="templateForm.company" placeholder="请输入公司名称" />
          </el-form-item>
        </template>
        
        <!-- 短信模板 -->
        <template v-if="currentTemplate === 'sms'">
          <el-form-item label="电话号码">
            <el-input v-model="templateForm.phone" placeholder="请输入电话号码" />
          </el-form-item>
          <el-form-item label="短信内容">
            <el-input v-model="templateForm.message" type="textarea" :rows="3" placeholder="请输入短信内容" />
          </el-form-item>
        </template>
        
        <!-- 邮件模板 -->
        <template v-if="currentTemplate === 'email'">
          <el-form-item label="收件人">
            <el-input v-model="templateForm.email" placeholder="请输入邮箱地址" />
          </el-form-item>
          <el-form-item label="主题">
            <el-input v-model="templateForm.subject" placeholder="请输入邮件主题" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="templateForm.body" type="textarea" :rows="3" placeholder="请输入邮件内容" />
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmTemplate">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Loading, 
  DocumentAdd, 
  Connection, 
  User, 
  ChatDotSquare, 
  Message,
  UploadFilled
} from '@element-plus/icons-vue'

// 响应式数据
const qrText = ref('')
const qrDataUrl = ref('')
const loading = ref(false)

// 二维码设置
const qrSettings = ref({
  size: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
})

// Logo设置
const logoSettings = ref({
  imageUrl: '',
  size: 20, // Logo大小比例 (10-50%)
  opacity: 90 // 透明度 (10-100%)
})

// Logo文件列表
const logoFileList = ref([])

// 错误纠正级别映射
const errorCorrectionLevels = ['L', 'M', 'Q', 'H']
const errorCorrectionLabels = ['低 (L)', '中 (M)', '高 (Q)', '最高 (H)']
const errorCorrectionIndex = ref(1) // 默认为 'M'

// 颜色输入框
const darkColorInput = ref('000000')
const lightColorInput = ref('FFFFFF')

// 颜色预设
const colorPresets = [
  { name: '黑白经典', dark: '#000000', light: '#FFFFFF' },
  { name: '蓝白商务', dark: '#1E40AF', light: '#FFFFFF' },
  { name: '红白活力', dark: '#DC2626', light: '#FFFFFF' },
  { name: '清新绿', dark: '#059669', light: '#FFFFFF' },
  { name: '科技紫', dark: '#7C3AED', light: '#FFFFFF' },
  { name: '暗黑模式', dark: '#FFFFFF', light: '#1F2937' },
  { name: '橙色活跃', dark: '#EA580C', light: '#FFFFFF' },
  { name: '温暖棕', dark: '#92400E', light: '#FEF3C7' }
]

// 模板相关
const templateDialogVisible = ref(false)
const templateDialogTitle = ref('')
const currentTemplate = ref('')
const templateForm = ref({})

// 生成二维码
const generateQrCode = async () => {
  if (!qrText.value.trim()) {
    qrDataUrl.value = ''
    return
  }
  
  loading.value = true
  
  try {
    const options = {
      width: qrSettings.value.size,
      margin: qrSettings.value.margin,
      color: {
        dark: qrSettings.value.color.dark,
        light: qrSettings.value.color.light
      },
      errorCorrectionLevel: qrSettings.value.errorCorrectionLevel
    }
    
    // 生成基础二维码
    const baseQrDataUrl = await QRCode.toDataURL(qrText.value, options)
    
    // 如果有Logo，则叠加Logo
    if (logoSettings.value.imageUrl) {
      qrDataUrl.value = await addLogoToQrCode(baseQrDataUrl)
    } else {
      qrDataUrl.value = baseQrDataUrl
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
    qrDataUrl.value = ''
  } finally {
    loading.value = false
  }
}

// 在二维码上叠加Logo
const addLogoToQrCode = (qrDataUrl) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const qrImage = new Image()
    qrImage.onload = () => {
      // 设置画布大小
      canvas.width = qrImage.width
      canvas.height = qrImage.height
      
      // 绘制二维码
      ctx.drawImage(qrImage, 0, 0)
      
      // 创建Logo图片
      const logoImage = new Image()
      logoImage.onload = () => {
        // 计算Logo尺寸和位置
        const logoSize = (qrImage.width * logoSettings.value.size) / 100
        const logoX = (qrImage.width - logoSize) / 2
        const logoY = (qrImage.height - logoSize) / 2
        
        // 设置透明度
        ctx.globalAlpha = logoSettings.value.opacity / 100
        
        // 在Logo周围绘制白色背景（提高识别率）
        const bgPadding = logoSize * 0.1
        ctx.globalAlpha = 1
        ctx.fillStyle = qrSettings.value.color.light
        ctx.fillRect(
          logoX - bgPadding,
          logoY - bgPadding,
          logoSize + bgPadding * 2,
          logoSize + bgPadding * 2
        )
        
        // 绘制Logo
        ctx.globalAlpha = logoSettings.value.opacity / 100
        ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
        
        // 重置透明度
        ctx.globalAlpha = 1
        
        // 返回合成后的图片
        resolve(canvas.toDataURL('image/png'))
      }
      logoImage.src = logoSettings.value.imageUrl
    }
    qrImage.src = qrDataUrl
  })
}

// 处理Logo文件上传
const handleLogoChange = (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 验证文件大小
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  
  // 读取文件并转换为base64
  const reader = new FileReader()
  reader.onload = (e) => {
    logoSettings.value.imageUrl = e.target.result
    generateQrCode()
  }
  reader.readAsDataURL(file)
}

// 移除Logo
const handleLogoRemove = () => {
  logoSettings.value.imageUrl = ''
  logoFileList.value = []
  generateQrCode()
}

// 下载二维码
const downloadQrCode = () => {
  if (!qrDataUrl.value) return
  
  const link = document.createElement('a')
  link.download = `qrcode_${Date.now()}.png`
  link.href = qrDataUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 应用模板
const applyTemplate = (type) => {
  currentTemplate.value = type
  templateForm.value = {}
  
  switch (type) {
    case 'wifi':
      templateDialogTitle.value = 'WiFi 信息二维码'
      templateForm.value = { ssid: '', password: '', security: 'WPA' }
      break
    case 'contact':
      templateDialogTitle.value = '联系人二维码'
      templateForm.value = { name: '', phone: '', email: '', company: '' }
      break
    case 'sms':
      templateDialogTitle.value = '短信二维码'
      templateForm.value = { phone: '', message: '' }
      break
    case 'email':
      templateDialogTitle.value = '邮件二维码'
      templateForm.value = { email: '', subject: '', body: '' }
      break
  }
  
  templateDialogVisible.value = true
}

// 确认模板
const confirmTemplate = () => {
  let content = ''
  
  switch (currentTemplate.value) {
    case 'wifi':
      content = `WIFI:T:${templateForm.value.security};S:${templateForm.value.ssid};P:${templateForm.value.password};;`
      break
    case 'contact':
      content = `BEGIN:VCARD\nVERSION:3.0\nFN:${templateForm.value.name}\nTEL:${templateForm.value.phone}\nEMAIL:${templateForm.value.email}\nORG:${templateForm.value.company}\nEND:VCARD`
      break
    case 'sms':
      content = `sms:${templateForm.value.phone}?body=${encodeURIComponent(templateForm.value.message)}`
      break
    case 'email':
      content = `mailto:${templateForm.value.email}?subject=${encodeURIComponent(templateForm.value.subject)}&body=${encodeURIComponent(templateForm.value.body)}`
      break
  }
  
  qrText.value = content
  generateQrCode()
  templateDialogVisible.value = false
}

// 获取错误纠正级别标签
const getErrorCorrectionLabel = (level) => {
  const index = errorCorrectionLevels.indexOf(level)
  return index !== -1 ? errorCorrectionLabels[index] : '中 (M)'
}

// 错误纠正级别变化处理
const onErrorCorrectionChange = (index) => {
  qrSettings.value.errorCorrectionLevel = errorCorrectionLevels[index]
  generateQrCode()
}

// 颜色处理函数
const hexToColorCode = (hex) => {
  return hex ? hex.replace('#', '').toUpperCase() : ''
}

const colorCodeToHex = (code) => {
  // 移除 # 号并转换为大写
  const cleanCode = code.replace('#', '').toUpperCase()
  
  // 验证格式
  if (!/^[0-9A-F]{6}$/.test(cleanCode)) {
    return null
  }
  
  return `#${cleanCode}`
}

// 前景色选择器变化
const onDarkColorChange = (color) => {
  darkColorInput.value = hexToColorCode(color)
  generateQrCode()
}

// 背景色选择器变化
const onLightColorChange = (color) => {
  lightColorInput.value = hexToColorCode(color)
  generateQrCode()
}

// 前景色输入框变化
const onDarkColorInputChange = (value) => {
  const cleanValue = value.replace('#', '')
  darkColorInput.value = cleanValue.toUpperCase()
  
  const hex = colorCodeToHex(cleanValue)
  if (hex && hex !== qrSettings.value.color.dark) {
    qrSettings.value.color.dark = hex
    generateQrCode()
  }
}

// 背景色输入框变化
const onLightColorInputChange = (value) => {
  const cleanValue = value.replace('#', '')
  lightColorInput.value = cleanValue.toUpperCase()
  
  const hex = colorCodeToHex(cleanValue)
  if (hex && hex !== qrSettings.value.color.light) {
    qrSettings.value.color.light = hex
    generateQrCode()
  }
}

// 验证前景色
const validateDarkColor = () => {
  const hex = colorCodeToHex(darkColorInput.value)
  if (hex) {
    qrSettings.value.color.dark = hex
    darkColorInput.value = hexToColorCode(hex)
  } else {
    // 恢复到原来的值
    darkColorInput.value = hexToColorCode(qrSettings.value.color.dark)
  }
  generateQrCode()
}

// 验证背景色
const validateLightColor = () => {
  const hex = colorCodeToHex(lightColorInput.value)
  if (hex) {
    qrSettings.value.color.light = hex
    lightColorInput.value = hexToColorCode(hex)
  } else {
    // 恢复到原来的值
    lightColorInput.value = hexToColorCode(qrSettings.value.color.light)
  }
  generateQrCode()
}

// 颜色预设处理
const applyColorPreset = (preset) => {
  qrSettings.value.color.dark = preset.dark
  qrSettings.value.color.light = preset.light
  
  // 更新输入框
  darkColorInput.value = hexToColorCode(preset.dark)
  lightColorInput.value = hexToColorCode(preset.light)
  
  generateQrCode()
}

// 检查是否是当前活跃的预设
const isActivePreset = (preset) => {
  return qrSettings.value.color.dark === preset.dark && 
         qrSettings.value.color.light === preset.light
}

// 组件挂载时的初始化
onMounted(() => {
  // 初始化错误纠正级别索引
  errorCorrectionIndex.value = errorCorrectionLevels.indexOf(qrSettings.value.errorCorrectionLevel)
  
  // 初始化颜色输入框
  darkColorInput.value = hexToColorCode(qrSettings.value.color.dark)
  lightColorInput.value = hexToColorCode(qrSettings.value.color.light)
  
  // 设置默认示例文本
  qrText.value = 'https://www.example.com'
  generateQrCode()
})
</script>

<style scoped>
.qr-container {
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

.settings-card, .preview-card, .template-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.form-section {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
}

.preview-section {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 12px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qr-preview {
  text-align: center;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.qr-info {
  text-align: left;
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-item:last-child {
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

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* 模板卡片样式 */
.template-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.template-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.template-buttons .el-button {
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.template-buttons .el-button .el-icon {
  font-size: 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 颜色预设样式 */
.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 8px;
}

.color-preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafbfc;
}

.color-preset-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.color-preset-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.preset-colors {
  display: flex;
  margin-bottom: 8px;
}

.preset-color {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.preset-color:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.preset-color:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.preset-name {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* 颜色输入组件样式 */
.color-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.color-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-picker {
  flex-shrink: 0;
}

/* Logo卡片样式 */
.logo-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.logo-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Logo上传样式 */
.logo-upload-section {
  padding: 0;
}

.logo-upload {
  margin-bottom: 16px;
}

.logo-upload .el-upload-dragger {
  width: 100%;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logo-upload .el-upload-dragger:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.logo-upload .el-icon--upload {
  font-size: 32px;
  color: #8c939d;
  margin-bottom: 8px;
}

.logo-upload .el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.logo-upload .el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.logo-upload .el-upload__tip {
  color: #8c939d;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

.logo-preview-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.logo-preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-preview-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
}

.logo-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.control-item .form-label {
  margin-bottom: 8px;
}

.color-input {
  flex: 1;
  min-width: 110px;
  max-width: 130px;
}

.color-input :deep(.el-input-group__prepend) {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

.color-input :deep(.el-input__inner) {
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

/* 取消Element Plus默认的按钮间距 */
.template-buttons .el-button + .el-button {
  margin-left: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qr-container {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .logo-card, .template-card {
    margin-top: 16px !important;
  }
  
  .template-buttons {
    grid-template-columns: 1fr;
  }
  
  .color-presets {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .color-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .color-input {
    max-width: 100%;
    width: 100%;
  }
}
</style>
