<script lang="ts">
import type { Component } from 'vue'
import type { MaskOptions } from '../../shared/types/mask'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TextFieldSlotName, TextFieldThemeVariants } from './text-field.theme'

export interface TextFieldProps {
  label: string
  id?: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
  placeholder?: string
  mask?: MaskOptions
  variant?: TextFieldThemeVariants['variant']
  size?: TextFieldThemeVariants['size']
  pill?: boolean
  floatLabel?: TextFieldThemeVariants['floatLabel']
  leadingIcon?: Component
  trailingIcon?: Component
  trailingIconLabel?: string
  trailingActionLabel?: string
  trailingActionHref?: string
  hint?: string
  errorMessage?: string
  invalid?: boolean
  disabled?: boolean
  ui?: Partial<Record<TextFieldSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { computed, watch } from 'vue'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import { useMask } from '../../shared/composables/useMask'
import { textFieldTheme } from './text-field.theme'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextFieldProps>(), {
  type: 'text',
  variant: 'outline',
  size: '4xl',
  pill: true,
  floatLabel: 'auto',
})

const emit = defineEmits<{
  trailingIconClick: [event: MouseEvent]
  trailingActionClick: [event: MouseEvent]
}>()

const fieldValue = defineModel<string>()
const unmaskedFieldValue = defineModel<string>('unmasked')

const { maskedValue, unmaskedValue, setMaskedValue, applyMaskOnInput } = useMask(
  () => props.mask ?? '',
  fieldValue.value ?? unmaskedFieldValue.value ?? '',
)

watch(fieldValue, (nextFieldValue) => {
  if (props.mask && nextFieldValue !== maskedValue.value) setMaskedValue(nextFieldValue ?? '')
})

watch(unmaskedFieldValue, (nextUnmaskedValue) => {
  if (props.mask && nextUnmaskedValue !== unmaskedValue.value) setMaskedValue(nextUnmaskedValue ?? '')
})

function updateMaskedFieldValue(inputEvent: Event) {
  applyMaskOnInput(inputEvent)
  fieldValue.value = maskedValue.value
  unmaskedFieldValue.value = unmaskedValue.value
}

const { fieldId, hintId, errorMessageId, isInvalid, describingElementId } = useFieldDescription(props)

const trailingContent = computed(() => {
  if (props.trailingActionLabel) return 'action'
  if (!props.trailingIcon) return 'none'
  return props.trailingIconLabel ? 'iconButton' : 'icon'
})

const textFieldSlots = computed(() =>
  textFieldTheme({
    variant: props.variant,
    size: props.size,
    pill: props.pill,
    floatLabel: props.floatLabel,
    hasLeadingIcon: Boolean(props.leadingIcon),
    trailingContent: trailingContent.value,
    invalid: isInvalid.value,
    disabled: props.disabled,
  }),
)

const fieldInputAttributes = computed(() => ({
  'id': fieldId.value,
  'type': props.type,
  'disabled': props.disabled,
  'aria-describedby': describingElementId.value,
  'aria-invalid': isInvalid.value || undefined,
  'placeholder': props.floatLabel === 'always' ? props.placeholder : ' ',
  'class': textFieldSlots.value.base({ class: props.ui?.base }),
}))

const trailingActionTag = computed(() => (props.trailingActionHref ? 'a' : 'button'))

const trailingActionAttributes = computed(() => {
  if (!props.trailingActionHref) return { type: 'button', disabled: props.disabled }

  return props.disabled ? { 'role': 'link', 'aria-disabled': 'true' } : { href: props.trailingActionHref }
})

function emitTrailingActionClick(event: MouseEvent) {
  if (!props.disabled) emit('trailingActionClick', event)
}
</script>

<template>
  <div :class="textFieldSlots.root({ class: [ui?.root, props.class] })">
    <div :class="textFieldSlots.container({ class: ui?.container })">
      <input
        v-if="mask"
        v-bind="{ ...$attrs, ...fieldInputAttributes }"
        :value="maskedValue"
        @input="updateMaskedFieldValue"
      />
      <input v-else v-bind="{ ...$attrs, ...fieldInputAttributes }" v-model="fieldValue" />

      <label :for="fieldId" :class="textFieldSlots.label({ class: ui?.label })">{{ label }}</label>

      <component :is="leadingIcon" v-if="leadingIcon" :class="textFieldSlots.leadingIcon({ class: ui?.leadingIcon })" />

      <component
        :is="trailingActionTag"
        v-if="trailingContent === 'action'"
        v-bind="trailingActionAttributes"
        :class="textFieldSlots.trailingAction({ class: ui?.trailingAction })"
        @click="emitTrailingActionClick"
      >
        {{ trailingActionLabel }}
      </component>

      <button
        v-else-if="trailingContent === 'iconButton'"
        type="button"
        :aria-label="trailingIconLabel"
        :disabled="disabled"
        :class="textFieldSlots.trailingIconButton({ class: ui?.trailingIconButton })"
        @click="emit('trailingIconClick', $event)"
      >
        <component :is="trailingIcon" :class="textFieldSlots.trailingIcon({ class: ui?.trailingIcon })" />
      </button>

      <component
        :is="trailingIcon"
        v-else-if="trailingContent === 'icon'"
        :class="textFieldSlots.trailingIcon({ class: ui?.trailingIcon })"
      />
    </div>

    <p v-if="errorMessage" :id="errorMessageId" :class="textFieldSlots.errorMessage({ class: ui?.errorMessage })">
      <CircleAlert :class="textFieldSlots.errorIcon({ class: ui?.errorIcon })" />
      {{ errorMessage }}
    </p>

    <p v-else-if="hint" :id="hintId" :class="textFieldSlots.hint({ class: ui?.hint })">{{ hint }}</p>
  </div>
</template>
