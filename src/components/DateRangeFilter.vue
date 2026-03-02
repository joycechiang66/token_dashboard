<template>
  <div class="flex gap-4 items-end">
    <div>
      <label class="block text-sm font-medium text-foreground mb-2">開始日期</label>
      <input
        :value="modelValue.startDate"
        @input="updateStart"
        type="date"
        class="px-3 py-2 border border-border rounded-md bg-background text-foreground"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-foreground mb-2">結束日期</label>
      <input
        :value="modelValue.endDate"
        @input="updateEnd"
        type="date"
        class="px-3 py-2 border border-border rounded-md bg-background text-foreground"
      />
    </div>
    <div class="flex gap-2">
      <button
        @click="setLast7Days"
        class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition"
      >
        最近 7 天
      </button>
      <button
        @click="setLast14Days"
        class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition"
      >
        最近 14 天
      </button>
      <button
        @click="setLast30Days"
        class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition"
      >
        最近 30 天
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateRange {
  startDate: string
  endDate: string
}

defineProps<{
  modelValue: DateRange
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

function updateStart(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', {
    startDate: target.value,
    endDate: modelValue.endDate,
  })
}

function updateEnd(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', {
    startDate: modelValue.startDate,
    endDate: target.value,
  })
}

function setLast7Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 7)
  emit('update:modelValue', {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  })
}

function setLast14Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 14)
  emit('update:modelValue', {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  })
}

function setLast30Days() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 30)
  emit('update:modelValue', {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  })
}
</script>
