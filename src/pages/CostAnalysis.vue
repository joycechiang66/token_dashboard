<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <router-link to="/" class="text-primary hover:opacity-80 transition mb-2 inline-block text-sm">← 返回首頁</router-link>
            <h1 class="text-3xl font-bold text-foreground">成本分析</h1>
            <p class="text-sm text-muted-foreground mt-1">詳細的成本統計和預算管理</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="showBudgetModal = true"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              ⚙ 預算設定
            </button>
            <button
              @click="exportCSV"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition text-sm"
            >
              匯出 CSV
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-8">
      <!-- Filters -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">篩選條件</h2>
          <button @click="resetFilters" class="text-sm text-primary hover:opacity-80 transition">重設篩選</button>
        </div>
        <div class="flex flex-wrap gap-6 items-end">
          <div class="flex gap-4 items-end flex-wrap">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">開始日期</label>
              <input v-model="dateRange.startDate" type="date" class="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">結束日期</label>
              <input v-model="dateRange.endDate" type="date" class="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm" />
            </div>
            <div class="flex gap-2">
              <button @click="setLast7Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 7 天</button>
              <button @click="setLast14Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 14 天</button>
              <button @click="setLast30Days" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">最近 30 天</button>
            </div>
          </div>
          <div class="flex gap-3 items-end flex-wrap">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                選擇模型
                <span v-if="selectedModels.length > 0" class="ml-1 text-primary">({{ selectedModels.length }} 個)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="model in availableModels"
                  :key="model"
                  @click="toggleModel(model)"
                  :class="[
                    'px-3 py-1 text-sm rounded-full border transition',
                    selectedModels.includes(model)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary',
                  ]"
                >{{ model }}</button>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="selectAllModels" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">全選</button>
              <button @click="clearModels" class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition">清除</button>
            </div>
          </div>
        </div>
        <p class="text-xs text-muted-foreground mt-3">顯示 {{ filteredRecords.length }} 筆記錄（共 {{ tokenRecords.length }} 筆）</p>
      </div>

      <!-- Cost Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">篩選期間成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCostCompact(companyCost) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">平均日成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCost(averageDailyCost) }}</p>
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
        <div class="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>預算: {{ formatCost(companyBudget) }}</span>
          <span>已使用: {{ formatCost(companyCost) }}</span>
          <span :class="companyBudget - companyCost < 0 ? 'text-red-500' : ''">
            {{ companyBudget - companyCost >= 0 ? '剩餘: ' : '超支: ' }}{{ formatCost(Math.abs(companyBudget - companyCost)) }}
          </span>
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
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>{{ formatCost(departmentStats[dept.id]?.cost || 0) }}</span>
              <span>/ {{ formatCost(budgetStore.getDepartmentBudget(dept.id)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cost Trend Chart (30 days) -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-4">過去 30 天成本趨勢</h2>
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
        <!-- Bar chart -->
        <div class="relative h-48 flex items-end gap-1 px-2">
          <div
            v-for="(day, i) in last30DaysTrend"
            :key="i"
            class="flex-1 flex flex-col items-center gap-1 group"
          >
            <div class="relative w-full">
              <div
                :style="{ height: Math.max((day.cost / trendMaxCost) * 140, 2) + 'px' }"
                class="w-full bg-primary rounded-t opacity-80 group-hover:opacity-100 transition-all"
              />
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                {{ day.date }}: {{ formatCost(day.cost) }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-2 px-2">
          <span>{{ last30DaysTrend[0]?.date }}</span>
          <span>{{ last30DaysTrend[Math.floor(last30DaysTrend.length / 2)]?.date }}</span>
          <span>{{ last30DaysTrend[last30DaysTrend.length - 1]?.date }}</span>
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
        <!-- Grouped bar chart: cost vs budget -->
        <div class="relative h-48 flex items-end gap-2 px-2">
          <div
            v-for="(month, i) in budgetHistory"
            :key="i"
            class="flex-1 flex items-end gap-0.5 group"
          >
            <div class="relative flex-1">
              <div
                :style="{ height: Math.max((month.cost / historyMaxBudget) * 140, 2) + 'px' }"
                class="w-full bg-primary rounded-t opacity-80 group-hover:opacity-100 transition-all"
              />
            </div>
            <div class="relative flex-1">
              <div
                :style="{ height: Math.max((month.budget / historyMaxBudget) * 140, 2) + 'px' }"
                class="w-full bg-muted-foreground rounded-t opacity-40 group-hover:opacity-60 transition-all"
              />
            </div>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              {{ month.month }}: {{ formatCost(month.cost) }} / {{ formatCost(month.budget) }}
            </div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-2 px-2">
          <span v-for="(m, i) in budgetHistory" :key="i" class="flex-1 text-center truncate">{{ m.month.slice(5) }}</span>
        </div>
        <div class="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-primary inline-block opacity-80" /> 實際成本</span>
          <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-muted-foreground inline-block opacity-40" /> 預算上限</span>
        </div>
      </div>

      <!-- Model Cost Analysis -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-6">模型成本佔比</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Pie chart (CSS) -->
          <div class="flex items-center justify-center">
            <div class="relative w-48 h-48">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--secondary))" stroke-width="20" />
                <circle
                  v-for="(seg, i) in pieSegments"
                  :key="i"
                  cx="50" cy="50" r="40"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="20"
                  :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                  :stroke-dashoffset="-seg.offset"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
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
import { computed, ref, reactive } from 'vue'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact, formatCost, calculateRecordCost } from '../utils/costCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import { exportCostAnalysisToCSV, downloadCSV } from '../utils/csvExport'
import type { TokenRecord, Department, DepartmentStats } from '../types'

const budgetStore = useBudgetStore()

const data = ref(getMockData())
const departments = ref<Department[]>(data.value.departments)
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)
const availableModels = ref<string[]>(getAvailableModels())

