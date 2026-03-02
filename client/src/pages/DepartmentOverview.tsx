/**
 * Department Overview Page
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Left sidebar navigation with department list
 * - Main content area showing department cards
 * - Each card displays total tokens, input/output breakdown
 * - Click to navigate to department detail view
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { getMockData, formatTokens, calculatePercentage, filterRecordsByDateRange, calculateStatsFromRecords, getAvailableModels } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart3, Users } from 'lucide-react';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import ModelFilter from '@/components/ModelFilter';
import ExportButton from '@/components/ExportButton';
import { exportDepartmentSummaryCSV } from '@/lib/csvExport';
import { calculateModelCost, formatCostCompact } from '@/lib/costCalculator';
import CostTrendChart from '@/components/CostTrendChart';
import { TokenRecord } from '@/lib/mockData';

export default function DepartmentOverview() {
  const [location, setLocation] = useLocation();
  const data = getMockData();
  
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
  
  // Get all available models
  const allRecords = data.departments.flatMap((dept) =>
    dept.employees.flatMap((emp) => emp.tokenRecords)
  );
  const availableModels = getAvailableModels(allRecords);
  
  // Filter records by date and model
  const filterRecordsByDateAndModel = (records: any[]) => {
    let filtered = filterRecordsByDateRange(records, dateRange.startDate, dateRange.endDate);
    if (selectedModels.length > 0) {
      filtered = filtered.filter((r) => selectedModels.includes(r.model));
    }
    return filtered;
  };
  
  // Calculate filtered stats for company-wide view
  const filteredDepartments = data.departments.map((dept) => {
    const filteredRecords = dept.employees.flatMap((emp) =>
      filterRecordsByDateAndModel(emp.tokenRecords)
    );
    const stats = calculateStatsFromRecords(filteredRecords);
    return {
      ...dept,
      filteredRecords,
      totalInputTokens: stats.totalInputTokens,
      totalOutputTokens: stats.totalOutputTokens,
      totalTokens: stats.totalTokens,
    };
  });
  
  // Calculate company-wide stats
  const companyFilteredRecords = filteredDepartments.flatMap((dept) => dept.filteredRecords);
  const companyStats = calculateStatsFromRecords(companyFilteredRecords);
  
  // Calculate company-wide cost
  const companyCost = companyFilteredRecords.reduce((total, record) => {
    return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
  }, 0);
  
  // Get all records for trend chart (not filtered by date range)
  const allCompanyRecords: TokenRecord[] = data.departments.flatMap((dept) =>
    dept.employees.flatMap((emp) => emp.tokenRecords)
  );
  // Filter by model if selected
  const trendChartRecords = selectedModels.length > 0
    ? allCompanyRecords.filter((r) => selectedModels.includes(r.model))
    : allCompanyRecords;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Token 使用量儀表板</h1>
          </div>
          <p className="text-muted-foreground">公司內部 AI Token 消耗統計與分析</p>
        </div>
      </header>

      <main className="container py-8">
        {/* Company-wide Statistics */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">公司整體統計</h2>
            <div className="flex items-center gap-3">
              <ExportButton
                options={[
                  {
                    label: '匯出公司摘要',
                    description: '匯出公司統計和部門排行',
                    onClick: () => {
                      // Create a virtual company object for export
                      const virtualCompany = {
                        id: 'company',
                        name: '公司整體',
                        description: '',
                        employees: data.departments.flatMap((d) => d.employees),
                        totalInputTokens: companyStats.totalInputTokens,
                        totalOutputTokens: companyStats.totalOutputTokens,
                        totalTokens: companyStats.totalTokens,
                        employeeCount: data.departments.flatMap((d) => d.employees).length,
                      } as any;
                      exportDepartmentSummaryCSV(virtualCompany, dateRange, selectedModels);
                    },
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">總 Token 使用量</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(companyStats.totalTokens)}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            {/* Input Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">輸入 Token</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(companyStats.totalInputTokens)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {calculatePercentage(companyStats.totalInputTokens, companyStats.totalTokens)}% 佔比
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">↓</span>
                </div>
              </div>
            </Card>

            {/* Output Tokens Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">輸出 Token</p>
                  <p className="text-3xl font-bold text-foreground">{formatTokens(companyStats.totalOutputTokens)}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {calculatePercentage(companyStats.totalOutputTokens, companyStats.totalTokens)}% 佔比
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">↑</span>
                </div>
              </div>
            </Card>

            {/* Estimated Cost Card */}
            <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">預估成本</p>
                  <p className="text-3xl font-bold text-foreground">{formatCostCompact(companyCost)}</p>
                  <p className="text-xs text-muted-foreground mt-2">基於當前篩選條件</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 font-semibold text-lg">$</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Department Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">部門數量</h3>
              </div>
              <p className="text-4xl font-bold text-primary">{filteredDepartments.length}</p>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">員工總數</h3>
              </div>
              <p className="text-4xl font-bold text-primary">{filteredDepartments.reduce((sum, d) => sum + d.employees.length, 0)}</p>
            </Card>
          </div>
        </div>

        {/* Cost Trend Chart */}
        <div className="mb-12">
          <CostTrendChart records={trendChartRecords} title="過去 30 天成本趨勢" height={350} />
        </div>

        {/* Departments Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">各部門詳情</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <Card 
                key={department.id}
                className="p-6 border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setLocation(`/department/${department.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{department.name}</h3>
                    <p className="text-sm text-muted-foreground">{department.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="space-y-3 mb-4 pt-4 border-t border-border">
                  {/* Total Tokens */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">總 Token</span>
                    <span className="font-semibold text-foreground">{formatTokens(department.totalTokens)}</span>
                  </div>

                  {/* Input/Output Breakdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">輸入 / 輸出</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatTokens(department.totalInputTokens)} / {formatTokens(department.totalOutputTokens)}
                    </span>
                  </div>

                  {/* Employee Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">員工數</span>
                    <span className="font-semibold text-foreground">{department.employees.length}</span>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">預估成本</span>
                    <span className="font-semibold text-amber-600">
                      {formatCostCompact(
                        department.filteredRecords.reduce((total, record) => {
                          return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
                        }, 0)
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Token 佔比</span>
                      <span className="text-xs font-semibold text-primary">
                        {calculatePercentage(department.totalTokens, companyStats.totalTokens)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(department.totalTokens, companyStats.totalTokens)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 group-hover:border-primary group-hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocation(`/department/${department.id}`);
                  }}
                >
                  查看詳情
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
