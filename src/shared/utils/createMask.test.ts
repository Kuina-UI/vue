import { describe, expect, it } from 'vitest'
import { createMask } from './createMask'

describe('createMask', () => {
  it('fills the tokens and writes the other characters as they are', () => {
    expect(createMask('#### #### #### ####').apply('4970123412341234')).toEqual({
      masked: '4970 1234 1234 1234',
      unmasked: '4970123412341234',
      completed: true,
    })
    expect(createMask('+261 ## ## ### ##').apply('341234567').masked).toBe('+261 34 12 345 67')
  })

  it('skips the characters no token accepts', () => {
    expect(createMask('##:##').apply('9h3o').masked).toBe('93:')
    expect(createMask('@@-###').apply('ab12c3').masked).toBe('ab-123')
  })

  it('adds the separator after a completed group, unless eager is false', () => {
    expect(createMask('##/##/####').apply('11').masked).toBe('11/')
    expect(createMask('##/##/####').apply('11', { eager: false }).masked).toBe('11')
    expect(createMask({ pattern: '##/##/####', eager: false }).apply('1102').masked).toBe('11/02')
  })

  it('reads a text that already contains the separators', () => {
    expect(createMask('##/##/####').apply('11/02/2026')).toEqual({
      masked: '11/02/2026',
      unmasked: '11022026',
      completed: true,
    })
  })

  it('reports whether every token is filled', () => {
    expect(createMask('##:##').apply('93').completed).toBe(false)
    expect(createMask('##:##').apply('0930').completed).toBe(true)
  })

  it('takes custom tokens with a transform, and escaped token characters', () => {
    const hexColorMask = createMask({
      pattern: '!#HHHHHH',
      tokens: { H: { pattern: /[0-9a-f]/i, transform: (character) => character.toUpperCase() } },
    })

    expect(hexColorMask.apply('1f2a3b').masked).toBe('#1F2A3B')
  })

  it('picks the shortest pattern that fits the typed characters', () => {
    const phoneMask = createMask(['## ## ## ##', '### ### ####'])

    expect(phoneMask.apply('12345678').masked).toBe('12 34 56 78')
    expect(phoneMask.apply('1234567890').masked).toBe('123 456 7890')
  })

  it('runs preprocess before masking', () => {
    const dateMask = createMask({ pattern: '##/##/####', preprocess: (text) => text.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2$3$1') })

    expect(dateMask.apply('2026-11-02').masked).toBe('11/02/2026')
  })

  it('finds the caret position after a number of accepted characters', () => {
    const dateMask = createMask('##/##/####')

    expect(dateMask.findCaretPosition('11/02/2026', 0)).toBe(0)
    expect(dateMask.findCaretPosition('11/02/2026', 2)).toBe(2)
    expect(dateMask.findCaretPosition('11/02/2026', 3)).toBe(4)
    expect(dateMask.findCaretPosition('11/02/2026', 8)).toBe(10)
  })
})
