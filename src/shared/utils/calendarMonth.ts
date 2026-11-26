import type { CalendarDay, CalendarMonth, Weekday } from '../types/calendar'
import { addDaysToIsoDate, countDaysInIsoMonth, findIsoDateWeekday } from './isoDate'

const daysPerWeek = 7

/** List the seven weekdays in the order a calendar shows them, from the day its weeks start on. */
export function orderWeekdays(weekStartsOn: Weekday) {
  return Array.from({ length: daysPerWeek }, (_, weekdayOffset) => ((weekStartsOn + weekdayOffset) % daysPerWeek) as Weekday)
}

/** Lay out the days of a month in weeks starting on the given weekday, with empty cells before the first day. */
export function createCalendarMonth(isoMonth: string, weekStartsOn: Weekday): CalendarMonth {
  const firstIsoDate = `${isoMonth}-01`
  const dayCount = countDaysInIsoMonth(isoMonth)
  const emptyCellCountBeforeFirstDay = (findIsoDateWeekday(firstIsoDate) - weekStartsOn + daysPerWeek) % daysPerWeek

  const monthDays = Array.from({ length: dayCount }, (_, dayIndex): CalendarDay => {
    const isoDate = addDaysToIsoDate(firstIsoDate, dayIndex)
    return { isoDate, dayNumber: dayIndex + 1, weekday: findIsoDateWeekday(isoDate) }
  })

  const calendarCells = [...Array<null>(emptyCellCountBeforeFirstDay).fill(null), ...monthDays]
  const weeks = Array.from({ length: Math.ceil(calendarCells.length / daysPerWeek) }, (_, weekIndex) =>
    calendarCells.slice(weekIndex * daysPerWeek, (weekIndex + 1) * daysPerWeek),
  )

  return { isoMonth, firstIsoDate, lastIsoDate: monthDays[dayCount - 1].isoDate, weeks }
}
