/**
 * Department Detail Page
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Department header with back navigation
 * - Department-wide statistics
 * - Employee list with individual token usage
 * - Click employee to see detailed token records
 */

import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { getDepartmentById, formatTokens, calculatePercentage, filterRecordsByDateRange, calculateStatsFromRecords, getAvailableModels, TokenRecord } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, TrendingUp } from 'lucide-react';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import ModelFilter from '@/components/ModelFilter';
import ExportButton from '@/components/ExportButton';
import { exportDepartmentSummaryCSV, exportModelBreakdownCSV, exportEmployeeDetailCSV } from '@/lib/csvExport';
import { calculateModelCost, formatCostCompact } from '@/lib/costCalculator';
import CostTrendChart from '@/components/CostTrendChart';

export default function DepartmentDetail() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute('/department/:id');
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  
  // Date range state
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  const defaultStartDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });
  
  // Model filter state
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const departmentId = params?.id as string;
  const department = getDepartmentById(departmentId);

  if (!department) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">部門未找到</h1>
          <Button onClick={() => setLocation('/')}>返回首頁</Button>
        </div>
      </div>
    );
  }

  // Get all available models from all records
  const allRecords = department.employees.flatMap((emp) => emp.tokenRecords);
  const availableModels = getAvailableModels(allRecords);
  
  // Filter records by date and model
  const filterRecordsByDateAndModel = (records: TokenRecord[]) => {
    let filtered = filterRecordsByDateRange(records, dateRange.startDate, dateRange.endDate);
    if (selectedModels.length > 0) {
      filtered = filtered.filter((r) => selectedModels.includes(r.model));
    }
    return filtered;
  };

  // Filter and calculate stats based on date range and selected models
  const filteredEmployees = department.employees.map((employee) => {
    const filteredRecords = filterRecordsByDateAndModel(employee.tokenRecords);
    const stats = calculateStatsFromRecords(filteredRecords);
    return {
      ...employee,
      filteredRecords,
      totalInputTokens: stats.totalInputTokens,
      totalOutputTokens: stats.totalOutputTokens,
      totalTokens: stats.totalTokens,
    };
  });

  // Calculate department stats from filtered records
  const departmentFilteredRecords = department.employees.flatMap((emp) =>
    filterRecordsByDateAndModel(emp.tokenRecords)
  );
  const departmentStats = calculateStatsFromRecords(departmentFilteredRecords);
  
  // Calculate department cost
  const departmentCost = departmentFilteredRecords.reduce((total, record) => {
    return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
  }, 0);
  
  // Get all department records for trend chart (not filtered by date range)
  const allDepartmentRecords: TokenRecord[] = department.employees.flatMap((emp) => emp.tokenRecords);
  // Filter by model if selected
  const trendChartRecords = selectedModels.length > 0
    ? allDepartmentRecords.filter((r) => selectedModels.includes(r.model))
    : allDepartmentRecords;

  // Sort employees by total tokens (descending)
  const sortedEmployees = [...filteredEmployees].sort((a, b) => b.totalTokens - a.totalTokens);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-2"
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回總覽
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{department.name}</h1>
          </div>
          <p className="text-muted-foreground">{department.description}</p>
        </div>
      </header>

      <main className="container py-8">
        {/* Department Statistics */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">部門統計</h2>
            <div className="flex items-center gap-3">
              <ExportButton
                options={[
                  {
                    label: '匯出部門摘要',
                    description: '匯出部門統計和員工排行',
                    onClick: () => exportDepartmentSummaryCSV(department, dateRange, selectedModels),
                  },
                  {
                    label: '匯出模型分析',
                    description: '匯出各模型的使用統計',
                    onClick: () => exportModelBreakdownCSV(department, dateRange, selectedModels),
                  },
                ]}
              />
              <ModelFilter
                availableModels={availableModels}
                selectedModels={selectedModels}
                onModelsChange={setSelectedModels}
              />
              <DateRangeFilter
                onDateRangeChange={setDateRange}
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Tokens */}
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">總 Token 使用量</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(departmentStats.totalTokens)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Input Tokens */}
            <Card className="p-6 border border-border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">輸入 Token</p>
              <p className="text-3xl font-bold text-foreground">{formatTokens(departmentStats.totalInputTokens)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {calculatePercentage(departmentStats.totalInputTokens, departmentStats.totalTokens)}% 佔比
              </p>
            </Card>

            {/* Output Tokens */}
            <Card className="p-6 border border-border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">輸出 Token</p>
              <p className="text-3xl font-bold text-foreground">{formatTokens(departmentStats.totalOutputTokens)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {calculatePercentage(departmentStats.totalOutputTokens, departmentStats.totalTokens)}% 佔比
              </p>
            </Card>

            {/* Estimated Cost */}
            <Card className="p-6 border border-border bg-card">
              <p className="text-sm font-medium text-muted-foreground mb-2">預估成本</p>
              <p className="text-3xl font-bold text-foreground">{formatCostCompact(departmentCost)}</p>
              <p className="text-xs text-muted-foreground mt-2">基於當前篩選條件</p>
            </Card>
          </div>
        </div>

        {/* Cost Trend Chart */}
        <div className="mb-12">
          <CostTrendChart records={trendChartRecords} title="過去 30 天成本趨勢" height={350} />
        </div>

        {/* Employees List */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">員工使用量排行</h2>
          
          <div className="space-y-4">
            {sortedEmployees.map((employee, index) => (
              <div key={employee.id}>
                <Card 
                  className="p-6 border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => setExpandedEmployeeId(
                    expandedEmployeeId === employee.id ? null : employee.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">總 Token</p>
                          <p className="font-semibold text-foreground">{formatTokens(employee.totalTokens)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">輸入 / 輸出</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatTokens(employee.totalInputTokens)} / {formatTokens(employee.totalOutputTokens)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">佔比</p>
                          <p className="font-semibold text-primary">
                            {departmentStats.totalTokens > 0 ? calculatePercentage(employee.totalTokens, departmentStats.totalTokens) : 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">預估成本</p>
                          <p className="font-semibold text-amber-600">
                            {formatCostCompact(
                              employee.filteredRecords.reduce((total, record) => {
                                return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
                              }, 0)
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: departmentStats.totalTokens > 0 ? `${calculatePercentage(employee.totalTokens, departmentStats.totalTokens)}%` : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <ChevronRight 
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        expandedEmployeeId === employee.id ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </Card>

                {/* Expanded Details - Token Records */}
                {expandedEmployeeId === employee.id && (
                  <div className="mt-4 ml-4 space-y-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold text-foreground">使用記錄 ({employee.filteredRecords.length} 筆)</div>
                      {employee.filteredRecords.length > 0 && (
                        <ExportButton
                          options={[
                            {
                              label: '下載詳細記錄',
                              description: '下載該員工的 Token 使用記錄',
                              onClick: () => exportEmployeeDetailCSV(employee, department, dateRange, selectedModels),
                            },
                          ]}
                        />
                      )}
                    </div>
                    
                    {employee.filteredRecords.length > 0 ? (
                      employee.filteredRecords.slice(0, 10).map((record) => (
                        <Card 
                          key={record.id}
                          className="p-4 border border-border/50 bg-secondary/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-foreground">{record.model}</p>
                              <p className="text-xs text-muted-foreground">{record.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{formatTokens(record.totalTokens)}</p>
                              <p className="text-xs text-muted-foreground">
                                ↓ {formatTokens(record.inputTokens)} | ↑ {formatTokens(record.outputTokens)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Token breakdown bar */}
                          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-secondary">
                            <div 
                              className="bg-blue-500 rounded-full"
                              style={{
                                width: `${calculatePercentage(record.inputTokens, record.totalTokens)}%`
                              }}
                              title={`輸入: ${formatTokens(record.inputTokens)}`}
                            />
                            <div 
                              className="bg-green-500 rounded-full"
                              style={{
                                width: `${calculatePercentage(record.outputTokens, record.totalTokens)}%`
                              }}
                              title={`輸出: ${formatTokens(record.outputTokens)}`}
                            />
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-muted-foreground">該時間段內無使用記錄</p>
                      </div>
                    )}
                    {employee.filteredRecords.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        還有 {employee.filteredRecords.length - 10} 筆記錄
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
