/**
 * Split utilities for expense allocation
 */

/**
 * Split amount evenly among members
 */
export function splitEvenly(
  totalAmount: number,
  memberCount: number,
): number[] {
  if (memberCount <= 0) return [];
  if (memberCount === 1) return [totalAmount];

  const baseAmount = Math.floor(totalAmount / memberCount);
  const remainder = totalAmount - baseAmount * memberCount;

  // Distribute remainder (1đ each) to first members
  const amounts: number[] = [];
  for (let i = 0; i < memberCount; i++) {
    amounts.push(baseAmount + (i < remainder ? 1 : 0));
  }

  return amounts;
}

/**
 * Split by percentage
 */
export function splitByPercentage(
  totalAmount: number,
  percentages: number[],
): number[] {
  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Tổng phần trăm phải bằng 100');
  }

  return percentages.map((p) => Math.round((totalAmount * p) / 100));
}

/**
 * Split by custom amounts
 */
export function splitByCustomAmounts(
  totalAmount: number,
  amounts: number[],
): { isValid: boolean; diff: number } {
  const sum = amounts.reduce((acc, a) => acc + a, 0);
  return {
    isValid: sum === totalAmount,
    diff: totalAmount - sum,
  };
}

/**
 * Format currency in VND
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse VND string to number
 */
export function parseVND(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}
