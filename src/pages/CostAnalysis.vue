<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between">
          <div>
            <router-link to="/" class="text-primary hover:opacity-80 transition mb-2 inline-block">← 返回首頁</router-link>
            <h1 class="text-3xl font-bold text-foreground">成本分析</h1>
            <p class="text-sm text-muted-foreground mt-1">詳細的成本統計和預算管理</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openBudgetSettings"
              class="px-4 py-2 bg-secondary text-foreground rounded-md hover:opacity-90 transition"
            >
              預算設定
            </button>
            <button
              @click="exportToPDF"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
            >
              匯出 PDF
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
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">開始日期</label>
            <input
              v-model="dateRange.startDate"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">結束日期</label>
            <input
              v-model="dateRange.endDate"
              type="date"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">選擇模型</label>
            <select
              multiple
              v-model="selectedModels"
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option v-for="model in availableModels" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Budget Status -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-foreground mb-6">公司整體預算狀態</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-foreground">預算: {{ formatCost(companyBudget) }}</span>
            <span class="text-foreground">已使用: {{ formatCost(companyCost) }}</span>
            <span class="text-foreground">剩餘: {{ formatCost(companyBudget - companyCost) }}</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-4 overflow-hidden">
            <div
              :style="{ width: Math.min((companyCost / companyBudget) * 100, 100) + '%' }"
              :class="[
                'h-full transition-all',
                companyCost / companyBudget >= 1
                  ? 'bg-red-500'
                  : companyCost / companyBudget >= 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500',
              ]"
            />
          </div>
          <span class="text-sm text-muted-foreground">
            使用率: {{ ((companyCost / companyBudget) * 100).toFixed(1) }}%
          </span>
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
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-foreground">{{ dept.name }}</h3>
              <span class="text-sm text-muted-foreground">{{
                ((departmentStats[dept.id]?.cost || 0) / (departmentBudgets[dept.id] || 1000) * 100).toFixed(1)
              }}%</span>
            </div>
            <div class="w-full bg-secondary rounded-full h-3 overflow-hidden mb-2">
              <div
                :style="{
                  width: Math.min(
                    ((departmentStats[dept.id]?.cost || 0) / (departmentBudgets[dept.id] || 1000)) * 100,
                    100
                  ) + '%',
                }"
                :class="[
                  'h-full transition-all',
                  (departmentStats[dept.id]?.cost || 0) / (departmentBudgets[dept.id] || 1000) >= 1
                    ? 'bg-red-500'
                    : (departmentStats[dept.id]?.cost || 0) / (departmentBudgets[dept.id] || 1000) >= 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500',
                ]"
              />
            </div>
            <div class="text-xs text-muted-foreground">
              {{ formatCost(departmentStats[dept.id]?.cost || 0) }} / {{ formatCost(departmentBudgets[dept.id] || 1000) }}
            </div>
          </div>
        </div>
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

      <!-- Charts -->
      <div class="space-y-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">過去 30 天成本趨勢</h2>
          <CostTrendChart :records="filteredRecords" />
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">預算使用歷史趨勢</h2>
          <BudgetHistoryChart :history="budgetStore.getBudgetHistory()" />
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">模型成本佔比</h2>
          <ModelCostAnalysis :records="filteredRecords" />
        </div>

        <div class="bg-card border border-border rounded-lg p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">部門成本對比</h2>
          <DepartmentCostComparison :departments="departments" :stats="departmentStats" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getAvailableModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact, formatCost } from '../utils/costCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import CostTrendChart from '../components/CostTrendChart.vue'
import BudgetHistoryChart from '../components/BudgetHistoryChart.vue'
import ModelCostAnalysis from '../components/ModelCostAnalysis.vue'
import DepartmentCostComparison from '../components/DepartmentCostComparison.vue'
import type { TokenRecord, Department, DepartmentStats } from '../types'

const budgetStore = useBudgetStore()

const data = ref(getMockData())
const departments = ref<Department[]>(data.value.departments)
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)
const availableModels = ref<string[]>(getAvailableModels())

const selectedModels = ref<string[]>([])
const dateRange = ref({ startDate: '2026-02-01', endDate: '2026-03-02' })

const departmentBudgets = computed(() => {
  const budgets: Record<string, number> = {}
  departments.value.forEach((dept) => {
    budgets[dept.id] = budgetStore.getDepartmentBudget(dept.id)
  })
  return budgets
})

const companyBudget = computed(() => budgetStore.getCompanyBudget())

const filteredRecords = computed(() => {
  let records = tokenRecords.value
  records = filterRecordsByDateRange(records, dateRange.value.startDate, dateRange.value.endDate)
  if (selectedModels.value.length > 0) {
    records = filterRecordsByModels(records, selectedModels.value)
  }
  return records
})

const companyCost = computed(() => calculateTotalCost(filteredRecords.value))

const averageDailyCost = computed(() => {
  const days = Math.ceil(
    (new Date(dateRange.value.endDate).getTime() - new Date(dateRange.value.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  )
  return days > 0 ? companyCost.value / days : 0
})

const departmentStats = computed(() => {
  const stats: Record<string, DepartmentStats> = {}

  departments.value.forEach((dept) => {
    const deptRecords = filteredRecords.value.filter((r) => r.departmentId === dept.id)
    const totalTokens = deptRecords.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0)
    const inputTokens = deptRecords.reduce((sum, r) => sum + r.inputTokens, 0)
    const outputTokens = deptRecords.reduce((sum, r) => sum + r.outputTokens, 0)

    stats[dept.id] = {
      id: dept.id,
      name: dept.name,
      totalTokens,
      inputTokens,
      outputTokens,
      cost: calculateTotalCost(deptRecords),
      recordCount: deptRecords.length,
    }
  })

  return stats
})

function openBudgetSettings() {
  alert('預算設定功能 - 待實現')
}

async function exportToPDF() {
  alert('PDF 匯出功能 - 待實現')
}
</script>
