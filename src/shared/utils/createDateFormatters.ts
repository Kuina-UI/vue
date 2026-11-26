import type { Weekday } from '../types/calendar'
import { addDaysToIsoDate, isoDateToUtcDate } from './isoDate'

const referenceSundayIsoDate = '2023-01-01'

/** Keep the first two letters of a short weekday name, like `Su` or `lu`, as calendar headers show them. */
function abbreviateWeekday(shortWeekdayName: string) {
  return Array.from(shortWeekdayName.replace(/\.$/, '')).slice(0, 2).join('')
}

/** Build the texts of a calendar in a language, from the dates themselves, with Intl. */
export function createDateFormatters(locale: string) {
  const shortDateFormat = new Intl.DateTimeFormat(locale, {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  })
  const fullDateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' })
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })

  return {
    formatShortDate: (isoDate: string) => shortDateFormat.format(isoDateToUtcDate(isoDate)),
    formatFullDate: (isoDate: string) => fullDateFormat.format(isoDateToUtcDate(isoDate)),
    formatMonth: (isoMonth: string) => monthFormat.format(isoDateToUtcDate(`${isoMonth}-01`)),
    formatWeekday: (weekday: Weekday) =>
      abbreviateWeekday(weekdayFormat.format(isoDateToUtcDate(addDaysToIsoDate(referenceSundayIsoDate, weekday)))),
  }
}

export type DateFormatters = ReturnType<typeof createDateFormatters>
