<template>
  <div class="min-h-screen bg-background">
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
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">開始日期</label>
              <input
                v-model="dateRange.startDate"
                type="date"
                class="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">結束日期</label>
              <input
                v-model="dateRange.endDate"
                type="date"
                class="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
            <div class="flex gap-2">
              <button @click="setLast7Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 7 天</button>
              <button @click="setLast14Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 14 天</button>
              <button @click="setLast30Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 30 天</button>
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
        <p class="text-xs text-muted-foreground mt-3">
          顯示 {{ filteredDeptRecords.length }} 筆記錄（共 {{ allDeptRecords.length }} 筆）
        </p>
      </div>

      <!-- Department Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        <div class="bg-card border border-border rounded-lg p-5">
          <p class="text-xs text-muted-foreground mb-1">預估成本</p>
          <p class="text-2xl font-bold text-foreground">{{ formatCostCompact(departmentCost) }}</p>
        </div>
      </div>

      <!-- Model Usage Breakdown -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-foreground mb-4">模型使用分佈</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="model in modelBreakdown"
            :key="model.name"
            class="bg-secondary rounded-lg p-4"
          >
            <p class="text-sm font-medium text-foreground mb-1">{{ model.name }}</p>
            <p class="text-lg font-bold text-foreground">{{ model.count }} 次</p>
            <p class="text-xs text-muted-foreground">{{ formatNumber(model.tokens) }} tokens</p>
            <p class="text-xs text-primary">{{ formatCost(model.cost) }}</p>
          </div>
        </div>
      </div>

      <!-- Employee Efficiency Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-foreground">員工效率排名</h2>
          <span class="text-xs text-muted-foreground">點擊查看詳細記錄</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="(emp, index) in employeeEfficiencyRanking"
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
                    <span class="text-sm text-muted-foreground">{{ formatCostCompact(emp.cost) }}</span>
                    <span class="text-sm font-medium text-foreground">{{ emp.efficiency.toFixed(0) }} T/$</span>
                    <span
                      :class="[
                        'px-2 py-0.5 rounded text-xs font-medium',
                        emp.rating === '高效'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : emp.rating === '低效'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                      ]"
                    >
                      {{ emp.rating }}
                    </span>
                    <span class="text-muted-foreground text-sm transition-transform duration-200" :class="{ 'rotate-180': expandedEmployees.has(emp.id) }">▼</span>
                  </div>
                </div>
                <div class="w-full bg-muted rounded-full h-1.5">
                  <div
                    class="bg-primary h-1.5 rounded-full transition-all"
                    :style="{ width: Math.min((emp.efficiency / maxEmployeeEfficiency) * 100, 100) + '%' }"
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
                      <th class="text-right py-2 px-3 text-xs font-medium text-muted-foreground">成本</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="record in employeeRecords.get(emp.id) || []"
                      :key="record.id"
                      class="border-b border-border/50 hover:bg-muted/50 transition last:border-0"
                    >
                      <td class="py-2 px-3 text-foreground">{{ record.date }}</td>
                      <td class="py-2 px-3 text-foreground">{{ record.model }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatNumber(record.inputTokens) }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatNumber(record.outputTokens) }}</td>
                      <td class="text-right py-2 px-3 text-foreground">{{ formatCost(calculateRecordCost(record)) }}</td>
                    </tr>
                    <tr v-if="(employeeRecords.get(emp.id) || []).length === 0">
                      <td colspan="5" class="py-4 text-center text-muted-foreground text-xs">此篩選條件下無記錄</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getDepartmentById, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact, formatCost, calculateRecordCost } from '../utils/costCalculator'
import { calculateEmployeeEfficiencies, getEfficiencyRating } from '../utils/efficiencyCalculator'
import { exportDepartmentSummaryToCSV, exportEmployeeDetailsToCSV, downloadCSV } from '../utils/csvExport'
import ThemeToggle from '../components/ThemeToggle.vue'
import MultiSelectDropdown from '../components/MultiSelectDropdown.vue'
import type { TokenRecord, Department, DepartmentStats } from '../types'

