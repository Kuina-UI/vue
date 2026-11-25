import type { ShortcutGuard } from '../types/shortcut'

const editableTagNames: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditableElement(eventTarget: EventTarget | null) {
  return eventTarget instanceof HTMLElement && (eventTarget.isContentEditable || editableTagNames.has(eventTarget.tagName))
}

/** Keep shortcuts from firing while the user types in a field, unless the shortcut allows it. */
export const editableFieldGuard: ShortcutGuard = (keyboardEvent, shortcutBinding) =>
  shortcutBinding.allowInEditable || !isEditableElement(keyboardEvent.target)
