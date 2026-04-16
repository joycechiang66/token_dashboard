import type { TokenRecord, Department, DepartmentStats } from '../types'
import { calculateRecordCost, formatCost } from './costCalculator'

function escapeCSV(value: string | number): string {
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function exportCompanySummaryToCSV(
  departments: Department[],
  stats: Record<string, DepartmentStats>
): string {
  const lines: string[] = []
  lines.push('公司 Token 使用與費用摘要報告')
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')
  lines.push('部門名稱,總 Token 數,輸入 Token,輸出 Token,預估費用,使用記錄數')
  departments.forEach((dept) => {
    const s = stats[dept.id]
    if (s) {
      lines.push(
        `${escapeCSV(dept.name)},${s.totalTokens},${s.inputTokens},${s.outputTokens},${formatCost(s.cost)},${s.recordCount}`
      )
    }
  })
  return lines.join('\n')
}

export function exportDepartmentSummaryToCSV(
  departmentName: string,
  stats: DepartmentStats,
  records: TokenRecord[]
): string {
  const lines: string[] = []

  lines.push(`部門 Token 使用報告 - ${departmentName}`)
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')

  lines.push('部門摘要')
  lines.push(`部門名稱,${escapeCSV(departmentName)}`)
  lines.push(`總 Token 數,${stats.totalTokens}`)
  lines.push(`輸入 Token,${stats.inputTokens}`)
  lines.push(`輸出 Token,${stats.outputTokens}`)
  lines.push(`使用記錄數,${stats.recordCount}`)
  lines.push('')

  lines.push('模型 Token 統計')
  lines.push('模型,使用次數,總 Token 數')

  const modelStats = new Map<string, { count: number; tokens: number }>()
  records.forEach((record) => {
    const key = record.model
    const existing = modelStats.get(key) || { count: 0, tokens: 0 }
    existing.count++
    existing.tokens += record.inputTokens + record.outputTokens
    modelStats.set(key, existing)
  })

  modelStats.forEach((stats, model) => {
    lines.push(`${model},${stats.count},${stats.tokens}`)
  })

  return lines.join('\n')
}

export function exportEmployeeDetailsToCSV(
  employeeName: string,
  records: TokenRecord[]
): string {
  const lines: string[] = []

  lines.push(`員工詳細記錄 - ${employeeName}`)
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')

  lines.push('使用記錄詳情')
  lines.push('日期,模型,輸入 Token,輸出 Token,總 Token 數')

  records.forEach((record) => {
    const totalTokens = record.inputTokens + record.outputTokens
    lines.push(
      `${record.date},${record.model},${record.inputTokens},${record.outputTokens},${totalTokens}`
    )
  })

  return lines.join('\n')
}

export function exportCostAnalysisToCSV(
  records: TokenRecord[],
  departments: Department[],
  stats: Record<string, DepartmentStats>
): string {
  const lines: string[] = []
  lines.push('費用分析報告')
  lines.push(`生成時間: ${new Date().toLocaleString('zh-TW')}`)
  lines.push('')
  lines.push('部門費用對比')
  lines.push('部門名稱,總 Token 數,預估費用,使用記錄數')
  departments.forEach((dept) => {
    const s = stats[dept.id]
    if (s) {
      lines.push(`${escapeCSV(dept.name)},${s.totalTokens},${formatCost(s.cost)},${s.recordCount}`)
    }
  })
  lines.push('')
  lines.push('詳細記錄')
  lines.push('日期,部門,員工ID,模型,輸入 Token,輸出 Token,預估費用')
  records.forEach((record) => {
    const dept = departments.find((d) => d.id === record.departmentId)
    lines.push(
      `${record.date},${escapeCSV(dept?.name || record.departmentId)},${record.employeeId},${record.model},${record.inputTokens},${record.outputTokens},${formatCost(calculateRecordCost(record))}`
    )
  })
  return lines.join('\n')
}

export function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
