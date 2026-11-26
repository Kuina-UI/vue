import { describe, expect, it } from 'vitest'
import {
  addDaysToIsoDate,
  addMonthsToIsoDate,
  addMonthsToIsoMonth,
  clampIsoDate,
  countDaysBetweenIsoDates,
  countDaysInIsoMonth,
  countMonthsBetweenIsoMonths,
  findIsoDateWeekday,
  isIsoDateInDateList,
} from './isoDate'

describe('isoDate', () => {
  it('moves dates across months, years and leap days', () => {
    expect(addDaysToIsoDate('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDaysToIsoDate('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDaysToIsoDate('2028-02-28', 1)).toBe('2028-02-29')
  })

  it('moves months and keeps the day, or the last day of a shorter month', () => {
    expect(addMonthsToIsoMonth('2026-12', 1)).toBe('2027-01')
    expect(addMonthsToIsoMonth('2026-01', -1)).toBe('2025-12')
    expect(addMonthsToIsoDate('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonthsToIsoDate('2026-11-26', -12)).toBe('2025-11-26')
  })

  it('counts days and months between dates', () => {
    expect(countDaysInIsoMonth('2026-02')).toBe(28)
    expect(countDaysInIsoMonth('2028-02')).toBe(29)
    expect(countMonthsBetweenIsoMonths('2026-11', '2027-02')).toBe(3)
    expect(countDaysBetweenIsoDates('2026-11-19', '2026-11-26')).toBe(7)
  })

  it('finds the weekday without any time zone shift', () => {
    expect(findIsoDateWeekday('2026-11-01')).toBe(0)
    expect(findIsoDateWeekday('2026-11-26')).toBe(4)
  })

  it('finds a date among listed dates and inside listed ranges, both ends included', () => {
    const closedDates: Parameters<typeof isIsoDateInDateList>[1] = ['2026-12-25', ['2026-12-28', '2026-12-31']]

    expect(isIsoDateInDateList('2026-12-25', closedDates)).toBe(true)
    expect(isIsoDateInDateList('2026-12-28', closedDates)).toBe(true)
    expect(isIsoDateInDateList('2026-12-30', closedDates)).toBe(true)
    expect(isIsoDateInDateList('2026-12-31', closedDates)).toBe(true)
    expect(isIsoDateInDateList('2026-12-26', closedDates)).toBe(false)
    expect(isIsoDateInDateList('2027-01-01', closedDates)).toBe(false)
  })

  it('keeps a date between its limits', () => {
    expect(clampIsoDate('2026-11-02', '2026-11-10')).toBe('2026-11-10')
    expect(clampIsoDate('2026-12-20', undefined, '2026-12-10')).toBe('2026-12-10')
    expect(clampIsoDate('2026-11-26', '2026-11-10', '2026-12-10')).toBe('2026-11-26')
  })
})
