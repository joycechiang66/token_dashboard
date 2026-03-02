/**
 * Budget Alert Component
 * 
 * Displays budget status and alerts when budget is exceeded or approaching limit
 */

import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BudgetAlertProps {
  name: string;
  currentCost: number;
  budgetLimit: number;
  type?: 'company' | 'department';
}

export default function BudgetAlert({
  name,
  currentCost,
  budgetLimit,
  type = 'department',
}: BudgetAlertProps) {
  const percentage = budgetLimit > 0 ? (currentCost / budgetLimit) * 100 : 0;
  const remaining = Math.max(0, budgetLimit - currentCost);
  const isExceeded = currentCost > budgetLimit;
  const isWarning = percentage >= 80 && percentage < 100;
  const isNormal = percentage < 80;

  let bgColor = '';
  let borderColor = '';
  let icon = null;
  let statusText = '';
  let statusColor = '';

  if (isExceeded) {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = <AlertCircle className="w-5 h-5 text-red-600" />;
    statusText = '已超支';
    statusColor = 'text-red-600';
  } else if (isWarning) {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    icon = <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    statusText = '即將超支';
    statusColor = 'text-yellow-600';
  } else {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = <CheckCircle className="w-5 h-5 text-green-600" />;
    statusText = '正常';
    statusColor = 'text-green-600';
  }

  return (
    <Card className={`p-4 border ${borderColor} ${bgColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{type === 'company' ? '公司預算' : '部門預算'}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${statusColor}`}>{statusText}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">使用進度</span>
          <span className="text-sm font-medium text-foreground">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isExceeded
                ? 'bg-red-600'
                : isWarning
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">已使用</p>
          <p className="font-semibold text-foreground">${currentCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">預算上限</p>
          <p className="font-semibold text-foreground">${budgetLimit.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">
            {isExceeded ? '超支' : '剩餘'}
          </p>
          <p className={`font-semibold ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(remaining).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Alert Message */}
      {isExceeded && (
        <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-700">
          ⚠️ 已超出預算 ${(currentCost - budgetLimit).toFixed(2)}，請立即檢查成本使用情況。
        </div>
      )}
      {isWarning && (
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-700">
          ⚠️ 預算使用已達 {percentage.toFixed(1)}%，請注意成本控制。
        </div>
      )}
    </Card>
  );
}
