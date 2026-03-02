/**
 * Date Range Filter Component
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Compact date range picker with clear visual feedback
 * - Integrated into card headers for easy access
 * - Supports quick preset ranges (Last 7 days, Last 30 days, etc.)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, X } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function DateRangeFilter({
  onDateRangeChange,
  initialStartDate,
  initialEndDate,
}: DateRangeFilterProps) {
  const today = new Date();
  const defaultEndDate = today.toISOString().split('T')[0];
  const defaultStartDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(initialStartDate || defaultStartDate);
  const [endDate, setEndDate] = useState(initialEndDate || defaultEndDate);
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onDateRangeChange({ startDate, endDate });
    setIsOpen(false);
  };

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    onDateRangeChange({ startDate: defaultStartDate, endDate: defaultEndDate });
    setIsOpen(false);
  };

  const handleQuickRange = (days: number) => {
    const newEndDate = today.toISOString().split('T')[0];
    const newStartDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange({ startDate: newStartDate, endDate: newEndDate });
    setIsOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getDaysDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-card hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm">
          {formatDate(startDate)} ~ {formatDate(endDate)}
        </span>
        <span className="text-xs text-muted-foreground ml-1">({getDaysDifference()} 天)</span>
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 p-4 border border-border bg-card shadow-lg z-50 w-96">
          <div className="space-y-4">
            {/* Quick Range Buttons */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">快速選擇</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickRange(7)}
                >
                  最近 7 天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickRange(14)}
                >
                  最近 14 天
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickRange(30)}
                >
                  最近 30 天
                </Button>
              </div>
            </div>

            {/* Date Input Fields */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  開始日期
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  結束日期
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleApply}
              >
                應用
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
