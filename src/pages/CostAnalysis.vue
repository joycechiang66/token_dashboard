<template>
  <div class="flex-1 bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <router-link to="/" class="text-primary hover:opacity-80 transition text-sm flex-shrink-0">← 返回首頁</router-link>
            <div>
              <h1 class="text-3xl font-bold text-foreground">成本分析</h1>
              <p class="text-sm text-muted-foreground mt-1">詳細的成本統計和預算管理</p>
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <ThemeToggle />
            <button
              v-if="isAdmin"
              @click="showBudgetModal = true"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              預算設定
            </button>
            <button
              @click="exportCSV"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              匯出 CSV
            </button>
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
    <main id="cost-analysis-content" class="container py-8">
      <!-- Top Alert -->
      <TopBudgetAlert v-if="topAlerts.length > 0" :alerts="topAlerts" class="mb-6" />

      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">篩選條件</h2>
          <button @click="resetFilters" class="text-sm text-primary hover:opacity-80 transition">重設篩選</button>
        </div>
        <div class="flex flex-wrap gap-6 items-end">
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
          <p class="text-xs text-muted-foreground">顯示 {{ filteredRecords.length }} 筆記錄（共 {{ tokenRecords.length }} 筆）</p>
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
        <!-- Cost Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">篩選期間成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCostCompact(companyCost) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">平均日成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCost(averageDailyCost) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">總 Token 數</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(totalTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">使用記錄數</p>
          <p class="text-3xl font-bold text-foreground">{{ filteredRecords.length }}</p>
        </div>
      </div>

      <!-- Company Budget Status -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">公司整體預算狀態</h2>
          <span
            :class="[
              'px-3 py-1 rounded text-sm font-medium',
              companyUsageRate >= 1 ? 'bg-red-100 text-red-800' :
              companyUsageRate >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800',
            ]"
          >
            {{ (companyUsageRate * 100).toFixed(1) }}%
          </span>
        </div>
        <div class="flex justify-end text-sm text-muted-foreground mb-3">
          <span>{{ formatCost(companyCost) }} / {{ formatCost(companyBudget) }}</span>
        </div>
        <div class="w-full bg-secondary rounded-full h-4 overflow-hidden">
          <div
            :style="{ width: Math.min(companyUsageRate * 100, 100) + '%' }"
            :class="[
              'h-full transition-all rounded-full',
              companyUsageRate >= 1 ? 'bg-red-500' : companyUsageRate >= 0.8 ? 'bg-yellow-500' : 'bg-green-500',
            ]"
          />
        </div>
      </div>

      <!-- Department Budget Status -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-6">部門預算狀態</h2>
        <div
          v-if="overBudgetDepartments.length > 0"
          class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p class="font-semibold text-red-800">目前有 {{ overBudgetDepartments.length }} 個部門超支</p>
          <p class="text-red-700 text-sm mt-1">
            {{ overBudgetDepartments.map((dept) => dept.name).join('、') }}，請盡快調整預算或降低使用量。
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="dept in departments"
            :key="dept.id"
            class="border border-border rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium text-foreground">{{ dept.name }}</h3>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  getDeptUsageRate(dept.id) >= 1 ? 'bg-red-100 text-red-800' :
                  getDeptUsageRate(dept.id) >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800',
                ]"
              >{{ (getDeptUsageRate(dept.id) * 100).toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-2.5 overflow-hidden mb-2">
              <div
                :style="{ width: Math.min(getDeptUsageRate(dept.id) * 100, 100) + '%' }"
                :class="[
                  'h-full transition-all rounded-full',
                  getDeptUsageRate(dept.id) >= 1 ? 'bg-red-500' :
                  getDeptUsageRate(dept.id) >= 0.8 ? 'bg-yellow-500' : 'bg-green-500',
                ]"
              />
            </div>
            <div class="flex justify-end text-xs text-muted-foreground">
              <span>{{ formatCost(departmentStats[dept.id]?.cost || 0) }} / {{ formatCost(budgetStore.getDepartmentBudget(dept.id)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Trend Chart (30 days) -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-4">篩選期間成本趨勢</h2>
        <!-- Summary stats -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">總成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCostCompact(trendTotalCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">平均日成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCost(trendAvgCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">最高日成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCost(trendMaxCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">最低日成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCost(trendMinCost) }}</p>
          </div>
        </div>
        <!-- Chart.js Line/Bar chart -->
        <div class="h-64">
          <Line
            v-if="trendChartData"
            :data="trendChartData"
            :options="trendChartOptions"
            :key="trendChartKey"
          />
        </div>
      </div>

      <!-- Budget History Chart (12 months) -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-4">預算使用歷史趨勢（12 個月）</h2>
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">平均月成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCostCompact(historyAvgCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">最高月成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCost(historyMaxCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">最低月成本</p>
            <p class="text-xl font-bold text-foreground">{{ formatCost(historyMinCost) }}</p>
          </div>
          <div class="bg-secondary rounded-lg p-4">
            <p class="text-xs text-muted-foreground mb-1">平均使用率</p>
            <p class="text-xl font-bold text-foreground">{{ historyAvgRate.toFixed(1) }}%</p>
          </div>
        </div>
        <!-- Chart.js grouped bar chart -->
        <div class="h-64">
          <Bar
            v-if="budgetChartData"
            :data="budgetChartData"
            :options="budgetChartOptions"
            :key="budgetChartKey"
          />
        </div>
      </div>

      <!-- Model Cost Analysis -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-6">模型成本佔比</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Chart.js Doughnut -->
          <div class="flex items-center justify-center">
            <div class="relative w-56 h-56">
              <Doughnut
                v-if="doughnutChartData"
                :data="doughnutChartData"
                :options="doughnutChartOptions"
                :key="doughnutChartKey"
              />
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="text-center">
                  <p class="text-xs text-muted-foreground">總成本</p>
                  <p class="text-sm font-bold text-foreground">{{ formatCostCompact(companyCost) }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- Legend & stats -->
          <div class="space-y-3">
            <div v-for="(model, i) in modelStats" :key="model.name" class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: pieColors[i % pieColors.length] }" />
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-foreground">{{ model.name }}</span>
                  <span class="text-muted-foreground">{{ model.percentage.toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-secondary rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full"
                    :style="{ width: model.percentage + '%', backgroundColor: pieColors[i % pieColors.length] }"
                  />
                </div>
                <div class="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{{ model.count }} 次</span>
                  <span>{{ formatCost(model.cost) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Cost Comparison -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-6">部門成本對比</h2>
        <div class="space-y-4">
          <div v-for="dept in deptCostRanking" :key="dept.id">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-foreground">{{ dept.name }}</span>
              <div class="flex gap-4 text-muted-foreground">
                <span>{{ formatNumber(dept.totalTokens) }} tokens</span>
                <span>{{ dept.recordCount }} 筆</span>
                <span class="font-medium text-foreground">{{ formatCost(dept.cost) }}</span>
                <span class="text-primary">{{ dept.percentage.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="w-full bg-secondary rounded-full h-3">
              <div
                class="bg-primary h-3 rounded-full transition-all"
                :style="{ width: dept.percentage + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
      </template>
    </main>

    <!-- Budget Settings Modal -->
    <div
      v-if="showBudgetModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showBudgetModal = false"
    >
      <div class="bg-card border border-border rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-foreground">預算設定</h2>
          <button @click="showBudgetModal = false" class="text-muted-foreground hover:text-foreground text-xl">✕</button>
        </div>

        <div class="space-y-4">
          <!-- Company budget -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">公司整體月預算 (USD)</label>
            <input
              v-model.number="editCompanyBudget"
              type="number"
              min="0"
              step="100"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>

          <!-- Department budgets -->
          <div>
            <p class="text-sm font-medium text-foreground mb-3">各部門月預算 (USD)</p>
            <div class="space-y-3">
              <div v-for="dept in departments" :key="dept.id" class="flex items-center gap-3">
                <label class="text-sm text-foreground w-32 flex-shrink-0">{{ dept.name }}</label>
                <input
                  v-model.number="editDeptBudgets[dept.id]"
                  type="number"
                  min="0"
                  step="100"
                  class="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="saveBudgetSettings"
            class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
          >
            儲存設定
          </button>
          <button
            @click="showBudgetModal = false"
            class="flex-1 px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact, formatCost, calculateRecordCost } from '../utils/costCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import { useAuthStore } from '../stores/auth'
import { exportCostAnalysisToCSV, downloadCSV } from '../utils/csvExport'
import { useBudgetAlerts } from '../composables/useBudgetAlerts'
import TopBudgetAlert from '../components/TopBudgetAlert.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
import DatePicker from '../components/DatePicker.vue'
import EmptyState from '../components/EmptyState.vue'
import { useChartTheme } from '../composables/useChartTheme'
import type { TokenRecord, Department, DepartmentStats } from '../types'
import { useRouter } from 'vue-router'

const router = useRouter()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()
const { gridColor, textColor, tooltipBg } = useChartTheme()

const isAdmin = computed(() => authStore.isAdmin)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const data = ref(getMockData())
const departments = ref<Department[]>(data.value.departments)
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

function setLast7Days() {
  const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 7)
  dateRange.value = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}
function setLast14Days() {
  const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 14)
  dateRange.value = { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] }
}
function setLast30Days() {
  const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 30)
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
const companyCost = computed(() => calculateTotalCost(filteredRecords.value))
const companyBudget = computed(() => budgetStore.getCompanyBudget())
const companyUsageRate = computed(() => companyCost.value / companyBudget.value)
const totalTokens = computed(() => filteredRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0))

const averageDailyCost = computed(() => {
  const days = Math.max(
    Math.ceil((new Date(dateRange.value.endDate).getTime() - new Date(dateRange.value.startDate).getTime()) / (1000 * 60 * 60 * 24)),
    1
  )
  return companyCost.value / days
})

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

const { alerts: topAlerts } = useBudgetAlerts(budgetStore, companyCost, departmentStats, departments)

const overBudgetDepartments = computed(() => {
  return departments.value.filter((dept) => getDeptUsageRate(dept.id) >= 1)
})

function getDeptUsageRate(deptId: string): number {
  const cost = departmentStats.value[deptId]?.cost || 0
  const budget = budgetStore.getDepartmentBudget(deptId) || 1
  return cost / budget
}

// Cost trend - now uses filtered records and respects date/model filters
const last30DaysTrend = computed(() => {
  const days: Array<{ date: string; cost: number }> = []
  const startDate = new Date(dateRange.value.startDate)
  const endDate = new Date(dateRange.value.endDate)
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.max(diffDays, 1)
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayRecords = filteredRecords.value.filter((r) => r.date === dateStr)
    days.push({ date: dateStr.slice(5).replace('-', '/'), cost: calculateTotalCost(dayRecords) })
  }
  return days
})
const trendTotalCost = computed(() => last30DaysTrend.value.reduce((s, d) => s + d.cost, 0))
const trendAvgCost = computed(() => {
  const days = last30DaysTrend.value.length
  return days > 0 ? trendTotalCost.value / days : 0
})
const trendMaxCost = computed(() => Math.max(...last30DaysTrend.value.map((d) => d.cost), 0.01))
const trendMinCost = computed(() => {
  const nonZero = last30DaysTrend.value.filter((d) => d.cost > 0)
  return nonZero.length > 0 ? Math.min(...nonZero.map((d) => d.cost)) : 0
})

// Budget history
const budgetHistory = computed(() => budgetStore.getBudgetHistory())
const historyAvgCost = computed(() => {
  const h = budgetHistory.value
  return h.length > 0 ? h.reduce((s, m) => s + m.cost, 0) / h.length : 0
})
const historyMaxCost = computed(() => Math.max(...budgetHistory.value.map((m) => m.cost), 0))
const historyMinCost = computed(() => {
  const costs = budgetHistory.value.map((m) => m.cost)
  return costs.length > 0 ? Math.min(...costs) : 0
})
const historyAvgRate = computed(() => {
  const h = budgetHistory.value
  if (h.length === 0) return 0
  return h.reduce((s, m) => s + (m.cost / m.budget) * 100, 0) / h.length
})

// ========== Chart.js: Cost Trend ==========
const trendChartKey = ref(0)
const trendChartData = computed(() => {
  const data = last30DaysTrend.value
  return {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: '日成本 (USD)',
        data: data.map((d) => d.cost),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 3,
        pointHoverRadius: 5,
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
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => `當日成本: US$${ctx.parsed.y.toFixed(2)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 45, font: { size: 10 }, color: textColor.value, maxTicksLimit: 15 },
    },
    y: {
      beginAtZero: true,
      grid: { color: gridColor.value },
      ticks: {
        font: { size: 11 },
        color: textColor.value,
        callback: (value: any) => `US$${Number(value).toFixed(2)}`,
      },
    },
  },
}))

// ========== Chart.js: Budget History ==========
const budgetChartKey = ref(0)
const budgetChartData = computed(() => {
  const data = budgetHistory.value
  return {
    labels: data.map((m) => m.month),
    datasets: [
      {
        label: '實際成本',
        data: data.map((m) => m.cost),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
      },
      {
        label: '預算上限',
        data: data.map((m) => m.budget),
        backgroundColor: 'rgba(156, 163, 175, 0.35)',
        borderColor: 'rgba(156, 163, 175, 0.6)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(156, 163, 175, 0.5)',
      },
    ],
  }
})
const budgetChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 16, font: { size: 12 }, color: textColor.value },
    },
    tooltip: {
      backgroundColor: tooltipBg.value,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => {
          const label = ctx.dataset.label || ''
          return `${label}: US$${ctx.parsed.y.toLocaleString()}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: textColor.value },
    },
    y: {
      beginAtZero: true,
      grid: { color: gridColor.value },
      ticks: {
        font: { size: 11 },
        color: textColor.value,
        callback: (value: any) => {
          const v = Number(value)
          return v >= 1000 ? `US$${(v / 1000).toFixed(0)}K` : `US$${v}`
        },
      },
    },
  },
}))

// 當篩選條件變化時更新圖表 key 以觸發重新渲染
watch([dateRange, selectedModels], () => {
  trendChartKey.value++
}, { deep: true })

watch(budgetHistory, () => {
  budgetChartKey.value++
}, { deep: true })

// Model stats for pie chart
const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16']
const modelStats = computed(() => {
  const map = new Map<string, { cost: number; count: number }>()
  filteredRecords.value.forEach((r) => {
    const existing = map.get(r.model) || { cost: 0, count: 0 }
    existing.cost += calculateRecordCost(r)
    existing.count++
    map.set(r.model, existing)
  })
  const total = companyCost.value
  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      cost: data.cost,
      count: data.count,
      percentage: total > 0 ? (data.cost / total) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost)
})

// ========== Chart.js: Doughnut ==========
const doughnutChartKey = ref(0)
const doughnutChartData = computed(() => {
  const stats = modelStats.value
  return {
    labels: stats.map((m) => m.name),
    datasets: [
      {
        data: stats.map((m) => m.cost),
        backgroundColor: stats.map((_, i) => pieColors[i % pieColors.length]),
        borderColor: stats.map((_, i) => pieColors[i % pieColors.length]),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  }
})
const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '60%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: tooltipBg.value,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: any) => {
          const value = ctx.parsed
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          return `${ctx.label}: US$${value.toFixed(2)} (${pct}%)`
        },
      },
    },
  },
}))

