import type {
  KeyCombination,
  ShortcutBinding,
  ShortcutDefinition,
  ShortcutDefinitions,
  ShortcutHandlerOptions,
} from '../types/shortcut'
import { isApplePlatform } from './isApplePlatform'
import { parseShortcut } from './parseShortcut'

const defaultSequenceTimeout = 1000

const modifierOnlyKeys: ReadonlySet<string> = new Set(['shift', 'control', 'alt', 'meta', 'altgraph', 'capslock', 'fn'])

const physicalCharacterPattern = /^(?:Key|Digit)(.)$/

function isCaselessCharacter(key: string) {
  return [...key].length === 1 && key.toLowerCase() === key.toUpperCase()
}

/** Compare the typed character first, so every keyboard layout works, then the physical key when Alt changed the character. */
function matchesPressedKey(keyboardEvent: KeyboardEvent, expectedKey: string) {
  if (keyboardEvent.key.toLowerCase() === expectedKey) return true

  const physicalCharacter = physicalCharacterPattern.exec(keyboardEvent.code)?.[1]?.toLowerCase()

  return keyboardEvent.altKey && physicalCharacter === expectedKey
}

/** Require the exact modifiers, except Shift and AltGr when they only serve to type a symbol. */
function matchesModifiers(keyboardEvent: KeyboardEvent, keyCombination: KeyCombination) {
  const { modifiers } = keyCombination
  const usesAppleModifier = isApplePlatform()
  const typesSymbol = isCaselessCharacter(keyCombination.key)
  const typesWithAltGraph = typesSymbol && keyboardEvent.getModifierState('AltGraph')

  const expectsCtrl = modifiers.has('ctrl') || (modifiers.has('mod') && !usesAppleModifier)
  const expectsMeta = modifiers.has('meta') || (modifiers.has('mod') && usesAppleModifier)

  return (
    keyboardEvent.metaKey === expectsMeta &&
    (typesWithAltGraph || keyboardEvent.ctrlKey === expectsCtrl) &&
    (typesWithAltGraph || keyboardEvent.altKey === modifiers.has('alt')) &&
    (typesSymbol || keyboardEvent.shiftKey === modifiers.has('shift'))
  )
}

function matchesKeyCombination(keyboardEvent: KeyboardEvent, keyCombination: KeyCombination | undefined) {
  if (!keyCombination) return false

  return matchesPressedKey(keyboardEvent, keyCombination.key) && matchesModifiers(keyboardEvent, keyCombination)
}

function createShortcutBinding(shortcut: string, shortcutDefinition: ShortcutDefinition): ShortcutBinding {
  const shortcutOptions = typeof shortcutDefinition === 'function' ? { handler: shortcutDefinition } : shortcutDefinition

  return {
    shortcut,
    keySequence: parseShortcut(shortcut),
    handler: shortcutOptions.handler,
    preventDefault: shortcutOptions.preventDefault ?? true,
    allowInEditable: shortcutOptions.allowInEditable ?? false,
  }
}

/** Build a keydown listener that runs the handler of each shortcut pressed, including sequences like "g d". */
export function createShortcutHandler(
  shortcutDefinitions: ShortcutDefinitions,
  handlerOptions: ShortcutHandlerOptions = {},
) {
  const shortcutBindings = Object.entries(shortcutDefinitions).map(([shortcut, shortcutDefinition]) =>
    createShortcutBinding(shortcut, shortcutDefinition),
  )
  const shortcutGuards = handlerOptions.guards ?? []
  const sequenceTimeout = handlerOptions.sequenceTimeout ?? defaultSequenceTimeout
  const matchedStepCounts = new Map<ShortcutBinding, number>()
  let sequenceResetTimer: ReturnType<typeof setTimeout> | undefined

  function countMatchedSteps(keyboardEvent: KeyboardEvent, shortcutBinding: ShortcutBinding) {
    const previousStepCount = matchedStepCounts.get(shortcutBinding) ?? 0

    if (matchesKeyCombination(keyboardEvent, shortcutBinding.keySequence[previousStepCount])) {
      return previousStepCount + 1
    }

    return matchesKeyCombination(keyboardEvent, shortcutBinding.keySequence[0]) ? 1 : 0
  }

  function runShortcut(keyboardEvent: KeyboardEvent, shortcutBinding: ShortcutBinding) {
    if (shortcutBinding.preventDefault) keyboardEvent.preventDefault()

    shortcutBinding.handler(keyboardEvent, { shortcut: shortcutBinding.shortcut })
  }

  function restartSequenceTimer() {
    clearTimeout(sequenceResetTimer)

    if (matchedStepCounts.size > 0) {
      sequenceResetTimer = setTimeout(() => matchedStepCounts.clear(), sequenceTimeout)
    }
  }

  return function handleShortcutKeydown(keydownEvent: Event) {
    if (!(keydownEvent instanceof KeyboardEvent) || keydownEvent.isComposing) return
    if (modifierOnlyKeys.has(keydownEvent.key.toLowerCase())) return

    for (const shortcutBinding of shortcutBindings) {
      const isAllowed = shortcutGuards.every((allowsShortcut) => allowsShortcut(keydownEvent, shortcutBinding))
      const matchedStepCount = isAllowed ? countMatchedSteps(keydownEvent, shortcutBinding) : 0

      if (matchedStepCount === shortcutBinding.keySequence.length) {
        matchedStepCounts.delete(shortcutBinding)
        runShortcut(keydownEvent, shortcutBinding)
      } else if (matchedStepCount > 0) {
        matchedStepCounts.set(shortcutBinding, matchedStepCount)
      } else {
        matchedStepCounts.delete(shortcutBinding)
      }
    }

    restartSequenceTimer()
  }
}
