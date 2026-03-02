export interface Department {
  id: string
  name: string
  description?: string
}

export interface Employee {
  id: string
  name: string
  departmentId: string
}

export interface TokenRecord {
  id: string
  employeeId: string
  departmentId: string
  model: string
  inputTokens: number
  outputTokens: number
  timestamp: string
  date: string
}

export interface DepartmentStats {
  id: string
  name: string
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cost: number
  recordCount: number
}

export interface EmployeeStats {
  id: string
  name: string
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cost: number
  recordCount: number
  efficiency: number
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface ModelCostData {
  model: string
  cost: number
  count: number
  percentage: number
}

export interface BudgetData {
  companyBudget: number
  departmentBudgets: Record<string, number>
}
