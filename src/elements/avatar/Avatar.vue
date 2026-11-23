<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { AvatarSlotName, AvatarThemeVariants } from './avatar.theme'

export interface AvatarProps {
  name?: string
  imageUrl?: string
  icon?: Component
  initials?: string
  overflowCount?: number
  variant?: AvatarThemeVariants['variant']
  color?: AvatarThemeVariants['color']
  size?: AvatarThemeVariants['size']
  pill?: boolean
  href?: string
  ui?: Partial<Record<AvatarSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { avatarTheme } from './avatar.theme'

const props = withDefaults(defineProps<AvatarProps>(), {
  name: '',
  overflowCount: 0,
  variant: 'soft',
  color: 'gray',
  size: 'md',
  pill: true,
})

const isOverflow = computed(() => props.overflowCount > 0)

const overflowLabel = computed(() => {
  if (props.overflowCount >= 1_000_000) {
    return `${Math.round(props.overflowCount / 1_000_000)}m`
  }

  if (props.overflowCount >= 1000) {
    return `${Math.round(props.overflowCount / 1000)}k`
  }

  return String(props.overflowCount)
})

const initialsLabel = computed(() => props.initials || props.name.charAt(0).toUpperCase())

const accessibleName = computed(() => props.name || (isOverflow.value ? `${props.overflowCount} more` : ''))

const labelCharacterCount = computed(() => {
  const visibleLabelLength = isOverflow.value ? overflowLabel.value.length : initialsLabel.value.length

  if (visibleLabelLength <= 1) {
    return 'one'
  }

  return visibleLabelLength === 2 ? 'two' : 'many'
})

const avatarSlots = computed(() =>
  avatarTheme({
    variant: props.variant,
    color: props.color,
    size: props.size,
    pill: props.pill,
    hasImage: Boolean(props.imageUrl),
    isLink: Boolean(props.href),
    isOverflow: isOverflow.value,
    labelCharacterCount: labelCharacterCount.value,
  }),
)

const rootTag = computed(() => (props.href ? 'a' : 'span'))

const rootAttributes = computed(() => {
  if (props.href) {
    return { 'href': props.href, 'aria-label': accessibleName.value || undefined }
  }

  return accessibleName.value ? { 'role': 'img', 'aria-label': accessibleName.value } : { 'aria-hidden': 'true' }
})
</script>

<template>
  <component :is="rootTag" v-bind="rootAttributes" :class="avatarSlots.base({ class: [ui?.base, props.class] })">
    <img v-if="imageUrl" :src="imageUrl" alt="" :class="avatarSlots.image({ class: ui?.image })" />
    <component :is="icon" v-else-if="icon" :class="avatarSlots.icon({ class: ui?.icon })" />
    <span v-else-if="isOverflow" aria-hidden="true" :class="avatarSlots.label({ class: ui?.label })">
      <span :class="avatarSlots.overflowSign({ class: ui?.overflowSign })">+</span>
      {{ overflowLabel }}
    </span>
    <span v-else aria-hidden="true" :class="avatarSlots.label({ class: ui?.label })">{{ initialsLabel }}</span>
  </component>
</template>
