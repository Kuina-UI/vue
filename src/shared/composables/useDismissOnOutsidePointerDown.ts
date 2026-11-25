import { type MaybeRefOrGetter, onMounted, toValue, watch } from 'vue'

type MaybeElement = HTMLElement | null | undefined

interface OutsidePointerDownOptions {
  active: MaybeRefOrGetter<boolean>
  onDismiss: () => void
}

/** Call onDismiss when a pointer goes down outside the given elements, while active. */
export function useDismissOnOutsidePointerDown(
  insideElements: MaybeRefOrGetter<MaybeElement>[],
  options: OutsidePointerDownOptions,
) {
  function dismissOnOutsidePointerDown(pointerEvent: PointerEvent) {
    const pointerTarget = pointerEvent.target

    if (!(pointerTarget instanceof Node)) return

    const isInsidePointerDown = insideElements.some((insideElement) => toValue(insideElement)?.contains(pointerTarget))

    if (!isInsidePointerDown) options.onDismiss()
  }

  onMounted(() => {
    watch(
      () => toValue(options.active),
      (isActive, _previousState, onCleanup) => {
        if (!isActive) return

        document.addEventListener('pointerdown', dismissOnOutsidePointerDown, { capture: true })

        onCleanup(() => document.removeEventListener('pointerdown', dismissOnOutsidePointerDown, { capture: true }))
      },
      { immediate: true },
    )
  })
}
