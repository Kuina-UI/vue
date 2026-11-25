import type { KeyCombination, ShortcutModifierName } from '../types/shortcut'
import { parseShortcut } from './parseShortcut'

type DisplayedModifierName = Exclude<ShortcutModifierName, 'mod'>

interface ShortcutKeyLabel {
  apple: string
  other: string
}

const appleModifierSymbols: ReadonlyArray<[DisplayedModifierName, string]> = [
  ['ctrl', '⌃'],
  ['alt', '⌥'],
  ['shift', '⇧'],
  ['meta', '⌘'],
]

const otherModifierLabels: ReadonlyArray<[DisplayedModifierName, string]> = [
  ['ctrl', 'Ctrl'],
  ['alt', 'Alt'],
  ['shift', 'Shift'],
  ['meta', 'Win'],
]

const shortcutKeyLabels: Readonly<Record<string, ShortcutKeyLabel>> = {
  ' ': { apple: 'Space', other: 'Space' },
  'escape': { apple: 'Esc', other: 'Esc' },
  'enter': { apple: '↩', other: 'Enter' },
  'tab': { apple: '⇥', other: 'Tab' },
  'backspace': { apple: '⌫', other: 'Backspace' },
  'delete': { apple: '⌦', other: 'Delete' },
  'insert': { apple: 'Insert', other: 'Insert' },
  'arrowup': { apple: '↑', other: '↑' },
  'arrowdown': { apple: '↓', other: '↓' },
  'arrowleft': { apple: '←', other: '←' },
  'arrowright': { apple: '→', other: '→' },
  'home': { apple: 'Home', other: 'Home' },
  'end': { apple: 'End', other: 'End' },
  'pageup': { apple: 'Page Up', other: 'Page Up' },
  'pagedown': { apple: 'Page Down', other: 'Page Down' },
}

function formatShortcutKey(key: string, usesAppleModifiers: boolean) {
  const shortcutKeyLabel = shortcutKeyLabels[key]

  if (shortcutKeyLabel) return usesAppleModifiers ? shortcutKeyLabel.apple : shortcutKeyLabel.other

  return key.toUpperCase()
}

function formatKeyCombination(keyCombination: KeyCombination, usesAppleModifiers: boolean) {
  const pressedModifiers = new Set(
    [...keyCombination.modifiers].map((modifierName) => {
      if (modifierName !== 'mod') return modifierName
      return usesAppleModifiers ? 'meta' : 'ctrl'
    }),
  )
  const keyLabel = formatShortcutKey(keyCombination.key, usesAppleModifiers)

  if (usesAppleModifiers) {
    const modifierSymbols = appleModifierSymbols.filter(([modifierName]) => pressedModifiers.has(modifierName))
    return modifierSymbols.map(([, modifierSymbol]) => modifierSymbol).join('') + keyLabel
  }

  const modifierLabels = otherModifierLabels.filter(([modifierName]) => pressedModifiers.has(modifierName))
  return [...modifierLabels.map(([, modifierLabel]) => modifierLabel), keyLabel].join('+')
}

/** Write a shortcut the way the user sees it on their keyboard, like ⇧⌘P on a Mac and Ctrl+Shift+P elsewhere. */
export function formatShortcut(shortcut: string, usesAppleModifiers: boolean) {
  return parseShortcut(shortcut)
    .map((keyCombination) => formatKeyCombination(keyCombination, usesAppleModifiers))
    .join(' ')
}
