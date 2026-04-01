import type { Department, Employee, TokenRecord } from '../types'

const departments: Department[] = [
  { id: 'dept-1', name: '產品研發部', description: '負責產品開發和維護' },
  { id: 'dept-2', name: '雲端服務部', description: '負責雲端基礎設施和服務' },
  { id: 'dept-3', name: '系統業務部', description: '負責系統維運和業務支持' },
  { id: 'dept-4', name: '金融業務部', description: '負責金融業務推廣與市場拓展' },
  { id: 'dept-5', name: '人力資源部', description: '負責人力資源管理' },
  { id: 'dept-6', name: '財務部', description: '負責公司財務規劃與管理' },
  { id: 'dept-7', name: '專案一部', description: '負責專案開發與執行' },
  { id: 'dept-8', name: '專案二部', description: '負責專案開發與執行' },
]

// 使用固定種子的偽隨機數生成器，確保每次載入資料一致
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

// 100 名員工，分配：產品開發部 25 人、數據科學部 25 人、運營部 20 人、金融業務部 18 人、人力資源部 12 人
const surnames = ['張','李','王','劉','陳','楊','周','吳','徐','何','馬','鄒','葉','龔','趙','孫','朱','高','林','郭','羅','梁','宋','鄭','謝','韓','唐','馮','董','蕭','程','曹','袁','鄧','許','傅','沈','曾','彭','呂','蘇','盧','蔣','蔡','賈','丁','魏','薛','葉','閻','余','潘','杜','戴','夏','鍾','汪','田','任','姜','范','方','石','姚','譚','廖','鄒','熊','金','陸','郝','孔','白','崔','康','毛','邱','秦','江','史','顧','侯','邵','孟','龍','萬','段','雷','錢','湯','尹','黎','易','常','武','喬','賀','賴','龔']
const givenNames = ['明','華','芳','強','麗','帆','紅','剛','靜','敏','超','偉','青','娟','磊','洋','霞','軍','秀','傑','濤','燕','鑫','玲','浩','琳','宇','雪','峰','婷','博','瑩','鵬','慧','飛','嘉','凱','欣','昊','萍','睿','蕾','毅','穎','翔','璐','晨','彤','晗','妍','辰','瑜','澤','楠','琪','旭','蓉','寧','菲','威','潔','暢','晶','錦','恆','萌','智','悅','冰','皓','晴','逸','彬','韻','楓','瀚','蕊','琦','朗','熙']

function generateEmployees(): Employee[] {
  const deptAlloc = [
    { deptId: 'dept-1', count: 25 },
    { deptId: 'dept-2', count: 25 },
    { deptId: 'dept-3', count: 20 },
    { deptId: 'dept-4', count: 18 },
    { deptId: 'dept-5', count: 12 },
    { deptId: 'dept-6', count: 10 },
    { deptId: 'dept-7', count: 15 },
    { deptId: 'dept-8', count: 15 },
  ]
  const emps: Employee[] = []
  const rng = seededRandom(123)
  let idx = 1
  for (const { deptId, count } of deptAlloc) {
    for (let i = 0; i < count; i++) {
      const sn = surnames[Math.floor(rng() * surnames.length)]
      const gn = givenNames[Math.floor(rng() * givenNames.length)]
      emps.push({ id: `emp-${idx}`, name: `${sn}${gn}`, departmentId: deptId })
      idx++
    }
  }
  return emps
}

const employees: Employee[] = generateEmployees()

const models = ['GPT-4', 'Claude', 'Gemini', 'GPT-3.5', 'Llama-2', 'Mistral', 'Qwen', 'Yi']

let cachedRecords: TokenRecord[] | null = null

function createTokenRecord(index: number, randomDate: Date, random: () => number): TokenRecord {
  const employee = employees[Math.floor(random() * employees.length)]
  const model = models[Math.floor(random() * models.length)]

  return {
    id: `record-${index}`,
    employeeId: employee.id,
    departmentId: employee.departmentId,
    model,
    inputTokens: Math.floor(random() * 5000) + 100,
    outputTokens: Math.floor(random() * 2000) + 50,
    timestamp: randomDate.toISOString(),
    date: randomDate.toISOString().split('T')[0],
  }
}

function generateTokenRecords(): TokenRecord[] {
  if (cachedRecords) return cachedRecords

  const records: TokenRecord[] = []
  const random = seededRandom(42)

  const baseDate = new Date()
  baseDate.setHours(12, 0, 0, 0)
  const thirtyDaysAgo = new Date(baseDate)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(thirtyDaysAgo)
    currentDate.setDate(thirtyDaysAgo.getDate() + i)
    currentDate.setHours(12, Math.floor(random() * 60), 0, 0)
    records.push(createTokenRecord(i, currentDate, random))
  }

  for (let i = 30; i < 500; i++) {
    const randomDate = new Date(
      thirtyDaysAgo.getTime() + random() * (baseDate.getTime() - thirtyDaysAgo.getTime())
    )
    records.push(createTokenRecord(i, randomDate, random))
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
