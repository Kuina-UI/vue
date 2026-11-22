<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TextFieldSlotName, TextFieldThemeVariants } from './text-field.theme'

export interface TextFieldProps {
  label: string
  id?: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
  variant?: TextFieldThemeVariants['variant']
  size?: TextFieldThemeVariants['size']
  pill?: boolean
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
import { computed, useId } from 'vue'
import { textFieldTheme } from './text-field.theme'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextFieldProps>(), {
  type: 'text',
  variant: 'outline',
  size: '4xl',
  pill: true,
})

const emit = defineEmits<{
  trailingIconClick: [event: MouseEvent]
  trailingActionClick: [event: MouseEvent]
}>()

const fieldValue = defineModel<string>()

const generatedInputId = useId()

const inputId = computed(() => props.id ?? generatedInputId)
const hintId = computed(() => `${inputId.value}-hint`)
const errorMessageId = computed(() => `${inputId.value}-error`)

const isInvalid = computed(() => props.invalid || Boolean(props.errorMessage))

const describingElementId = computed(() => {
  if (props.errorMessage) return errorMessageId.value
  if (props.hint) return hintId.value
  return undefined
})

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
    hasLeadingIcon: Boolean(props.leadingIcon),
    trailingContent: trailingContent.value,
    invalid: isInvalid.value,
    disabled: props.disabled,
  }),
)

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
        v-bind="$attrs"
        :id="inputId"
        v-model="fieldValue"
        :type="type"
        :disabled="disabled"
        :aria-describedby="describingElementId"
        :aria-invalid="isInvalid || undefined"
        placeholder=" "
        :class="textFieldSlots.base({ class: ui?.base })"
      />

      <label :for="inputId" :class="textFieldSlots.label({ class: ui?.label })">{{ label }}</label>

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
