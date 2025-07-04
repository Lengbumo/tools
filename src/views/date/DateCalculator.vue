<template>
  <div class="date-calculator">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">日期计算器</h1>
        <p class="page-desc">提供多种日期计算功能，包括日期加减、差值计算、年龄计算等</p>
      </div>
    </div>

    <el-config-provider :locale="locale">
      <el-row :gutter="24">
        <!-- 日期加减计算 -->
        <el-col :span="12">
          <el-card class="calculator-card">
            <template #header>
              <div class="card-header">
                <span>日期加减计算</span>
                <el-button @click="clearDateAdd" :disabled="!addStartDate">
                  清空
                </el-button>
              </div>
            </template>
            
            <div class="calculator-content">
              <div class="input-group">
                <label class="input-label">起始日期：</label>
                <el-date-picker
                  v-model="addStartDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="calculateDateAdd"
                  style="width: 100%"
                />
              <div class="quick-dates">
                <el-button size="small" @click="setTodayAsStart">今天</el-button>
                <el-button size="small" @click="setYesterdayAsStart">昨天</el-button>
                <el-button size="small" @click="setTomorrowAsStart">明天</el-button>
              </div>
            </div>
            
            <div class="operation-section">
              <div class="operation-row">
                <el-radio-group v-model="addOperation" @change="calculateDateAdd">
                  <el-radio value="add">加上</el-radio>
                  <el-radio value="subtract">减去</el-radio>
                </el-radio-group>
              </div>
              
              <div class="duration-inputs">
                <div class="duration-item">
                  <el-input-number
                    v-model="addYears"
                    :min="0"
                    :max="100"
                    @change="calculateDateAdd"
                  />
                  <span>年</span>
                </div>
                <div class="duration-item">
                  <el-input-number
                    v-model="addMonths"
                    :min="0"
                    :max="12"
                    @change="calculateDateAdd"
                  />
                  <span>月</span>
                </div>
                <div class="duration-item">
                  <el-input-number
                    v-model="addDays"
                    :min="0"
                    :max="365"
                    @change="calculateDateAdd"
                  />
                  <span>天</span>
                </div>
              </div>
            </div>
            
            <div class="result-section">
              <div class="result-item">
                <label>计算结果：</label>
                <div class="result-value">
                  {{ addResult || '请选择日期并输入时间间隔' }}
                </div>
                <el-button 
                  v-if="addResult" 
                  @click="copyToClipboard(addResult)"
                  size="small"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              
              <div v-if="addResult" class="result-details">
                <div class="detail-item">
                  <span>星期：</span>
                  <span>{{ addResultWeekday }}</span>
                </div>
                <div class="detail-item">
                  <span>距离今天：</span>
                  <span>{{ addResultFromToday }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 日期差值计算 -->
      <el-col :span="12">
        <el-card class="calculator-card">
          <template #header>
            <div class="card-header">
              <span>日期差值计算</span>
              <el-button @click="clearDateDiff" :disabled="!diffStartDate && !diffEndDate">
                清空
              </el-button>
            </div>
          </template>
          
          <div class="calculator-content">
            <div class="input-group">
              <label class="input-label">开始日期：</label>
              <el-date-picker
                v-model="diffStartDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="calculateDateDiff"
                style="width: 100%"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">结束日期：</label>
              <el-date-picker
                v-model="diffEndDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="calculateDateDiff"
                style="width: 100%"
              />
              <div class="quick-actions">
                <el-button size="small" @click="setTodayAsEnd">设为今天</el-button>
                <el-button size="small" @click="swapDates">交换日期</el-button>
              </div>
            </div>
            
            <div class="result-section">
              <div v-if="diffResults.totalDays !== null" class="diff-results">
                <div class="result-grid">
                  <div class="result-card">
                    <div class="result-number">{{ Math.abs(diffResults.totalDays) }}</div>
                    <div class="result-label">总天数</div>
                  </div>
                  <div class="result-card">
                    <div class="result-number">{{ Math.abs(diffResults.totalWeeks) }}</div>
                    <div class="result-label">总周数</div>
                  </div>
                  <div class="result-card">
                    <div class="result-number">{{ Math.abs(diffResults.totalMonths) }}</div>
                    <div class="result-label">总月数</div>
                  </div>
                  <div class="result-card">
                    <div class="result-number">{{ Math.abs(diffResults.totalYears) }}</div>
                    <div class="result-label">总年数</div>
                  </div>
                </div>
                
                <div class="detailed-diff">
                  <div class="diff-detail">
                    <span>精确差值：</span>
                    <span class="diff-value">{{ diffResults.detailedDiff }}</span>
                  </div>
                  <div class="diff-detail">
                    <span>工作日：</span>
                    <span class="diff-value">{{ diffResults.workDays }} 天</span>
                  </div>
                  <div class="diff-detail">
                    <span>周末天数：</span>
                    <span class="diff-value">{{ diffResults.weekendDays }} 天</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-result">
                请选择开始和结束日期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 年龄计算 -->
      <el-col :span="12">
        <el-card class="calculator-card">
          <template #header>
            <div class="card-header">
              <span>年龄计算器</span>
              <el-button @click="clearAge" :disabled="!birthDate">
                清空
              </el-button>
            </div>
          </template>
          
          <div class="calculator-content">
            <div class="input-group">
              <label class="input-label">出生日期：</label>
              <el-date-picker
                v-model="birthDate"
                type="date"
                placeholder="选择出生日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="calculateAge"
                style="width: 100%"
              />
            </div>
            
            <div class="input-group">
              <label class="input-label">计算到日期：</label>
              <el-date-picker
                v-model="ageCalculateDate"
                type="date"
                placeholder="选择计算日期（默认今天）"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="calculateAge"
                style="width: 100%"
              />
              <div class="quick-dates">
                <el-button size="small" @click="setTodayAsAgeDate">设为今天</el-button>
              </div>
            </div>
            
            <div class="result-section">
              <div v-if="ageResults.years !== null" class="age-results">
                <div class="age-main">
                  <div class="age-number">{{ ageResults.years }}</div>
                  <div class="age-label">岁</div>
                </div>
                
                <div class="age-details">
                  <div class="age-detail">
                    <span>精确年龄：</span>
                    <span>{{ ageResults.detailed }}</span>
                  </div>
                  <div class="age-detail">
                    <span>总天数：</span>
                    <span>{{ ageResults.totalDays }} 天</span>
                  </div>
                  <div class="age-detail">
                    <span>总小时：</span>
                    <span>{{ ageResults.totalHours.toLocaleString() }} 小时</span>
                  </div>
                  <div class="age-detail">
                    <span>总分钟：</span>
                    <span>{{ ageResults.totalMinutes.toLocaleString() }} 分钟</span>
                  </div>
                  <div class="age-detail">
                    <span>下次生日：</span>
                    <span class="birthday-info">{{ ageResults.nextBirthday }}</span>
                  </div>
                  <div class="age-detail">
                    <span>距离生日：</span>
                    <span class="birthday-countdown">{{ ageResults.daysToNextBirthday }} 天</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-result">
                请选择出生日期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 倒计时计算 -->
      <el-col :span="12">
        <el-card class="calculator-card">
          <template #header>
            <div class="card-header">
              <span>倒计时计算</span>
              <el-button @click="clearCountdown" :disabled="!countdownDate">
                清空
              </el-button>
            </div>
          </template>
          
          <div class="calculator-content">
            <div class="input-group">
              <label class="input-label">目标日期：</label>
              <el-date-picker
                v-model="countdownDate"
                type="datetime"
                placeholder="选择目标日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="calculateCountdown"
                style="width: 100%"
              />
            </div>
            
            <div class="quick-countdown">
              <label class="input-label">快捷选择：</label>
              <div class="quick-buttons">
                <el-button size="small" @click="setQuickCountdown(1)">1天后</el-button>
                <el-button size="small" @click="setQuickCountdown(7)">1周后</el-button>
                <el-button size="small" @click="setQuickCountdown(30)">1月后</el-button>
                <el-button size="small" @click="setQuickCountdown(365)">1年后</el-button>
              </div>
            </div>
            
            <div class="result-section">
              <div v-if="countdownResults.isValid" class="countdown-results">
                <div class="countdown-status">
                  <div class="status-text" :class="countdownResults.isExpired ? 'expired' : 'active'">
                    {{ countdownResults.isExpired ? '已过期' : '倒计时中' }}
                  </div>
                </div>
                
                <div class="countdown-display">
                  <div class="countdown-item">
                    <div class="countdown-number">{{ countdownResults.days }}</div>
                    <div class="countdown-label">天</div>
                  </div>
                  <div class="countdown-item">
                    <div class="countdown-number">{{ countdownResults.hours }}</div>
                    <div class="countdown-label">小时</div>
                  </div>
                  <div class="countdown-item">
                    <div class="countdown-number">{{ countdownResults.minutes }}</div>
                    <div class="countdown-label">分钟</div>
                  </div>
                  <div class="countdown-item">
                    <div class="countdown-number">{{ countdownResults.seconds }}</div>
                    <div class="countdown-label">秒</div>
                  </div>
                </div>
                
                <div class="countdown-summary">
                  <div class="summary-item">
                    <span>总天数：</span>
                    <span>{{ Math.abs(countdownResults.totalDays) }} 天</span>
                  </div>
                  <div class="summary-item">
                    <span>总小时：</span>
                    <span>{{ Math.abs(countdownResults.totalHours).toLocaleString() }} 小时</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-result">
                请选择目标日期时间
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Element Plus 中文配置
const locale = zhCn

// 日期加减计算相关
const addStartDate = ref('')
const addOperation = ref('add')
const addYears = ref(0)
const addMonths = ref(0)
const addDays = ref(0)
const addResult = ref('')
const addResultWeekday = ref('')
const addResultFromToday = ref('')

// 日期差值计算相关
const diffStartDate = ref('')
const diffEndDate = ref('')
const diffResults = ref({
  totalDays: null,
  totalWeeks: null,
  totalMonths: null,
  totalYears: null,
  detailedDiff: '',
  workDays: null,
  weekendDays: null
})

// 年龄计算相关
const birthDate = ref('')
const ageCalculateDate = ref('')
const ageResults = ref({
  years: null,
  detailed: '',
  totalDays: null,
  totalHours: null,
  totalMinutes: null,
  nextBirthday: '',
  daysToNextBirthday: null
})

// 倒计时相关
const countdownDate = ref('')
const countdownResults = ref({
  isValid: false,
  isExpired: false,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalDays: 0,
  totalHours: 0
})
const countdownTimer = ref(null)

// 工具方法
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

const getWeekday = (date) => {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[new Date(date).getDay()]
}

const getDaysFromToday = (date) => {
  const today = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays === -1) return '昨天'
  if (diffDays > 0) return `${diffDays}天后`
  return `${Math.abs(diffDays)}天前`
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

// 日期加减计算
const calculateDateAdd = () => {
  if (!addStartDate.value) {
    addResult.value = ''
    addResultWeekday.value = ''
    addResultFromToday.value = ''
    return
  }
  
  try {
    const startDate = new Date(addStartDate.value)
    let resultDate = new Date(startDate)
    
    if (addOperation.value === 'add') {
      resultDate.setFullYear(resultDate.getFullYear() + (addYears.value || 0))
      resultDate.setMonth(resultDate.getMonth() + (addMonths.value || 0))
      resultDate.setDate(resultDate.getDate() + (addDays.value || 0))
    } else {
      resultDate.setFullYear(resultDate.getFullYear() - (addYears.value || 0))
      resultDate.setMonth(resultDate.getMonth() - (addMonths.value || 0))
      resultDate.setDate(resultDate.getDate() - (addDays.value || 0))
    }
    
    addResult.value = formatDate(resultDate)
    addResultWeekday.value = getWeekday(resultDate)
    addResultFromToday.value = getDaysFromToday(resultDate)
    
  } catch (error) {
    addResult.value = '计算错误'
    addResultWeekday.value = ''
    addResultFromToday.value = ''
  }
}

// 计算工作日
const calculateWorkDays = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let workDays = 0
  let weekendDays = 0
  
  const current = new Date(start)
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++
    } else {
      workDays++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return { workDays, weekendDays }
}

