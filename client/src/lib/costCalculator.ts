/**
 * Cost Calculator Utilities
 * 
 * Provides functions to calculate estimated costs based on token usage
 * and model pricing configurations
 */

/**
 * Model pricing configuration (cost per 1M tokens)
 * These are example prices based on typical market rates
 */
export const MODEL_PRICING: Record<string, { inputCost: number; outputCost: number }> = {
  'GPT-4': {
    inputCost: 30, // $30 per 1M input tokens
    outputCost: 60, // $60 per 1M output tokens
  },
  'GPT-4 Turbo': {
    inputCost: 10,
    outputCost: 30,
  },
  'GPT-3.5 Turbo': {
    inputCost: 0.5,
    outputCost: 1.5,
  },
  'Claude 3 Opus': {
    inputCost: 15,
    outputCost: 75,
  },
  'Claude 3 Sonnet': {
    inputCost: 3,
    outputCost: 15,
  },
  'Claude 3 Haiku': {
    inputCost: 0.25,
    outputCost: 1.25,
  },
  'Gemini Pro': {
    inputCost: 0.5,
    outputCost: 1.5,
  },
  'Gemini Ultra': {
    inputCost: 10,
    outputCost: 20,
  },
};

/**
 * Calculate cost for a specific model and token counts
 * @param model Model name
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @returns Cost in USD
 */
export function calculateModelCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // Default pricing if model not found
    return (inputTokens + outputTokens) * 0.0000005; // $0.5 per 1M tokens
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputCost;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCost;

  return inputCost + outputCost;
}

/**
 * Format cost as currency string
 * @param cost Cost in USD
 * @returns Formatted currency string
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost);
}

/**
 * Format cost with compact notation (e.g., $1.2K, $5.3M)
 * @param cost Cost in USD
 * @returns Formatted cost string
 */
export function formatCostCompact(cost: number): string {
  if (cost >= 1_000_000) {
    return `$${(cost / 1_000_000).toFixed(2)}M`;
  } else if (cost >= 1_000) {
    return `$${(cost / 1_000).toFixed(2)}K`;
  } else {
    return `$${cost.toFixed(2)}`;
  }
}

/**
 * Get pricing for a specific model
 * @param model Model name
 * @returns Pricing object or default pricing
 */
export function getModelPricing(model: string) {
  return (
    MODEL_PRICING[model] || {
      inputCost: 0.5,
      outputCost: 1.5,
    }
  );
}

/**
 * Get all available models with pricing
 * @returns Array of model names with pricing
 */
export function getAvailableModelsWithPricing() {
  return Object.entries(MODEL_PRICING).map(([model, pricing]) => ({
    model,
    ...pricing,
  }));
}
