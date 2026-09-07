import { describe, it, expect } from 'vitest';
import { splitEvenly, splitByPercentage, splitByCustomAmounts, formatVND } from './split';

describe('Split Utilities', () => {
  describe('splitEvenly', () => {
    it('splits amount evenly without remainder', () => {
      const result = splitEvenly(300000, 3);
      expect(result).toEqual([100000, 100000, 100000]);
    });

    it('distributes remainder correctly', () => {
      const result = splitEvenly(100, 3);
      expect(result).toEqual([34, 33, 33]);
      expect(result.reduce((a, b) => a + b, 0)).toBe(100);
    });

    it('handles 1 member', () => {
      expect(splitEvenly(50000, 1)).toEqual([50000]);
    });

    it('returns empty array for 0 or negative members', () => {
      expect(splitEvenly(50000, 0)).toEqual([]);
      expect(splitEvenly(50000, -1)).toEqual([]);
    });
  });

  describe('splitByPercentage', () => {
    it('splits correctly with valid percentages', () => {
      const result = splitByPercentage(1000000, [50, 30, 20]);
      expect(result).toEqual([500000, 300000, 200000]);
    });

    it('throws error when percentage total is not 100', () => {
      expect(() => splitByPercentage(1000000, [50, 40])).toThrow('Tổng phần trăm phải bằng 100');
    });
  });

  describe('splitByCustomAmounts', () => {
    it('returns isValid true when amounts match total', () => {
      const res = splitByCustomAmounts(100000, [30000, 70000]);
      expect(res.isValid).toBe(true);
      expect(res.diff).toBe(0);
    });

    it('returns isValid false and diff when amounts do not match total', () => {
      const res = splitByCustomAmounts(100000, [30000, 60000]);
      expect(res.isValid).toBe(false);
      expect(res.diff).toBe(10000);
    });
  });

  describe('formatVND', () => {
    it('formats numbers into VND currency format', () => {
      const formatted = formatVND(100000);
      expect(formatted).toContain('100.000');
      expect(formatted).toContain('₫');
    });
  });
});