// 日期差值计算
const calculateDateDiff = () => {
  if (!diffStartDate.value || !diffEndDate.value) {
    diffResults.value = {
      totalDays: null,
      totalWeeks: null,
      totalMonths: null,
      totalYears: null,
      detailedDiff: '',
      workDays: null,
      weekendDays: null
    }
    return
  }
  
  try {
    const startDate = new Date(diffStartDate.value)
    const endDate = new Date(diffEndDate.value)
    
    const diffTime = endDate.getTime() - startDate.getTime()
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = Math.floor(totalDays / 30.44) // 平均每月天数
    const totalYears = Math.floor(totalDays / 365.25) // 考虑闰年
    
    // 计算精确差值
    let years = endDate.getFullYear() - startDate.getFullYear()
    let months = endDate.getMonth() - startDate.getMonth()
    let days = endDate.getDate() - startDate.getDate()
    
    if (days < 0) {
      months--
      const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
      days += lastMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    let detailedDiff = ''
    if (years > 0) detailedDiff += `${years}年`
    if (months > 0) detailedDiff += `${months}个月`
    if (days > 0) detailedDiff += `${days}天`
    if (!detailedDiff) detailedDiff = '0天'
    
    // 计算工作日
    const { workDays, weekendDays } = calculateWorkDays(
      startDate < endDate ? startDate : endDate,
      startDate < endDate ? endDate : startDate
    )
    
    diffResults.value = {
      totalDays,
      totalWeeks,
      totalMonths,
      totalYears,
      detailedDiff,
      workDays,
      weekendDays
    }
    
  } catch (error) {
    console.error('日期差值计算错误:', error)
  }
}

// 年龄计算
const calculateAge = () => {
  if (!birthDate.value) {
    ageResults.value = {
      years: null,
      detailed: '',
      totalDays: null,
      totalHours: null,
      totalMinutes: null,
      nextBirthday: '',
      daysToNextBirthday: null
    }
    return
  }
  
  try {
    const birth = new Date(birthDate.value)
    const calculateTo = ageCalculateDate.value ? new Date(ageCalculateDate.value) : new Date()
    
    // 计算年龄
    let years = calculateTo.getFullYear() - birth.getFullYear()
    let months = calculateTo.getMonth() - birth.getMonth()
    let days = calculateTo.getDate() - birth.getDate()
    
    if (days < 0) {
      months--
      const lastMonth = new Date(calculateTo.getFullYear(), calculateTo.getMonth(), 0)
      days += lastMonth.getDate()
    }
    
    if (months < 0) {
      years--
      months += 12
    }
    
    const detailed = `${years}岁${months}个月${days}天`
    
    // 计算总天数、小时、分钟
    const diffTime = calculateTo.getTime() - birth.getTime()
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60))
    const totalMinutes = Math.floor(diffTime / (1000 * 60))
    
    // 计算下次生日
    const currentYear = calculateTo.getFullYear()
    let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate())
    
    if (nextBirthday <= calculateTo) {
      nextBirthday.setFullYear(currentYear + 1)
    }
    
    const nextBirthdayStr = formatDate(nextBirthday)
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - calculateTo.getTime()) / (1000 * 60 * 60 * 24))
    
    ageResults.value = {
      years,
      detailed,
      totalDays,
      totalHours,
      totalMinutes,
      nextBirthday: nextBirthdayStr,
      daysToNextBirthday
    }
    
  } catch (error) {
    console.error('年龄计算错误:', error)
  }
}

