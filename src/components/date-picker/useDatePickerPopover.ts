import type { Ref } from 'vue'
import { useDismissOnOutsidePointerDown } from '../../shared/composables/useDismissOnOutsidePointerDown'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'

interface DatePickerPopoverOptions {
  isOpen: Ref<boolean>
  isOpenable: () => boolean
  rootElement: Readonly<Ref<HTMLElement | null>>
  triggerElement: Readonly<Ref<HTMLElement | null>>
  panelElement: Readonly<Ref<HTMLElement | null>>
  onClose?: () => void
}

/** Open and close the calendar of a date picker from its trigger, the keyboard, focus and outside clicks. */
export function useDatePickerPopover(popoverOptions: DatePickerPopoverOptions) {
  const { isOpen, rootElement, triggerElement, panelElement } = popoverOptions

  function openCalendar() {
    if (popoverOptions.isOpenable()) isOpen.value = true
  }

  function closeCalendar({ restoreFocus }: { restoreFocus: boolean }) {
    if (!isOpen.value) return

    isOpen.value = false
    popoverOptions.onClose?.()

    if (restoreFocus) triggerElement.value?.focus()
  }

  function toggleCalendar() {
    if (isOpen.value) closeCalendar({ restoreFocus: false })
    else openCalendar()
  }

  const openCalendarFromTriggerKeys = createShortcutHandler({
    enter: openCalendar,
    space: openCalendar,
    arrowdown: openCalendar,
    arrowup: openCalendar,
  })

  const closeCalendarOnEscape = createShortcutHandler({
    escape: (keyboardEvent) => {
      keyboardEvent.stopPropagation()
      closeCalendar({ restoreFocus: true })
    },
  })

  function closeCalendarWhenFocusLeaves(focusEvent: FocusEvent) {
    const nextFocusedElement = focusEvent.relatedTarget

    if (!(nextFocusedElement instanceof Node)) return

    const staysInside = [rootElement.value, panelElement.value].some((insideElement) =>
      insideElement?.contains(nextFocusedElement),
    )

    if (!staysInside) closeCalendar({ restoreFocus: false })
  }

  useDismissOnOutsidePointerDown([rootElement, panelElement], {
    active: isOpen,
    onDismiss: () => closeCalendar({ restoreFocus: false }),
  })

  return {
    openCalendar,
    closeCalendar,
    toggleCalendar,
    openCalendarFromTriggerKeys,
    closeCalendarOnEscape,
    closeCalendarWhenFocusLeaves,
  }
}
