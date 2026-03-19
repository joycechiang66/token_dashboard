<template>
  <div id="app" class="min-h-screen bg-background text-foreground flex flex-col">
    <router-view class="flex-1" />
    <footer class="py-4 text-center text-sm text-muted-foreground border-t border-border mt-auto">
      &copy; {{ new Date().getFullYear() }} Ai3人工智能股份有限公司 版權所有
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
