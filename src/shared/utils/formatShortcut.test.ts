import { describe, expect, it } from 'vitest'
import { formatShortcut } from './formatShortcut'

describe('formatShortcut', () => {
  it.each([
    ['mod+e', '⌘E', 'Ctrl+E'],
    ['mod+shift+p', '⇧⌘P', 'Ctrl+Shift+P'],
    ['ctrl+alt+delete', '⌃⌥⌦', 'Ctrl+Alt+Delete'],
    ['meta+k', '⌘K', 'Win+K'],
    ['mod+backspace', '⌘⌫', 'Ctrl+Backspace'],
    ['shift+enter', '⇧↩', 'Shift+Enter'],
    ['escape', 'Esc', 'Esc'],
    ['arrowdown', '↓', '↓'],
    ['space', 'Space', 'Space'],
    ['?', '?', '?'],
    ['f2', 'F2', 'F2'],
    ['g d', 'G D', 'G D'],
  ])('writes %s as %s on Apple platforms and %s elsewhere', (shortcut, appleLabel, otherLabel) => {
    expect(formatShortcut(shortcut, true)).toBe(appleLabel)
    expect(formatShortcut(shortcut, false)).toBe(otherLabel)
  })

  it('rejects a shortcut it cannot read, like the handler does', () => {
    expect(() => formatShortcut('⌘E', true)).toThrow(/^Unknown key/)
  })
})
