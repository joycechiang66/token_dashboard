/**
 * Budget Context
 * 
 * Manages budget settings for departments and company
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface BudgetSettings {
  companyBudget: number; // Monthly budget for entire company in USD
  departmentBudgets: Record<string, number>; // Monthly budgets by department ID
}

interface BudgetContextType {
  budgets: BudgetSettings;
  setBudgets: (budgets: BudgetSettings) => void;
  setCompanyBudget: (budget: number) => void;
  setDepartmentBudget: (departmentId: string, budget: number) => void;
  getCompanyBudget: () => number;
  getDepartmentBudget: (departmentId: string) => number;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Default budgets
const DEFAULT_BUDGETS: BudgetSettings = {
  companyBudget: 10000, // $10,000 per month for company
  departmentBudgets: {
    'eng': 3000,
    'product': 2500,
    'data': 2000,
    'design': 1000,
    'marketing': 1500,
  },
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetSettings>(DEFAULT_BUDGETS);

  const setCompanyBudget = (budget: number) => {
    setBudgets((prev) => ({
      ...prev,
      companyBudget: budget,
    }));
  };

  const setDepartmentBudget = (departmentId: string, budget: number) => {
    setBudgets((prev) => ({
      ...prev,
      departmentBudgets: {
        ...prev.departmentBudgets,
        [departmentId]: budget,
      },
    }));
  };

  const getCompanyBudget = () => budgets.companyBudget;

  const getDepartmentBudget = (departmentId: string) => {
    return budgets.departmentBudgets[departmentId] || 0;
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        setBudgets,
        setCompanyBudget,
        setDepartmentBudget,
        getCompanyBudget,
        getDepartmentBudget,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
}
