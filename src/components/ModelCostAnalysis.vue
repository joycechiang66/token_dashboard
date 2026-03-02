<template>
  <div class="w-full">
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">總成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCostCompact(totalCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">總使用次數</p>
        <p class="text-2xl font-bold text-foreground">{{ totalCount }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">平均成本</p>
        <p class="text-2xl font-bold text-foreground">{{ formatCost(averageCost) }}</p>
      </div>
      <div class="bg-secondary rounded-lg p-4">
        <p class="text-sm text-muted-foreground mb-1">最常用模型</p>
        <p class="text-2xl font-bold text-foreground">{{ mostUsedModel }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-secondary rounded-lg p-6 h-96 flex items-center justify-center text-muted-foreground">
        <p>模型成本佔比圓餅圖（需要 Recharts 集成）</p>
      </div>
      <div class="bg-secondary rounded-lg p-6 h-96 flex items-center justify-center text-muted-foreground">
        <p>模型使用頻率柱狀圖（需要 Recharts 集成）</p>
      </div>
    </div>

    <div class="bg-secondary rounded-lg p-6 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-2 px-4 font-semibold text-foreground">模型</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">成本</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">佔比</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">使用次數</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">平均成本</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="model in modelStats"
            :key="model.name"
            class="border-b border-border hover:bg-accent transition"
          >
            <td class="py-2 px-4 text-foreground font-medium">{{ model.name }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ formatCost(model.cost) }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ model.percentage.toFixed(1) }}%</td>
            <td class="text-right py-2 px-4 text-foreground">{{ model.count }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ formatCost(model.avgCost) }}</td>
          </tr>
        </tbody>
      </table>
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

const modelStats = computed(() => {
  const stats = new Map<string, { cost: number; count: number }>()

  ;(props.records || []).forEach((record) => {
    const key = record.model
    const existing = stats.get(key) || { cost: 0, count: 0 }
    existing.cost += calculateRecordCost(record)
    existing.count++
    stats.set(key, existing)
  })

  const total = totalCost.value

  return Array.from(stats.entries())
    .map(([name, data]) => ({
      name,
      cost: data.cost,
      count: data.count,
      percentage: total > 0 ? (data.cost / total) * 100 : 0,
      avgCost: data.count > 0 ? data.cost / data.count : 0,
    }))
    .sort((a, b) => b.cost - a.cost)
})

const totalCost = computed(() => {
  return (props.records || []).reduce((sum, r) => sum + calculateRecordCost(r), 0)
})

const totalCount = computed(() => {
  return (props.records || []).length
})

const averageCost = computed(() => {
  return totalCount.value > 0 ? totalCost.value / totalCount.value : 0
})

const mostUsedModel = computed(() => {
  if (modelStats.value.length === 0) return '無'
  return modelStats.value[0].name
})
</script>
