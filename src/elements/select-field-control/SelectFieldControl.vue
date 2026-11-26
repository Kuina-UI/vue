<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SelectFieldControlSlotName, SelectFieldControlThemeVariants } from './select-field-control.theme'

export interface SelectFieldControlProps {
  label: string
  labelId: string
  valueId?: string
  hintId: string
  errorMessageId: string
  placeholder?: string
  hint?: string
  errorMessage?: string
  size?: SelectFieldControlThemeVariants['size']
  variant?: SelectFieldControlThemeVariants['variant']
  pill?: boolean
  floatLabel?: SelectFieldControlThemeVariants['floatLabel']
  open?: boolean
  invalid?: boolean
  disabled?: boolean
  hasValue?: boolean
  leadingIcon?: Component | null
  trailingIcon?: Component | null
  showsClearButton?: boolean
  clearLabel?: string
  spokenValue?: string
  triggerAttributes?: Record<string, unknown>
  ui?: Partial<Record<SelectFieldControlSlotName, ClassNameValue>>
  class?: ClassNameValue
}

export interface SelectFieldControlSlots {
  default?: () => unknown
  leading?: () => unknown
  input?: (inputSlotProps: { inputClass: string }) => unknown
  status?: (statusSlotProps: { statusClass: string }) => unknown
  popup?: () => unknown
}
</script>

<script setup lang="ts">
import { CircleAlert, X } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import { selectFieldControlTheme } from './select-field-control.theme'

const props = withDefaults(defineProps<SelectFieldControlProps>(), {
  size: '4xl',
  variant: 'outline',
  pill: true,
  floatLabel: 'auto',
  clearLabel: 'Clear current value',
})

const emit = defineEmits<{
  clear: []
}>()

const slots = defineSlots<SelectFieldControlSlots>()

const containerElement = useTemplateRef<HTMLElement>('containerElement')
const triggerElement = useTemplateRef<HTMLElement>('triggerElement')

defineExpose({ containerElement, triggerElement })

const fieldState = computed(() => {
  if (props.invalid) return 'invalid'
  if (props.disabled) return 'disabled'
  return props.open ? 'open' : 'idle'
})

const controlSlots = computed(() =>
  selectFieldControlTheme({
    size: props.size,
    variant: props.variant,
    pill: props.pill,
    fieldState: fieldState.value,
    floatLabel: props.floatLabel,
    labelFloating: props.floatLabel === 'always' || props.hasValue || props.open,
    hasLeadingIcon: Boolean(props.leadingIcon),
    disabled: props.disabled,
    open: props.open,
    hasTrailingIcon: Boolean(props.trailingIcon),
  }),
)
</script>

<template>
  <div :class="controlSlots.root({ class: [ui?.root, props.class] })">
    <div ref="containerElement" :class="controlSlots.container({ class: ui?.container })">
      <div ref="triggerElement" v-bind="triggerAttributes" :class="controlSlots.base({ class: ui?.base })">
        <span v-if="slots.leading" :class="controlSlots.leadingAvatar({ class: ui?.leadingAvatar })">
          <slot name="leading" />
        </span>
        <component :is="leadingIcon" v-else-if="leadingIcon" :class="controlSlots.leadingIcon({ class: ui?.leadingIcon })" />

        <slot v-if="slots.input" name="input" :input-class="controlSlots.input({ class: ui?.input })" />
        <template v-else>
          <span :id="valueId" :aria-hidden="spokenValue ? true : undefined" :class="controlSlots.value({ class: ui?.value })">
            <slot v-if="hasValue" />
            <span v-else-if="placeholder" :class="controlSlots.placeholder({ class: ui?.placeholder })">
              {{ placeholder }}
            </span>
          </span>
          <span v-if="spokenValue" :class="controlSlots.selectionForScreenReaders({ class: ui?.selectionForScreenReaders })">
            {{ spokenValue }}
          </span>
        </template>

        <span v-if="showsClearButton || slots.status || trailingIcon" :class="controlSlots.trailing({ class: ui?.trailing })">
          <button
            v-if="showsClearButton"
            type="button"
            :aria-label="clearLabel"
            :class="controlSlots.clearButton({ class: ui?.clearButton })"
            @click.stop="emit('clear')"
            @keydown.stop
          >
            <X :class="controlSlots.clearIcon({ class: ui?.clearIcon })" />
          </button>
          <slot name="status" :status-class="controlSlots.loadingIndicator({ class: ui?.loadingIndicator })" />
          <component :is="trailingIcon" v-if="trailingIcon" :class="controlSlots.trailingIcon({ class: ui?.trailingIcon })" />
        </span>
      </div>

      <span :id="labelId" :class="controlSlots.label({ class: ui?.label })">{{ label }}</span>

      <slot name="popup" />
    </div>

    <p v-if="errorMessage" :id="errorMessageId" :class="controlSlots.errorMessage({ class: ui?.errorMessage })">
      <CircleAlert :class="controlSlots.errorIcon({ class: ui?.errorIcon })" />
      {{ errorMessage }}
    </p>

    <p v-else-if="hint" :id="hintId" :class="controlSlots.hint({ class: ui?.hint })">{{ hint }}</p>
  </div>
</template>
