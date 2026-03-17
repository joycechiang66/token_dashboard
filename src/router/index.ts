import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import DepartmentDetail from '../pages/DepartmentDetail.vue'
import CostAnalysis from '../pages/CostAnalysis.vue'
import Login from '../pages/Login.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/department/:id',
    name: 'DepartmentDetail',
    component: DepartmentDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/cost-analysis',
    name: 'CostAnalysis',
    component: CostAnalysis,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
