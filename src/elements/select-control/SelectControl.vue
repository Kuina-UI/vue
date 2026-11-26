<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SelectControlSlotName, SelectControlThemeVariants } from './select-control.theme'

export interface SelectControlProps {
  size?: SelectControlThemeVariants['size']
  variant?: SelectControlThemeVariants['variant']
  pill?: boolean
  block?: boolean
  open?: boolean
  invalid?: boolean
  disabled?: boolean
  interactive?: boolean
  hasValue?: boolean
  searchesInTrigger?: boolean
  leadingIcon?: Component | null
  trailingIcon?: Component | null
  showsClearButton?: boolean
  clearLabel?: string
  spokenValue?: string
  triggerAttributes?: Record<string, unknown>
  ui?: Partial<Record<SelectControlSlotName, ClassNameValue>>
  class?: ClassNameValue
}

export interface SelectControlSlots {
  default?: () => unknown
  leading?: () => unknown
  input?: (inputSlotProps: { inputClass: string }) => unknown
  status?: (statusSlotProps: { statusClass: string }) => unknown
  popup?: () => unknown
}
</script>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import { selectControlTheme } from './select-control.theme'

const props = withDefaults(defineProps<SelectControlProps>(), {
  size: 'md',
  variant: 'outline',
  pill: true,
  block: true,
  interactive: true,
  clearLabel: 'Clear current value',
})

const emit = defineEmits<{
  clear: []
}>()

const slots = defineSlots<SelectControlSlots>()

const rootElement = useTemplateRef<HTMLElement>('rootElement')
const triggerElement = useTemplateRef<HTMLElement>('triggerElement')

defineExpose({ rootElement, triggerElement })

const controlSlots = computed(() =>
  selectControlTheme({
    size: props.size,
    variant: props.variant,
    pill: props.pill,
    block: props.block,
    open: props.open,
    invalid: props.invalid,
    interactive: props.interactive,
    disabled: props.disabled,
    hasSelection: props.hasValue,
    searchesInTrigger: props.searchesInTrigger,
    hasTrailingIcon: Boolean(props.trailingIcon),
  }),
)
</script>

<template>
  <div ref="rootElement" :class="controlSlots.root({ class: [ui?.root, props.class] })">
    <div ref="triggerElement" v-bind="triggerAttributes" :class="controlSlots.base({ class: ui?.base })">
      <span v-if="slots.leading" :class="controlSlots.leadingAvatar({ class: ui?.leadingAvatar })">
        <slot name="leading" />
      </span>
      <component :is="leadingIcon" v-else-if="leadingIcon" :class="controlSlots.leadingIcon({ class: ui?.leadingIcon })" />

      <slot v-if="slots.input" name="input" :input-class="controlSlots.input({ class: ui?.input })" />
      <template v-else>
        <span :aria-hidden="spokenValue ? true : undefined" :class="controlSlots.value({ class: ui?.value })">
          <slot />
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

    <slot name="popup" />
  </div>
</template>
