/**
 * Top Budget Alert Component
 * 
 * Displays prominent alert banner at the top of the dashboard
 * when budget is approaching or exceeded
 */

import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface TopBudgetAlertProps {
  alerts: Array<{
    type: 'warning' | 'critical';
    name: string;
    currentCost: number;
    budgetLimit: number;
    percentage: number;
  }>;
}

export default function TopBudgetAlert({ alerts }: TopBudgetAlertProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter((alert) => !dismissedAlerts.has(`${alert.name}-${alert.type}`));

  if (visibleAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (name: string, type: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(`${name}-${type}`);
    setDismissedAlerts(newDismissed);
  };

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const isCritical = alert.type === 'critical';
        const bgColor = isCritical
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
        const textColor = isCritical ? 'text-red-900 dark:text-red-100' : 'text-yellow-900 dark:text-yellow-100';
        const Icon = isCritical ? AlertCircle : AlertTriangle;

        return (
          <div
            key={`${alert.name}-${alert.type}`}
            className={`${bgColor} border rounded-lg p-4 flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${textColor}`}>
                {isCritical ? '⚠️ 預算已超支' : '⚠️ 預算即將用完'}
              </p>
              <p className={`text-sm mt-1 ${textColor}`}>
                {alert.name} 已使用 ${alert.currentCost.toFixed(2)} / ${alert.budgetLimit.toFixed(2)}（
                <span className="font-semibold">{alert.percentage.toFixed(1)}%</span>）
                {isCritical
                  ? ` - 已超支 $${(alert.currentCost - alert.budgetLimit).toFixed(2)}`
                  : ` - 剩餘 $${(alert.budgetLimit - alert.currentCost).toFixed(2)}`}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(alert.name, alert.type)}
              className={`flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors ${textColor}`}
              aria-label="關閉告警"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