watch([dateRange, selectedModels], () => {
  doughnutChartKey.value++
}, { deep: true })

// Department cost ranking
const deptCostRanking = computed(() => {
  const total = companyCost.value || 1
  return departments.value
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      cost: departmentStats.value[dept.id]?.cost || 0,
      totalTokens: departmentStats.value[dept.id]?.totalTokens || 0,
      recordCount: departmentStats.value[dept.id]?.recordCount || 0,
      percentage: ((departmentStats.value[dept.id]?.cost || 0) / total) * 100,
    }))
    .sort((a, b) => b.cost - a.cost)
})

// Budget modal
const showBudgetModal = ref(false)
const editCompanyBudget = ref(budgetStore.getCompanyBudget())
const editDeptBudgets = reactive<Record<string, number>>({})
departments.value.forEach((dept) => {
  editDeptBudgets[dept.id] = budgetStore.getDepartmentBudget(dept.id)
})

function saveBudgetSettings() {
  budgetStore.setCompanyBudget(editCompanyBudget.value)
  departments.value.forEach((dept) => {
    budgetStore.setDepartmentBudget(dept.id, editDeptBudgets[dept.id])
  })
  showBudgetModal.value = false
}

// CSV export
function exportCSV() {
  const csv = exportCostAnalysisToCSV(filteredRecords.value, departments.value, departmentStats.value)
  downloadCSV(csv, `cost-analysis-${new Date().toISOString().split('T')[0]}.csv`)
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>
