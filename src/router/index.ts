import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import DepartmentDetail from '../pages/DepartmentDetail.vue'
import CostAnalysis from '../pages/CostAnalysis.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/department/:id',
    name: 'DepartmentDetail',
    component: DepartmentDetail,
  },
  {
    path: '/cost-analysis',
    name: 'CostAnalysis',
    component: CostAnalysis,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
