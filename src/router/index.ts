import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import DepartmentDetail from '../pages/DepartmentDetail.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/NotFound.vue'
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
    redirect: '/'
  },
  {
    path: '/fee-analysis',
    redirect: '/'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
