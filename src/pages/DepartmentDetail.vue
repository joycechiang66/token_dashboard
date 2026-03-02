<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container py-6">
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-primary hover:opacity-80 transition">← 返回首頁</router-link>
          <div>
            <h1 class="text-3xl font-bold text-foreground">{{ department?.name }}</h1>
            <p class="text-sm text-muted-foreground mt-1">{{ department?.description }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-8">
      <!-- Department Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">總 Token 使用量</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(departmentTotalTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">輸入 Token</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(departmentInputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">輸出 Token</p>
          <p class="text-3xl font-bold text-foreground">{{ formatNumber(departmentOutputTokens) }}</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <p class="text-sm text-muted-foreground mb-2">預估成本</p>
          <p class="text-3xl font-bold text-foreground">{{ formatCostCompact(departmentCost) }}</p>
        </div>
      </div>

      <!-- Employee Efficiency Ranking -->
      <div class="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-foreground mb-6">員工效率排名</h2>
        <div class="space-y-3">
          <div
            v-for="(emp, index) in employeeEfficiencyRanking"
            :key="emp.id"
            class="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer hover:bg-accent transition"
            @click="toggleEmployeeExpanded(emp.id)"
          >
            <div class="flex items-center gap-4 flex-1">
              <span class="text-sm font-semibold text-muted-foreground w-8">{{ index + 1 }}</span>
              <span class="font-medium text-foreground">{{ emp.name }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-muted-foreground">{{ emp.efficiency.toFixed(0) }} Token/$</span>
              <span
                :class="[
                  'px-3 py-1 rounded text-sm font-medium',
                  emp.rating === '高效'
                    ? 'bg-green-100 text-green-800'
                    : emp.rating === '低效'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{ emp.rating }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Employee Details -->
      <div class="space-y-4">
        <div
          v-for="emp in employeeEfficiencyRanking"
          v-show="expandedEmployees.has(emp.id)"
          :key="`details-${emp.id}`"
          class="bg-card border border-border rounded-lg p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">{{ emp.name }} - 詳細記錄</h3>
            <button
              @click="exportEmployeeCSV(emp.id, emp.name)"
              class="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition"
            >
              匯出 CSV
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left py-2 px-4 font-semibold text-foreground">日期</th>
                  <th class="text-left py-2 px-4 font-semibold text-foreground">模型</th>
                  <th class="text-right py-2 px-4 font-semibold text-foreground">輸入 Token</th>
                  <th class="text-right py-2 px-4 font-semibold text-foreground">輸出 Token</th>
                  <th class="text-right py-2 px-4 font-semibold text-foreground">預估成本</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in employeeRecords.get(emp.id) || []"
                  :key="record.id"
                  class="border-b border-border hover:bg-secondary transition"
                >
                  <td class="py-2 px-4 text-muted-foreground">{{ record.date }}</td>
                  <td class="py-2 px-4 text-foreground">{{ record.model }}</td>
                  <td class="text-right py-2 px-4 text-foreground">{{ formatNumber(record.inputTokens) }}</td>
                  <td class="text-right py-2 px-4 text-foreground">{{ formatNumber(record.outputTokens) }}</td>
                  <td class="text-right py-2 px-4 text-foreground">{{ formatCost(calculateRecordCost(record)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getMockData, filterRecordsByDateRange, filterRecordsByModels, getDepartmentById } from '../utils/mockData'
import { calculateTotalCost, formatCostCompact, formatCost, calculateRecordCost } from '../utils/costCalculator'
import { calculateEmployeeEfficiencies, getEfficiencyRating } from '../utils/efficiencyCalculator'
import { exportEmployeeDetailsToCSV, downloadCSV } from '../utils/csvExport'
import type { TokenRecord, Department, Employee } from '../types'

const route = useRoute()
const departmentId = route.params.id as string

const data = ref(getMockData())
const department = ref<Department | undefined>(getDepartmentById(departmentId))
const tokenRecords = ref<TokenRecord[]>(data.value.tokenRecords)

const expandedEmployees = ref<Set<string>>(new Set())

const departmentRecords = computed(() => {
  return tokenRecords.value.filter((r) => r.departmentId === departmentId)
})

const departmentTotalTokens = computed(() => {
  return departmentRecords.value.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0)
})

const departmentInputTokens = computed(() => {
  return departmentRecords.value.reduce((sum, r) => sum + r.inputTokens, 0)
})

const departmentOutputTokens = computed(() => {
  return departmentRecords.value.reduce((sum, r) => sum + r.outputTokens, 0)
})

const departmentCost = computed(() => {
  return calculateTotalCost(departmentRecords.value)
})

const departmentEmployees = computed(() => {
  return data.value.employees.filter((e) => e.departmentId === departmentId)
})

const employeeEfficiencies = computed(() => {
  return calculateEmployeeEfficiencies(
    departmentRecords.value,
    departmentEmployees.value.map((e) => e.id)
  )
})

const employeeRecords = computed(() => {
  const map = new Map<string, TokenRecord[]>()
  departmentEmployees.value.forEach((emp) => {
    map.set(emp.id, departmentRecords.value.filter((r) => r.employeeId === emp.id))
  })
  return map
})

const employeeEfficiencyRanking = computed(() => {
  const allEfficiencies = Object.values(employeeEfficiencies.value)

  return departmentEmployees.value
    .map((emp) => ({
      id: emp.id,
      name: emp.name,
      efficiency: employeeEfficiencies.value[emp.id] || 0,
      rating: getEfficiencyRating(employeeEfficiencies.value[emp.id] || 0, allEfficiencies),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
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

function toggleEmployeeExpanded(employeeId: string) {
  if (expandedEmployees.value.has(employeeId)) {
    expandedEmployees.value.delete(employeeId)
  } else {
    expandedEmployees.value.add(employeeId)
  }
}

function exportEmployeeCSV(employeeId: string, employeeName: string) {
  const records = employeeRecords.value.get(employeeId) || []
  const csv = exportEmployeeDetailsToCSV(employeeName, records)
  downloadCSV(csv, `employee-${employeeName}-${new Date().toISOString().split('T')[0]}.csv`)
}

onMounted(() => {
  // Initialize
})
</script>
