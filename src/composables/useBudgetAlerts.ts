import { computed, type Ref } from 'vue'
import type { Department, DepartmentStats } from '../types'

interface BudgetStore {
  getCompanyBudget: () => number
  getDepartmentBudget: (id: string) => number
}

interface Alert {
  type: 'warning' | 'error'
  title: string
  message: string
}

function getUsageRate(cost: number, budget: number): number {
  if (budget <= 0) {
    return cost > 0 ? Number.POSITIVE_INFINITY : 0
  }
  return cost / budget
}

function formatUsageRate(rate: number): string {
  return Number.isFinite(rate) ? `${(rate * 100).toFixed(1)}%` : '∞%'
}

export function useBudgetAlerts(
  budgetStore: BudgetStore,
  companyCost: Ref<number>,
  departmentStats: Ref<Record<string, DepartmentStats>>,
  departments: Ref<Department[]>
) {
  const alerts = computed(() => {
    const result: Alert[] = []
    const companyTotalTokens = Object.values(departmentStats.value).reduce((sum, dept) => sum + dept.totalTokens, 0)
    
    const companyBudget = budgetStore.getCompanyBudget()
    const companyUsageRate = getUsageRate(companyCost.value, companyBudget)
    
    if (companyUsageRate > 0.8) {
      result.push({
        type: companyUsageRate > 1 ? 'error' : 'warning',
        title: companyUsageRate > 1 ? '公司 Token 用量過高' : '公司 Token 用量接近上限',
        message: companyUsageRate > 1
          ? `目前累計 Token 用量為 ${companyTotalTokens.toLocaleString()}，對應使用率 ${formatUsageRate(companyUsageRate)}，請優先檢視高使用量部門與模型使用情況。`
          : `目前累計 Token 用量為 ${companyTotalTokens.toLocaleString()}，對應使用率 ${formatUsageRate(companyUsageRate)}，建議提前檢視各部門後續 Token 需求。`,
      })
    }

    departments.value.forEach((dept) => {
      const deptCost = departmentStats.value[dept.id]?.cost || 0
      const deptTokens = departmentStats.value[dept.id]?.totalTokens || 0
      const deptBudget = budgetStore.getDepartmentBudget(dept.id)
      const rate = getUsageRate(deptCost, deptBudget)
      
      if (rate > 0.8) {
        result.push({
          type: rate > 1 ? 'error' : 'warning',
          title: `${dept.name}${rate > 1 ? 'Token 用量過高' : 'Token 用量接近上限'}`,
          message: rate > 1
            ? `目前累計 Token 用量為 ${deptTokens.toLocaleString()}，對應使用率 ${formatUsageRate(rate)}，請優先檢視該部門高使用量人員與模型使用情況。`
            : `目前累計 Token 用量為 ${deptTokens.toLocaleString()}，對應使用率 ${formatUsageRate(rate)}，建議提早評估該部門後續 Token 使用量。`,
        })
      }
    })
    
    return result
  })

  return {
    alerts
  }
}
