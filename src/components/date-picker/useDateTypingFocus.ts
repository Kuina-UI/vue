import { type Ref, ref } from 'vue'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'

type MaybeElement = Element | null | undefined

export interface DateTypingCalendarControls {
  isOpen: Ref<boolean>
  openCalendar: () => void
  closeCalendar: (closeOptions: { restoreFocus: boolean }) => void
  closeCalendarWhenFocusLeaves: (focusEvent: FocusEvent) => void
  showDate: (isoDate: string) => void
  focusCalendar: () => void
  panelElement: () => MaybeElement
}

interface DateTypingFocusOptions {
  calendar: DateTypingCalendarControls
  typedInputs: () => (HTMLInputElement | null)[]
  containerElement: Readonly<Ref<HTMLElement | null>>
  onFocusLeave: () => void
}

/** Open the calendar from a typed date field without leaving it, move into the calendar on demand, and notice when the focus leaves. */
export function useDateTypingFocus(typingFocusOptions: DateTypingFocusOptions) {
  const { calendar } = typingFocusOptions

  const movesFocusIntoCalendar = ref(true)

  function openCalendarFromControlClick(clickEvent: MouseEvent) {
    const typedInputs = typingFocusOptions.typedInputs()
    const clickedTypedInput = typedInputs.find((typedInput) => typedInput && typedInput === clickEvent.target)

    if (calendar.isOpen.value && !clickedTypedInput) {
      calendar.closeCalendar({ restoreFocus: true })
      return
    }

    const typedInputToFocus = clickedTypedInput ?? typedInputs[0]

    movesFocusIntoCalendar.value = false
    typedInputToFocus?.focus()
    calendar.openCalendar()
  }

  function moveFocusIntoCalendar() {
    movesFocusIntoCalendar.value = true

    if (calendar.isOpen.value) calendar.focusCalendar()
    else calendar.openCalendar()
  }

  const handleTypingKeys = createShortcutHandler({
    arrowdown: moveFocusIntoCalendar,
    escape: () => calendar.closeCalendar({ restoreFocus: false }),
  })

  function handleTypingFocusout(focusEvent: FocusEvent) {
    const nextFocusedElement = focusEvent.relatedTarget
    const staysInside =
      nextFocusedElement instanceof Node &&
      [typingFocusOptions.containerElement.value, calendar.panelElement()].some((insideElement) =>
        insideElement?.contains(nextFocusedElement),
      )

    if (staysInside) return

    typingFocusOptions.onFocusLeave()
    calendar.closeCalendarWhenFocusLeaves(focusEvent)
  }

  function resetCalendarFocusMode() {
    movesFocusIntoCalendar.value = true
  }

  return { movesFocusIntoCalendar, openCalendarFromControlClick, handleTypingKeys, handleTypingFocusout, resetCalendarFocusMode }
}
