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
    
    const companyBudget = budgetStore.getCompanyBudget()
    const companyUsageRate = getUsageRate(companyCost.value, companyBudget)
    
    if (companyUsageRate > 0.8) {
      result.push({
        type: companyUsageRate > 1 ? 'error' : 'warning',
        title: companyUsageRate > 1 ? '公司預算已超支' : '公司預算即將用盡',
        message: `已使用 ${formatUsageRate(companyUsageRate)}，共 $${companyCost.value.toFixed(2)} / $${companyBudget.toFixed(2)}`,
      })
    }

    departments.value.forEach((dept) => {
      const deptCost = departmentStats.value[dept.id]?.cost || 0
      const deptBudget = budgetStore.getDepartmentBudget(dept.id)
      const rate = getUsageRate(deptCost, deptBudget)
      
      if (rate > 0.8) {
        result.push({
          type: rate > 1 ? 'error' : 'warning',
          title: `${dept.name}${rate > 1 ? '預算超支' : '預算即將用盡'}`,
          message: `已使用 ${formatUsageRate(rate)}，共 $${deptCost.toFixed(2)} / $${deptBudget.toFixed(2)}`,
        })
      }
    })
    
    return result
  })

  return {
    alerts
  }
}
