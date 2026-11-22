<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { LoadingDotsSlotName } from './loading-dots.theme'

export interface LoadingDotsProps {
  label?: string
  ui?: Partial<Record<LoadingDotsSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { loadingDotsTheme } from './loading-dots.theme'

const props = withDefaults(defineProps<LoadingDotsProps>(), {
  label: 'Loading',
})

const loadingDotsSlots = loadingDotsTheme()
</script>

<template>
  <div role="status" :aria-label="label" :class="loadingDotsSlots.base({ class: [ui?.base, props.class] })">
    <span v-for="dotPosition in 3" :key="dotPosition" />
  </div>
</template>
