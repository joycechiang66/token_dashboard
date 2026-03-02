/**
 * Mock Data for Token Dashboard
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Clear information hierarchy
 * - Department-level overview → Individual detail drill-down
 * - Multiple AI models tracking (GPT-4, Claude, Gemini, etc.)
 * - Input/Output token separation
 */

export interface TokenRecord {
  id: string;
  date: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  tokenRecords: TokenRecord[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  employeeCount: number;
  employees: Employee[];
}

export interface CompanyStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  departmentCount: number;
  employeeCount: number;
  departments: Department[];
}

// Generate mock token records for an employee
function generateTokenRecords(employeeId: string, count: number = 15): TokenRecord[] {
  const models = ['GPT-4', 'GPT-3.5', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Gemini Pro', 'LLaMA 2'];
  const records: TokenRecord[] = [];
  
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const model = models[Math.floor(Math.random() * models.length)];
    const inputTokens = Math.floor(Math.random() * 5000) + 500;
    const outputTokens = Math.floor(Math.random() * 3000) + 200;
    
    records.push({
      id: `${employeeId}-record-${i}`,
      date: date.toISOString().split('T')[0],
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    });
  }
  
  return records;
}

// Generate mock employees for a department
function generateEmployees(departmentId: string, count: number): Employee[] {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const roles = ['Senior Engineer', 'Engineer', 'Junior Engineer', 'Data Scientist', 'Product Manager', 'Analyst'];
  
  const employees: Employee[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const id = `emp-${departmentId}-${i}`;
    const tokenRecords = generateTokenRecords(id);
    
    const totalInputTokens = tokenRecords.reduce((sum, r) => sum + r.inputTokens, 0);
    const totalOutputTokens = tokenRecords.reduce((sum, r) => sum + r.outputTokens, 0);
    
    employees.push({
      id,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      tokenRecords,
    });
  }
  
  return employees;
}

// Generate mock departments
function generateDepartments(): Department[] {
  const departmentNames = [
    { name: 'Engineering', description: 'Software development and infrastructure' },
    { name: 'Product', description: 'Product management and strategy' },
    { name: 'Data Science', description: 'Analytics and machine learning' },
    { name: 'Marketing', description: 'Marketing and growth' },
    { name: 'Sales', description: 'Sales and business development' },
  ];
  
  const departments: Department[] = [];
  
  departmentNames.forEach((dept, index) => {
    const id = `dept-${index}`;
    const employeeCount = Math.floor(Math.random() * 8) + 4; // 4-12 employees per department
    const employees = generateEmployees(id, employeeCount);
    
    const totalInputTokens = employees.reduce((sum, e) => sum + e.totalInputTokens, 0);
    const totalOutputTokens = employees.reduce((sum, e) => sum + e.totalOutputTokens, 0);
    
    departments.push({
      id,
      name: dept.name,
      description: dept.description,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      employeeCount: employees.length,
      employees,
    });
  });
  
  return departments;
}

// Generate company-wide statistics
export function generateMockData(): CompanyStats {
  const departments = generateDepartments();
  
  const totalInputTokens = departments.reduce((sum, d) => sum + d.totalInputTokens, 0);
  const totalOutputTokens = departments.reduce((sum, d) => sum + d.totalOutputTokens, 0);
  const totalEmployeeCount = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  
  return {
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    departmentCount: departments.length,
    employeeCount: totalEmployeeCount,
    departments,
  };
}

// Create singleton instance
let mockDataInstance: CompanyStats | null = null;

export function getMockData(): CompanyStats {
  if (!mockDataInstance) {
    mockDataInstance = generateMockData();
  }
  return mockDataInstance;
}

// Get department by ID
export function getDepartmentById(departmentId: string): Department | undefined {
  const data = getMockData();
  return data.departments.find(d => d.id === departmentId);
}

// Get employee by ID
export function getEmployeeById(employeeId: string): Employee | undefined {
  const data = getMockData();
  for (const dept of data.departments) {
    const employee = dept.employees.find(e => e.id === employeeId);
    if (employee) return employee;
  }
  return undefined;
}

// Format token numbers with thousand separator
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString('en-US');
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}
