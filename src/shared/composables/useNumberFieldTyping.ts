import { computed, type MaybeRefOrGetter, onBeforeUnmount, ref, type ShallowRef, toValue, watch, type WritableComputedRef } from 'vue'
import { createDebouncedCallback } from '../utils/createDebouncedCallback'
import { createShortcutHandler } from '../utils/createShortcutHandler'
import { clampToRange, countStepDecimals, roundToDecimals } from '../utils/steppedValue'

export interface NumberFieldTypingOptions {
  fieldValue: WritableComputedRef<number>
  lowestValue: MaybeRefOrGetter<number>
  highestValue: MaybeRefOrGetter<number>
  step: MaybeRefOrGetter<number>
  fieldElement: Readonly<ShallowRef<HTMLInputElement | null>>
  onFieldFocus?: (focusEvent: FocusEvent) => void
  onFieldBlur?: (blurEvent: FocusEvent) => void
}

const typedValueUpdateDelay = 250

/** Type a number in a text field: only numeric characters, applied 250ms after typing stops and settled on blur. */
export function useNumberFieldTyping({
  fieldValue,
  lowestValue,
  highestValue,
  step,
  fieldElement,
  onFieldFocus,
  onFieldBlur,
}: NumberFieldTypingOptions) {
  const valueDecimalCount = computed(() => countStepDecimals(toValue(step)))

  function formatFieldValue(displayedValue: number) {
    return displayedValue.toFixed(valueDecimalCount.value)
  }

  function keepInBounds(requestedValue: number) {
    return clampToRange(requestedValue, toValue(lowestValue), toValue(highestValue))
  }

  const valueText = ref(formatFieldValue(fieldValue.value))

  const debouncedTypedValueUpdate = createDebouncedCallback((typedValue: number) => {
    fieldValue.value = typedValue
  }, typedValueUpdateDelay)

  watch([fieldValue, valueDecimalCount], ([nextFieldValue]) => {
    if (fieldElement.value !== document.activeElement) valueText.value = formatFieldValue(nextFieldValue)
  })

  function keepNumericCharacters(typedText: string) {
    const nonNumericCharacters = toValue(lowestValue) < 0 ? /[^\d.-]/g : /[^\d.]/g

    return typedText.replace(nonNumericCharacters, '')
  }

  function updateValueFromTyping(inputEvent: Event) {
    const typingInput = inputEvent.target as HTMLInputElement
    const typedText = keepNumericCharacters(typingInput.value)
    const typedNumber = Number.parseFloat(typedText || '0')

    valueText.value = typedText

    if (typingInput.value !== typedText) typingInput.value = typedText

    if (Number.isNaN(typedNumber)) return

    const typedValue = keepInBounds(typedNumber)

    debouncedTypedValueUpdate.callAfterDelay(toValue(step) >= 1 ? Math.floor(typedValue) : typedValue)
  }

  function commitTypedValue(blurEvent: FocusEvent) {
    debouncedTypedValueUpdate.cancel()

    const typedNumber = Number.parseFloat(valueText.value) || 0
    const roundedValue =
      toValue(step) >= 1 ? Math.floor(typedNumber) : roundToDecimals(typedNumber, valueDecimalCount.value)
    const committedValue = keepInBounds(roundedValue)

    if (committedValue !== fieldValue.value) fieldValue.value = committedValue

    valueText.value = formatFieldValue(committedValue)
    onFieldBlur?.(blurEvent)
  }

  function selectValueText(focusEvent: FocusEvent) {
    fieldElement.value?.setSelectionRange(0, fieldElement.value.value.length)
    onFieldFocus?.(focusEvent)
  }

  function applyValueFromKey(requestedValue: number) {
    const nextFieldValue = keepInBounds(requestedValue)

    debouncedTypedValueUpdate.cancel()
    fieldValue.value = nextFieldValue
    valueText.value = formatFieldValue(nextFieldValue)
  }

  function addStepsToValue(stepCount: number) {
    applyValueFromKey(roundToDecimals(fieldValue.value + toValue(step) * stepCount, valueDecimalCount.value))
  }

  function blurField() {
    fieldElement.value?.blur()
  }

  const changeValueFromKeys = createShortcutHandler({
    'home': () => applyValueFromKey(toValue(lowestValue)),
    'end': () => applyValueFromKey(toValue(highestValue)),
    'arrowup': () => addStepsToValue(1),
    'shift+arrowup': () => addStepsToValue(10),
    'arrowdown': () => addStepsToValue(-1),
    'shift+arrowdown': () => addStepsToValue(-10),
    'enter': blurField,
    'escape': blurField,
  })

  onBeforeUnmount(debouncedTypedValueUpdate.cancel)

  const fieldListeners = {
    input: updateValueFromTyping,
    focus: selectValueText,
    blur: commitTypedValue,
    keydown: changeValueFromKeys,
    click: (clickEvent: MouseEvent) => clickEvent.stopPropagation(),
  }

  return { valueText, fieldListeners }
}
