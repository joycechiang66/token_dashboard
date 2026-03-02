/**
 * Cost Trend Chart Component
 * 
 * Displays a line chart showing cost trends over the past 30 days
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { TokenRecord } from '@/lib/mockData';
import { calculateModelCost } from '@/lib/costCalculator';

interface CostTrendChartProps {
  records: TokenRecord[];
  title?: string;
  height?: number;
}

export default function CostTrendChart({ records, title = '成本趨勢', height = 300 }: CostTrendChartProps) {
  // Generate past 30 days data
  const today = new Date();
  const days: Record<string, number> = {};

  // Initialize all 30 days with 0 cost
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days[dateStr] = 0;
  }

  // Calculate cost for each day
  records.forEach((record) => {
    const recordDate = record.date;
    if (days.hasOwnProperty(recordDate)) {
      const cost = calculateModelCost(record.model, record.inputTokens, record.outputTokens);
      days[recordDate] += cost;
    }
  });

  // Convert to chart data format
  const chartData = Object.entries(days).map(([date, cost]) => ({
    date: new Date(date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }),
    cost: parseFloat(cost.toFixed(2)),
  }));

  // Calculate statistics
  const totalCost = Object.values(days).reduce((sum, cost) => sum + cost, 0);
  const avgCost = totalCost / 30;
  const maxCost = Math.max(...Object.values(days));
  const minCost = Math.min(...Object.values(days));

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">總成本</p>
            <p className="font-semibold text-foreground">${totalCost.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">平均成本</p>
            <p className="font-semibold text-foreground">${avgCost.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">最高成本</p>
            <p className="font-semibold text-foreground">${maxCost.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">最低成本</p>
            <p className="font-semibold text-foreground">${minCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full" style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                label={{ value: '成本 ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '成本']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
                name="每日成本"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
