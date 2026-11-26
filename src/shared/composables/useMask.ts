import { computed, type MaybeRefOrGetter, readonly, ref, toValue } from 'vue'
import type { MaskOptions } from '../types/mask'
import { createMask } from '../utils/createMask'

function isTextInput(eventTarget: EventTarget | null): eventTarget is HTMLInputElement | HTMLTextAreaElement {
  return eventTarget instanceof HTMLInputElement || eventTarget instanceof HTMLTextAreaElement
}

/** Mask what is typed in an input: bind `maskedValue` as its value and `applyMaskOnInput` on its input event. */
export function useMask(maskOptions: MaybeRefOrGetter<MaskOptions>, initialText = '') {
  const mask = computed(() => createMask(toValue(maskOptions)))

  const maskedValue = ref(mask.value.apply(initialText, { eager: false }).masked)

  const maskResult = computed(() => mask.value.apply(maskedValue.value, { eager: false }))
  const unmaskedValue = computed(() => maskResult.value.unmasked)
  const isComplete = computed(() => maskResult.value.completed)

  function setMaskedValue(text: string) {
    maskedValue.value = mask.value.apply(text, { eager: false }).masked
  }

  function applyMaskOnInput(inputEvent: Event) {
    const maskedInput = inputEvent.target

    if (!isTextInput(maskedInput)) return
    if (inputEvent instanceof InputEvent && inputEvent.isComposing) return

    const inputType = inputEvent instanceof InputEvent ? inputEvent.inputType : ''
    const rawText = maskedInput.value
    const caretPosition = maskedInput.selectionStart ?? rawText.length
    const keepsCaretAtEnd = caretPosition >= rawText.length
    const previousMaskedValue = maskedValue.value

    let nextMaskResult = mask.value.apply(rawText, { eager: !inputType.startsWith('delete') })
    let acceptedCountBeforeCaret = [...mask.value.apply(rawText.slice(0, caretPosition), { eager: false }).unmasked].length

    const deletedOnlyASeparator = inputType === 'deleteContentBackward' && nextMaskResult.masked === previousMaskedValue

    if (deletedOnlyASeparator && acceptedCountBeforeCaret > 0) {
      const acceptedCharacters = [...nextMaskResult.unmasked]
      acceptedCharacters.splice(acceptedCountBeforeCaret - 1, 1)
      nextMaskResult = mask.value.apply(acceptedCharacters.join(''), { eager: false })
      acceptedCountBeforeCaret -= 1
    }

    maskedValue.value = nextMaskResult.masked
    maskedInput.value = nextMaskResult.masked

    const nextCaretPosition =
      keepsCaretAtEnd && !deletedOnlyASeparator
        ? nextMaskResult.masked.length
        : mask.value.findCaretPosition(nextMaskResult.masked, acceptedCountBeforeCaret)

    if (maskedInput.ownerDocument.activeElement === maskedInput) {
      maskedInput.setSelectionRange(nextCaretPosition, nextCaretPosition)
    }
  }

  return {
    maskedValue: readonly(maskedValue),
    unmaskedValue,
    isComplete,
    setMaskedValue,
    applyMaskOnInput,
  }
}
