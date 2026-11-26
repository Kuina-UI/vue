<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TextFieldSlotName, TextFieldThemeVariants } from './text-field.theme'

export interface TextFieldProps {
  label: string
  id?: string
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
  placeholder?: string
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
import { computed } from 'vue'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
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
        :id="fieldId"
        v-model="fieldValue"
        :type="type"
        :disabled="disabled"
        :aria-describedby="describingElementId"
        :aria-invalid="isInvalid || undefined"
        :placeholder="floatLabel === 'always' ? placeholder : ' '"
        :class="textFieldSlots.base({ class: ui?.base })"
      />

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
