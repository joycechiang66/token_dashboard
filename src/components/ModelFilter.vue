<template>
  <div class="flex gap-2 items-end">
    <div class="flex-1">
      <label class="block text-sm font-medium text-foreground mb-2">選擇模型</label>
      <select
        multiple
        :value="modelValue"
        @change="handleChange"
        class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
        size="1"
      >
        <option v-for="model in availableModels" :key="model" :value="model">
          {{ model }}
        </option>
      </select>
    </div>
    <div class="flex gap-2">
      <button
        @click="selectAll"
        class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition"
      >
        全選
      </button>
      <button
        @click="clearAll"
        class="px-3 py-2 text-sm bg-secondary text-foreground rounded-md hover:opacity-90 transition"
      >
        清除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string[]
  availableModels: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function handleChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const selected = Array.from(target.selectedOptions, (option) => option.value)
  emit('update:modelValue', selected)
}

function selectAll() {
  emit('update:modelValue', [...availableModels])
}

function clearAll() {
  emit('update:modelValue', [])
}
</script>
