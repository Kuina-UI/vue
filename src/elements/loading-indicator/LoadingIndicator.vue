<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { LoadingIndicatorSlotName } from './loading-indicator.theme'

export interface LoadingIndicatorProps {
  label?: string
  ui?: Partial<Record<LoadingIndicatorSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { loadingIndicatorTheme } from './loading-indicator.theme'

const props = withDefaults(defineProps<LoadingIndicatorProps>(), {
  label: 'Loading',
})

const loadingIndicatorSlots = loadingIndicatorTheme()
</script>

<template>
  <div role="status" :aria-label="label" :class="loadingIndicatorSlots.base({ class: [ui?.base, props.class] })" />
</template>
