/**
 * Budget History Context
 * 
 * Manages budget usage history for long-term trend analysis
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface BudgetHistoryRecord {
  date: string; // YYYY-MM-DD
  companySpent: number;
  companyBudget: number;
  departmentSpent: Record<string, number>;
  departmentBudget: Record<string, number>;
}

interface BudgetHistoryContextType {
  history: BudgetHistoryRecord[];
  addHistoryRecord: (record: BudgetHistoryRecord) => void;
  getHistoryByDateRange: (startDate: string, endDate: string) => BudgetHistoryRecord[];
  getMonthlySummary: () => Array<{
    month: string;
    companySpent: number;
    companyBudget: number;
    percentage: number;
  }>;
}

const BudgetHistoryContext = createContext<BudgetHistoryContextType | undefined>(undefined);

export function BudgetHistoryProvider({ children }: { children: ReactNode }) {
  // Initialize with mock historical data (past 12 months)
  const [history, setHistory] = useState<BudgetHistoryRecord[]>(() => {
    const records: BudgetHistoryRecord[] = [];
    const today = new Date();
    
    // Generate historical data for past 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate varying monthly costs
      const baseSpent = 3000 + Math.random() * 4000;
      const variance = Math.sin(i * 0.5) * 1000;
      
      records.push({
        date: dateStr,
        companySpent: baseSpent + variance,
        companyBudget: 10000,
        departmentSpent: {
          'dept-1': (baseSpent + variance) * 0.35,
          'dept-2': (baseSpent + variance) * 0.25,
          'dept-3': (baseSpent + variance) * 0.20,
          'dept-4': (baseSpent + variance) * 0.10,
          'dept-5': (baseSpent + variance) * 0.10,
        },
        departmentBudget: {
          'dept-1': 3000,
          'dept-2': 2500,
          'dept-3': 2000,
          'dept-4': 1000,
          'dept-5': 1500,
        },
      });
    }
    
    return records;
  });

  const addHistoryRecord = (record: BudgetHistoryRecord) => {
    setHistory((prev) => {
      // Remove duplicate dates, keep the latest
      const filtered = prev.filter((r) => r.date !== record.date);
      return [...filtered, record].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const getHistoryByDateRange = (startDate: string, endDate: string) => {
    return history.filter((r) => r.date >= startDate && r.date <= endDate);
  };

  const getMonthlySummary = () => {
    // Group by month and calculate average
    const monthlyMap: Record<string, { spent: number; budget: number; count: number }> = {};
    
    history.forEach((record) => {
      const month = record.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) {
        monthlyMap[month] = { spent: 0, budget: 0, count: 0 };
      }
      monthlyMap[month].spent += record.companySpent;
      monthlyMap[month].budget = record.companyBudget;
      monthlyMap[month].count += 1;
    });

    return Object.entries(monthlyMap)
      .map(([month, data]) => ({
        month,
        companySpent: data.spent / data.count,
        companyBudget: data.budget,
        percentage: ((data.spent / data.count) / data.budget) * 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  return (
    <BudgetHistoryContext.Provider value={{ history, addHistoryRecord, getHistoryByDateRange, getMonthlySummary }}>
      {children}
    </BudgetHistoryContext.Provider>
  );
}

export function useBudgetHistory() {
  const context = useContext(BudgetHistoryContext);
  if (context === undefined) {
    throw new Error('useBudgetHistory must be used within BudgetHistoryProvider');
  }
  return context;
}
