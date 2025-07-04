<template>
  <div class="cron-expression">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">Cron表达式工具</h1>
        <p class="page-desc">在线生成和解析Cron表达式，支持可视化配置和执行时间预测</p>
      </div>
    </div>

    <el-config-provider :locale="locale">
      <el-row :gutter="24">
        <!-- 可视化生成器 -->
        <el-col :span="12">
          <el-card class="generator-card">
            <template #header>
              <div class="card-header">
                <span>可视化生成器</span>
                <el-button @click="resetGenerator">重置</el-button>
              </div>
            </template>
            
            <div class="generator-content">
              <!-- 类型选择 -->
              <div class="type-selector">
                <el-radio-group v-model="cronType" @change="handleTypeChange">
                  <el-radio value="second">秒级</el-radio>
                  <el-radio value="minute">分钟级</el-radio>
                  <el-radio value="hour">小时级</el-radio>
                  <el-radio value="day">日级</el-radio>
                  <el-radio value="custom">自定义</el-radio>
                </el-radio-group>
              </div>

              <!-- 秒配置 -->
              <div v-if="cronType === 'second' || cronType === 'custom'" class="time-config">
                <label class="config-label">秒 (0-59)：</label>
                <el-radio-group v-model="cronConfig.secondType" @change="updateCronExpression">
                  <el-radio value="*">每秒</el-radio>
                  <el-radio value="interval">间隔</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.secondType === 'interval'" class="interval-config">
                  <span>每</span>
                  <el-input-number v-model="cronConfig.secondInterval" :min="1" :max="59" @change="updateCronExpression" />
                  <span>秒执行</span>
                </div>
                
                <div v-if="cronConfig.secondType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificSeconds" @change="updateCronExpression">
                    <el-checkbox v-for="n in 60" :key="n-1" :value="n-1">{{ n-1 }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 分钟配置 -->
              <div v-if="cronType !== 'second' || cronType === 'custom'" class="time-config">
                <label class="config-label">分钟 (0-59)：</label>
                <el-radio-group v-model="cronConfig.minuteType" @change="updateCronExpression">
                  <el-radio value="*">每分钟</el-radio>
                  <el-radio value="interval">间隔</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.minuteType === 'interval'" class="interval-config">
                  <span>每</span>
                  <el-input-number v-model="cronConfig.minuteInterval" :min="1" :max="59" @change="updateCronExpression" />
                  <span>分钟执行</span>
                </div>
                
                <div v-if="cronConfig.minuteType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificMinutes" @change="updateCronExpression">
                    <el-checkbox v-for="n in 60" :key="n-1" :value="n-1">{{ n-1 }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 小时配置 -->
              <div v-if="cronType === 'hour' || cronType === 'day' || cronType === 'custom'" class="time-config">
                <label class="config-label">小时 (0-23)：</label>
                <el-radio-group v-model="cronConfig.hourType" @change="updateCronExpression">
                  <el-radio value="*">每小时</el-radio>
                  <el-radio value="interval">间隔</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.hourType === 'interval'" class="interval-config">
                  <span>每</span>
                  <el-input-number v-model="cronConfig.hourInterval" :min="1" :max="23" @change="updateCronExpression" />
                  <span>小时执行</span>
                </div>
                
                <div v-if="cronConfig.hourType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificHours" @change="updateCronExpression">
                    <el-checkbox v-for="n in 24" :key="n-1" :value="n-1">{{ n-1 }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 日期配置 -->
              <div v-if="cronType === 'day' || cronType === 'custom'" class="time-config">
                <label class="config-label">日期 (1-31)：</label>
                <el-radio-group v-model="cronConfig.dayType" @change="updateCronExpression">
                  <el-radio value="*">每天</el-radio>
                  <el-radio value="interval">间隔</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.dayType === 'interval'" class="interval-config">
                  <span>每</span>
                  <el-input-number v-model="cronConfig.dayInterval" :min="1" :max="31" @change="updateCronExpression" />
                  <span>天执行</span>
                </div>
                
                <div v-if="cronConfig.dayType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificDays" @change="updateCronExpression">
                    <el-checkbox v-for="n in 31" :key="n" :value="n">{{ n }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 月份配置 -->
              <div v-if="cronType === 'day' || cronType === 'custom'" class="time-config">
                <label class="config-label">月份 (1-12)：</label>
                <el-radio-group v-model="cronConfig.monthType" @change="updateCronExpression">
                  <el-radio value="*">每月</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.monthType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificMonths" @change="updateCronExpression">
                    <el-checkbox v-for="(month, index) in months" :key="index+1" :value="index+1">
                      {{ month }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 星期配置 -->
              <div v-if="cronType === 'day' || cronType === 'custom'" class="time-config">
                <label class="config-label">星期 (0-6, 0=周日)：</label>
                <el-radio-group v-model="cronConfig.weekType" @change="updateCronExpression">
                  <el-radio value="*">每天</el-radio>
                  <el-radio value="specific">指定</el-radio>
                </el-radio-group>
                
                <div v-if="cronConfig.weekType === 'specific'" class="specific-config">
                  <el-checkbox-group v-model="cronConfig.specificWeeks" @change="updateCronExpression">
                    <el-checkbox v-for="(week, index) in weeks" :key="index" :value="index">
                      {{ week }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <!-- 生成的表达式 -->
              <div class="generated-expression">
                <label class="config-label">生成的Cron表达式：</label>
                <div class="expression-display">
                  <el-input v-model="generatedExpression" readonly />
                  <el-button @click="copyToClipboard(generatedExpression)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                  <el-button type="primary" @click="useGeneratedExpression">使用</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 表达式解析 -->
        <el-col :span="12">
          <el-card class="parser-card">
            <template #header>
              <div class="card-header">
                <span>表达式解析</span>
                <el-button @click="clearParser">清空</el-button>
              </div>
            </template>
            
            <div class="parser-content">
              <!-- 输入框 -->
              <div class="input-group">
                <label class="input-label">Cron表达式：</label>
                <el-input
                  v-model="inputExpression"
                  placeholder="例如：0 0 12 * * ? 表示每天12点执行"
                  @input="parseCronExpression"
                />
                <div class="input-tip">
                  标准格式：秒 分 时 日 月 周 [年]
                </div>
              </div>

              <!-- 常用模板 -->
              <div class="template-section">
                <label class="section-label">常用模板：</label>
                <div class="template-grid">
                  <div 
                    v-for="template in cronTemplates" 
                    :key="template.name"
                    class="template-item"
                    @click="selectTemplate(template)"
                  >
                    <div class="template-name">{{ template.name }}</div>
                    <div class="template-expression">{{ template.expression }}</div>
                    <div class="template-desc">{{ template.description }}</div>
                  </div>
                </div>
              </div>

              <!-- 解析结果 -->
              <div class="result-section">
                <div v-if="parseResult.isValid" class="parse-success">
                  <div class="result-item">
                    <label>表达式含义：</label>
                    <div class="result-value">{{ parseResult.description }}</div>
                  </div>
                  
                  <div class="result-item">
                    <label>下次执行时间：</label>
                    <div class="result-value next-time">{{ parseResult.nextExecution }}</div>
                  </div>
                  
                  <div class="result-item">
                    <label>未来5次执行时间：</label>
                    <div class="future-executions">
                      <div v-for="(time, index) in parseResult.futureExecutions" :key="index" class="future-time">
                        {{ time }}
                      </div>
                    </div>
                  </div>

                  <div class="result-item">
                    <label>表达式字段解析：</label>
                    <div class="field-breakdown">
                      <div class="field-item">
                        <span class="field-name">秒：</span>
                        <span class="field-value">{{ parseResult.fields.second }}</span>
                      </div>
                      <div class="field-item">
                        <span class="field-name">分：</span>
                        <span class="field-value">{{ parseResult.fields.minute }}</span>
                      </div>
                      <div class="field-item">
                        <span class="field-name">时：</span>
                        <span class="field-value">{{ parseResult.fields.hour }}</span>
                      </div>
                      <div class="field-item">
                        <span class="field-name">日：</span>
                        <span class="field-value">{{ parseResult.fields.day }}</span>
                      </div>
                      <div class="field-item">
                        <span class="field-name">月：</span>
                        <span class="field-value">{{ parseResult.fields.month }}</span>
                      </div>
                      <div class="field-item">
                        <span class="field-name">周：</span>
                        <span class="field-value">{{ parseResult.fields.week }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else-if="inputExpression && !parseResult.isValid" class="parse-error">
                  <el-alert
                    title="表达式格式错误"
                    :description="parseResult.error"
                    type="error"
                    show-icon
                  />
                </div>
                
                <div v-else class="parse-empty">
                  <el-empty description="请输入Cron表达式或选择模板" />
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { Cron } from 'croner'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Element Plus 中文配置
const locale = zhCn

// 响应式数据
const cronType = ref('minute')
const inputExpression = ref('')
const generatedExpression = ref('0 * * * * *')

// 可视化生成器配置
const cronConfig = ref({
  secondType: '*',
  secondInterval: 1,
  specificSeconds: [],
  minuteType: '*',
  minuteInterval: 1,
  specificMinutes: [],
  hourType: '*',
  hourInterval: 1,
  specificHours: [],
  dayType: '*',
  dayInterval: 1,
  specificDays: [],
  monthType: '*',
  specificMonths: [],
  weekType: '*',
  specificWeeks: []
})

// 解析结果
const parseResult = ref({
  isValid: false,
  description: '',
  nextExecution: '',
  futureExecutions: [],
  fields: {
    second: '',
    minute: '',
    hour: '',
    day: '',
    month: '',
    week: ''
  },
  error: ''
})

// 常量
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 常用模板
const cronTemplates = ref([
  { name: '每分钟', expression: '0 * * * * *', description: '每分钟执行一次' },
  { name: '每小时', expression: '0 0 * * * *', description: '每小时执行一次' },
  { name: '每天午夜', expression: '0 0 0 * * *', description: '每天0点执行' },
  { name: '每天中午', expression: '0 0 12 * * *', description: '每天12点执行' },
  { name: '每周一', expression: '0 0 0 * * 1', description: '每周一0点执行' },
  { name: '每月1号', expression: '0 0 0 1 * *', description: '每月1号0点执行' },
  { name: '工作日上班', expression: '0 0 9 * * 1-5', description: '工作日上午9点执行' },
  { name: '工作日下班', expression: '0 0 18 * * 1-5', description: '工作日下午6点执行' },
  { name: '每5分钟', expression: '0 */5 * * * *', description: '每5分钟执行一次' },
  { name: '每15分钟', expression: '0 */15 * * * *', description: '每15分钟执行一次' },
  { name: '每30分钟', expression: '0 */30 * * * *', description: '每30分钟执行一次' },
  { name: '每年1月1日', expression: '0 0 0 1 1 *', description: '每年1月1日0点执行' }
])

// 方法
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('已复制到剪贴板')
  }
}

const handleTypeChange = () => {
  resetGenerator()
  updateCronExpression()
}

const resetGenerator = () => {
  cronConfig.value = {
    secondType: '*',
    secondInterval: 1,
    specificSeconds: [],
    minuteType: '*',
    minuteInterval: 1,
    specificMinutes: [],
    hourType: '*',
    hourInterval: 1,
    specificHours: [],
    dayType: '*',
    dayInterval: 1,
    specificDays: [],
    monthType: '*',
    specificMonths: [],
    weekType: '*',
    specificWeeks: []
  }
}

const updateCronExpression = () => {
  const parts = []
  
  // 秒
  if (cronType.value === 'second' || cronType.value === 'custom') {
    if (cronConfig.value.secondType === '*') {
      parts.push('*')
    } else if (cronConfig.value.secondType === 'interval') {
      parts.push(`*/${cronConfig.value.secondInterval}`)
    } else if (cronConfig.value.secondType === 'specific') {
      parts.push(cronConfig.value.specificSeconds.join(',') || '0')
    }
  } else {
    parts.push('0')
  }
  
  // 分
  if (cronType.value === 'minute' || cronType.value === 'hour' || cronType.value === 'day' || cronType.value === 'custom') {
    if (cronConfig.value.minuteType === '*') {
      parts.push(cronType.value === 'minute' ? '*' : '0')
    } else if (cronConfig.value.minuteType === 'interval') {
      parts.push(`*/${cronConfig.value.minuteInterval}`)
    } else if (cronConfig.value.minuteType === 'specific') {
      parts.push(cronConfig.value.specificMinutes.join(',') || '0')
    }
  } else {
    parts.push('*')
  }
  
  // 时
  if (cronType.value === 'hour' || cronType.value === 'day' || cronType.value === 'custom') {
    if (cronConfig.value.hourType === '*') {
      parts.push(cronType.value === 'hour' ? '*' : '0')
    } else if (cronConfig.value.hourType === 'interval') {
      parts.push(`*/${cronConfig.value.hourInterval}`)
    } else if (cronConfig.value.hourType === 'specific') {
      parts.push(cronConfig.value.specificHours.join(',') || '0')
    }
  } else {
    parts.push('*')
  }
  
  // 日
  if (cronType.value === 'day' || cronType.value === 'custom') {
    if (cronConfig.value.dayType === '*') {
      parts.push('*')
    } else if (cronConfig.value.dayType === 'interval') {
      parts.push(`*/${cronConfig.value.dayInterval}`)
    } else if (cronConfig.value.dayType === 'specific') {
      parts.push(cronConfig.value.specificDays.join(',') || '*')
    }
  } else {
    parts.push('*')
  }
  
  // 月
  if (cronType.value === 'day' || cronType.value === 'custom') {
    if (cronConfig.value.monthType === '*') {
      parts.push('*')
    } else if (cronConfig.value.monthType === 'specific') {
      parts.push(cronConfig.value.specificMonths.join(',') || '*')
    }
  } else {
    parts.push('*')
  }
  
  // 周
  if (cronType.value === 'day' || cronType.value === 'custom') {
    if (cronConfig.value.weekType === '*') {
      parts.push('*')
    } else if (cronConfig.value.weekType === 'specific') {
      parts.push(cronConfig.value.specificWeeks.join(',') || '*')
    }
  } else {
    parts.push('*')
  }
  
  generatedExpression.value = parts.join(' ')
}

const useGeneratedExpression = () => {
  inputExpression.value = generatedExpression.value
  parseCronExpression()
  ElMessage.success('已使用生成的表达式')
}

const selectTemplate = (template) => {
  inputExpression.value = template.expression
  parseCronExpression()
  ElMessage.success(`已选择模板：${template.name}`)
}

const clearParser = () => {
  inputExpression.value = ''
  parseResult.value = {
    isValid: false,
    description: '',
    nextExecution: '',
    futureExecutions: [],
    fields: {
      second: '',
      minute: '',
      hour: '',
      day: '',
      month: '',
      week: ''
    },
    error: ''
  }
}

const parseCronExpression = () => {
  if (!inputExpression.value.trim()) {
    parseResult.value.isValid = false
    return
  }
  
  try {
    const cron = new Cron(inputExpression.value)
    
    // 解析字段
    const parts = inputExpression.value.split(' ')
    const fields = {
      second: parts[0] || '*',
      minute: parts[1] || '*',
      hour: parts[2] || '*',
      day: parts[3] || '*',
      month: parts[4] || '*',
      week: parts[5] || '*'
    }
    
    // 生成描述
    const description = generateDescription(fields)
    
    // 获取下次执行时间
    const nextExecution = cron.nextRun()
    
    // 获取未来5次执行时间
    const futureExecutions = []
    let current = new Date()
    for (let i = 0; i < 5; i++) {
      const next = cron.nextRun(current)
      if (next) {
        futureExecutions.push(formatDateTime(next))
        current = new Date(next.getTime() + 1000) // 加1秒避免重复
      }
    }
    
    parseResult.value = {
      isValid: true,
      description,
      nextExecution: nextExecution ? formatDateTime(nextExecution) : '无',
      futureExecutions,
      fields,
      error: ''
    }
    
  } catch (error) {
    parseResult.value = {
      isValid: false,
      description: '',
      nextExecution: '',
      futureExecutions: [],
      fields: {
        second: '',
        minute: '',
        hour: '',
        day: '',
        month: '',
        week: ''
      },
      error: error.message || '表达式格式错误'
    }
  }
}

const generateDescription = (fields) => {
  const descriptions = []
  
  // 解析秒
  if (fields.second !== '*') {
    if (fields.second.includes('/')) {
      const interval = fields.second.split('/')[1]
      descriptions.push(`每${interval}秒`)
    } else if (fields.second.includes(',')) {
      descriptions.push(`第${fields.second}秒`)
    } else {
      descriptions.push(`第${fields.second}秒`)
    }
  }
  
  // 解析分钟
  if (fields.minute !== '*') {
    if (fields.minute.includes('/')) {
      const interval = fields.minute.split('/')[1]
      descriptions.push(`每${interval}分钟`)
    } else if (fields.minute.includes(',')) {
      descriptions.push(`第${fields.minute}分钟`)
    } else {
      descriptions.push(`第${fields.minute}分钟`)
    }
  }
  
  // 解析小时
  if (fields.hour !== '*') {
    if (fields.hour.includes('/')) {
      const interval = fields.hour.split('/')[1]
      descriptions.push(`每${interval}小时`)
    } else if (fields.hour.includes(',')) {
      descriptions.push(`第${fields.hour}小时`)
    } else {
      descriptions.push(`${fields.hour}点`)
    }
  }
  
  // 解析日期
  if (fields.day !== '*') {
    if (fields.day.includes('/')) {
      const interval = fields.day.split('/')[1]
      descriptions.push(`每${interval}天`)
    } else if (fields.day.includes(',')) {
      descriptions.push(`第${fields.day}天`)
    } else {
      descriptions.push(`${fields.day}号`)
    }
  }
  
  // 解析月份
  if (fields.month !== '*') {
    if (fields.month.includes(',')) {
      descriptions.push(`第${fields.month}月`)
    } else {
      descriptions.push(`${fields.month}月`)
    }
  }
  
  // 解析星期
  if (fields.week !== '*') {
    if (fields.week.includes(',')) {
      const weekNums = fields.week.split(',')
      const weekNames = weekNums.map(num => weeks[parseInt(num)])
      descriptions.push(`${weekNames.join('、')}`)
    } else if (fields.week.includes('-')) {
      descriptions.push(`${fields.week.replace('-', '到')}`)
    } else {
      descriptions.push(`${weeks[parseInt(fields.week)]}`)
    }
  }
  
  return descriptions.length > 0 ? descriptions.join('，') : '每秒执行'
}

const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(/\//g, '-')
}

// 生命周期
onMounted(() => {
  updateCronExpression()
})
</script>

<style scoped>
.cron-expression {
  max-width: 1400px;
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

.generator-card,
.parser-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 800px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #374151;
}

.generator-content,
.parser-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.type-selector {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

.time-config {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.config-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.interval-config {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.specific-config {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
}

.specific-config .el-checkbox {
  margin-right: 12px;
  margin-bottom: 8px;
}

.generated-expression {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
}

.expression-display {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.expression-display .el-input {
  flex: 1;
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
  margin-top: 4px;
}

.template-section {
  margin-top: 16px;
}

.section-label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.template-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
}

.template-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.template-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.template-expression {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 2px 4px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 12px;
  color: #6b7280;
}

.result-section {
  margin-top: 16px;
}

.parse-success {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item label {
  font-weight: 500;
  color: #374151;
}

.result-value {
  color: #1f2937;
  font-size: 14px;
}

.next-time {
  color: #059669;
  font-weight: 500;
}

.future-executions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.future-time {
  font-size: 14px;
  color: #6b7280;
  padding: 4px 8px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.field-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #f9fafb;
  border-radius: 4px;
  font-size: 12px;
}

.field-name {
  font-weight: 500;
  color: #374151;
}

.field-value {
  color: #6b7280;
  font-family: 'Consolas', 'Monaco', monospace;
}

.parse-error {
  margin-top: 16px;
}

.parse-empty {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .cron-expression {
    padding: 0 16px;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .field-breakdown {
    grid-template-columns: 1fr;
  }
  
  .expression-display {
    flex-direction: column;
  }
}
</style> 