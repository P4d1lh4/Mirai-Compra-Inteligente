import { formatPrice, formatDistance, savingsPercent } from '@/lib/utils'

describe('API Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats price as Brazilian real', () => {
      expect(formatPrice(100)).toBe('R$ 100,00')
      expect(formatPrice(1500.5)).toBe('R$ 1.500,50')
      expect(formatPrice(0)).toBe('R$ 0,00')
    })

    it('handles large numbers', () => {
      expect(formatPrice(999999.99)).toBe('R$ 999.999,99')
    })

    it('handles decimal places', () => {
      expect(formatPrice(99.9)).toBe('R$ 99,90')
      expect(formatPrice(99.99)).toBe('R$ 99,99')
    })
  })

  describe('formatDistance', () => {
    it('formats distance in kilometers', () => {
      expect(formatDistance(1.5)).toBe('1,5 km')
      expect(formatDistance(0.5)).toBe('0,5 km')
      expect(formatDistance(100)).toBe('100 km')
    })

    it('handles very short distances', () => {
      expect(formatDistance(0.1)).toBe('0,1 km')
    })
  })

  describe('savingsPercent', () => {
    it('calculates percentage savings', () => {
      // Original: 100, Current: 80 = 20% savings
      expect(savingsPercent(100, 80)).toBe(20)
    })

    it('handles same price', () => {
      expect(savingsPercent(100, 100)).toBe(0)
    })

    it('handles price increase (negative savings)', () => {
      // Original: 100, Current: 150 = -50% (50% increase)
      expect(savingsPercent(100, 150)).toBe(-50)
    })

    it('returns 0 when original is 0', () => {
      expect(savingsPercent(0, 100)).toBe(0)
    })
  })
})
