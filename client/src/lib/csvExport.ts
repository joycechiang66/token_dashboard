/**
 * CSV Export Utilities
 * 
 * Provides functions to export department and employee token data to CSV format
 */

import { Employee, TokenRecord, Department } from './mockData';

/**
 * Convert data to CSV format and trigger download
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Escape CSV field values (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string | number): string {
  const fieldStr = String(field);
  if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
    return `"${fieldStr.replace(/"/g, '""')}"`;
  }
  return fieldStr;
}

/**
 * Export department summary data to CSV
 */
export function exportDepartmentSummaryCSV(
  department: Department,
  dateRange: { startDate: string; endDate: string },
  selectedModels: string[]
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${department.name}_summary_${timestamp}.csv`;

  // Filter records based on date and model
  const filterRecords = (records: TokenRecord[]) => {
    let filtered = records.filter(
      (r) => r.date >= dateRange.startDate && r.date <= dateRange.endDate
    );
    if (selectedModels.length > 0) {
      filtered = filtered.filter((r) => selectedModels.includes(r.model));
    }
    return filtered;
  };

  // Calculate stats
  const allFilteredRecords = department.employees.flatMap((emp) =>
    filterRecords(emp.tokenRecords)
  );

  const totalInputTokens = allFilteredRecords.reduce((sum, r) => sum + r.inputTokens, 0);
  const totalOutputTokens = allFilteredRecords.reduce((sum, r) => sum + r.outputTokens, 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  // Build CSV content
  let csv = '部門 Token 使用量摘要\n\n';
  csv += `部門名稱,${escapeCSVField(department.name)}\n`;
  csv += `篩選日期,${dateRange.startDate} 至 ${dateRange.endDate}\n`;
  csv += selectedModels.length > 0
    ? `篩選模型,${escapeCSVField(selectedModels.join('; '))}\n`
    : '篩選模型,所有模型\n';
  csv += '\n';

  csv += '部門統計\n';
  csv += `總 Token 使用量,${totalTokens.toLocaleString('en-US')}\n`;
  csv += `輸入 Token,${totalInputTokens.toLocaleString('en-US')}\n`;
  csv += `輸出 Token,${totalOutputTokens.toLocaleString('en-US')}\n`;
  csv += `輸入佔比,${totalTokens > 0 ? ((totalInputTokens / totalTokens) * 100).toFixed(2) : 0}%\n`;
  csv += `輸出佔比,${totalTokens > 0 ? ((totalOutputTokens / totalTokens) * 100).toFixed(2) : 0}%\n`;
  csv += '\n';

  // Employee details
  csv += '員工使用量排行\n';
  csv += '排名,員工名稱,職位,總 Token,輸入 Token,輸出 Token,輸入佔比,輸出佔比\n';

  const sortedEmployees = department.employees
    .map((emp) => {
      const filteredRecords = filterRecords(emp.tokenRecords);
      const empInputTokens = filteredRecords.reduce((sum, r) => sum + r.inputTokens, 0);
      const empOutputTokens = filteredRecords.reduce((sum, r) => sum + r.outputTokens, 0);
      const empTotalTokens = empInputTokens + empOutputTokens;
      return {
        ...emp,
        filteredRecords,
        totalInputTokens: empInputTokens,
        totalOutputTokens: empOutputTokens,
        totalTokens: empTotalTokens,
      };
    })
    .sort((a, b) => b.totalTokens - a.totalTokens);

  sortedEmployees.forEach((emp, index) => {
    const inputPercentage =
      emp.totalTokens > 0 ? ((emp.totalInputTokens / emp.totalTokens) * 100).toFixed(2) : '0';
    const outputPercentage =
      emp.totalTokens > 0 ? ((emp.totalOutputTokens / emp.totalTokens) * 100).toFixed(2) : '0';

    csv += `${index + 1},${escapeCSVField(emp.name)},${escapeCSVField(emp.role)},${emp.totalTokens.toLocaleString('en-US')},${emp.totalInputTokens.toLocaleString('en-US')},${emp.totalOutputTokens.toLocaleString('en-US')},${inputPercentage}%,${outputPercentage}%\n`;
  });

  downloadCSV(csv, filename);
}

/**
 * Export employee detailed records to CSV
 */
export function exportEmployeeDetailCSV(
  employee: Employee,
  department: Department,
  dateRange: { startDate: string; endDate: string },
  selectedModels: string[]
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${employee.name}_records_${timestamp}.csv`;

  // Filter records based on date and model
  let filteredRecords = employee.tokenRecords.filter(
    (r) => r.date >= dateRange.startDate && r.date <= dateRange.endDate
  );
  if (selectedModels.length > 0) {
    filteredRecords = filteredRecords.filter((r) => selectedModels.includes(r.model));
  }

  // Calculate stats
  const totalInputTokens = filteredRecords.reduce((sum, r) => sum + r.inputTokens, 0);
  const totalOutputTokens = filteredRecords.reduce((sum, r) => sum + r.outputTokens, 0);
  const totalTokens = totalInputTokens + totalOutputTokens;

  // Build CSV content
  let csv = '員工 Token 使用詳細記錄\n\n';
  csv += `部門,${escapeCSVField(department.name)}\n`;
  csv += `員工名稱,${escapeCSVField(employee.name)}\n`;
  csv += `職位,${escapeCSVField(employee.role)}\n`;
  csv += `電郵,${escapeCSVField(employee.email)}\n`;
  csv += `篩選日期,${dateRange.startDate} 至 ${dateRange.endDate}\n`;
  csv += selectedModels.length > 0
    ? `篩選模型,${escapeCSVField(selectedModels.join('; '))}\n`
    : '篩選模型,所有模型\n';
  csv += '\n';

  csv += '統計摘要\n';
  csv += `總 Token 使用量,${totalTokens.toLocaleString('en-US')}\n`;
  csv += `輸入 Token,${totalInputTokens.toLocaleString('en-US')}\n`;
  csv += `輸出 Token,${totalOutputTokens.toLocaleString('en-US')}\n`;
  csv += `輸入佔比,${totalTokens > 0 ? ((totalInputTokens / totalTokens) * 100).toFixed(2) : 0}%\n`;
  csv += `輸出佔比,${totalTokens > 0 ? ((totalOutputTokens / totalTokens) * 100).toFixed(2) : 0}%\n`;
  csv += `記錄數量,${filteredRecords.length}\n`;
  csv += '\n';

  // Detailed records
  csv += '使用記錄詳情\n';
  csv += '日期,模型,輸入 Token,輸出 Token,總 Token\n';

  filteredRecords.forEach((record) => {
    csv += `${record.date},${escapeCSVField(record.model)},${record.inputTokens.toLocaleString('en-US')},${record.outputTokens.toLocaleString('en-US')},${record.totalTokens.toLocaleString('en-US')}\n`;
  });

  downloadCSV(csv, filename);
}