// 倒计时计算
const calculateCountdown = () => {
  if (!countdownDate.value) {
    countdownResults.value = {
      isValid: false,
      isExpired: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      totalHours: 0
    }
    return
  }
  
  try {
    const now = new Date()
    const target = new Date(countdownDate.value)
    
    const diffTime = target.getTime() - now.getTime()
    const isExpired = diffTime < 0
    
    const totalDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24))
    const totalHours = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60))
    
    const days = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24))
    const hours = Math.floor((Math.abs(diffTime) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((Math.abs(diffTime) % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((Math.abs(diffTime) % (1000 * 60)) / 1000)
    
    countdownResults.value = {
      isValid: true,
      isExpired,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours
    }
    
  } catch (error) {
    console.error('倒计时计算错误:', error)
  }
}

// 快捷操作
const setTodayAsStart = () => {
  addStartDate.value = formatDate(new Date())
  calculateDateAdd()
}

const setYesterdayAsStart = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  addStartDate.value = formatDate(yesterday)
  calculateDateAdd()
}

const setTomorrowAsStart = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  addStartDate.value = formatDate(tomorrow)
  calculateDateAdd()
}

const setTodayAsEnd = () => {
  diffEndDate.value = formatDate(new Date())
  calculateDateDiff()
}

const swapDates = () => {
  const temp = diffStartDate.value
  diffStartDate.value = diffEndDate.value
  diffEndDate.value = temp
  calculateDateDiff()
}

