import { countDaysInIsoMonth } from './isoDate'

type DatePartName = 'day' | 'month' | 'year'

const datePartDigitCounts: Record<DatePartName, number> = { day: 2, month: 2, year: 4 }
const datePartHints: Record<DatePartName, string> = { day: 'DD', month: 'MM', year: 'YYYY' }
const directionMarkPattern = /[‎‏؜]/g
const fallbackSeparator = '/'
const rangeSeparator = ' – '

function isDatePartName(partType: string): partType is DatePartName {
  return partType === 'day' || partType === 'month' || partType === 'year'
}

function padDatePart(datePart: number, digitCount: number) {
  return String(datePart).padStart(digitCount, '0')
}

/** Read the order of the day, month and year in a language, and the characters written between them. */
function readDateLayout(locale: string) {
  const dateFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
    numberingSystem: 'latn',
  })
  const datePartOrder: DatePartName[] = []
  const separators: string[] = []

  for (const formattedPart of dateFormat.formatToParts(new Date(Date.UTC(2026, 10, 26)))) {
    if (isDatePartName(formattedPart.type)) datePartOrder.push(formattedPart.type)
    else if (datePartOrder.length > 0 && datePartOrder.length < 3) {
      const separatorIndex = datePartOrder.length - 1
      separators[separatorIndex] = (separators[separatorIndex] ?? '') + formattedPart.value.replace(directionMarkPattern, '')
    }
  }

  return { datePartOrder, separators: separators.map((separator) => separator || fallbackSeparator) }
}

function escapeMaskTokens(separator: string) {
  return separator.replace(/[#@*!]/g, (tokenCharacter) => `!${tokenCharacter}`)
}

function buildIsoDate(year: number, month: number, day: number) {
  if (year < 1 || month < 1 || month > 12 || day < 1) return undefined

  const isoMonth = `${padDatePart(year, 4)}-${padDatePart(month, 2)}`

  return day > countDaysInIsoMonth(isoMonth) ? undefined : `${isoMonth}-${padDatePart(day, 2)}`
}

/** Describe how dates are typed in a language: the mask pattern, the format hint, and how typed text becomes a date. */
export function createDateInputMask(locale: string) {
  const { datePartOrder, separators } = readDateLayout(locale)
  const maxDigitCount = datePartOrder.reduce((digitCount, datePartName) => digitCount + datePartDigitCounts[datePartName], 0)

  const pattern = datePartOrder
    .map((datePartName, partIndex) => '#'.repeat(datePartDigitCounts[datePartName]) + escapeMaskTokens(separators[partIndex] ?? ''))
    .join('')

  const formatHint = datePartOrder
    .map((datePartName, partIndex) => datePartHints[datePartName] + (separators[partIndex] ?? ''))
    .join('')

  function formatIsoDate(isoDate: string) {
    const datePartValues: Record<DatePartName, string> = {
      year: isoDate.slice(0, 4),
      month: isoDate.slice(5, 7),
      day: isoDate.slice(8, 10),
    }

    return datePartOrder.map((datePartName, partIndex) => datePartValues[datePartName] + (separators[partIndex] ?? '')).join('')
  }

  /** Read a typed or pasted date: a `YYYY-MM-DD` date, three groups of digits in the order of the language, or all its digits. */
  function parseTypedDate(typedText: string) {
    const trimmedText = typedText.trim()
    const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedText)

    if (isoDateMatch) return buildIsoDate(Number(isoDateMatch[1]), Number(isoDateMatch[2]), Number(isoDateMatch[3]))

    const digitGroups = trimmedText.split(/\D+/).filter(Boolean)
    const datePartValues: Partial<Record<DatePartName, string>> = {}

    if (digitGroups.length === datePartOrder.length) {
      datePartOrder.forEach((datePartName, partIndex) => {
        datePartValues[datePartName] = digitGroups[partIndex]
      })
    } else {
      const digits = trimmedText.replace(/\D/g, '')
      if (digits.length !== maxDigitCount) return undefined

      let consumedDigitCount = 0
      for (const datePartName of datePartOrder) {
        datePartValues[datePartName] = digits.slice(consumedDigitCount, consumedDigitCount + datePartDigitCounts[datePartName])
        consumedDigitCount += datePartDigitCounts[datePartName]
      }
    }

    if (datePartValues.year?.length !== 4) return undefined

    return buildIsoDate(Number(datePartValues.year), Number(datePartValues.month), Number(datePartValues.day))
  }

  /** Rewrite a complete date, typed or pasted in any accepted form, in the layout of the language before it is masked. */
  function normalizeTypedDate(typedText: string) {
    const typedIsoDate = parseTypedDate(typedText)
    return typedIsoDate ? formatIsoDate(typedIsoDate) : typedText
  }

  const rangePattern = pattern + escapeMaskTokens(rangeSeparator) + pattern
  const rangeFormatHint = formatHint + rangeSeparator + formatHint

  function formatIsoRange([rangeStart, rangeEnd]: [string, string]) {
    return formatIsoDate(rangeStart) + rangeSeparator + formatIsoDate(rangeEnd)
  }

  /** Read both ends of a typed range from its digits: each end is known once its digits are all typed. */
  function parseTypedRange(typedText: string) {
    const digits = typedText.replace(/\D/g, '')
    const hasCompleteStart = digits.length >= maxDigitCount
    const hasCompleteEnd = digits.length >= maxDigitCount * 2

    return {
      hasCompleteStart,
      hasCompleteEnd,
      rangeStart: hasCompleteStart ? parseTypedDate(digits.slice(0, maxDigitCount)) : undefined,
      rangeEnd: hasCompleteEnd ? parseTypedDate(digits.slice(maxDigitCount, maxDigitCount * 2)) : undefined,
    }
  }

  /** Rewrite a complete range, pasted as two `YYYY-MM-DD` dates or two dates in the order of the language, in the layout of the language. */
  function normalizeTypedRange(typedText: string) {
    const isoRangeMatch = /^\s*(\d{4}-\d{2}-\d{2})\D+(\d{4}-\d{2}-\d{2})\s*$/.exec(typedText)
    const digitGroups = typedText.split(/\D+/).filter(Boolean)
    const [typedStart, typedEnd] = isoRangeMatch
      ? [isoRangeMatch[1], isoRangeMatch[2]]
      : [digitGroups.slice(0, 3).join(' '), digitGroups.slice(3, 6).join(' ')]
    const rangeStart = isoRangeMatch || digitGroups.length === 6 ? parseTypedDate(typedStart) : undefined
    const rangeEnd = rangeStart ? parseTypedDate(typedEnd) : undefined

    return rangeStart && rangeEnd ? formatIsoRange([rangeStart, rangeEnd]) : typedText
  }

  return {
    pattern,
    formatHint,
    formatIsoDate,
    parseTypedDate,
    normalizeTypedDate,
    rangePattern,
    rangeFormatHint,
    formatIsoRange,
    parseTypedRange,
    normalizeTypedRange,
  }
}

export type DateInputMask = ReturnType<typeof createDateInputMask>
