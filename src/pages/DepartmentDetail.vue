<template>
  <div class="flex-1 bg-background flex flex-col">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center gap-4 flex-wrap">
          <router-link to="/" class="text-primary hover:opacity-80 transition text-sm">← 返回首頁</router-link>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-foreground">{{ department?.name }}</h1>
            <p class="text-sm text-muted-foreground mt-1">{{ department?.description }}</p>
          </div>
          <div class="flex gap-2 items-center">
            <ThemeToggle />
            <button
              @click="exportDeptCSV"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              匯出 CSV
            </button>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition text-sm font-medium"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="dept-main-content" class="container py-8">
      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">篩選條件</h2>
          <button @click="resetFilters" class="text-sm text-primary hover:opacity-80 transition">重設篩選</button>
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
            顯示 {{ filteredDeptRecords.length }} 筆記錄（共 {{ allDeptRecords.length }} 筆）
          </p>
        </div>
      </div>

      <template v-if="filteredDeptRecords.length === 0">
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
        <!-- Department Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">總 Token</p>
          <p class="text-2xl font-bold text-foreground">{{ formatNumber(departmentTotalTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">輸入 Token</p>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(departmentInputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">輸出 Token</p>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatNumber(departmentOutputTokens) }}</p>
        </div>
      </div>

      <!-- Model Usage Breakdown -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-foreground mb-4">模型 Token 分佈</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="model in modelBreakdown"
            :key="model.name"
            class="bg-secondary rounded-lg p-4"
          >
            <p class="text-sm font-medium text-foreground mb-1">{{ model.name }}</p>
            <p class="text-lg font-bold text-foreground">{{ model.count }} 次</p>
            <p class="text-xs text-muted-foreground">{{ formatNumber(model.tokens) }} tokens</p>
          </div>
        </div>
      </div>

      <!-- Employee Token Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-foreground">員工 Token 排名</h2>
          <span class="text-xs text-muted-foreground">依總 Token 使用量排序，點擊查看詳細記錄</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(emp, index) in employeeTokenRanking"
            :key="emp.id"
            class="bg-secondary rounded-lg overflow-hidden"
          >
            <!-- Employee Summary Row -->
            <div 
              class="flex items-center gap-4 p-4 cursor-pointer hover:bg-accent transition"
              @click="toggleEmployeeExpanded(emp.id)"
            >
              <span
                :class="[
                  'text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0',
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
                  <span class="font-medium text-foreground">{{ emp.name }}</span>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-muted-foreground">{{ formatNumber(emp.totalTokens) }} tokens</span>
                    <span class="text-sm text-muted-foreground">{{ emp.recordCount }} 筆</span>
                    <span class="text-muted-foreground text-sm transition-transform duration-200" :class="{ 'rotate-180': expandedEmployees.has(emp.id) }">▼</span>
                  </div>
                </div>
                <div class="w-full bg-muted rounded-full h-1.5">
                  <div
                    class="bg-primary h-1.5 rounded-full transition-all"
                    :style="{ width: Math.min((emp.totalTokens / maxEmployeeTokens) * 100, 100) + '%' }"
                  />
                </div>
              </div>
            </div>

            <!-- Expanded Details -->
            <div v-show="expandedEmployees.has(emp.id)" class="border-t border-border bg-card/50 p-4 animate-in slide-in-from-top-2 duration-200">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-foreground">詳細使用記錄 ({{ (employeeRecords.get(emp.id) || []).length }} 筆)</h4>
                <button
                  @click.stop="exportEmployeeCSV(emp.id, emp.name)"
                  class="px-2 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90 transition"
                >
                  匯出 CSV
                </button>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-border/50">
                      <th class="text-left py-2 px-3 text-xs font-medium text-muted-foreground">日期</th>
                      <th class="text-left py-2 px-3 text-xs font-medium text-muted-foreground">模型</th>
                      <th class="text-right py-2 px-3 text-xs font-medium text-muted-foreground">輸入 Token</th>
                      <th class="text-right py-2 px-3 text-xs font-medium text-muted-foreground">輸出 Token</th>
                      <th class="text-right py-2 px-3 text-xs font-medium text-muted-foreground">總 Token</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="record in getPaginatedRecords(emp.id)"
                      :key="record.id"
                      class="border-b border-border/50 hover:bg-muted/50 transition last:border-0"
                    >
                      <td class="py-2 px-3 text-foreground">{{ record.date.replace(/-/g, '/') }}</td>
                      <td class="py-2 px-3 text-foreground">{{ record.model }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatNumber(record.inputTokens) }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatNumber(record.outputTokens) }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatNumber(record.inputTokens + record.outputTokens) }}</td>
                    </tr>
                    <tr v-if="(employeeRecords.get(emp.id) || []).length === 0">
                      <td colspan="5" class="py-4 text-center text-muted-foreground text-xs">此篩選條件下無記錄</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Pagination
                v-if="(employeeRecords.get(emp.id) || []).length > 0"
                :current-page="getEmployeePage(emp.id)"
                :total-items="(employeeRecords.get(emp.id) || []).length"
                :items-per-page="ITEMS_PER_PAGE"
                @update:current-page="(page) => setEmployeePage(emp.id, page)"
                class="mt-4"
              />
            </div>
          </div>
        </div>
      </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getDepartmentById, getAvailableModels } from '../utils/mockData'
