<template>
  <div class="timestamp-converter">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">时间戳转换器</h1>
        <p class="page-desc">在线时间戳与日期时间相互转换，支持多种格式和时区</p>
      </div>
    </div>

    <el-config-provider :locale="locale">

    <!-- 当前时间戳显示 -->
    <el-card class="current-time-card">
      <template #header>
        <div class="card-header">
          <span>当前时间戳</span>
          <el-switch
            v-model="autoRefresh"
            active-text="自动刷新"
            inactive-text="手动刷新"
            @change="handleAutoRefreshChange"
          />
        </div>
      </template>
      
      <div class="current-time-display">
        <div class="time-row">
          <div class="time-item">
            <label>当前时间：</label>
            <span class="time-value">{{ currentDateTime }}</span>
          </div>
          <el-button @click="refreshCurrentTime" :disabled="autoRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <div class="time-row">
          <div class="time-item">
            <label>时间戳（秒）：</label>
            <span class="time-value">{{ currentTimestamp }}</span>
          </div>
          <el-button @click="copyToClipboard(currentTimestamp)">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
        
        <div class="time-row">
          <div class="time-item">
            <label>时间戳（毫秒）：</label>
            <span class="time-value">{{ currentTimestampMs }}</span>
          </div>
          <el-button @click="copyToClipboard(currentTimestampMs)">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="24">
      <!-- 时间戳转日期 -->
      <el-col :span="12">
        <el-card class="converter-card">
          <template #header>
            <div class="card-header">
              <span>时间戳转日期</span>
              <el-button 
                type="primary" 
                @click="clearTimestampInput"
                :disabled="!timestampInput"
              >
                清空
              </el-button>
            </div>
          </template>
          
          <div class="converter-content">
            <div class="input-group">
              <label class="input-label">时间戳：</label>
              <el-input
                v-model="timestampInput"
                placeholder="请输入时间戳（支持秒和毫秒）"
                @input="convertTimestampToDate"
              />
              <div class="input-tip">
                支持10位（秒）或13位（毫秒）时间戳
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">时间格式：</label>
              <el-select v-model="timestampFormat" @change="convertTimestampToDate">
                <el-option label="自动识别" value="auto" />
                <el-option label="秒级时间戳" value="seconds" />
                <el-option label="毫秒级时间戳" value="milliseconds" />
              </el-select>
            </div>
            
            <div class="input-group">
              <label class="input-label">时区：</label>
              <el-select v-model="selectedTimezone" @change="convertTimestampToDate">
                <el-option 
                  v-for="tz in timezones" 
                  :key="tz.value" 
                  :label="tz.label" 
                  :value="tz.value" 
                />
              </el-select>
            </div>
            
            <div class="result-section">
              <div class="result-item">
                <label>转换结果：</label>
                <div class="result-value">
                  {{ timestampResult || '请输入有效的时间戳' }}
                </div>
                <el-button 
                  v-if="timestampResult" 
                  @click="copyToClipboard(timestampResult)"
                  size="small"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              
              <div v-if="timestampResult" class="result-formats">
                <div class="format-item">
                  <span class="format-label">ISO格式：</span>
                  <span class="format-value">{{ timestampResultISO }}</span>
                  <el-button @click="copyToClipboard(timestampResultISO)" size="small">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
                <div class="format-item">
                  <span class="format-label">相对时间：</span>
                  <span class="format-value">{{ timestampResultRelative }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 日期转时间戳 -->
      <el-col :span="12">
        <el-card class="converter-card">
          <template #header>
            <div class="card-header">
              <span>日期转时间戳</span>
              <el-button 
                type="primary" 
                @click="clearDateInput"
                :disabled="!dateInput"
              >
                清空
              </el-button>
            </div>
          </template>
          
          <div class="converter-content">
            <div class="input-group">
              <label class="input-label">日期时间：</label>
              <el-date-picker
                v-model="dateInput"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="convertDateToTimestamp"
                style="width: 100%"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">或手动输入：</label>
              <el-input
                v-model="dateInputManual"
                placeholder="格式：2024-01-01 12:00:00"
                @input="convertDateToTimestamp"
              />
              <div class="input-tip">
                支持格式：YYYY-MM-DD HH:mm:ss 或 YYYY/MM/DD HH:mm:ss
              </div>
            </div>
            
            <div class="input-group">
              <label class="input-label">时区：</label>
              <el-select v-model="selectedTimezone" @change="convertDateToTimestamp">
                <el-option 
                  v-for="tz in timezones" 
                  :key="tz.value" 
                  :label="tz.label" 
                  :value="tz.value" 
                />
              </el-select>
            </div>
            
            <div class="result-section">
              <div class="result-item">
                <label>时间戳（秒）：</label>
                <div class="result-value">
                  {{ dateResultSeconds || '请输入有效的日期时间' }}
                </div>
                <el-button 
                  v-if="dateResultSeconds" 
                  @click="copyToClipboard(dateResultSeconds)"
                  size="small"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              
              <div class="result-item">
                <label>时间戳（毫秒）：</label>
                <div class="result-value">
                  {{ dateResultMs || '请输入有效的日期时间' }}
                </div>
                <el-button 
                  v-if="dateResultMs" 
                  @click="copyToClipboard(dateResultMs)"
                  size="small"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 批量转换 -->
    <el-card class="batch-converter-card">
      <template #header>
        <div class="card-header">
          <span>批量转换</span>
          <div class="batch-actions">
            <el-button @click="clearBatchInput" :disabled="!batchInput.trim()">
              清空输入
            </el-button>
            <el-button type="primary" @click="processBatchConversion" :disabled="!batchInput.trim()">
              开始转换
            </el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="batch-input-section">
            <div class="input-group">
              <label class="input-label">批量输入：</label>
              <el-input
                v-model="batchInput"
                type="textarea"
                :rows="8"
                placeholder="每行一个时间戳或日期时间，支持混合输入&#10;例如：&#10;1640995200&#10;2024-01-01 12:00:00&#10;1640995200000"
              />
              <div class="input-tip">
                支持时间戳（秒/毫秒）和日期时间格式混合输入
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="batch-result-section">
            <div class="result-header">
              <label class="input-label">转换结果：</label>
              <el-button 
                v-if="batchResults.length > 0" 
                @click="copyBatchResults"
                size="small"
              >
                <el-icon><CopyDocument /></el-icon>
                复制全部
              </el-button>
            </div>
            <div class="batch-results">
              <div v-if="batchResults.length === 0" class="empty-results">
                转换结果将在这里显示
              </div>
              <div v-else class="results-list">
                <div 
                  v-for="(result, index) in batchResults" 
                  :key="index"
                  class="result-row"
                  :class="{ 'error': result.error }"
                >
                  <div class="result-input">{{ result.input }}</div>
                  <div class="result-arrow">→</div>
                  <div class="result-output">
                    {{ result.error || result.output }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, CopyDocument } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Element Plus 中文配置
const locale = zhCn

// 响应式数据
const currentTime = ref(new Date())
const autoRefresh = ref(true)
const refreshTimer = ref(null)

// 时间戳转日期相关
const timestampInput = ref('')
const timestampFormat = ref('auto')
const selectedTimezone = ref('Asia/Shanghai')
const timestampResult = ref('')
const timestampResultISO = ref('')
const timestampResultRelative = ref('')

// 日期转时间戳相关
const dateInput = ref('')
const dateInputManual = ref('')
const dateResultSeconds = ref('')
const dateResultMs = ref('')

// 批量转换相关
const batchInput = ref('')
const batchResults = ref([])

// 支持的时区
const timezones = ref([
  { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '纽约时间 (UTC-5/-4)', value: 'America/New_York' },
  { label: '洛杉矶时间 (UTC-8/-7)', value: 'America/Los_Angeles' },
  { label: '伦敦时间 (UTC+0/+1)', value: 'Europe/London' },
  { label: '巴黎时间 (UTC+1/+2)', value: 'Europe/Paris' },
  { label: '悉尼时间 (UTC+10/+11)', value: 'Australia/Sydney' },
  { label: 'UTC时间', value: 'UTC' }
])

// 计算属性
const currentDateTime = computed(() => {
  return formatDateTime(currentTime.value)
})

const currentTimestamp = computed(() => {
  return Math.floor(currentTime.value.getTime() / 1000)
})

const currentTimestampMs = computed(() => {
  return currentTime.value.getTime()
})

// 方法
const formatDateTime = (date, timezone = 'Asia/Shanghai') => {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace(/\//g, '-')
  } catch (error) {
    return date.toLocaleString('zh-CN')
  }
}

const refreshCurrentTime = () => {
  currentTime.value = new Date()
}

const handleAutoRefreshChange = (value) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  refreshTimer.value = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
}

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text.toString())
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text.toString()
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  }
}

