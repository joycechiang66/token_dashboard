/**
 * Model Filter Component
 * 
 * Design Philosophy: Enterprise-grade professional style
 * - Multi-select dropdown for filtering by AI models
 * - Shows model usage statistics
 * - Integrated with other filters
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown, X } from 'lucide-react';

export interface ModelFilterProps {
  availableModels: string[];
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
}

export default function ModelFilter({
  availableModels,
  selectedModels,
  onModelsChange,
}: ModelFilterProps) {
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

  const handleToggleModel = (model: string) => {
    const newModels = selectedModels.includes(model)
      ? selectedModels.filter((m) => m !== model)
      : [...selectedModels, model];
    onModelsChange(newModels);
  };

  const handleSelectAll = () => {
    if (selectedModels.length === availableModels.length) {
      onModelsChange([]);
    } else {
      onModelsChange([...availableModels]);
    }
  };

  const handleClear = () => {
    onModelsChange([]);
  };

  const displayText =
    selectedModels.length === 0
      ? '所有模型'
      : selectedModels.length === availableModels.length
        ? '所有模型'
        : `${selectedModels.length} 個模型`;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-card hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{displayText}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 p-4 border border-border bg-card shadow-lg z-50 w-72">
          <div className="space-y-3">
            {/* Select All / Clear Buttons */}
            <div className="flex gap-2 pb-3 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleSelectAll}
              >
                {selectedModels.length === availableModels.length ? '取消全選' : '全選'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleClear}
              >
                清除
              </Button>
            </div>

            {/* Model List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableModels.map((model) => (
                <label
                  key={model}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model)}
                    onChange={() => handleToggleModel(model)}
                    className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
                  />
                  <span className="text-sm text-foreground flex-1">{model}</span>
                </label>
              ))}
            </div>

            {/* Selected Models Display */}
            {selectedModels.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">已選擇：</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModels.map((model) => (
                    <div
                      key={model}
                      className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary"
                    >
                      {model}
                      <button
                        onClick={() => handleToggleModel(model)}
                        className="ml-1 hover:text-primary/70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
