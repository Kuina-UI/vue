import { computed, type Ref, ref, watch } from 'vue'
import { useMask } from '../../shared/composables/useMask'
import { createDateInputMask } from '../../shared/utils/createDateInputMask'

interface TypedDateInputOptions {
  selectedDate: Ref<string | undefined>
  locale: () => string
  isDateUnavailable: (isoDate: string) => boolean
  onDateTyped: (isoDate: string) => void
}

/** Let people type a date through the mask of its language, keep it in sync with the selected date, and refuse dates that cannot be picked. */
export function useTypedDateInput(typedDateOptions: TypedDateInputOptions) {
  const { selectedDate } = typedDateOptions

  const dateInputMask = computed(() => createDateInputMask(typedDateOptions.locale()))

  function formatSelectedDate() {
    return selectedDate.value ? dateInputMask.value.formatIsoDate(selectedDate.value) : ''
  }

  const {
    maskedValue: typedText,
    isComplete,
    setMaskedValue,
    applyMaskOnInput,
  } = useMask(
    () => ({ pattern: dateInputMask.value.pattern, preprocess: dateInputMask.value.normalizeTypedDate }),
    formatSelectedDate(),
  )

  const isTypedDateRejected = ref(false)

  watch([selectedDate, dateInputMask], () => {
    if (dateInputMask.value.parseTypedDate(typedText.value) === selectedDate.value) return

    setMaskedValue(formatSelectedDate())
    isTypedDateRejected.value = false
  })

  function commitTypedText() {
    if (!typedText.value) {
      isTypedDateRejected.value = false
      selectedDate.value = undefined
      return
    }

    const typedIsoDate = dateInputMask.value.parseTypedDate(typedText.value)

    if (!typedIsoDate || typedDateOptions.isDateUnavailable(typedIsoDate)) {
      isTypedDateRejected.value = isComplete.value
      return
    }

    isTypedDateRejected.value = false
    selectedDate.value = typedIsoDate
    typedDateOptions.onDateTyped(typedIsoDate)
  }

  function updateTypedText(inputEvent: Event) {
    applyMaskOnInput(inputEvent)
    commitTypedText()
  }

  function restoreTypedText() {
    setMaskedValue(formatSelectedDate())
    isTypedDateRejected.value = false
  }

  return { dateInputMask, typedText, isTypedDateRejected, updateTypedText, restoreTypedText }
}
