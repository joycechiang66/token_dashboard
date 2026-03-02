/**
 * Export PDF Button Component
 * 
 * Provides button to export cost analysis page to PDF
 */

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportCostAnalysisToPDF } from '@/lib/pdfExport';
import { useState } from 'react';

interface ExportPDFButtonProps {
  fileName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
}

export default function ExportPDFButton({ fileName = 'cost-analysis.pdf', variant = 'outline' }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportCostAnalysisToPDF(fileName);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('匯出 PDF 失敗，請稍後重試');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      className="flex items-center gap-2"
    >
      <Download size={16} />
      {isExporting ? '匯出中...' : '匯出 PDF'}
    </Button>
  );
}
