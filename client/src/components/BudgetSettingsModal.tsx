/**
 * Budget Settings Modal Component
 * 
 * Modal for editing budget settings
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Array<{ id: string; name: string }>;
}

export default function BudgetSettingsModal({
  isOpen,
  onClose,
  departments,
}: BudgetSettingsModalProps) {
  const { budgets, setCompanyBudget, setDepartmentBudget } = useBudget();
  const [companyBudget, setLocalCompanyBudget] = useState(budgets.companyBudget);
  const [departmentBudgets, setLocalDepartmentBudgets] = useState(budgets.departmentBudgets);

  const handleCompanyBudgetChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setLocalCompanyBudget(num);
  };

  const handleDepartmentBudgetChange = (departmentId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setLocalDepartmentBudgets((prev) => ({
      ...prev,
      [departmentId]: num,
    }));
  };

  const handleSave = () => {
    setCompanyBudget(companyBudget);
    Object.entries(departmentBudgets).forEach(([deptId, budget]) => {
      setDepartmentBudget(deptId, budget);
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 p-6 border border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">預算設定</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Company Budget */}
          <div className="p-4 bg-secondary/30 rounded-lg">
            <label className="block text-sm font-semibold text-foreground mb-2">
              公司月度預算 (USD)
            </label>
            <input
              type="number"
              value={companyBudget}
              onChange={(e) => handleCompanyBudgetChange(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="輸入金額"
              min="0"
              step="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              設定整個公司的月度成本預算上限
            </p>
          </div>

          {/* Department Budgets */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">部門月度預算 (USD)</h3>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="p-3 bg-secondary/20 rounded-lg">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {dept.name}
                  </label>
                  <input
                    type="number"
                    value={departmentBudgets[dept.id] || 0}
                    onChange={(e) => handleDepartmentBudgetChange(dept.id, e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="輸入金額"
                    min="0"
                    step="100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            保存設定
          </Button>
        </div>
      </Card>
    </div>
  );
}
