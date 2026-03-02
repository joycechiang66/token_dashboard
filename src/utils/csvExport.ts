import type { TokenRecord, DepartmentStats } from '../types'
import { calculateRecordCost, formatCost } from './costCalculator'

function escapeCSV(value: string | number): string {
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function exportDepartmentSummaryToCSV(
  departmentName: string,
  stats: DepartmentStats,
  records: TokenRecord[]
): string {
  const lines: string[] = []

  // Header
  lines.push(`部門成本分析報告 - ${departmentName}`)
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')

  // Summary
  lines.push('部門摘要')
  lines.push(`部門名稱,${escapeCSV(departmentName)}`)
  lines.push(`總 Token 數,${stats.totalTokens}`)
  lines.push(`輸入 Token,${stats.inputTokens}`)
  lines.push(`輸出 Token,${stats.outputTokens}`)
  lines.push(`預估成本,${formatCost(stats.cost)}`)
  lines.push(`使用記錄數,${stats.recordCount}`)
  lines.push('')

  // Model breakdown
  lines.push('模型使用統計')
  lines.push('模型,使用次數,總 Token 數,預估成本')

  const modelStats = new Map<string, { count: number; tokens: number; cost: number }>()
  records.forEach((record) => {
    const key = record.model
    const existing = modelStats.get(key) || { count: 0, tokens: 0, cost: 0 }
    existing.count++
    existing.tokens += record.inputTokens + record.outputTokens
    existing.cost += calculateRecordCost(record)
    modelStats.set(key, existing)
  })

  modelStats.forEach((stats, model) => {
    lines.push(`${model},${stats.count},${stats.tokens},${formatCost(stats.cost)}`)
  })

  return lines.join('\n')
}

export function exportEmployeeDetailsToCSV(
  employeeName: string,
  records: TokenRecord[]
): string {
  const lines: string[] = []

  // Header
  lines.push(`員工詳細記錄 - ${employeeName}`)
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')

  // Records
  lines.push('使用記錄詳情')
  lines.push('日期,模型,輸入 Token,輸出 Token,總 Token 數,預估成本')

  records.forEach((record) => {
    const totalTokens = record.inputTokens + record.outputTokens
    const cost = calculateRecordCost(record)
    lines.push(
      `${record.date},${record.model},${record.inputTokens},${record.outputTokens},${totalTokens},${formatCost(cost)}`
    )
  })

  return lines.join('\n')
}

export function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
