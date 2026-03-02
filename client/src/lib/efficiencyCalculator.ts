/**
 * Efficiency Calculator Utilities
 * 
 * Provides functions to calculate Token usage efficiency metrics
 */

import { calculateModelCost } from './costCalculator';
import { TokenRecord } from './mockData';

/**
 * Calculate efficiency metrics for a set of records
 * Efficiency = Tokens per Dollar (higher is better)
 */
export interface EfficiencyMetrics {
  totalTokens: number;
  totalCost: number;
  tokensPerDollar: number; // Tokens per $1 spent
  costPerToken: number; // Cost per 1M tokens
}

/**
 * Calculate efficiency metrics from token records
 */
export function calculateEfficiencyMetrics(records: TokenRecord[]): EfficiencyMetrics {
  let totalTokens = 0;
  let totalCost = 0;

  records.forEach((record) => {
    totalTokens += record.inputTokens + record.outputTokens;
    totalCost += calculateModelCost(record.model, record.inputTokens, record.outputTokens);
  });

  const tokensPerDollar = totalCost > 0 ? totalTokens / totalCost : 0;
  const costPerToken = totalTokens > 0 ? (totalCost / totalTokens) * 1_000_000 : 0;

  return {
    totalTokens,
    totalCost,
    tokensPerDollar,
    costPerToken,
  };
}

/**
 * Format efficiency metric (tokens per dollar)
 */
export function formatEfficiency(tokensPerDollar: number): string {
  return `${tokensPerDollar.toFixed(0)} tokens/$`;
}

/**
 * Format cost per token metric
 */
export function formatCostPerToken(costPerToken: number): string {
  return `$${costPerToken.toFixed(4)}/M`;
}

/**
 * Get efficiency rank based on tokens per dollar
 * Returns rank number (1 = most efficient, higher = less efficient)
 */
export function getEfficiencyRank(
  currentEfficiency: number,
  allEfficiencies: number[]
): number {
  const sorted = [...allEfficiencies].sort((a, b) => b - a);
  return sorted.indexOf(currentEfficiency) + 1;
}

/**
 * Get efficiency badge color based on rank
 */
export function getEfficiencyBadgeColor(rank: number, totalCount: number): string {
  const percentile = rank / totalCount;

  if (percentile <= 0.33) {
    return 'bg-green-100 text-green-700'; // Top 33%
  } else if (percentile <= 0.67) {
    return 'bg-yellow-100 text-yellow-700'; // Middle 33%
  } else {
    return 'bg-red-100 text-red-700'; // Bottom 33%
  }
}

/**
 * Get efficiency badge label
 */
export function getEfficiencyBadgeLabel(rank: number, totalCount: number): string {
  const percentile = rank / totalCount;

  if (percentile <= 0.33) {
    return '高效';
  } else if (percentile <= 0.67) {
    return '中等';
  } else {
    return '低效';
  }
}
