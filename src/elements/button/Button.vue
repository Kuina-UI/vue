<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { ButtonSlotName, ButtonThemeVariants } from './button.theme'

export interface ButtonProps {
  label?: string
  variant?: ButtonThemeVariants['variant']
  color?: ButtonThemeVariants['color']
  size?: ButtonThemeVariants['size']
  leadingIcon?: Component
  trailingIcon?: Component
  square?: boolean
  pill?: boolean
  block?: boolean
  disabled?: boolean
  loading?: boolean
  selected?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  ui?: Partial<Record<ButtonSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { buttonTheme } from './button.theme'

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'solid',
  color: 'primary',
  size: 'md',
  pill: true,
  type: 'button',
})

const buttonSlots = computed(() =>
  buttonTheme({
    variant: props.variant,
    color: props.color,
    size: props.size,
    square: props.square,
    pill: props.pill,
    block: props.block,
    disabled: props.disabled,
    loading: props.loading,
    selected: props.selected,
  }),
)

const rootTag = computed(() => (props.href ? 'a' : 'button'))

const rootAttributes = computed(() => {
  const accessibleName = props.square ? { 'aria-label': props.label } : {}

  if (props.href) {
    return props.disabled
      ? { ...accessibleName, 'role': 'link', 'aria-disabled': 'true' }
      : { ...accessibleName, href: props.href }
  }

  return {
    ...accessibleName,
    'type': props.type,
    'disabled': props.disabled || props.loading,
    'aria-busy': props.loading || undefined,
    'aria-pressed': props.selected || undefined,
  }
})
</script>

<template>
  <component :is="rootTag" v-bind="rootAttributes" :class="buttonSlots.base({ class: [ui?.base, props.class] })">
    <span v-if="loading" :class="buttonSlots.loadingOverlay({ class: ui?.loadingOverlay })">
      <span :class="buttonSlots.loadingIndicator({ class: ui?.loadingIndicator })" />
    </span>

    <span :class="buttonSlots.content({ class: ui?.content })">
      <component :is="leadingIcon" v-if="leadingIcon" :class="buttonSlots.leadingIcon({ class: ui?.leadingIcon })" />

      <span v-if="!square && (label || $slots.default)" :class="buttonSlots.label({ class: ui?.label })">
        <slot>{{ label }}</slot>
      </span>

      <component
        :is="trailingIcon"
        v-if="trailingIcon && !square"
        :class="buttonSlots.trailingIcon({ class: ui?.trailingIcon })"
      />
    </span>
  </component>
</template>
