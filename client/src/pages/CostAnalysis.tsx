/**
 * Cost Analysis Page
 * 
 * Dedicated page for in-depth cost analysis and trends
 * Displays:
 * - 30-day cost trends
 * - 12-month budget history
 * - Model cost breakdown
 * - Department cost comparison
 */

import { useState } from 'react';
import { getMockData, getAvailableModels } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import DateRangeFilter, { DateRange } from '@/components/DateRangeFilter';
import ModelFilter from '@/components/ModelFilter';
import { calculateModelCost, formatCostCompact } from '@/lib/costCalculator';
import { useBudget } from '@/contexts/BudgetContext';
import BudgetAlert from '@/components/BudgetAlert';
import BudgetSettingsModal from '@/components/BudgetSettingsModal';
import { Settings } from 'lucide-react';
import CostTrendChart from '@/components/CostTrendChart';
import ModelCostAnalysis from '@/components/ModelCostAnalysis';
import BudgetHistoryChart from '@/components/BudgetHistoryChart';

export default function CostAnalysis() {
  const [, setLocation] = useLocation();
  const data = getMockData();
  const { getCompanyBudget, getDepartmentBudget } = useBudget();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

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

  // Get all records first
  const allRecords = data.departments.flatMap((dept: any) => dept.employees.flatMap((emp: any) => emp.tokenRecords));
  
  // Model filter state
  const availableModels = getAvailableModels(allRecords);
  const [selectedModels, setSelectedModels] = useState<string[]>(availableModels);

  // Filter records
  const filteredRecords = allRecords.filter((record: any) => {
    const recordDate = record.date;
    const isInDateRange = recordDate >= dateRange.startDate && recordDate <= dateRange.endDate;
    const isSelectedModel = selectedModels.includes(record.model);
    return isInDateRange && isSelectedModel;
  });

  // Calculate company cost
  const companyCost = filteredRecords.reduce((total: number, record: any) => {
    return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
  }, 0);

  // Get trend chart records (last 30 days)
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const trendChartRecords = allRecords.filter((record: any) => {
    const recordDate = record.date;
    const isInDateRange = recordDate >= thirtyDaysAgo && recordDate <= defaultEndDate;
    const isSelectedModel = selectedModels.includes(record.model);
    return isInDateRange && isSelectedModel;
  });

  // Calculate department costs for comparison
  const departmentCosts = data.departments.map((dept: any) => {
    const deptRecords = filteredRecords.filter((record: any) => record.departmentId === dept.id);
    const cost = deptRecords.reduce((total: number, record: any) => {
      return total + calculateModelCost(record.model, record.inputTokens, record.outputTokens);
    }, 0);
    return {
      id: dept.id,
      name: dept.name,
      cost,
      percentage: companyCost > 0 ? (cost / companyCost) * 100 : 0,
    };
  }).sort((a, b) => b.cost - a.cost);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="返回首頁"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">成本分析</h1>
          </div>
          <Button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Settings className="w-4 h-4" />
            預算設定
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateRangeFilter onDateRangeChange={setDateRange} />
            <ModelFilter availableModels={availableModels} selectedModels={selectedModels} onModelsChange={setSelectedModels} />
          </div>
        </div>

        {/* Budget Status */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-6">預算狀態</h3>
          
          {/* Company Budget */}
          <div className="mb-8">
            <BudgetAlert
              name="公司整體預算"
              currentCost={companyCost}
              budgetLimit={getCompanyBudget()}
              type="company"
            />
          </div>
          
          {/* Department Budgets */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">部門預算狀態</h4>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {departmentCosts.map((dept) => {
                  const deptBudget = getDepartmentBudget(dept.id);
                  return (
                    <BudgetAlert
                      key={dept.id}
                      name={dept.name}
                      currentCost={dept.cost}
                      budgetLimit={deptBudget}
                      type="department"
                    />
                  );
                })}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">篩選期間成本</p>
            <p className="text-3xl font-bold text-foreground">{formatCostCompact(companyCost)}</p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">平均日成本</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCostCompact(companyCost / (Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1))}
            </p>
          </Card>
          <Card className="p-6 border border-border bg-card">
            <p className="text-sm text-muted-foreground mb-2">使用記錄數</p>
            <p className="text-3xl font-bold text-foreground">{filteredRecords.length}</p>
          </Card>
        </div>

        {/* 30-Day Cost Trend */}
        <div className="mb-12">
          <CostTrendChart records={trendChartRecords} title="過去 30 天成本趨勢" height={350} />
        </div>

        {/* 12-Month Budget History */}
        <div className="mb-12">
          <BudgetHistoryChart title="預算使用歷史趨勢（12 個月）" height={400} />
        </div>

        {/* Model Cost Analysis */}
        <div className="mb-12">
          <ModelCostAnalysis records={filteredRecords} title="模型成本分析" />
        </div>

        {/* Department Cost Comparison */}
        <div className="mb-12">
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-6">部門成本對比</h3>
            <div className="space-y-3">
              {departmentCosts.map((dept, index) => (
                <div key={dept.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground truncate">
                        {index + 1}. {dept.name}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{formatCostCompact(dept.cost)}</p>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{dept.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Budget Settings Modal */}
      <BudgetSettingsModal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} departments={data.departments} />
    </div>
  );
}
