<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TextLinkSlotName, TextLinkThemeVariants } from './text-link.theme'

export interface TextLinkProps {
  label?: string
  href?: string
  color?: TextLinkThemeVariants['color']
  weight?: TextLinkThemeVariants['weight']
  underline?: boolean
  external?: boolean
  leadingIcon?: Component
  trailingIcon?: Component
  ui?: Partial<Record<TextLinkSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternalUrl } from '../../shared/utils/isExternalUrl'
import { textLinkTheme } from './text-link.theme'

const props = withDefaults(defineProps<TextLinkProps>(), {
  href: '#',
  color: 'inherit',
  weight: 'inherit',
  underline: undefined,
  external: undefined,
})

const showsUnderline = computed(() => props.underline ?? props.color !== 'primary')

const opensNewTab = computed(() => props.external ?? isExternalUrl(props.href))

const textLinkSlots = computed(() =>
  textLinkTheme({
    color: props.color,
    weight: props.weight,
    underline: showsUnderline.value,
    hasIcon: Boolean(props.leadingIcon || props.trailingIcon),
  }),
)
</script>

<template>
  <a
    :href="href"
    :target="opensNewTab ? '_blank' : undefined"
    :rel="opensNewTab ? 'noopener noreferrer' : undefined"
    :class="textLinkSlots.base({ class: [ui?.base, props.class] })"
  >
    <component :is="leadingIcon" v-if="leadingIcon" :class="textLinkSlots.leadingIcon({ class: ui?.leadingIcon })" />
    <slot>{{ label }}</slot>
    <component
      :is="trailingIcon"
      v-if="trailingIcon"
      :class="textLinkSlots.trailingIcon({ class: ui?.trailingIcon })"
    />
    <span v-if="opensNewTab" :class="textLinkSlots.newTabHint({ class: ui?.newTabHint })">(opens in a new tab)</span>
  </a>
</template>