// Filters
const selectedModels = ref<string[]>([])
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
function resetFilters() { setLast30Days(); selectedModels.value = [] }

// Filtered records
const filteredRecords = computed(() => {
  let records = tokenRecords.value
  records = filterRecordsByDateRange(records, dateRange.value.startDate, dateRange.value.endDate)
  if (selectedModels.value.length > 0) {
    records = filterRecordsByModels(records, selectedModels.value)
  }
  return records
})

// Stats
const companyCost = computed(() => calculateTotalCost(filteredRecords.value))
const companyBudget = computed(() => budgetStore.getCompanyBudget())
const companyUsageRate = computed(() => companyCost.value / companyBudget.value)

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

function getDeptUsageRate(deptId: string): number {
  const cost = departmentStats.value[deptId]?.cost || 0
  const budget = budgetStore.getDepartmentBudget(deptId) || 1
  return cost / budget
}

// 30-day trend
const last30DaysTrend = computed(() => {
  const days: Array<{ date: string; cost: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayRecords = tokenRecords.value.filter((r) => r.date === dateStr)
    days.push({ date: dateStr.slice(5), cost: calculateTotalCost(dayRecords) })
  }
  return days
})
const trendTotalCost = computed(() => last30DaysTrend.value.reduce((s, d) => s + d.cost, 0))
const trendAvgCost = computed(() => trendTotalCost.value / 30)
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
const historyMaxBudget = computed(() => Math.max(...budgetHistory.value.map((m) => Math.max(m.cost, m.budget)), 0.01))

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

const circumference = 2 * Math.PI * 40 // r=40
const pieSegments = computed(() => {
  let offset = 0
  return modelStats.value.map((model, i) => {
    const dash = (model.percentage / 100) * circumference
    const seg = { dash, gap: circumference - dash, offset, color: pieColors[i % pieColors.length] }
    offset += dash
    return seg
  })
})

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
