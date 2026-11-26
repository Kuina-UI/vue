import type { DateOrDateRange, Weekday } from '../types/calendar'

const millisecondsPerDay = 24 * 60 * 60 * 1000

function padDatePart(datePart: number) {
  return String(datePart).padStart(2, '0')
}

/** Turn a `YYYY-MM-DD` date into a Date at midnight UTC, so that no time zone can move it to another day. */
export function isoDateToUtcDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`)
}

export function utcDateToIsoDate(utcDate: Date) {
  return utcDate.toISOString().slice(0, 10)
}

export function extractIsoMonth(isoDate: string) {
  return isoDate.slice(0, 7)
}

export function countDaysInIsoMonth(isoMonth: string) {
  const [year, monthNumber] = isoMonth.split('-').map(Number)
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
}

export function findIsoDateWeekday(isoDate: string) {
  return isoDateToUtcDate(isoDate).getUTCDay() as Weekday
}

export function addDaysToIsoDate(isoDate: string, dayCount: number) {
  const utcDate = isoDateToUtcDate(isoDate)
  utcDate.setUTCDate(utcDate.getUTCDate() + dayCount)
  return utcDateToIsoDate(utcDate)
}

export function addMonthsToIsoMonth(isoMonth: string, monthCount: number) {
  const utcDate = isoDateToUtcDate(`${isoMonth}-01`)
  utcDate.setUTCMonth(utcDate.getUTCMonth() + monthCount)
  return extractIsoMonth(utcDateToIsoDate(utcDate))
}

/** Move a date by whole months, keeping its day number, or the last day when the target month is shorter. */
export function addMonthsToIsoDate(isoDate: string, monthCount: number) {
  const targetIsoMonth = addMonthsToIsoMonth(extractIsoMonth(isoDate), monthCount)
  const targetDayNumber = Math.min(Number(isoDate.slice(8, 10)), countDaysInIsoMonth(targetIsoMonth))
  return `${targetIsoMonth}-${padDatePart(targetDayNumber)}`
}

export function countMonthsBetweenIsoMonths(fromIsoMonth: string, toIsoMonth: string) {
  const [fromYear, fromMonthNumber] = fromIsoMonth.split('-').map(Number)
  const [toYear, toMonthNumber] = toIsoMonth.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonthNumber - fromMonthNumber)
}

export function countDaysBetweenIsoDates(fromIsoDate: string, toIsoDate: string) {
  return Math.round((isoDateToUtcDate(toIsoDate).getTime() - isoDateToUtcDate(fromIsoDate).getTime()) / millisecondsPerDay)
}

/** Tell whether a date is one of the listed dates, or falls inside one of the listed ranges, both ends included. */
export function isIsoDateInDateList(isoDate: string, dateList: DateOrDateRange[]) {
  return dateList.some((listedDate) =>
    typeof listedDate === 'string' ? listedDate === isoDate : isoDate >= listedDate[0] && isoDate <= listedDate[1],
  )
}

export interface IsoDateLimits {
  min?: string
  max?: string
  disabledDates?: DateOrDateRange[]
  isDateDisabled?: (isoDate: string) => boolean
}

/** Tell whether a date falls outside min and max, or is disabled by the list or the function. */
export function isIsoDateUnavailable(isoDate: string, dateLimits: IsoDateLimits) {
  if (dateLimits.min && isoDate < dateLimits.min) return true
  if (dateLimits.max && isoDate > dateLimits.max) return true
  if (dateLimits.disabledDates && isIsoDateInDateList(isoDate, dateLimits.disabledDates)) return true
  return Boolean(dateLimits.isDateDisabled?.(isoDate))
}

export function clampIsoDate(isoDate: string, minIsoDate?: string, maxIsoDate?: string) {
  if (minIsoDate && isoDate < minIsoDate) return minIsoDate
  if (maxIsoDate && isoDate > maxIsoDate) return maxIsoDate
  return isoDate
}

/** Read today's date in the time zone of the device, which is the day its user sees on the calendar. */
export function findLocalTodayIsoDate() {
  const now = new Date()
  return `${now.getFullYear()}-${padDatePart(now.getMonth() + 1)}-${padDatePart(now.getDate())}`
}
