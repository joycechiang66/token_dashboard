/**
 * Budget History Chart Component
 * 
 * Displays long-term budget usage trends
 */

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine } from 'recharts';
import { Card } from '@/components/ui/card';
import { useBudgetHistory } from '@/contexts/BudgetHistoryContext';
import { useState } from 'react';

interface BudgetHistoryChartProps {
  title?: string;
  height?: number;
}

export default function BudgetHistoryChart({ title = '預算使用歷史趨勢', height = 400 }: BudgetHistoryChartProps) {
  const { getMonthlySummary } = useBudgetHistory();
  const [chartType, setChartType] = useState<'line' | 'composed'>('line');

  const data = getMonthlySummary();

  if (data.length === 0) {
    return (
      <Card className="p-6 border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          暫無歷史數據
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              chartType === 'line'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            折線圖
          </button>
          <button
            onClick={() => setChartType('composed')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              chartType === 'composed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            組合圖
          </button>
        </div>
      </div>

      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                label={{ value: '成本 (USD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'companySpent') {
                    return [`$${value.toFixed(2)}`, '實際成本'];
                  }
                  if (name === 'companyBudget') {
                    return [`$${value.toFixed(2)}`, '預算上限'];
                  }
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ color: 'var(--color-foreground)' }}
                formatter={(value) => {
                  if (value === 'companySpent') return '實際成本';
                  if (value === 'companyBudget') return '預算上限';
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="companySpent"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
                name="companySpent"
              />
              <Line
                type="monotone"
                dataKey="companyBudget"
                stroke="var(--color-muted-foreground)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="companyBudget"
              />
            </LineChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                label={{ value: '成本 (USD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'companySpent') {
                    return [`$${value.toFixed(2)}`, '實際成本'];
                  }
                  if (name === 'percentage') {
                    return [`${value.toFixed(1)}%`, '預算使用率'];
                  }
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ color: 'var(--color-foreground)' }}
                formatter={(value) => {
                  if (value === 'companySpent') return '實際成本';
                  if (value === 'percentage') return '預算使用率';
                  return value;
                }}
              />
              <Bar dataKey="companySpent" fill="var(--color-primary)" name="companySpent" />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                yAxisId="right"
                name="percentage"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                label={{ value: '預算使用率 (%)', angle: 90, position: 'insideRight' }}
              />
              <ReferenceLine
                yAxisId="right"
                y={100}
                stroke="var(--color-destructive)"
                strokeDasharray="5 5"
                label={{ value: '預算上限', position: 'right', fill: 'var(--color-destructive)' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">平均月成本</p>
          <p className="font-semibold text-foreground">
            ${(data.reduce((sum, d) => sum + d.companySpent, 0) / data.length).toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">最高月成本</p>
          <p className="font-semibold text-foreground">
            ${Math.max(...data.map((d) => d.companySpent)).toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">最低月成本</p>
          <p className="font-semibold text-foreground">
            ${Math.min(...data.map((d) => d.companySpent)).toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">平均使用率</p>
          <p className="font-semibold text-foreground">
            {(data.reduce((sum, d) => sum + d.percentage, 0) / data.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
