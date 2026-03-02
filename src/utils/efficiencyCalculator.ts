import type { TokenRecord } from '../types'
import { calculateTotalCost } from './costCalculator'

export function calculateEfficiency(totalTokens: number, totalCost: number): number {
  if (totalCost === 0) return 0
  return totalTokens / totalCost
}

export function getEfficiencyRating(efficiency: number, allEfficiencies: number[]): string {
  if (allEfficiencies.length === 0) return '中等'

  const sorted = [...allEfficiencies].sort((a, b) => b - a)
  const topThird = sorted[Math.floor(sorted.length / 3)]
  const bottomThird = sorted[Math.floor((sorted.length * 2) / 3)]

  if (efficiency >= topThird) return '高效'
  if (efficiency <= bottomThird) return '低效'
  return '中等'
}

export function calculateDepartmentEfficiencies(
  records: TokenRecord[],
  departmentIds: string[]
): Record<string, number> {
  const efficiencies: Record<string, number> = {}

  departmentIds.forEach((deptId) => {
    const deptRecords = records.filter((r) => r.departmentId === deptId)
    const totalTokens = deptRecords.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens,
      0
    )
    const totalCost = calculateTotalCost(deptRecords)
    efficiencies[deptId] = calculateEfficiency(totalTokens, totalCost)
  })

  return efficiencies
}

export function calculateEmployeeEfficiencies(
  records: TokenRecord[],
  employeeIds: string[]
): Record<string, number> {
  const efficiencies: Record<string, number> = {}

  employeeIds.forEach((empId) => {
    const empRecords = records.filter((r) => r.employeeId === empId)
    const totalTokens = empRecords.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens,
      0
    )
    const totalCost = calculateTotalCost(empRecords)
    efficiencies[empId] = calculateEfficiency(totalTokens, totalCost)
  })

  return efficiencies
}