import { exportDepartmentSummaryToCSV, exportEmployeeDetailsToCSV, downloadCSV } from '../utils/csvExport'
import ThemeToggle from '../components/ThemeToggle.vue'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
import DatePicker from '../components/DatePicker.vue'
import EmptyState from '../components/EmptyState.vue'
import Pagination from '../components/Pagination.vue'
import type { TokenRecord, Department, DepartmentStats } from '../types'

import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const route = useRoute()
const departmentId = route.params.id as string

const data = ref(getMockData())
const department = ref<Department | undefined>(getDepartmentById(departmentId))
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

// All dept records (unfiltered by date/model, just by dept)
const allDeptRecords = computed(() => tokenRecords.value.filter((r) => r.departmentId === departmentId))

// Filtered records
const filteredDeptRecords = computed(() => {
  if (isDateRangeInvalid.value) {
    return []
  }

  let records = allDeptRecords.value
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
const departmentTotalTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0))
const departmentInputTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.inputTokens, 0))
const departmentOutputTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.outputTokens, 0))

// Model breakdown
const modelBreakdown = computed(() => {
  const map = new Map<string, { count: number; tokens: number }>()
  filteredDeptRecords.value.forEach((r) => {
    const existing = map.get(r.model) || { count: 0, tokens: 0 }
    existing.count++
    existing.tokens += r.inputTokens + r.outputTokens
    map.set(r.model, existing)
  })
  return Array.from(map.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.tokens - a.tokens)
})

// Employees
const departmentEmployees = computed(() => data.value.employees.filter((e) => e.departmentId === departmentId))

const employeeRecords = computed(() => {
  const map = new Map<string, TokenRecord[]>()
  departmentEmployees.value.forEach((emp) => {
    const records = filteredDeptRecords.value
      .filter((r) => r.employeeId === emp.id)
      .sort((a, b) => b.date.localeCompare(a.date))
    map.set(emp.id, records)
  })
  return map
})

const employeeTokenRanking = computed(() => {
  return departmentEmployees.value
    .map((emp) => {
      const empRecords = employeeRecords.value.get(emp.id) || []
      return {
        id: emp.id,
        name: emp.name,
        recordCount: empRecords.length,
        totalTokens: empRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0),
      }
    })
    .sort((a, b) => b.totalTokens - a.totalTokens)
})

const maxEmployeeTokens = computed(() => {
  const totals = employeeTokenRanking.value.map((e) => e.totalTokens)
  return totals.length > 0 ? Math.max(...totals) : 1
})

// Expand/collapse
const expandedEmployees = ref<Set<string>>(new Set())
function toggleEmployeeExpanded(employeeId: string) {
  if (expandedEmployees.value.has(employeeId)) {
    expandedEmployees.value.delete(employeeId)
  } else {
    expandedEmployees.value.add(employeeId)
    // Reset to page 1 when expanding
    if (!employeePageMap.value[employeeId]) {
      employeePageMap.value[employeeId] = 1
    }
  }
}

// Pagination
const employeePageMap = ref<Record<string, number>>({})
const ITEMS_PER_PAGE = 10

function getEmployeePage(empId: string) {
  return employeePageMap.value[empId] || 1
}

function setEmployeePage(empId: string, page: number) {
  employeePageMap.value[empId] = page
}

function getPaginatedRecords(empId: string) {
  const records = employeeRecords.value.get(empId) || []
  const page = getEmployeePage(empId)
  const start = (page - 1) * ITEMS_PER_PAGE
  return records.slice(start, start + ITEMS_PER_PAGE)
}

// CSV export
function exportDeptCSV() {
  const deptStats: DepartmentStats = {
    id: departmentId,
    name: department.value?.name || '',
    totalTokens: departmentTotalTokens.value,
    inputTokens: departmentInputTokens.value,
    outputTokens: departmentOutputTokens.value,
    cost: 0,
    recordCount: filteredDeptRecords.value.length,
  }
  const csv = exportDepartmentSummaryToCSV(department.value?.name || '', deptStats, filteredDeptRecords.value)
  downloadCSV(csv, `dept-${department.value?.name}-${new Date().toISOString().split('T')[0]}.csv`)
}

function exportEmployeeCSV(employeeId: string, employeeName: string) {
  const records = employeeRecords.value.get(employeeId) || []
  const csv = exportEmployeeDetailsToCSV(employeeName, records)
  downloadCSV(csv, `employee-${employeeName}-${new Date().toISOString().split('T')[0]}.csv`)
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>
