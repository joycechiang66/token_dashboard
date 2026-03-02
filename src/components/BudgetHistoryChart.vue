<template>
  <div class="w-full">
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">平均月成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCostCompact(averageMonthCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">最高月成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(maxMonthCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">最低月成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(minMonthCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">平均使用率</p>
        <p class="text-2xl font-bold text-foreground">{{ averageUsageRate.toFixed(1) }}%</p>
      </div>
    </div>

    <div class="bg-secondary rounded-lg p-6 h-96 flex items-center justify-center text-muted-foreground">
      <p>預算歷史趨勢圖表（需要 Recharts 集成）</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCostCompact, formatCost } from '../utils/costCalculator'

interface BudgetHistoryItem {
  month: string
  cost: number
  budget: number
}

defineProps<{
  history: BudgetHistoryItem[]
}>()

const averageMonthCost = computed(() => {
  const history = (props.history || []) as BudgetHistoryItem[]
  if (history.length === 0) return 0
  return history.reduce((sum, h) => sum + h.cost, 0) / history.length
})

const maxMonthCost = computed(() => {
  const history = (props.history || []) as BudgetHistoryItem[]
  if (history.length === 0) return 0
  return Math.max(...history.map((h) => h.cost))
})

const minMonthCost = computed(() => {
  const history = (props.history || []) as BudgetHistoryItem[]
  if (history.length === 0) return 0
  return Math.min(...history.map((h) => h.cost))
})

const averageUsageRate = computed(() => {
  const history = (props.history || []) as BudgetHistoryItem[]
  if (history.length === 0) return 0
  const avgRate = history.reduce((sum, h) => sum + (h.cost / h.budget) * 100, 0) / history.length
  return avgRate
})
</script>
