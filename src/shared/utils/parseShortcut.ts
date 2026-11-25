import type { KeyCombination, ShortcutModifierName } from '../types/shortcut'

const shortcutModifierNames: ReadonlySet<string> = new Set<ShortcutModifierName>(['ctrl', 'meta', 'alt', 'shift', 'mod'])

const shortcutKeyAliases: Readonly<Record<string, string>> = {
  space: ' ',
  plus: '+',
}

const namedShortcutKeys: ReadonlySet<string> = new Set([
  'escape',
  'enter',
  'tab',
  'backspace',
  'delete',
  'insert',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'pageup',
  'pagedown',
])

const functionKeyPattern = /^f([1-9]|1\d|2[0-4])$/

function isShortcutModifierName(modifierName: string): modifierName is ShortcutModifierName {
  return shortcutModifierNames.has(modifierName)
}

function isSupportedShortcutKey(key: string) {
  return [...key].length === 1 || namedShortcutKeys.has(key) || functionKeyPattern.test(key)
}

function parseKeyCombination(combinationText: string, shortcut: string): KeyCombination {
  const combinationParts = combinationText.toLowerCase().split('+')
  const keyName = combinationParts.pop() ?? ''
  const key = shortcutKeyAliases[keyName] ?? keyName

  if (!isSupportedShortcutKey(key)) throw new Error(`Unknown key "${keyName}" in shortcut "${shortcut}".`)

  const modifiers = combinationParts.map((modifierName) => {
    if (!isShortcutModifierName(modifierName)) {
      throw new Error(`Unknown modifier "${modifierName}" in shortcut "${shortcut}".`)
    }
    return modifierName
  })

  return { key, modifiers: new Set(modifiers) }
}

/** Turn a shortcut like "mod+k" or "g d" into the key combinations to press in order. */
export function parseShortcut(shortcut: string): KeyCombination[] {
  return shortcut
    .trim()
    .split(/\s+/)
    .map((combinationText) => parseKeyCombination(combinationText, shortcut))
}