const convertTimestampToDate = () => {
  if (!timestampInput.value) {
    timestampResult.value = ''
    timestampResultISO.value = ''
    timestampResultRelative.value = ''
    return
  }
  
  try {
    let timestamp = parseInt(timestampInput.value)
    
    if (isNaN(timestamp)) {
      timestampResult.value = '无效的时间戳'
      return
    }
    
    // 自动识别格式
    if (timestampFormat.value === 'auto') {
      if (timestamp.toString().length === 10) {
        timestamp = timestamp * 1000
      } else if (timestamp.toString().length === 13) {
        // 已是毫秒，无需转换
      } else {
        timestampResult.value = '时间戳长度不正确'
        return
      }
    } else if (timestampFormat.value === 'seconds') {
      timestamp = timestamp * 1000
    }
    
    const date = new Date(timestamp)
    
    if (isNaN(date.getTime())) {
      timestampResult.value = '无效的时间戳'
      return
    }
    
    timestampResult.value = formatDateTime(date, selectedTimezone.value)
    timestampResultISO.value = date.toISOString()
    timestampResultRelative.value = getRelativeTime(date)
    
  } catch (error) {
    timestampResult.value = '转换失败'
    timestampResultISO.value = ''
    timestampResultRelative.value = ''
  }
}

const convertDateToTimestamp = () => {
  let inputDate = dateInput.value || dateInputManual.value
  
  if (!inputDate) {
    dateResultSeconds.value = ''
    dateResultMs.value = ''
    return
  }
  
  try {
    let date
    
    if (typeof inputDate === 'string') {
      // 支持多种格式
      inputDate = inputDate.replace(/\//g, '-')
      date = new Date(inputDate)
    } else {
      date = new Date(inputDate)
    }
    
    if (isNaN(date.getTime())) {
      dateResultSeconds.value = '无效的日期时间'
      dateResultMs.value = '无效的日期时间'
      return
    }
    
    dateResultSeconds.value = Math.floor(date.getTime() / 1000)
    dateResultMs.value = date.getTime()
    
  } catch (error) {
    dateResultSeconds.value = '转换失败'
    dateResultMs.value = '转换失败'
  }
}

const getRelativeTime = (date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) {
    return diffSeconds === 0 ? '刚刚' : `${Math.abs(diffSeconds)}秒${diffSeconds > 0 ? '前' : '后'}`
  } else if (diffMinutes < 60) {
    return `${Math.abs(diffMinutes)}分钟${diffMinutes > 0 ? '前' : '后'}`
  } else if (diffHours < 24) {
    return `${Math.abs(diffHours)}小时${diffHours > 0 ? '前' : '后'}`
  } else if (diffDays < 30) {
    return `${Math.abs(diffDays)}天${diffDays > 0 ? '前' : '后'}`
  } else {
    return '很久以前'
  }
}

