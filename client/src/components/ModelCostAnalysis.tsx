/**
 * Model Cost Analysis Component
 * 
 * Displays pie chart of model cost breakdown and usage frequency
 */

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/card';
import { TokenRecord } from '@/lib/mockData';
import { calculateModelCost } from '@/lib/costCalculator';

interface ModelCostAnalysisProps {
  records: TokenRecord[];
  title?: string;
}

interface ModelData {
  name: string;
  cost: number;
  count: number;
  percentage: number;
}

// Color palette for models
const MODEL_COLORS: Record<string, string> = {
  'GPT-4': '#3b82f6',
  'GPT-3.5': '#60a5fa',
  'Claude 3': '#8b5cf6',
  'Claude 2': '#a78bfa',
  'Gemini Pro': '#ec4899',
  'LLaMA 2': '#f97316',
  'Mistral': '#eab308',
  'Cohere': '#10b981',
};

export default function ModelCostAnalysis({ records, title = '模型成本分析' }: ModelCostAnalysisProps) {
  // Calculate cost by model
  const modelStats: Record<string, { cost: number; count: number }> = {};

  records.forEach((record) => {
    const cost = calculateModelCost(record.model, record.inputTokens, record.outputTokens);
    if (!modelStats[record.model]) {
      modelStats[record.model] = { cost: 0, count: 0 };
    }
    modelStats[record.model].cost += cost;
    modelStats[record.model].count += 1;
  });

  // Convert to array and sort by cost
  const totalCost = Object.values(modelStats).reduce((sum, stat) => sum + stat.cost, 0);
  const totalCount = Object.values(modelStats).reduce((sum, stat) => sum + stat.count, 0);

  const modelData: ModelData[] = Object.entries(modelStats)
    .map(([name, stat]) => ({
      name,
      cost: stat.cost,
      count: stat.count,
      percentage: totalCost > 0 ? (stat.cost / totalCost) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  // Data for bar chart (usage frequency)
  const frequencyData = modelData.map((item) => ({
    name: item.name,
    count: item.count,
  }));

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart - Cost Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">成本佔比</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {modelData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={MODEL_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: `1px solid var(--color-border)`,
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Usage Frequency */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-4">使用頻率</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: `1px solid var(--color-border)`,
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                  }}
                  formatter={(value: number) => [`${value} 次`, '使用次數']}
                />
                <Bar dataKey="count" fill="var(--color-primary)" name="使用次數" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">模型</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">成本</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">佔比</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">使用次數</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">平均成本</th>
            </tr>
          </thead>
          <tbody>
            {modelData.map((item) => (
              <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: MODEL_COLORS[item.name] || '#8884d8' }}
                    />
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-foreground font-semibold">
                  ${item.cost.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-primary font-semibold">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right text-foreground">
                  {item.count}
                </td>
                <td className="py-3 px-4 text-right text-foreground">
                  ${(item.cost / item.count).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">總成本</p>
          <p className="font-semibold text-foreground">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">總使用次數</p>
          <p className="font-semibold text-foreground">{totalCount}</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">平均成本</p>
          <p className="font-semibold text-foreground">${(totalCost / totalCount).toFixed(4)}</p>
        </div>
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">最常用模型</p>
          <p className="font-semibold text-foreground">{modelData.length > 0 ? modelData[0].name : '無數據'}</p>
        </div>
      </div>
    </Card>
  );
}
