<template>
  <div class="mb-8 space-y-3">
    <div
      v-for="(alert, index) in alerts"
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
        @click="dismissAlert(index)"
        class="text-muted-foreground hover:text-foreground transition"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Alert {
  type: 'warning' | 'error'
  title: string
  message: string
}

const props = defineProps<{
  alerts: Alert[]
}>()

const dismissedIndices = ref<Set<number>>(new Set())

function dismissAlert(index: number) {
  dismissedIndices.value.add(index)
}
</script>
