/**
 * Efficiency Ranking Component
 * 
 * Displays a ranking table of departments or employees by efficiency
 */

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  calculateEfficiencyMetrics,
  formatEfficiency,
  getEfficiencyBadgeColor,
  getEfficiencyBadgeLabel,
  getEfficiencyRank,
} from '@/lib/efficiencyCalculator';
import { TokenRecord } from '@/lib/mockData';

interface RankingItem {
  id: string;
  name: string;
  records: TokenRecord[];
}

interface EfficiencyRankingProps {
  items: RankingItem[];
  title?: string;
  type?: 'department' | 'employee';
}

export default function EfficiencyRanking({
  items,
  title = 'Token 使用效率排名',
  type = 'department',
}: EfficiencyRankingProps) {
  // Calculate efficiency for each item
  const itemsWithEfficiency = items
    .map((item) => {
      const metrics = calculateEfficiencyMetrics(item.records);
      return {
        ...item,
        efficiency: metrics.tokensPerDollar,
        totalTokens: metrics.totalTokens,
        totalCost: metrics.totalCost,
      };
    })
    .sort((a, b) => b.efficiency - a.efficiency); // Sort by efficiency (descending)

  const efficiencies = itemsWithEfficiency.map((item) => item.efficiency);

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">排名</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                {type === 'department' ? '部門' : '員工'}
              </th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Token 數量</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">成本</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">效率</th>
              <th className="text-center py-3 px-4 text-muted-foreground font-medium">評級</th>
            </tr>
          </thead>
          <tbody>
            {itemsWithEfficiency.map((item, index) => {
              const rank = getEfficiencyRank(item.efficiency, efficiencies);
              const badgeColor = getEfficiencyBadgeColor(rank, itemsWithEfficiency.length);
              const badgeLabel = getEfficiencyBadgeLabel(rank, itemsWithEfficiency.length);
              const isImproving = index > 0 && item.efficiency > itemsWithEfficiency[index - 1].efficiency;

              return (
                <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{index + 1}</span>
                      {index === 0 && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {index === itemsWithEfficiency.length - 1 && (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    {(item.totalTokens / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 px-4 text-right text-foreground">
                    ${item.totalCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-primary">{formatEfficiency(item.efficiency)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {itemsWithEfficiency.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>暫無數據</p>
        </div>
      )}
    </Card>
  );
}
