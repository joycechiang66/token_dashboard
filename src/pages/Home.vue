<template>
  <div class="flex-1 bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-foreground">Token 使用量儀表板</h1>
            <p class="text-sm text-muted-foreground mt-1">公司內部 AI Token 使用與部門費用概況</p>
          </div>
          <div class="flex gap-2 items-center">
            <ThemeToggle />
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
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
          <p class="text-xs text-muted-foreground mb-1">部門數量</p>
          <p class="text-2xl font-bold text-foreground">{{ departments.length }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">員工總數</p>
          <p class="text-2xl font-bold text-foreground">{{ employees.length }}</p>
        </div>
      </div>

      <!-- Department Token Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-foreground">部門 Token 排名</h2>
          <span class="text-xs text-muted-foreground">依總 Token 使用量排序</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(dept, index) in departmentTokenRanking"
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
                  <span class="text-sm text-muted-foreground">{{ dept.recordCount }} 筆</span>
                </div>
              </div>
              <div class="w-full bg-muted rounded-full h-1.5">
                <div
                  class="bg-primary h-1.5 rounded-full transition-all"
                  :style="{ width: Math.min((dept.totalTokens / maxTokens) * 100, 100) + '%' }"
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
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-foreground">{{ dept.name }}</h3>
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
              <span class="text-muted-foreground">使用記錄</span>
              <span class="font-medium text-foreground">{{ departmentStats[dept.id]?.recordCount || 0 }} 筆</span>
            </div>
          </div>
        </router-link>
      </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost } from '../utils/costCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import { useAuthStore } from '../stores/auth'
import { exportCompanySummaryToCSV, downloadCSV } from '../utils/csvExport'
import { useBudgetAlerts } from '../composables/useBudgetAlerts'
import TopBudgetAlert from '../components/TopBudgetAlert.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
import DatePicker from '../components/DatePicker.vue'
import EmptyState from '../components/EmptyState.vue'
import type { TokenRecord, Department, Employee, DepartmentStats } from '../types'
import { useRouter } from 'vue-router'

const router = useRouter()
const budgetStore = useBudgetStore()
const authStore = useAuthStore()

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

const departmentTokenRanking = computed(() => {
  return departments.value
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      recordCount: departmentStats.value[dept.id]?.recordCount || 0,
      totalTokens: departmentStats.value[dept.id]?.totalTokens || 0,
    }))
    .sort((a, b) => b.totalTokens - a.totalTokens)
})

const maxTokens = computed(() => {
  const totals = departmentTokenRanking.value.map((d) => d.totalTokens)
  return totals.length > 0 ? Math.max(...totals) : 1
})

// Alerts
const { alerts: topAlerts } = useBudgetAlerts(budgetStore, companyCost, departmentStats, departments)

// CSV export
function exportCSV() {
  const csv = exportCompanySummaryToCSV(departments.value, departmentStats.value)
  downloadCSV(csv, `company-summary-${new Date().toISOString().split('T')[0]}.csv`)
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>
