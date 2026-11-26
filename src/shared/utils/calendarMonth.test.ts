import { describe, expect, it } from 'vitest'
import { createCalendarMonth, orderWeekdays } from './calendarMonth'

describe('createCalendarMonth', () => {
  it('starts the first week on Sunday by default, without empty cells when the month starts on Sunday', () => {
    const novemberMonth = createCalendarMonth('2026-11', 0)

    expect(novemberMonth.weeks).toHaveLength(5)
    expect(novemberMonth.weeks[0][0]?.isoDate).toBe('2026-11-01')
    expect(novemberMonth.weeks[4].map((calendarDay) => calendarDay?.dayNumber)).toEqual([29, 30])
    expect(novemberMonth.firstIsoDate).toBe('2026-11-01')
    expect(novemberMonth.lastIsoDate).toBe('2026-11-30')
  })

  it('adds empty cells before the first day when weeks start on Monday', () => {
    const novemberMonth = createCalendarMonth('2026-11', 1)

    expect(novemberMonth.weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(novemberMonth.weeks[0][6]?.isoDate).toBe('2026-11-01')
    expect(novemberMonth.weeks).toHaveLength(6)
  })

  it('lists the weekdays from the first day of the week', () => {
    expect(orderWeekdays(0)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(orderWeekdays(1)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })
})
