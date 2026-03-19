import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  username: string
  role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  // 初始化時檢查 localStorage (模擬持久化登入)
  const savedUser = localStorage.getItem('token-dashboard-user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch {
      localStorage.removeItem('token-dashboard-user')
    }
  }

  function login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin123') {
      user.value = { username: 'admin', role: 'admin' }
    } else if (username === 'user' && password === 'user123') {
      user.value = { username: 'user', role: 'user' }
    } else {
      return false
    }
    
    localStorage.setItem('token-dashboard-user', JSON.stringify(user.value))
    return true
  }

  function logout() {
    user.value = null
    localStorage.removeItem('token-dashboard-user')
    // 移除 window.location.href 強制跳轉，讓 UI 層的 vue-router 處理跳轉
    // 以避免 base URL 問題
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout
  }
})
