import type { Department, Employee, TokenRecord } from '../types'

const departments: Department[] = [
  { id: 'dept-1', name: '產品開發部', description: '負責產品開發和維護' },
  { id: 'dept-2', name: '數據科學部', description: '負責數據分析和 AI 模型' },
  { id: 'dept-3', name: '運營部', description: '負責運營和業務支持' },
  { id: 'dept-4', name: '市場部', description: '負責市場營銷和推廣' },
  { id: 'dept-5', name: '人力資源部', description: '負責人力資源管理' },
]

const employees: Employee[] = [
  { id: 'emp-1', name: '張明', departmentId: 'dept-1' },
  { id: 'emp-2', name: '李華', departmentId: 'dept-1' },
  { id: 'emp-3', name: '王芳', departmentId: 'dept-1' },
  { id: 'emp-4', name: '劉強', departmentId: 'dept-2' },
  { id: 'emp-5', name: '陳麗', departmentId: 'dept-2' },
  { id: 'emp-6', name: '楊帆', departmentId: 'dept-2' },
  { id: 'emp-7', name: '周紅', departmentId: 'dept-2' },
  { id: 'emp-8', name: '吳剛', departmentId: 'dept-3' },
  { id: 'emp-9', name: '徐靜', departmentId: 'dept-3' },
  { id: 'emp-10', name: '何敏', departmentId: 'dept-4' },
  { id: 'emp-11', name: '馬超', departmentId: 'dept-4' },
  { id: 'emp-12', name: '鄒偉', departmentId: 'dept-4' },
  { id: 'emp-13', name: '葉青', departmentId: 'dept-5' },
  { id: 'emp-14', name: '龔娟', departmentId: 'dept-5' },
]

const models = ['GPT-4', 'Claude', 'Gemini', 'GPT-3.5', 'Llama-2', 'Mistral', 'Qwen', 'Yi']

// 使用固定種子的偽隨機數生成器，確保每次載入資料一致
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

let cachedRecords: TokenRecord[] | null = null

function generateTokenRecords(): TokenRecord[] {
  if (cachedRecords) return cachedRecords

  const records: TokenRecord[] = []
  const random = seededRandom(42)

  // 以 2026-03-02 為基準，往前 30 天
  const baseDate = new Date('2026-03-02T00:00:00Z')
  const thirtyDaysAgo = new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000)

  for (let i = 0; i < 500; i++) {
    const randomDate = new Date(
      thirtyDaysAgo.getTime() + random() * (baseDate.getTime() - thirtyDaysAgo.getTime())
    )
    const employee = employees[Math.floor(random() * employees.length)]
    const model = models[Math.floor(random() * models.length)]

    records.push({
      id: `record-${i}`,
      employeeId: employee.id,
      departmentId: employee.departmentId,
      model,
      inputTokens: Math.floor(random() * 5000) + 100,
      outputTokens: Math.floor(random() * 2000) + 50,
      timestamp: randomDate.toISOString(),
      date: randomDate.toISOString().split('T')[0],
    })
  }

  // 按日期排序（新到舊）
  records.sort((a, b) => b.date.localeCompare(a.date))

  cachedRecords = records
  return records
}

export function getMockData() {
  return {
    departments,
    employees,
    tokenRecords: generateTokenRecords(),
  }
}

export function getAvailableModels(): string[] {
  return models
}

export function filterRecordsByDateRange(
  records: TokenRecord[],
  startDate: string,
  endDate: string
): TokenRecord[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000

  return records.filter((record) => {
    const recordTime = new Date(record.timestamp).getTime()
    return recordTime >= start && recordTime <= end
  })
}

export function filterRecordsByModels(records: TokenRecord[], models: string[]): TokenRecord[] {
  if (models.length === 0) return records
  return records.filter((record) => models.includes(record.model))
}

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((dept) => dept.id === id)
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((emp) => emp.id === id)
}
