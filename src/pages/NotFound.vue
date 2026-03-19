<template>
  <div class="flex-1 flex items-center justify-center bg-background px-4 py-12">
    <div class="text-center max-w-md w-full">
      <div class="mb-6 text-9xl font-bold text-primary opacity-20">404</div>
      <h1 class="text-3xl font-bold text-foreground mb-4">找不到頁面</h1>
      <p class="text-muted-foreground mb-8">
        抱歉，您所尋找的頁面不存在或是已被移除。
      </p>
      <router-link
        to="/"
        class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
      >
        返回首頁
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for static 404 page
</script>
