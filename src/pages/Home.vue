<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-foreground">Token 使用量儀表板</h1>
            <p class="text-sm text-muted-foreground mt-1">公司內部 AI Token 消耗統計與分析</p>
          </div>
          <div class="flex gap-2 items-center">
            <ThemeToggle />
            <button
              @click="exportCSV"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              匯出 CSV
            </button>
            <router-link
              to="/cost-analysis"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              成本分析
            </router-link>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:opacity-90 transition text-sm"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="home-main-content" class="container py-8">
      <!-- Top Alert -->
      <TopBudgetAlert v-if="topAlerts.length > 0" :alerts="topAlerts" class="mb-6" />

      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">篩選條件</h2>
          <button
            @click="resetFilters"
            class="text-sm text-primary hover:opacity-80 transition"
          >
            重設篩選
          </button>
        </div>
        <div class="flex flex-wrap gap-6 items-end">
          <!-- Date Range -->
          <div class="flex gap-4 items-end flex-wrap">
            <div class="relative min-w-[140px]">
              <label class="block text-sm font-medium text-foreground mb-2">開始日期</label>
              <DatePicker
                v-model="dateRange.startDate"
                :error="isDateRangeInvalid"
              />
              <p v-if="dateRangeError" class="absolute top-full left-0 text-xs text-red-500 mt-1 whitespace-nowrap">{{ dateRangeError }}</p>
            </div>
            <div class="min-w-[140px]">
              <label class="block text-sm font-medium text-foreground mb-2">結束日期</label>
              <DatePicker
                v-model="dateRange.endDate"
                :error="isDateRangeInvalid"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="setLast7Days"
                :class="['px-3 py-2 text-sm rounded-md transition', activeDateShortcut === 7 ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'bg-secondary text-foreground hover:opacity-90']"
              >
                最近 7 天
              </button>
              <button
                @click="setLast14Days"
                :class="['px-3 py-2 text-sm rounded-md transition', activeDateShortcut === 14 ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'bg-secondary text-foreground hover:opacity-90']"
              >
                最近 14 天
              </button>
              <button
                @click="setLast30Days"
                :class="['px-3 py-2 text-sm rounded-md transition', activeDateShortcut === 30 ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'bg-secondary text-foreground hover:opacity-90']"
              >
                最近 30 天
              </button>
            </div>
          </div>

          <!-- Model Filter -->
          <div class="flex gap-3 items-end flex-wrap">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                選擇模型
              </label>
              <MultiSelectDropdown
                v-model="selectedModels"
                :options="availableModels"
                placeholder="請選擇模型"
              />
            </div>
          </div>
        </div>
        <div class="mt-6">
          <p class="text-xs text-muted-foreground">
            顯示 {{ filteredRecords.length }} 筆記錄（共 {{ tokenRecords.length }} 筆）
          </p>
        </div>
      </div>

      <template v-if="filteredRecords.length === 0">
        <EmptyState>
          <template #action>
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition font-medium"
            >
              重置篩選條件
            </button>
          </template>
        </EmptyState>
      </template>
      <template v-else>
        <!-- Summary Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">總 Token</p>
          <p class="text-2xl font-bold text-foreground">{{ formatNumber(totalTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">輸入 Token</p>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(totalInputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">輸出 Token</p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(totalOutputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">預估成本</p>
          <p class="text-2xl font-bold text-foreground">{{ formatCostCompact(companyCost) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">部門數量</p>
          <p class="text-2xl font-bold text-foreground">{{ departments.length }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">員工總數</p>
          <p class="text-2xl font-bold text-foreground">{{ employees.length }}</p>
        </div>
      </div>

      <!-- Token Usage Trend Mini Chart -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">篩選期間 Token 使用趨勢</h2>
          <div class="flex gap-4 text-sm text-muted-foreground">
            <span>總成本: <strong class="text-foreground">{{ formatCostCompact(companyCost) }}</strong></span>
            <span>平均日成本: <strong class="text-foreground">US${{ trendAvgCost.toFixed(2) }}</strong></span>
          </div>
        </div>
        <div class="h-48">
          <Line
            v-if="trendChartData"
            :data="trendChartData"
            :options="trendChartOptions"
            :key="trendChartKey"
          />
        </div>
      </div>

      <!-- Efficiency Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-foreground">部門效率排名</h2>
          <span class="text-xs text-muted-foreground">Token 每美元</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(dept, index) in departmentEfficiencyRanking"
            :key="dept.id"
            class="flex items-center gap-4 p-4 bg-secondary rounded-lg"
          >
            <span
              :class="[
                'text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full',
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-amber-600 text-white' :
                'bg-muted text-muted-foreground',
              ]"
            >
              {{ index + 1 }}
            </span>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-foreground">{{ dept.name }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-muted-foreground">{{ formatNumber(dept.totalTokens) }} tokens</span>
                  <span class="text-sm text-muted-foreground">{{ formatCostCompact(dept.cost) }}</span>
                  <span class="text-sm font-medium text-foreground">{{ dept.efficiency.toFixed(0) }} T/$</span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-xs font-medium',
                      dept.rating === '高效'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : dept.rating === '低效'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    ]"
                  >
                    {{ dept.rating }}
                  </span>
                </div>
              </div>
              <div class="w-full bg-muted rounded-full h-1.5">
                <div
                  class="bg-primary h-1.5 rounded-full transition-all"
                  :style="{ width: Math.min((dept.efficiency / maxEfficiency) * 100, 100) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Departments Grid -->
      <h2 class="text-xl font-semibold text-foreground mb-4">各部門詳情</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="dept in departments"
          :key="dept.id"
          :to="`/department/${dept.id}`"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition cursor-pointer block"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-semibold text-foreground">{{ dept.name }}</h3>
            <span
              :class="[
                'px-2 py-0.5 rounded text-xs font-medium',
                getBudgetStatus(dept.id) === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : getBudgetStatus(dept.id) === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800',
              ]"
            >
              {{ getBudgetStatusLabel(dept.id) }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground mb-4">{{ dept.description }}</p>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Token 使用量</span>
              <span class="font-medium text-foreground">{{ formatNumber(departmentStats[dept.id]?.totalTokens || 0) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">輸入 / 輸出</span>
              <span class="font-medium text-foreground">
                {{ formatNumber(departmentStats[dept.id]?.inputTokens || 0) }} / {{ formatNumber(departmentStats[dept.id]?.outputTokens || 0) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">預估成本</span>
              <span class="font-medium text-foreground">{{ formatCostCompact(departmentStats[dept.id]?.cost || 0) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">使用記錄</span>
              <span class="font-medium text-foreground">{{ departmentStats[dept.id]?.recordCount || 0 }} 筆</span>
            </div>
          </div>
          <!-- Budget bar -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-muted-foreground mb-1">
              <span>預算使用率</span>
              <span>{{ getBudgetUsageRate(dept.id) }}%</span>
            </div>
            <div class="w-full bg-muted rounded-full h-1.5">
              <div
                :class="[
                  'h-1.5 rounded-full transition-all',
                  getBudgetStatus(dept.id) === 'critical' ? 'bg-red-500' :
                  getBudgetStatus(dept.id) === 'warning' ? 'bg-yellow-500' : 'bg-green-500',
                ]"
                :style="{ width: Math.min(parseFloat(getBudgetUsageRate(dept.id)), 100) + '%' }"
              />
            </div>
          </div>
        </router-link>
      </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact } from '../utils/costCalculator'
import { calculateDepartmentEfficiencies, getEfficiencyRating } from '../utils/efficiencyCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import { useAuthStore } from '../stores/auth'
import { exportCompanySummaryToCSV, downloadCSV } from '../utils/csvExport'
import { useBudgetAlerts } from '../composables/useBudgetAlerts'
import TopBudgetAlert from '../components/TopBudgetAlert.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
import DatePicker from '../components/DatePicker.vue'
import EmptyState from '../components/EmptyState.vue'
import { useChartTheme } from '../composables/useChartTheme'
import type { TokenRecord, Department, Employee, DepartmentStats } from '../types'
import { useRouter } from 'vue-router'

const router = useRouter()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()
const { gridColor, textColor, tooltipBg } = useChartTheme()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const data = ref(getMockData())
const departments = ref<Department[]>(data.value.departments)
const employees = ref<Employee[]>(data.value.employees)
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)
const availableModels = ref<string[]>(getAvailableModels())

// Filters
const selectedModels = ref<string[]>([...availableModels.value])
const getInitialDateRange = () => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}
const dateRange = ref(getInitialDateRange())

const activeDateShortcut = computed(() => {
  const end = new Date()
  const endStr = end.toISOString().split('T')[0]
  if (dateRange.value.endDate !== endStr) return null

  const checkDays = (days: number) => {
    const start = new Date(end)
    start.setDate(start.getDate() - days)
    return dateRange.value.startDate === start.toISOString().split('T')[0]
  }

  if (checkDays(7)) return 7
  if (checkDays(14)) return 14
  if (checkDays(30)) return 30
  return null
})

const dateRangeError = computed(() => {
  const start = new Date(dateRange.value.startDate)
  const end = new Date(dateRange.value.endDate)
  if (start > end) {
    return '選擇錯誤，請重新操作'
  }
  
  const maxEnd = new Date(start)
  maxEnd.setFullYear(maxEnd.getFullYear() + 3)
  if (end > maxEnd) {
    return '查詢區間最多為 3 年'
  }
  
  return ''
})

const isDateRangeInvalid = computed(() => !!dateRangeError.value)

// Filter helpers
function setLast7Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 7)
  dateRange.value = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}
function setLast14Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 14)
  dateRange.value = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}
function setLast30Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)
  dateRange.value = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}

function resetFilters() {
  setLast30Days()
  selectedModels.value = [...availableModels.value]
}

// Filtered records
const filteredRecords = computed(() => {
  if (isDateRangeInvalid.value) {
    return []
  }

  let records = tokenRecords.value
  records = filterRecordsByDateRange(records, dateRange.value.startDate, dateRange.value.endDate)
  if (selectedModels.value.length === 0) {
    return []
  }
  if (selectedModels.value.length > 0) {
    records = filterRecordsByModels(records, selectedModels.value)
  }
  return records
})

// Stats
const totalTokens = computed(() => filteredRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0))
const totalInputTokens = computed(() => filteredRecords.value.reduce((sum, r) => sum + r.inputTokens, 0))
const totalOutputTokens = computed(() => filteredRecords.value.reduce((sum, r) => sum + r.outputTokens, 0))
const companyCost = computed(() => calculateTotalCost(filteredRecords.value))