/**
 * Export model breakdown data to CSV
 */
export function exportModelBreakdownCSV(
  department: Department,
  dateRange: { startDate: string; endDate: string },
  selectedModels: string[]
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${department.name}_models_${timestamp}.csv`;

  // Filter records based on date and model
  const filterRecords = (records: TokenRecord[]) => {
    let filtered = records.filter(
      (r) => r.date >= dateRange.startDate && r.date <= dateRange.endDate
    );
    if (selectedModels.length > 0) {
      filtered = filtered.filter((r) => selectedModels.includes(r.model));
    }
    return filtered;
  };

  // Get all records and group by model
  const allFilteredRecords = department.employees.flatMap((emp) =>
    filterRecords(emp.tokenRecords)
  );

  const modelStats = allFilteredRecords.reduce(
    (acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = {
          model: record.model,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          count: 0,
        };
      }
      acc[record.model].inputTokens += record.inputTokens;
      acc[record.model].outputTokens += record.outputTokens;
      acc[record.model].totalTokens += record.totalTokens;
      acc[record.model].count += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        model: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        count: number;
      }
    >
  );

  const totalTokens = allFilteredRecords.reduce((sum, r) => sum + r.totalTokens, 0);

  // Build CSV content
  let csv = '模型使用量分析\n\n';
  csv += `部門,${escapeCSVField(department.name)}\n`;
  csv += `篩選日期,${dateRange.startDate} 至 ${dateRange.endDate}\n`;
  csv += `篩選模型,${selectedModels.length > 0 ? escapeCSVField(selectedModels.join('; ')) : '所有模型'}\n`;
  csv += '\n';

  csv += '模型統計\n';
  csv += '模型名稱,輸入 Token,輸出 Token,總 Token,使用次數,佔比\n';

  Object.values(modelStats)
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .forEach((stat) => {
      const percentage =
        totalTokens > 0 ? ((stat.totalTokens / totalTokens) * 100).toFixed(2) : '0';
      csv += `${escapeCSVField(stat.model)},${stat.inputTokens.toLocaleString('en-US')},${stat.outputTokens.toLocaleString('en-US')},${stat.totalTokens.toLocaleString('en-US')},${stat.count},${percentage}%\n`;
    });

  downloadCSV(csv, filename);
}
