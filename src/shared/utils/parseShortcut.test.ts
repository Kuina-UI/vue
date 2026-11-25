import { describe, expect, it } from 'vitest'
import { parseShortcut } from './parseShortcut'

describe('parseShortcut', () => {
  it('parses a single key without modifiers', () => {
    expect(parseShortcut('escape')).toEqual([{ key: 'escape', modifiers: new Set() }])
  })

  it('parses modifiers and ignores letter case', () => {
    expect(parseShortcut('Mod+Shift+K')).toEqual([{ key: 'k', modifiers: new Set(['mod', 'shift']) }])
  })

  it('parses a sequence of key combinations separated by spaces', () => {
    expect(parseShortcut('  g   d ')).toEqual([
      { key: 'g', modifiers: new Set() },
      { key: 'd', modifiers: new Set() },
    ])
  })

  it('turns the space and plus aliases into their characters', () => {
    expect(parseShortcut('shift+space')).toEqual([{ key: ' ', modifiers: new Set(['shift']) }])
    expect(parseShortcut('mod+plus')).toEqual([{ key: '+', modifiers: new Set(['mod']) }])
  })

  it.each(['?', '/', 'arrowdown', 'pagedown', 'f1', 'f12', 'f24', 'é'])('accepts the key %s', (shortcut) => {
    expect(() => parseShortcut(shortcut)).not.toThrow()
  })

  it('rejects an unknown modifier', () => {
    expect(() => parseShortcut('ctlr+k')).toThrow('Unknown modifier "ctlr" in shortcut "ctlr+k".')
  })

  it.each(['arrowdwn', 'f25', 'mod+', ''])('rejects the unknown or missing key in "%s"', (shortcut) => {
    expect(() => parseShortcut(shortcut)).toThrow(/^Unknown key/)
  })
})
