<template>
  <div class="mb-8 space-y-3">
    <div
      v-for="(alert, index) in visibleAlerts"
      :key="index"
      :class="[
        'p-4 rounded-lg border flex items-center justify-between',
        alert.type === 'error'
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200',
      ]"
    >
      <div>
        <p
          :class="[
            'font-semibold',
            alert.type === 'error' ? 'text-red-800' : 'text-yellow-800',
          ]"
        >
          {{ alert.title }}
        </p>
        <p
          :class="[
            'text-sm mt-1',
            alert.type === 'error' ? 'text-red-700' : 'text-yellow-700',
          ]"
        >
          {{ alert.message }}
        </p>
      </div>
      <button
        @click="dismissAlert(alert)"
        class="text-muted-foreground hover:text-foreground transition"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Alert {
  type: 'warning' | 'error'
  title: string
  message: string
}

const props = defineProps<{
  alerts: Alert[]
}>()

const dismissedKeys = ref<Set<string>>(new Set())

const visibleAlerts = computed(() => {
  return props.alerts.filter((alert) => !dismissedKeys.value.has(getAlertKey(alert)))
})

function getAlertKey(alert: Alert) {
  return `${alert.title}-${alert.message}`
}

function dismissAlert(alert: Alert) {
  const newSet = new Set(dismissedKeys.value)
  newSet.add(getAlertKey(alert))
  dismissedKeys.value = newSet
}
</script>
