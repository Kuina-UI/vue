import { computed, type Ref, ref, watch } from 'vue'
import { useMask } from '../../shared/composables/useMask'
import type { DateRange } from '../../shared/types/calendar'
import { createDateInputMask } from '../../shared/utils/createDateInputMask'
import { addDaysToIsoDate, type IsoDateLimits, isIsoDateUnavailable } from '../../shared/utils/isoDate'
import { type DateTypingCalendarControls, useDateTypingFocus } from './useDateTypingFocus'

interface DateRangeTypingOptions {
  selectedRange: Ref<DateRange | undefined>
  typingProps: IsoDateLimits & { locale: string; maxRangeDays?: number }
  calendar: DateTypingCalendarControls
  containerElement: Readonly<Ref<HTMLElement | null>>
  rangeInput: Readonly<Ref<HTMLInputElement | null>>
}

/** Let people type a range in one field, the dash coming by itself after the start, and update the range once both ends fit together. */
export function useDateRangeTyping(typingOptions: DateRangeTypingOptions) {
  const { selectedRange, typingProps, calendar } = typingOptions

  const dateInputMask = computed(() => createDateInputMask(typingProps.locale))

  function formatSelectedRange() {
    return selectedRange.value ? dateInputMask.value.formatIsoRange(selectedRange.value) : ''
  }

  const {
    maskedValue: typedText,
    setMaskedValue,
    applyMaskOnInput,
  } = useMask(
    () => ({ pattern: dateInputMask.value.rangePattern, preprocess: dateInputMask.value.normalizeTypedRange }),
    formatSelectedRange(),
  )

  const isTypedRangeRejected = ref(false)

  watch([selectedRange, dateInputMask], () => {
    const { rangeStart, rangeEnd } = dateInputMask.value.parseTypedRange(typedText.value)

    if (rangeStart === selectedRange.value?.[0] && rangeEnd === selectedRange.value?.[1]) return

    setMaskedValue(formatSelectedRange())
    isTypedRangeRejected.value = false
  })

  function isDateUnavailable(isoDate: string) {
    return isIsoDateUnavailable(isoDate, typingProps)
  }

  function exceedsMaxRangeDays(rangeStart: string, rangeEnd: string) {
    return typingProps.maxRangeDays !== undefined && rangeEnd > addDaysToIsoDate(rangeStart, typingProps.maxRangeDays - 1)
  }

  function commitTypedRange() {
    if (!typedText.value) {
      isTypedRangeRejected.value = false
      selectedRange.value = undefined
      return
    }

    const { hasCompleteStart, hasCompleteEnd, rangeStart, rangeEnd } = dateInputMask.value.parseTypedRange(typedText.value)
    const isStartRejected = hasCompleteStart && (!rangeStart || isDateUnavailable(rangeStart))

    if (rangeStart && !isStartRejected) calendar.showDate(rangeStart)

    if (!hasCompleteEnd || !rangeStart || isStartRejected) {
      isTypedRangeRejected.value = isStartRejected
      return
    }

    isTypedRangeRejected.value =
      !rangeEnd || isDateUnavailable(rangeEnd) || rangeEnd < rangeStart || exceedsMaxRangeDays(rangeStart, rangeEnd)

    if (isTypedRangeRejected.value || !rangeEnd) return

    calendar.showDate(rangeEnd)
    selectedRange.value = [rangeStart, rangeEnd]
  }

  function restoreTypedRange() {
    setMaskedValue(formatSelectedRange())
    isTypedRangeRejected.value = false
  }

  const typingFocus = useDateTypingFocus({
    calendar,
    typedInputs: () => [typingOptions.rangeInput.value],
    containerElement: typingOptions.containerElement,
    onFocusLeave: restoreTypedRange,
  })

  const typedInputListeners = {
    onInput: (inputEvent: Event) => {
      applyMaskOnInput(inputEvent)
      commitTypedRange()
    },
    onKeydown: typingFocus.handleTypingKeys,
    onFocusout: typingFocus.handleTypingFocusout,
  }

  return {
    dateInputMask,
    typedText,
    isTypedDateRejected: isTypedRangeRejected,
    movesFocusIntoCalendar: typingFocus.movesFocusIntoCalendar,
    openCalendarFromControlClick: typingFocus.openCalendarFromControlClick,
    resetCalendarFocusMode: typingFocus.resetCalendarFocusMode,
    typedInputListeners,
  }
}