const departmentStats = computed(() => {
  const stats: Record<string, DepartmentStats> = {}
  departments.value.forEach((dept) => {
    const deptRecords = filteredRecords.value.filter((r) => r.departmentId === dept.id)
    stats[dept.id] = {
      id: dept.id,
      name: dept.name,
      totalTokens: deptRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0),
      inputTokens: deptRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      outputTokens: deptRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      cost: calculateTotalCost(deptRecords),
      recordCount: deptRecords.length,
    }
  })
  return stats
})

const departmentEfficiencies = computed(() =>
  calculateDepartmentEfficiencies(filteredRecords.value, departments.value.map((d) => d.id))
)

const departmentEfficiencyRanking = computed(() => {
  const allEfficiencies = Object.values(departmentEfficiencies.value)
  return departments.value
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      efficiency: departmentEfficiencies.value[dept.id] || 0,
      totalTokens: departmentStats.value[dept.id]?.totalTokens || 0,
      cost: departmentStats.value[dept.id]?.cost || 0,
      rating: getEfficiencyRating(departmentEfficiencies.value[dept.id] || 0, allEfficiencies),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
})

const maxEfficiency = computed(() => {
  const efficiencies = departmentEfficiencyRanking.value.map((d) => d.efficiency)
  return efficiencies.length > 0 ? Math.max(...efficiencies) : 1
})

