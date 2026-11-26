import { describe, expect, it } from 'vitest'
import { createDateFormatters } from './createDateFormatters'

describe('createDateFormatters', () => {
  it('writes dates like Apps SDK UI in English', () => {
    const englishFormatters = createDateFormatters('en-US')

    expect(englishFormatters.formatShortDate('2026-11-26')).toBe('11/26/26')
    expect(englishFormatters.formatShortDate('2026-11-03')).toBe('11/03/26')
    expect(englishFormatters.formatMonth('2026-11')).toBe('November 2026')
    expect(englishFormatters.formatFullDate('2026-11-26')).toBe('Thursday, November 26, 2026')
    expect([0, 1, 2, 3, 4, 5, 6].map((weekday) => englishFormatters.formatWeekday(weekday as 0))).toEqual([
      'Su',
      'Mo',
      'Tu',
      'We',
      'Th',
      'Fr',
      'Sa',
    ])
  })

  it('follows the locale for every text', () => {
    const frenchFormatters = createDateFormatters('fr-FR')

    expect(frenchFormatters.formatShortDate('2026-11-26')).toBe('26/11/26')
    expect(frenchFormatters.formatMonth('2026-11')).toBe('novembre 2026')
    expect(frenchFormatters.formatFullDate('2026-11-26')).toBe('jeudi 26 novembre 2026')
    expect(frenchFormatters.formatWeekday(1)).toBe('lu')
  })
})
