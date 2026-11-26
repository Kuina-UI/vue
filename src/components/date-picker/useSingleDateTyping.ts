import type { Ref } from 'vue'
import { type IsoDateLimits, isIsoDateUnavailable } from '../../shared/utils/isoDate'
import { type DateTypingCalendarControls, useDateTypingFocus } from './useDateTypingFocus'
import { useTypedDateInput } from './useTypedDateInput'

interface SingleDateTypingOptions {
  selectedDate: Ref<string | undefined>
  typingProps: IsoDateLimits & { locale: string }
  calendar: DateTypingCalendarControls
  containerElement: Readonly<Ref<HTMLElement | null>>
  dateInput: Readonly<Ref<HTMLInputElement | null>>
}

/** Let people type the date of a date picker: masked input, calendar following the typed date, and the last valid date back when the focus leaves. */
export function useSingleDateTyping(typingOptions: SingleDateTypingOptions) {
  const { selectedDate, typingProps, calendar } = typingOptions

  const typedDateInput = useTypedDateInput({
    selectedDate,
    locale: () => typingProps.locale,
    isDateUnavailable: (isoDate) => isIsoDateUnavailable(isoDate, typingProps),
    onDateTyped: (isoDate) => calendar.showDate(isoDate),
  })

  const typingFocus = useDateTypingFocus({
    calendar,
    typedInputs: () => [typingOptions.dateInput.value],
    containerElement: typingOptions.containerElement,
    onFocusLeave: typedDateInput.restoreTypedText,
  })

  const typedInputListeners = {
    onInput: typedDateInput.updateTypedText,
    onKeydown: typingFocus.handleTypingKeys,
    onFocusout: typingFocus.handleTypingFocusout,
  }

  return {
    dateInputMask: typedDateInput.dateInputMask,
    typedText: typedDateInput.typedText,
    isTypedDateRejected: typedDateInput.isTypedDateRejected,
    movesFocusIntoCalendar: typingFocus.movesFocusIntoCalendar,
    openCalendarFromControlClick: typingFocus.openCalendarFromControlClick,
    resetCalendarFocusMode: typingFocus.resetCalendarFocusMode,
    typedInputListeners,
  }
}
