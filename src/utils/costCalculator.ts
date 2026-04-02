import type { TokenRecord } from '../types'

const DEFAULT_MODEL_RATE = { input: 12, output: 24 }
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'GPT-4': { input: 28, output: 56 },
  'GPT-3.5': { input: 4, output: 8 },
  Claude: { input: 18, output: 36 },
  Gemini: { input: 14, output: 28 },
  'Llama-2': { input: 3, output: 6 },
  Mistral: { input: 10, output: 20 },
  Qwen: { input: 8, output: 16 },
  Yi: { input: 6, output: 12 },
}
const currencyFormatter = new Intl.NumberFormat('zh-TW', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export function calculateRecordCost(record: TokenRecord): number {
  const pricing = MODEL_PRICING[record.model] || DEFAULT_MODEL_RATE
  return (record.inputTokens / 1000) * pricing.input + (record.outputTokens / 1000) * pricing.output
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
  return `NT$${currencyFormatter.format(cost)}`
}

export function formatCostCompact(cost: number): string {
  if (cost >= 100000000) {
    return `NT$${(cost / 100000000).toFixed(2)}億`
  }
  if (cost >= 10000) {
    return `NT$${(cost / 10000).toFixed(1)}萬`
  }
  return formatCost(cost)
}

export function getModelPricing(): Record<string, { input: number; output: number }> {
  return MODEL_PRICING
}
