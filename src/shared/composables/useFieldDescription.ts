import { computed, useId } from 'vue'

interface FieldDescriptionProps {
  id?: string
  hint?: string
  errorMessage?: string
  invalid?: boolean
}

/** Give a form field its ID, link it to its hint or error message, and tell whether it is invalid. */
export function useFieldDescription(fieldProps: FieldDescriptionProps) {
  const generatedFieldId = useId()

  const fieldId = computed(() => fieldProps.id ?? generatedFieldId)
  const hintId = computed(() => `${fieldId.value}-hint`)
  const errorMessageId = computed(() => `${fieldId.value}-error`)

  const isInvalid = computed(() => Boolean(fieldProps.invalid || fieldProps.errorMessage))

  const describingElementId = computed(() => {
    if (fieldProps.errorMessage) return errorMessageId.value
    if (fieldProps.hint) return hintId.value
    return undefined
  })

  return { fieldId, hintId, errorMessageId, isInvalid, describingElementId }
}
