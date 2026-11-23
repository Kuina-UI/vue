<script lang="ts">
import type { AvatarProps } from '../../elements/avatar'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { AvatarGroupSlotName, AvatarGroupThemeVariants } from './avatar-group.theme'

export type AvatarGroupMember = Pick<AvatarProps, 'name' | 'imageUrl' | 'icon' | 'initials' | 'color' | 'variant'>

export interface AvatarGroupProps {
  avatars: AvatarGroupMember[]
  label?: string
  size?: AvatarProps['size']
  stack?: AvatarGroupThemeVariants['stack']
  overflowCount?: number
  surface?: AvatarGroupThemeVariants['surface']
  ui?: Partial<Record<AvatarGroupSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { KAvatar } from '../../elements/avatar'
import { avatarGroupTheme } from './avatar-group.theme'

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  size: 'md',
  stack: 'start',
  overflowCount: 0,
  surface: 'widget',
})

const hasOverflow = computed(() => props.overflowCount > 0)

const stackedAvatars = computed(() => {
  const groupAvatars: AvatarProps[] = hasOverflow.value
    ? [...props.avatars, { overflowCount: props.overflowCount }]
    : [...props.avatars]

  const keyedAvatars = groupAvatars.map((avatarProps, avatarPosition) => ({ avatarProps, avatarPosition }))

  return props.stack === 'start' ? keyedAvatars.reverse() : keyedAvatars
})

const avatarGroupSlots = computed(() =>
  avatarGroupTheme({
    stack: props.stack,
    surface: props.surface,
    hasOverflow: hasOverflow.value,
  }),
)
</script>

<template>
  <div
    :role="label ? 'group' : undefined"
    :aria-label="label || undefined"
    :class="avatarGroupSlots.base({ class: [ui?.base, props.class] })"
  >
    <KAvatar
      v-for="stackedAvatar in stackedAvatars"
      :key="stackedAvatar.avatarPosition"
      v-bind="stackedAvatar.avatarProps"
      :size="size"
    />
  </div>
</template>
