/**
 * Export Button Component
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Provides export options for different data types
 * - Dropdown menu with multiple export formats
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, ChevronDown } from 'lucide-react';

export interface ExportOption {
  label: string;
  description: string;
  onClick: () => void;
}

interface ExportButtonProps {
  options: ExportOption[];
}

export default function ExportButton({ options }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-card hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">匯出</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 p-2 border border-border bg-card shadow-lg z-50 w-64">
          <div className="space-y-1">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleExport(option.onClick)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              >
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