const clearTimestampInput = () => {
  timestampInput.value = ''
  timestampResult.value = ''
  timestampResultISO.value = ''
  timestampResultRelative.value = ''
}

const clearDateInput = () => {
  dateInput.value = ''
  dateInputManual.value = ''
  dateResultSeconds.value = ''
  dateResultMs.value = ''
}

const clearBatchInput = () => {
  batchInput.value = ''
  batchResults.value = []
}

const processBatchConversion = () => {
  if (!batchInput.value.trim()) {
    ElMessage.warning('请输入要转换的内容')
    return
  }
  
  const lines = batchInput.value.split('\n').filter(line => line.trim())
  const results = []
  
  lines.forEach(line => {
    const input = line.trim()
    if (!input) return
    
    try {
      // 尝试作为时间戳解析
      if (/^\d+$/.test(input)) {
        let timestamp = parseInt(input)
        
        if (input.length === 10) {
          timestamp = timestamp * 1000
        } else if (input.length !== 13) {
          results.push({
            input,
            output: '',
            error: '时间戳长度不正确'
          })
          return
        }
        
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) {
          results.push({
            input,
            output: '',
            error: '无效的时间戳'
          })
          return
        }
        
        results.push({
          input,
          output: formatDateTime(date, selectedTimezone.value),
          error: null
        })
      } 
      // 尝试作为日期时间解析
      else {
        const normalizedInput = input.replace(/\//g, '-')
        const date = new Date(normalizedInput)
        
        if (isNaN(date.getTime())) {
          results.push({
            input,
            output: '',
            error: '无效的日期格式'
          })
          return
        }
        
        const timestamp = Math.floor(date.getTime() / 1000)
        results.push({
          input,
          output: `${timestamp} (${date.getTime()})`,
          error: null
        })
      }
    } catch (error) {
      results.push({
        input,
        output: '',
        error: '转换失败'
      })
    }
  })
  
  batchResults.value = results
  ElMessage.success(`批量转换完成，共处理 ${results.length} 条记录`)
}

const copyBatchResults = () => {
  const resultText = batchResults.value
    .map(result => `${result.input} → ${result.error || result.output}`)
    .join('\n')
  
  copyToClipboard(resultText)
}

// 生命周期
onMounted(() => {
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.timestamp-converter {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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

.current-time-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.converter-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.batch-converter-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.current-time-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-item label {
  font-weight: 500;
  color: #374151;
  min-width: 120px;
}

.time-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #059669;
}

.converter-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input-tip {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.result-section {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item label {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
}

.result-value {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #059669;
  word-break: break-all;
}

.result-formats {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 12px;
}

.format-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.format-item:last-child {
  margin-bottom: 0;
}

.format-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
  font-size: 12px;
}

.format-value {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #374151;
  word-break: break-all;
}

.batch-input-section,
.batch-result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-results {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
  max-height: 300px;
  overflow-y: auto;
}

.empty-results {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}

.results-list {
  padding: 12px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.result-row:last-child {
  margin-bottom: 0;
}

.result-row.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.result-row.error .result-output {
  color: #dc2626;
}

.result-input {
  flex: 1;
  color: #374151;
  word-break: break-all;
}

.result-arrow {
  color: #6b7280;
  font-weight: bold;
}

.result-output {
  flex: 2;
  color: #059669;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timestamp-converter {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .time-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .time-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .time-item label {
    min-width: auto;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .result-item label {
    min-width: auto;
  }
  
  .format-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .format-label {
    min-width: auto;
  }
  
  .result-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .result-arrow {
    align-self: center;
  }
}
</style> 