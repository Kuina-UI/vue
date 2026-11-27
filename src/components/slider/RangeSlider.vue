<script lang="ts">
import type { SliderControlSlotName } from '../../elements/slider-control'
import type { SliderMark, SliderRange } from '../../shared/types/slider'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SliderSlotName } from './slider.theme'

export interface RangeSliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  minRange?: number
  resetValue?: SliderRange
  resetLabel?: string
  startLabel?: string
  endLabel?: string
  unit?: string
  prefixUnit?: string
  marks?: SliderMark[]
  trackColor?: string
  rangeColor?: string
  name?: string
  disabled?: boolean
  ui?: Partial<Record<SliderSlotName | 'container' | Exclude<SliderControlSlotName, 'root'>, ClassNameValue>>
  class?: ClassNameValue
}

export interface RangeSliderSlots {
  label?: () => unknown
}
</script>

<script setup lang="ts">
import { computed, onMounted, useId, useTemplateRef, watch } from 'vue'
import { KSliderControl } from '../../elements/slider-control'
import { useNumberFieldTyping } from '../../shared/composables/useNumberFieldTyping'
import { clampToRange } from '../../shared/utils/steppedValue'
import SliderHeader from './SliderHeader.vue'
import { sliderTheme } from './slider.theme'

const props = withDefaults(defineProps<RangeSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  minRange: 0,
  resetLabel: 'Reset to default',
  startLabel: 'Minimum',
  endLabel: 'Maximum',
})

const emit = defineEmits<{
  focus: [focusEvent: FocusEvent]
  blur: [blurEvent: FocusEvent]
}>()

const slots = defineSlots<RangeSliderSlots>()

const rangeModelValue = defineModel<SliderRange>()

const rangeSliderId = useId()
const startInputId = `${rangeSliderId}-start`
const labelId = `${rangeSliderId}-label`

const sliderControl = useTemplateRef<InstanceType<typeof KSliderControl>>('sliderControl')
const startInput = useTemplateRef<HTMLInputElement>('startInput')
const endInput = useTemplateRef<HTMLInputElement>('endInput')
const valueSeparator = useTemplateRef<HTMLElement>('valueSeparator')

const sliderRange = computed({
  get: (): SliderRange => rangeModelValue.value ?? [props.min, props.max],
  set: (nextSliderRange: SliderRange) => {
    rangeModelValue.value = nextSliderRange
  },
})

const sliderControlValues = computed({
  get: () => [...sliderRange.value],
  set: ([nextRangeStart, nextRangeEnd]: number[]) => {
    sliderRange.value = [nextRangeStart ?? props.min, nextRangeEnd ?? props.max]
  },
})

const rangeStart = computed({
  get: () => sliderRange.value[0],
  set: (nextRangeStart: number) => {
    sliderRange.value = [nextRangeStart, sliderRange.value[1]]
  },
})

const rangeEnd = computed({
  get: () => sliderRange.value[1],
  set: (nextRangeEnd: number) => {
    sliderRange.value = [sliderRange.value[0], nextRangeEnd]
  },
})

function emitFocus(focusEvent: FocusEvent) {
  emit('focus', focusEvent)
}

function emitBlur(blurEvent: FocusEvent) {
  emit('blur', blurEvent)
}

const startField = useNumberFieldTyping({
  fieldValue: rangeStart,
  lowestValue: () => props.min,
  highestValue: () => rangeEnd.value - props.minRange,
  step: () => props.step,
  fieldElement: startInput,
  onFieldFocus: emitFocus,
  onFieldBlur: emitBlur,
})

const endField = useNumberFieldTyping({
  fieldValue: rangeEnd,
  lowestValue: () => rangeStart.value + props.minRange,
  highestValue: () => props.max,
  step: () => props.step,
  fieldElement: endInput,
  onFieldFocus: emitFocus,
  onFieldBlur: emitBlur,
})

const startValueText = startField.valueText
const endValueText = endField.valueText