const setTodayAsAgeDate = () => {
  ageCalculateDate.value = formatDate(new Date())
  calculateAge()
}

const setQuickCountdown = (days) => {
  const target = new Date()
  target.setDate(target.getDate() + days)
  
  // 确保使用本地时区而不是UTC，避免时区偏移问题
  const year = target.getFullYear()
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const day = String(target.getDate()).padStart(2, '0')
  const hours = String(target.getHours()).padStart(2, '0')
  const minutes = String(target.getMinutes()).padStart(2, '0')
  const seconds = String(target.getSeconds()).padStart(2, '0')
  
  countdownDate.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  calculateCountdown()
}

// 清空操作
const clearDateAdd = () => {
  addStartDate.value = ''
  addYears.value = 0
  addMonths.value = 0
  addDays.value = 0
  addResult.value = ''
  addResultWeekday.value = ''
  addResultFromToday.value = ''
}

const clearDateDiff = () => {
  diffStartDate.value = ''
  diffEndDate.value = ''
  diffResults.value = {
    totalDays: null,
    totalWeeks: null,
    totalMonths: null,
    totalYears: null,
    detailedDiff: '',
    workDays: null,
    weekendDays: null
  }
}

const clearAge = () => {
  birthDate.value = ''
  ageCalculateDate.value = ''
  ageResults.value = {
    years: null,
    detailed: '',
    totalDays: null,
    totalHours: null,
    totalMinutes: null,
    nextBirthday: '',
    daysToNextBirthday: null
  }
}

