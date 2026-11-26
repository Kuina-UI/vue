import { describe, expect, it } from 'vitest'
import { createDateInputMask } from './createDateInputMask'

describe('createDateInputMask', () => {
  it('follows the order and the separator of the language', () => {
    expect(createDateInputMask('en-US').formatHint).toBe('MM/DD/YYYY')
    expect(createDateInputMask('fr-FR').formatHint).toBe('DD/MM/YYYY')
    expect(createDateInputMask('de-DE').formatHint).toBe('DD.MM.YYYY')
    expect(createDateInputMask('en-US').formatIsoDate('2026-11-02')).toBe('11/02/2026')
    expect(createDateInputMask('fr-FR').formatIsoDate('2026-11-02')).toBe('02/11/2026')
  })

  it('builds the mask pattern of the language', () => {
    expect(createDateInputMask('en-US').pattern).toBe('##/##/####')
    expect(createDateInputMask('de-DE').pattern).toBe('##.##.####')
  })

  it('rewrites a complete date in the layout of the language, and leaves a partial one as it is', () => {
    const englishMask = createDateInputMask('en-US')

    expect(englishMask.normalizeTypedDate('2026-11-02')).toBe('11/02/2026')
    expect(englishMask.normalizeTypedDate('11/2/2026')).toBe('11/02/2026')
    expect(englishMask.normalizeTypedDate('11/02/')).toBe('11/02/')
  })

  it('reads typed, pasted and ISO dates, and refuses impossible ones', () => {
    const englishMask = createDateInputMask('en-US')

    expect(englishMask.parseTypedDate('11/02/2026')).toBe('2026-11-02')
    expect(englishMask.parseTypedDate('11/2/2026')).toBe('2026-11-02')
    expect(englishMask.parseTypedDate('2026-11-02')).toBe('2026-11-02')
    expect(englishMask.parseTypedDate('11022026')).toBe('2026-11-02')
    expect(englishMask.parseTypedDate('02/30/2026')).toBeUndefined()
    expect(englishMask.parseTypedDate('11/02/26')).toBeUndefined()
    expect(englishMask.parseTypedDate('11/02/')).toBeUndefined()
    expect(createDateInputMask('fr-FR').parseTypedDate('02/11/2026')).toBe('2026-11-02')
  })

  it('builds the range pattern with its dash, and reads each end once its digits are typed', () => {
    const englishMask = createDateInputMask('en-US')

    expect(englishMask.rangePattern).toBe('##/##/#### – ##/##/####')
    expect(englishMask.rangeFormatHint).toBe('MM/DD/YYYY – MM/DD/YYYY')
    expect(englishMask.formatIsoRange(['2026-11-03', '2026-11-16'])).toBe('11/03/2026 – 11/16/2026')
    expect(englishMask.parseTypedRange('11/03/2026 – 11/1')).toEqual({
      hasCompleteStart: true,
      hasCompleteEnd: false,
      rangeStart: '2026-11-03',
      rangeEnd: undefined,
    })
    expect(englishMask.parseTypedRange('11/03/2026 – 11/16/2026').rangeEnd).toBe('2026-11-16')
  })

  it('rewrites a pasted range in the layout of the language', () => {
    const englishMask = createDateInputMask('en-US')

    expect(englishMask.normalizeTypedRange('2026-11-03 – 2026-11-16')).toBe('11/03/2026 – 11/16/2026')
    expect(englishMask.normalizeTypedRange('11/3/2026 - 11/16/2026')).toBe('11/03/2026 – 11/16/2026')
    expect(englishMask.normalizeTypedRange('11/03/2026 – 11/1')).toBe('11/03/2026 – 11/1')
  })
})

