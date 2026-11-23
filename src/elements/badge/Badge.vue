<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { BadgeSlotName, BadgeThemeVariants } from './badge.theme'

export interface BadgeProps {
  label?: string
  variant?: BadgeThemeVariants['variant']
  color?: BadgeThemeVariants['color']
  size?: BadgeThemeVariants['size']
  leadingIcon?: Component
  trailingIcon?: Component
  dot?: boolean
  pill?: boolean
  ui?: Partial<Record<BadgeSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { badgeTheme } from './badge.theme'

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'soft',
  color: 'gray',
  size: 'sm',
})

const badgeSlots = computed(() =>
  badgeTheme({
    variant: props.variant,
    color: props.color,
    size: props.size,
    pill: props.pill,
  }),
)
</script>

<template>
  <span :class="badgeSlots.base({ class: [ui?.base, props.class] })">
    <span v-if="dot" aria-hidden="true" :class="badgeSlots.dot({ class: ui?.dot })" />
    <component :is="leadingIcon" v-if="leadingIcon" :class="badgeSlots.leadingIcon({ class: ui?.leadingIcon })" />
    <slot>{{ label }}</slot>
    <component :is="trailingIcon" v-if="trailingIcon" :class="badgeSlots.trailingIcon({ class: ui?.trailingIcon })" />
  </span>
</template>
