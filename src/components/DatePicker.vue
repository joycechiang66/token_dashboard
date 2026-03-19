<template>
  <div class="relative w-full">
    <!-- Visual custom input -->
    <div
      class="flex items-center justify-between px-3 py-2 border rounded-md bg-background text-sm transition-colors"
      :class="[
        error ? 'border-red-500 focus-within:ring-red-500 text-red-500' : 'border-border text-foreground focus-within:ring-2 focus-within:ring-ring focus-within:border-primary',
      ]"
    >
      <span>{{ formattedDate }}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-muted-foreground ml-2 flex-shrink-0"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
      </svg>
    </div>
    <!-- Hidden native input -->
    <input
      type="date"
      v-model="internalValue"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  error?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formattedDate = computed(() => {
  if (!props.modelValue) return 'YYYY/MM/DD'
  return props.modelValue.replace(/-/g, '/')
})
</script>
