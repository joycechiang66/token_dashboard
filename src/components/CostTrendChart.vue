<template>
  <div class="w-full">
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">總成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCostCompact(totalCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">平均成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(averageCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">最高成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(maxCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">最低成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(minCost) }}</p>
      </div>
    </div>

    <div class="bg-secondary rounded-lg p-6 h-96 flex items-center justify-center text-muted-foreground">
      <p>成本趨勢圖表（需要 Recharts 集成）</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TokenRecord } from '../types'
import { calculateRecordCost, formatCostCompact, formatCost } from '../utils/costCalculator'

defineProps<{
  records: TokenRecord[]
}>()

const totalCost = computed(() => {
  return (props.records || []).reduce((sum, r) => sum + calculateRecordCost(r), 0)
})

const averageCost = computed(() => {
  const records = props.records || []
  return records.length > 0 ? totalCost.value / records.length : 0
})

const maxCost = computed(() => {
  const records = props.records || []
  if (records.length === 0) return 0
  return Math.max(...records.map((r) => calculateRecordCost(r)))
})

const minCost = computed(() => {
  const records = props.records || []
  if (records.length === 0) return 0
  return Math.min(...records.map((r) => calculateRecordCost(r)))
})
</script>