const isResetValueShown = computed(
  () =>
    props.resetValue !== undefined &&
    props.resetValue[0] === rangeStart.value &&
    props.resetValue[1] === rangeEnd.value,
)

const hidesResetButton = computed(
  () => props.disabled || (isResetValueShown.value && !(sliderControl.value?.isPointerPressing ?? false)),
)

const sliderSlots = computed(() => sliderTheme({ disabled: props.disabled, hidesResetButton: hidesResetButton.value }))

const sliderControlUi = computed(() => ({ ...props.ui, root: props.ui?.container }))

const thumbAttributes = { onFocus: emitFocus, onBlur: emitBlur }

function keepRangeInBounds() {
  const [currentRangeStart, currentRangeEnd] = sliderRange.value
  const rangeStartInBounds = clampToRange(currentRangeStart, props.min, props.max)
  const rangeEndInBounds = clampToRange(currentRangeEnd, props.min, props.max)

  if (rangeStartInBounds !== currentRangeStart || rangeEndInBounds !== currentRangeEnd) {
    sliderRange.value = [rangeStartInBounds, rangeEndInBounds]
  }
}

function focusClosestValueInput(clickEvent: MouseEvent) {
  const separatorBox = valueSeparator.value?.getBoundingClientRect()
  const clicksEndSide = separatorBox !== undefined && clickEvent.clientX > separatorBox.left + separatorBox.width / 2

  ;(clicksEndSide ? endInput : startInput).value?.focus()
}

function resetSliderRange() {
  if (props.resetValue) sliderRange.value = [...props.resetValue]
}

watch(() => [props.min, props.max], keepRangeInBounds)

onMounted(keepRangeInBounds)
</script>

<template>
  <div
    role="group"
    :aria-labelledby="label || slots.label ? labelId : undefined"
    :class="sliderSlots.root({ class: [ui?.root, props.class] })"
  >
    <SliderHeader
      :label-id="labelId"
      :label-target-id="startInputId"
      :label="label"
      :shows-reset-button="resetValue !== undefined"
      :reset-label="resetLabel"
      :hides-reset-button="hidesResetButton"
      :disabled="disabled"
      :ui="ui"
      @reset="resetSliderRange"
      @value-click="focusClosestValueInput"
    >
      <template v-if="slots.label" #label>
        <slot name="label" />
      </template>

      <span v-if="prefixUnit" :class="sliderSlots.unit({ class: ui?.unit })">{{ prefixUnit }}</span>
      <input
        :id="startInputId"
        ref="startInput"
        type="text"
        :aria-label="startLabel"
        :value="startValueText"
        :disabled="disabled"
        :style="{ '--slider-value-length': startValueText.length }"
        :class="sliderSlots.valueInput({ class: ui?.valueInput })"
        v-on="startField.fieldListeners"
      />
      <span ref="valueSeparator" :class="sliderSlots.valueSeparator({ class: ui?.valueSeparator })">–</span>
      <span v-if="prefixUnit" :class="sliderSlots.unit({ class: ui?.unit })">{{ prefixUnit }}</span>
      <input
        ref="endInput"
        type="text"
        :aria-label="endLabel"
        :value="endValueText"
        :disabled="disabled"
        :style="{ '--slider-value-length': endValueText.length }"
        :class="sliderSlots.valueInput({ class: ui?.valueInput })"
        v-on="endField.fieldListeners"
      />
      <span v-if="unit" :class="sliderSlots.unit({ class: ui?.unit })">{{ unit }}</span>
    </SliderHeader>

    <KSliderControl
      ref="sliderControl"
      v-model="sliderControlValues"
      :min="min"
      :max="max"
      :step="step"
      :min-range="minRange"
      :disabled="disabled"
      :name="name"
      :marks="marks"
      :track-color="trackColor"
      :range-color="rangeColor"
      :thumb-labels="[startLabel, endLabel]"
      :thumb-attributes="thumbAttributes"
      :ui="sliderControlUi"
    />
  </div>
</template>
