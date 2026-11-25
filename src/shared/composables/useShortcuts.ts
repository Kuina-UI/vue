import { type MaybeRefOrGetter, onMounted, toValue, watch } from 'vue'
import type { ShortcutDefinitions, ShortcutGuard } from '../types/shortcut'
import { createShortcutHandler } from '../utils/createShortcutHandler'
import { editableFieldGuard } from '../utils/editableFieldGuard'

export interface ShortcutListenerOptions {
  target?: MaybeRefOrGetter<EventTarget | null | undefined>
  enabled?: MaybeRefOrGetter<boolean>
  guards?: ShortcutGuard[]
}

/** Listen for keyboard shortcuts on the document, or on a target, while the component is mounted. */
export function useShortcuts(
  shortcutDefinitions: MaybeRefOrGetter<ShortcutDefinitions>,
  listenerOptions: ShortcutListenerOptions = {},
) {
  function resolveListenedTarget() {
    return listenerOptions.target === undefined ? document : toValue(listenerOptions.target)
  }

  onMounted(() => {
    watch(
      () =>
        [toValue(shortcutDefinitions), resolveListenedTarget(), toValue(listenerOptions.enabled) ?? true] as const,
      ([currentDefinitions, listenedTarget, isEnabled], _previousState, onCleanup) => {
        if (!isEnabled || !listenedTarget) return

        const handleShortcutKeydown = createShortcutHandler(currentDefinitions, {
          guards: [editableFieldGuard, ...(listenerOptions.guards ?? [])],
        })

        listenedTarget.addEventListener('keydown', handleShortcutKeydown)

        onCleanup(() => listenedTarget.removeEventListener('keydown', handleShortcutKeydown))
      },
      { immediate: true },
    )
  })
}