const clearCountdown = () => {
  countdownDate.value = ''
  countdownResults.value = {
    isValid: false,
    isExpired: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
    totalHours: 0
  }
}

// 启动倒计时定时器
const startCountdownTimer = () => {
  countdownTimer.value = setInterval(() => {
    if (countdownDate.value) {
      calculateCountdown()
    }
  }, 1000)
}

const stopCountdownTimer = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  // 初始化今天为年龄计算日期
  ageCalculateDate.value = formatDate(new Date())
  startCountdownTimer()
})

onUnmounted(() => {
  stopCountdownTimer()
})
</script>

<style scoped>
.date-calculator {
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

.calculator-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.calculator-content {
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

.quick-dates,
.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.operation-section {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.operation-row {
  margin-bottom: 16px;
}

.duration-inputs {
  display: flex;
  gap: 16px;
}

.duration-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-item span {
  font-size: 14px;
  color: #374151;
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
}

.result-details,
.result-formats {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item span:first-child {
  color: #6b7280;
}

.detail-item span:last-child {
  color: #374151;
  font-weight: 500;
}

/* 日期差值结果样式 */
.diff-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.result-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.result-number {
  font-size: 24px;
  font-weight: bold;
  color: #059669;
  margin-bottom: 4px;
}

.result-label {
  font-size: 12px;
  color: #6b7280;
}

.detailed-diff {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.diff-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.diff-detail:last-child {
  margin-bottom: 0;
}

.diff-value {
  font-weight: 500;
  color: #374151;
}

/* 年龄计算结果样式 */
.age-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.age-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.age-number {
  font-size: 48px;
  font-weight: bold;
  color: #059669;
}

.age-label {
  font-size: 20px;
  color: #374151;
}

.age-details {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.age-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.age-detail:last-child {
  margin-bottom: 0;
}

.birthday-info,
.birthday-countdown {
  font-weight: 500;
  color: #dc2626;
}

/* 倒计时样式 */
.quick-countdown {
  margin-bottom: 16px;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.countdown-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.countdown-status {
  text-align: center;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
}

.status-text.active {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-text.expired {
  background-color: #fee2e2;
  color: #dc2626;
}

.countdown-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.countdown-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.countdown-number {
  font-size: 28px;
  font-weight: bold;
  color: #059669;
  margin-bottom: 4px;
}

.countdown-label {
  font-size: 12px;
  color: #6b7280;
}

.countdown-summary {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.empty-result {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .date-calculator {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .duration-inputs {
    flex-direction: column;
    gap: 8px;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .countdown-display {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .age-number {
    font-size: 36px;
  }
  
  .countdown-number {
    font-size: 20px;
  }
  
  .quick-dates,
  .quick-actions,
  .quick-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .countdown-display {
    grid-template-columns: 1fr;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .result-item label {
    min-width: auto;
  }
}
</style> 