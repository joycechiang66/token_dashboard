import type { TokenRecord } from '../types'

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'GPT-4': { input: 0.00003, output: 0.00006 },
  'GPT-3.5': { input: 0.0000005, output: 0.0000015 },
  Claude: { input: 0.000008, output: 0.000024 },
  Gemini: { input: 0.00001, output: 0.00002 },
  'Llama-2': { input: 0.0000005, output: 0.0000015 },
  Mistral: { input: 0.00001, output: 0.00003 },
  Qwen: { input: 0.000005, output: 0.000015 },
  Yi: { input: 0.000003, output: 0.000009 },
}

export function calculateRecordCost(record: TokenRecord): number {
  const pricing = MODEL_PRICING[record.model] || { input: 0.00001, output: 0.00003 }
  return record.inputTokens * pricing.input + record.outputTokens * pricing.output
}

export function calculateTotalCost(records: TokenRecord[]): number {
  return records.reduce((sum, record) => sum + calculateRecordCost(record), 0)
}

export function calculateModelCost(records: TokenRecord[], model: string): number {
  return records
    .filter((record) => record.model === model)
    .reduce((sum, record) => sum + calculateRecordCost(record), 0)
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`
}

export function formatCostCompact(cost: number): string {
  if (cost >= 1000000) {
    return `$${(cost / 1000000).toFixed(1)}M`
  }
  if (cost >= 1000) {
    return `$${(cost / 1000).toFixed(1)}K`
  }
  return `$${cost.toFixed(2)}`
}

export function getModelPricing(): Record<string, { input: number; output: number }> {
  return MODEL_PRICING
}
