import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'token-dashboard-fee-budget-v2'

interface StoredBudget {
  companyBudget: number
  departmentBudgets: Record<string, number>
}

function loadFromStorage(): StoredBudget | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToStorage(data: StoredBudget) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

const defaultCompanyBudget = 65000
const defaultDepartmentBudgets: Record<string, number> = {
  'dept-1': 9000,
  'dept-2': 12000,
  'dept-3': 7500,
  'dept-4': 6500,
  'dept-5': 4500,
  'dept-6': 5000,
  'dept-7': 11000,
  'dept-8': 9500,
}

export const useBudgetStore = defineStore('budget', () => {
  const stored = loadFromStorage()

  const companyBudget = ref(stored?.companyBudget ?? defaultCompanyBudget)
  const departmentBudgets = ref<Record<string, number>>(stored?.departmentBudgets ?? { ...defaultDepartmentBudgets })

  const budgetHistory = ref<Array<{ month: string; cost: number; budget: number }>>([
    { month: '2025-11', cost: 52000, budget: 65000 },
    { month: '2025-12', cost: 56800, budget: 65000 },
    { month: '2026-01', cost: 48900, budget: 65000 },
    { month: '2026-02', cost: 61500, budget: 65000 },
    { month: '2026-03', cost: 59800, budget: 65000 },
    { month: '2026-04', cost: 54200, budget: 65000 },
    { month: '2026-05', cost: 62600, budget: 65000 },
    { month: '2026-06', cost: 57100, budget: 65000 },
    { month: '2026-07', cost: 68900, budget: 65000 },
    { month: '2026-08', cost: 60400, budget: 65000 },
    { month: '2026-09', cost: 65200, budget: 65000 },
    { month: '2026-10', cost: 58200, budget: 65000 },
  ])

  // 監聽變化自動存入 localStorage
  watch([companyBudget, departmentBudgets], () => {
    saveToStorage({
      companyBudget: companyBudget.value,
      departmentBudgets: departmentBudgets.value,
    })
  }, { deep: true })

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
