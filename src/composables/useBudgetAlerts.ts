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

export function useBudgetAlerts(
  budgetStore: BudgetStore,
  companyCost: Ref<number>,
  departmentStats: Ref<Record<string, DepartmentStats>>,
  departments: Ref<Department[]>
) {
  const alerts = computed(() => {
    const result: Alert[] = []
    
    // Check company budget
    const companyBudget = budgetStore.getCompanyBudget()
    // Avoid division by zero
    const companyUsageRate = companyBudget > 0 ? companyCost.value / companyBudget : 0
    
    if (companyUsageRate >= 0.8) {
      result.push({
        type: companyUsageRate >= 1 ? 'error' : 'warning',
        title: companyUsageRate >= 1 ? '公司預算已超支' : '公司預算即將用盡',
        message: `已使用 ${(companyUsageRate * 100).toFixed(1)}%，共 $${companyCost.value.toFixed(2)} / $${companyBudget.toFixed(2)}`,
      })
    }

    // Check department budgets
    departments.value.forEach((dept) => {
      const deptCost = departmentStats.value[dept.id]?.cost || 0
      const deptBudget = budgetStore.getDepartmentBudget(dept.id) || 0
      
      if (deptBudget > 0) {
        const rate = deptCost / deptBudget
        if (rate >= 0.8) {
          result.push({
            type: rate >= 1 ? 'error' : 'warning',
            title: `${dept.name}${rate >= 1 ? '預算超支' : '預算即將用盡'}`,
            message: `已使用 ${(rate * 100).toFixed(1)}%，共 $${deptCost.toFixed(2)} / $${deptBudget.toFixed(2)}`,
          })
        }
      }
    })
    
    return result
  })

  return {
    alerts
  }
}