// Budget helpers
function getBudgetUsageRate(deptId: string): string {
  const cost = departmentStats.value[deptId]?.cost || 0
  const budget = budgetStore.getDepartmentBudget(deptId) || 1
  return ((cost / budget) * 100).toFixed(1)
}
function getBudgetStatus(deptId: string): 'ok' | 'warning' | 'critical' {
  const rate = parseFloat(getBudgetUsageRate(deptId))
  if (rate >= 100) return 'critical'
  if (rate >= 80) return 'warning'
  return 'ok'
}
function getBudgetStatusLabel(deptId: string): string {
  const status = getBudgetStatus(deptId)
  if (status === 'critical') return '超支'
  if (status === 'warning') return '警告'
  return '正常'
}

// Alerts
const { alerts: topAlerts } = useBudgetAlerts(budgetStore, companyCost, departmentStats, departments)

// CSV export
function exportCSV() {
  const csv = exportCompanySummaryToCSV(departments.value, departmentStats.value)
  downloadCSV(csv, `company-summary-${new Date().toISOString().split('T')[0]}.csv`)
}

// ========== Mini Trend Chart ==========
const trendChartKey = ref(0)
const dailyTrend = computed(() => {
  const startDate = new Date(dateRange.value.startDate)
  const endDate = new Date(dateRange.value.endDate)
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.max(diffDays, 1)
  const days: Array<{ date: string; cost: number; tokens: number }> = []
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayRecords = filteredRecords.value.filter((r) => r.date === dateStr)
    days.push({
      date: dateStr.slice(5).replace('-', '/'),
      cost: calculateTotalCost(dayRecords),
      tokens: dayRecords.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0),
    })
  }
  return days
})

const trendAvgCost = computed(() => {
  const days = dailyTrend.value
  return days.length > 0 ? days.reduce((s, d) => s + d.cost, 0) / days.length : 0
})

const trendChartData = computed(() => {
  const data = dailyTrend.value
  return {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: '日成本 (USD)',
        data: data.map((d) => d.cost),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: data.length > 20 ? 0 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        fill: true,
        tension: 0.3,
      },
    ],
  }
})

const trendChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tooltipBg.value,
      titleFont: { size: 11 },
      bodyFont: { size: 11 },
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 8,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => `成本: $${ctx.parsed.y.toFixed(2)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, font: { size: 10 }, color: textColor.value, maxTicksLimit: 10 },
    },
    y: {
      beginAtZero: true,
      grid: { color: gridColor.value },
      ticks: {
        font: { size: 10 },
        color: textColor.value,
        callback: (value: any) => `$${Number(value).toFixed(2)}`,
      },
    },
  },
}))

watch([dateRange, selectedModels], () => {
  trendChartKey.value++
}, { deep: true })

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>
