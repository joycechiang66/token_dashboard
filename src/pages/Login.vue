<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Token Dashboard</h1>
        <p class="text-muted-foreground">請登入以繼續使用</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-foreground mb-2">帳號</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            placeholder="請輸入帳號"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-2">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            placeholder="請輸入密碼"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 py-2 rounded">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition duration-200"
          :disabled="loading"
        >
          {{ loading ? '登入中...' : '登入' }}
        </button>

        <div class="mt-6 text-xs text-center text-muted-foreground bg-secondary/50 p-4 rounded-md">
          <p class="font-semibold mb-2">測試帳號：</p>
          <div class="flex justify-center gap-8">
            <div>
              <span class="block font-medium text-foreground">管理員</span>
              <span>admin / admin123</span>
            </div>
            <div>
              <span class="block font-medium text-foreground">一般用戶</span>
              <span>user / user123</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))

  if (authStore.login(username.value, password.value)) {
    router.push('/')
  } else {
    error.value = '帳號或密碼錯誤'
  }
  
  loading.value = false
}
</script>
