<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SegmentedControlSlotName, SegmentedControlThemeVariants } from './segmented-control.theme'

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: Component
  disabled?: boolean
}

export interface SegmentedControlProps {
  ariaLabel: string
  options: SegmentedControlOption[]
  name?: string
  size?: SegmentedControlThemeVariants['size']
  pill?: boolean
  block?: boolean
  square?: boolean
  disabled?: boolean
  ui?: Partial<Record<SegmentedControlSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed, useId, useTemplateRef } from 'vue'
import { useSlidingThumb } from '../../shared/composables/useSlidingThumb'
import { resolvePressScale } from '../../shared/utils/resolvePressScale'
import { segmentedControlTheme } from './segmented-control.theme'

const props = withDefaults(defineProps<SegmentedControlProps>(), {
  size: 'md',
  pill: true,
})

const selectedValue = defineModel<string>()

const segmentedControlId = useId()

const segmentedControlName = computed(() => props.name ?? segmentedControlId)

const trackElement = useTemplateRef<HTMLElement>('trackElement')

const hasSelectedOption = computed(() => props.options.some((option) => option.value === selectedValue.value))

const { thumbStyle, isThumbPlaced, animatesThumb } = useSlidingThumb({
  trackElement,
  findSelectedElement: () => trackElement.value?.querySelector<HTMLElement>('[data-selected]'),
  placementSources: [
    selectedValue,
    () => props.options,
    () => props.size,
    () => props.pill,
    () => props.block,
    () => props.square,
  ],
})

const segmentedControlSlots = computed(() =>
  segmentedControlTheme({
    size: props.size,
    pill: props.pill,
    block: props.block,
    square: props.square,
    disabled: props.disabled,
    isThumbPlaced: isThumbPlaced.value,
    animatesThumb: animatesThumb.value,
  }),
)

function isOptionDisabled(option: SegmentedControlOption) {
  return props.disabled || Boolean(option.disabled)
}

function updatePressScale(pointerEvent: PointerEvent) {
  const optionElement = pointerEvent.currentTarget as HTMLElement

  optionElement.style.setProperty('--press-scale-x', String(resolvePressScale(optionElement.offsetWidth)))
}
</script>

<template>
  <div
    ref="trackElement"
    role="radiogroup"
    :aria-label="ariaLabel"
    :class="segmentedControlSlots.root({ class: [ui?.root, props.class] })"
  >
    <div
      v-show="hasSelectedOption"
      aria-hidden="true"
      :style="thumbStyle"
      :class="segmentedControlSlots.thumb({ class: ui?.thumb })"
    />

    <label
      v-for="option in options"
      :key="option.value"
      :data-selected="option.value === selectedValue ? '' : undefined"
      :class="segmentedControlSlots.option({ optionDisabled: isOptionDisabled(option), class: ui?.option })"
      @pointerenter="updatePressScale"
    >
      <input
        v-model="selectedValue"
        type="radio"
        :name="segmentedControlName"
        :value="option.value"
        :disabled="isOptionDisabled(option)"
        :aria-label="square ? option.label : undefined"
        :class="segmentedControlSlots.input({ class: ui?.input })"
      />
      <span :class="segmentedControlSlots.content({ class: ui?.content })">
        <component :is="option.icon" v-if="option.icon" :class="segmentedControlSlots.icon({ class: ui?.icon })" />
        <template v-if="!square">{{ option.label }}</template>
      </span>
    </label>
  </div>
</template>
