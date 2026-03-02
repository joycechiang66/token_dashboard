<template>
  <div class="w-full">
    <div class="bg-secondary rounded-lg p-6 h-96 flex items-center justify-center text-muted-foreground mb-6">
      <p>部門成本對比柱狀圖（需要 Recharts 集成）</p>
    </div>

    <div class="bg-secondary rounded-lg p-6 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-2 px-4 font-semibold text-foreground">部門</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">成本</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">佔比</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">Token 數</th>
            <th class="text-right py-2 px-4 font-semibold text-foreground">使用記錄</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dept in departmentStats"
            :key="dept.id"
            class="border-b border-border hover:bg-accent transition"
          >
            <td class="py-2 px-4 text-foreground font-medium">{{ dept.name }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ formatCost(dept.cost) }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ dept.percentage.toFixed(1) }}%</td>
            <td class="text-right py-2 px-4 text-foreground">{{ formatNumber(dept.totalTokens) }}</td>
            <td class="text-right py-2 px-4 text-foreground">{{ dept.recordCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Department, DepartmentStats } from '../types'
import { formatCost } from '../utils/costCalculator'

const props = defineProps<{
  departments: Department[]
  stats: Record<string, DepartmentStats>
}>()

const departmentStats = computed(() => {
  const total = Object.values(props.stats || {}).reduce((sum, s) => sum + s.cost, 0)

  return (props.departments || [])
    .map((dept) => {
      const stat = (props.stats || {})[dept.id]
      return {
        id: dept.id,
        name: dept.name,
        cost: stat?.cost || 0,
        percentage: total > 0 ? ((stat?.cost || 0) / total) * 100 : 0,
        totalTokens: stat?.totalTokens || 0,
        recordCount: stat?.recordCount || 0,
      }
    })
    .sort((a, b) => b.cost - a.cost)
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
</script>
