<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center justify-between w-full min-w-[200px] px-3 py-2 text-sm bg-background border rounded-md transition focus:outline-none focus:ring-2 focus:ring-ring"
      :class="[
        modelValue.length === 0 ? 'border-red-500 hover:border-red-600' : 'border-border hover:border-primary'
      ]"
      type="button"
    >
      <span v-if="modelValue.length === 0" class="text-red-500">{{ placeholder }}</span>
      <span v-else-if="modelValue.length === options.length" class="text-foreground">全部模型 ({{ modelValue.length }})</span>
      <span v-else-if="modelValue.length === 1" class="text-foreground truncate max-w-[150px]">{{ modelValue[0] }}</span>
      <span v-else class="text-foreground">已選擇 {{ modelValue.length }} 個模型</span>
      
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
        class="ml-2 w-4 h-4 transition-transform duration-200"
        :class="[
          isOpen ? 'rotate-180' : '',
          modelValue.length === 0 ? 'text-red-500' : ''
        ]"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </button>
    <p v-if="modelValue.length === 0" class="absolute top-full left-0 text-xs text-red-500 mt-1">至少需選一個模型</p>

    <!-- Dropdown Content -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md animate-in fade-in-0 zoom-in-95"
    >
      <!-- Actions -->
      <div class="flex items-center justify-between p-2 border-b border-border">
        <button
          @click="selectAll"
          class="text-xs text-primary hover:opacity-80 transition font-medium"
        >
          全選
        </button>
        <button
          @click="clearAll"
          class="text-xs text-muted-foreground hover:text-destructive transition"
        >
          清除
        </button>
      </div>

      <!-- Options List -->
      <div class="max-h-60 overflow-y-auto p-1">
        <label
          v-for="option in options"
          :key="option"
          class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="modelValue.includes(option)"
            @change="toggleOption(option)"
            class="w-4 h-4 rounded border-input text-primary focus:ring-ring"
          />
          <span class="flex-1 truncate">{{ option }}</span>
        </label>
        <div v-if="options.length === 0" class="p-2 text-sm text-muted-foreground text-center">
          無可用選項
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  options: string[];
  modelValue: string[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

const toggleOption = (option: string) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(option);
  
  if (index === -1) {
    newValue.push(option);
  } else {
    newValue.splice(index, 1);
  }
  
  emit('update:modelValue', newValue);
};

const selectAll = () => {
  emit('update:modelValue', [...props.options]);
};

const clearAll = () => {
  emit('update:modelValue', []);
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
