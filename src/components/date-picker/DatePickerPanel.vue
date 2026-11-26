<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue'
import { useFloatingPosition } from '../../shared/composables/useFloatingPosition'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import { findFloatingTransformOrigin } from '../../shared/utils/floatingPanelTransition'
import { flipFloatingPosition } from '../../shared/utils/flipFloatingPosition'
import type { ClassNameValue } from '../../shared/utils/tv'
import { datePickerTheme } from './date-picker.theme'

const props = defineProps<{
  id: string
  label: string
  anchorElement: HTMLElement | null | undefined
  side: FloatingSide
  align: FloatingAlign
  flip: boolean
  strategy: FloatingStrategy
  panelClass?: ClassNameValue
}>()

const emit = defineEmits<{
  positioned: []
}>()

const panelElement = useTemplateRef<HTMLElement>('panelElement')

defineExpose({ panelElement })

const panelPositionModifiers = computed(() => (props.flip ? [flipFloatingPosition()] : []))

const { floatingStyles, floatingPlacement, isPositioned } = useFloatingPosition(() => props.anchorElement, panelElement, {
  open: true,
  side: () => props.side,
  align: () => props.align,
  sideOffset: 8,
  strategy: () => props.strategy,
  positionModifiers: panelPositionModifiers,
})

watch(isPositioned, (hasBeenPositioned) => {
  if (hasBeenPositioned) emit('positioned')
})

const panelStyles = computed(() => ({
  ...floatingStyles.value,
  transformOrigin: findFloatingTransformOrigin(floatingPlacement.value),
}))

const panelSlots = computed(() => datePickerTheme())
</script>

<template>
  <div
    :id="id"
    ref="panelElement"
    role="dialog"
    :aria-label="label"
    :style="panelStyles"
    :class="panelSlots.panel({ class: panelClass })"
  >
    <slot />
  </div>
</template>
