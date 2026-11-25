export type ShortcutModifierName = 'ctrl' | 'meta' | 'alt' | 'shift' | 'mod'

export interface KeyCombination {
  key: string
  modifiers: ReadonlySet<ShortcutModifierName>
}

export interface ShortcutContext {
  shortcut: string
}

export type ShortcutHandler = (keyboardEvent: KeyboardEvent, shortcutContext: ShortcutContext) => void

export interface ShortcutOptions {
  handler: ShortcutHandler
  preventDefault?: boolean
  allowInEditable?: boolean
}

export type ShortcutDefinition = ShortcutHandler | ShortcutOptions

export type ShortcutDefinitions = Record<string, ShortcutDefinition>

export interface ShortcutBinding {
  shortcut: string
  keySequence: KeyCombination[]
  handler: ShortcutHandler
  preventDefault: boolean
  allowInEditable: boolean
}

export type ShortcutGuard = (keyboardEvent: KeyboardEvent, shortcutBinding: ShortcutBinding) => boolean

export interface ShortcutHandlerOptions {
  guards?: ShortcutGuard[]
  sequenceTimeout?: number
}