const route = useRoute()
const departmentId = route.params.id as string

const data = ref(getMockData())
const department = ref<Department | undefined>(getDepartmentById(departmentId))
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)
const availableModels = ref<string[]>(getAvailableModels())

// Filters
const selectedModels = ref<string[]>([...availableModels.value])
const now = new Date()
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
const dateRange = ref({
  startDate: thirtyDaysAgo.toISOString().split('T')[0],
  endDate: now.toISOString().split('T')[0],
})

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
function toggleModel(model: string) {
  const idx = selectedModels.value.indexOf(model)
  if (idx >= 0) selectedModels.value.splice(idx, 1)
  else selectedModels.value.push(model)
}
function selectAllModels() { selectedModels.value = [...availableModels.value] }
function clearModels() { selectedModels.value = [] }
function resetFilters() { setLast30Days(); selectedModels.value = [...availableModels.value] }

// All dept records (unfiltered by date/model, just by dept)
const allDeptRecords = computed(() => tokenRecords.value.filter((r) => r.departmentId === departmentId))

// Filtered records
const filteredDeptRecords = computed(() => {
  let records = allDeptRecords.value
  records = filterRecordsByDateRange(records, dateRange.value.startDate, dateRange.value.endDate)
  if (selectedModels.value.length > 0) {
    records = filterRecordsByModels(records, selectedModels.value)
  }
  return records
})

// Stats
const departmentTotalTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0))
const departmentInputTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.inputTokens, 0))
const departmentOutputTokens = computed(() => filteredDeptRecords.value.reduce((sum, r) => sum + r.outputTokens, 0))
const departmentCost = computed(() => calculateTotalCost(filteredDeptRecords.value))

// Model breakdown
const modelBreakdown = computed(() => {
  const map = new Map<string, { count: number; tokens: number; cost: number }>()
  filteredDeptRecords.value.forEach((r) => {
    const existing = map.get(r.model) || { count: 0, tokens: 0, cost: 0 }
    existing.count++
    existing.tokens += r.inputTokens + r.outputTokens
    existing.cost += calculateRecordCost(r)
    map.set(r.model, existing)
  })
  return Array.from(map.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
})

// Employees
const departmentEmployees = computed(() => data.value.employees.filter((e) => e.departmentId === departmentId))

const employeeEfficiencies = computed(() =>
  calculateEmployeeEfficiencies(filteredDeptRecords.value, departmentEmployees.value.map((e) => e.id))
)

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

const employeeEfficiencyRanking = computed(() => {
  const allEfficiencies = Object.values(employeeEfficiencies.value)
  return departmentEmployees.value
    .map((emp) => {
      const empRecords = employeeRecords.value.get(emp.id) || []
      return {
        id: emp.id,
        name: emp.name,
        efficiency: employeeEfficiencies.value[emp.id] || 0,
        totalTokens: empRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0),
        cost: calculateTotalCost(empRecords),
        rating: getEfficiencyRating(employeeEfficiencies.value[emp.id] || 0, allEfficiencies),
      }
    })
    .sort((a, b) => b.efficiency - a.efficiency)
})

const maxEmployeeEfficiency = computed(() => {
  const effs = employeeEfficiencyRanking.value.map((e) => e.efficiency)
  return effs.length > 0 ? Math.max(...effs) : 1
})

// Expand/collapse
const expandedEmployees = ref<Set<string>>(new Set())
function toggleEmployeeExpanded(employeeId: string) {
  if (expandedEmployees.value.has(employeeId)) {
    expandedEmployees.value.delete(employeeId)
  } else {
    expandedEmployees.value.add(employeeId)
  }
}

// CSV export
function exportDeptCSV() {
  const deptStats: DepartmentStats = {
    id: departmentId,
    name: department.value?.name || '',
    totalTokens: departmentTotalTokens.value,
    inputTokens: departmentInputTokens.value,
    outputTokens: departmentOutputTokens.value,
    cost: departmentCost.value,
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
