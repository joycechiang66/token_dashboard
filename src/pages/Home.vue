<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-foreground">Token 使用量儀表板</h1>
            <p class="text-sm text-muted-foreground mt-1">公司內部 AI Token 消耗統計與分析</p>
          </div>
          <router-link
            to="/cost-analysis"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
          >
            成本分析
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-8">
      <!-- Top Alert -->
      <TopBudgetAlert v-if="topAlerts.length > 0" :alerts="topAlerts" />

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">總 Token 使用量</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(totalTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">輸入 Token</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(totalInputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">輸出 Token</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(totalOutputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">預估成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCostCompact(companyCost) }}</p>
        </div>
      </div>

      <!-- Department Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground">部門數量</p>
          <p class="text-3xl font-bold text-foreground">{{ departments.length }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground">員工總數</p>
          <p class="text-3xl font-bold text-foreground">{{ employees.length }}</p>
        </div>
      </div>

      <!-- Efficiency Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-foreground mb-6">部門效率排名</h2>
        <div class="space-y-3">
          <div
            v-for="(dept, index) in departmentEfficiencyRanking"
            :key="dept.id"
            class="flex items-center justify-between p-4 bg-secondary rounded-lg"
          >
            <div class="flex items-center gap-4 flex-1">
              <span class="text-sm font-semibold text-muted-foreground w-8">{{ index + 1 }}</span>
              <span class="font-medium text-foreground">{{ dept.name }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground">{{ dept.efficiency.toFixed(0) }} Token/$</span>
              <span
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  dept.rating === '高效'
                    ? 'bg-green-100 text-green-800'
                    : dept.rating === '低效'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{ dept.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Departments Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="dept in departments"
          :key="dept.id"
          :to="`/department/${dept.id}`"
          class="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
        >
          <h3 class="text-lg font-semibold text-foreground mb-4">{{ dept.name }}</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">Token 使用量</span>
              <span class="text-sm font-medium text-foreground">{{
                formatNumber(departmentStats[dept.id]?.totalTokens || 0)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">預估成本</span>
              <span class="text-sm font-medium text-foreground">{{
                formatCostCompact(departmentStats[dept.id]?.cost || 0)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">使用記錄</span>
              <span class="text-sm font-medium text-foreground">{{
                departmentStats[dept.id]?.recordCount || 0
              }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact } from '../utils/costCalculator'
import { calculateDepartmentEfficiencies, getEfficiencyRating } from '../utils/efficiencyCalculator'
import { useBudgetStore } from '../stores/budgetStore'
import TopBudgetAlert from '../components/TopBudgetAlert.vue'
import type { TokenRecord, Department, Employee, DepartmentStats } from '../types'

const budgetStore = useBudgetStore()

const data = ref(getMockData())
const departments = ref<Department[]>(data.value.departments)
const employees = ref<Employee[]>(data.value.employees)
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)

const selectedModels = ref<string[]>([])
const dateRange = ref({ startDate: '2026-02-01', endDate: '2026-03-02' })

const filteredRecords = computed(() => {
  let records = tokenRecords.value
  records = filterRecordsByDateRange(records, dateRange.value.startDate, dateRange.value.endDate)
  if (selectedModels.value.length > 0) {
    records = filterRecordsByModels(records, selectedModels.value)
  }
  return records
})

const totalTokens = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0)
})

const totalInputTokens = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + r.inputTokens, 0)
})

const totalOutputTokens = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + r.outputTokens, 0)
})

const companyCost = computed(() => {
  return calculateTotalCost(filteredRecords.value)
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

const departmentEfficiencies = computed(() => {
  return calculateDepartmentEfficiencies(
    filteredRecords.value,
    departments.value.map((d) => d.id)
  )
})

const departmentEfficiencyRanking = computed(() => {
  const allEfficiencies = Object.values(departmentEfficiencies.value)

  return departments.value
    .map((dept) => ({
      id: dept.id,
      name: dept.name,
      efficiency: departmentEfficiencies.value[dept.id] || 0,
      rating: getEfficiencyRating(departmentEfficiencies.value[dept.id] || 0, allEfficiencies),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
})

const topAlerts = computed(() => {
  const alerts = []

  const companyBudget = budgetStore.getCompanyBudget()
  const companyUsageRate = companyCost.value / companyBudget

  if (companyUsageRate >= 0.8) {
    alerts.push({
      type: companyUsageRate >= 1 ? 'error' : 'warning',
      title: companyUsageRate >= 1 ? '公司預算已超支' : '公司預算即將用盡',
      message: `已使用 ${(companyUsageRate * 100).toFixed(1)}% 的預算`,
    })
  }

  return alerts
})

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

onMounted(() => {
  // Initialize data
})
</script>
