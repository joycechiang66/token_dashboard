import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBudgetStore = defineStore('budget', () => {
  const companyBudget = ref(10000)
  const departmentBudgets = ref<Record<string, number>>({
    'dept-1': 2000,
    'dept-2': 3000,
    'dept-3': 1500,
    'dept-4': 1500,
    'dept-5': 1000,
  })

  const budgetHistory = ref<Array<{ month: string; cost: number; budget: number }>>([
    { month: '2025-11', cost: 8500, budget: 10000 },
    { month: '2025-12', cost: 9200, budget: 10000 },
    { month: '2026-01', cost: 7800, budget: 10000 },
    { month: '2026-02', cost: 8900, budget: 10000 },
    { month: '2026-03', cost: 9100, budget: 10000 },
    { month: '2026-04', cost: 8600, budget: 10000 },
    { month: '2026-05', cost: 9400, budget: 10000 },
    { month: '2026-06', cost: 8200, budget: 10000 },
    { month: '2026-07', cost: 9800, budget: 10000 },
    { month: '2026-08', cost: 8700, budget: 10000 },
    { month: '2026-09', cost: 9300, budget: 10000 },
    { month: '2026-10', cost: 8400, budget: 10000 },
  ])

  function setCompanyBudget(budget: number) {
    companyBudget.value = budget
  }

  function setDepartmentBudget(departmentId: string, budget: number) {
    departmentBudgets.value[departmentId] = budget
  }

  function getCompanyBudget(): number {
    return companyBudget.value
  }

  function getDepartmentBudget(departmentId: string): number {
    return departmentBudgets.value[departmentId] || 0
  }

  function getBudgetHistory() {
    return budgetHistory.value
  }

  return {
    companyBudget,
    departmentBudgets,
    budgetHistory,
    setCompanyBudget,
    setDepartmentBudget,
    getCompanyBudget,
    getDepartmentBudget,
    getBudgetHistory,
  }
})
