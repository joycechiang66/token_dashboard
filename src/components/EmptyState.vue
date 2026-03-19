<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center bg-card border border-border rounded-lg w-full mb-8">
    <div class="bg-secondary p-4 rounded-full mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-muted-foreground"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
        <path d="M11 8v6" />
        <path d="M8 11h6" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-foreground mb-2">{{ title }}</h3>
    <p class="text-sm text-muted-foreground max-w-sm mb-6">{{ message }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '查無資料',
  },
  message: {
    type: String,
    default: '目前篩選條件下沒有任何記錄，建議您擴大日期範圍或選擇更多模型。',
  },
})
</script>
