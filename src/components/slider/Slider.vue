<script lang="ts">
import type { SliderControlSlotName } from '../../elements/slider-control'
import type { SliderMark } from '../../shared/types/slider'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SliderSlotName } from './slider.theme'

export interface SliderProps {
  label?: string
  min?: number
  max?: number
  step?: number
  resetValue?: number
  resetLabel?: string
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

export interface SliderSlots {
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

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  resetLabel: 'Reset to default',
})

const emit = defineEmits<{
  focus: [focusEvent: FocusEvent]
  blur: [blurEvent: FocusEvent]
}>()

const slots = defineSlots<SliderSlots>()

const sliderModelValue = defineModel<number>()

const sliderId = useId()
const valueInputId = `${sliderId}-value`
const labelId = `${sliderId}-label`

const sliderControl = useTemplateRef<InstanceType<typeof KSliderControl>>('sliderControl')
const valueInput = useTemplateRef<HTMLInputElement>('valueInput')

const sliderValue = computed({
  get: () => sliderModelValue.value ?? props.min,
  set: (nextSliderValue: number) => {
    sliderModelValue.value = nextSliderValue
  },
})

const sliderControlValues = computed({
  get: () => [sliderValue.value],
  set: ([nextSliderValue]: number[]) => {
    if (nextSliderValue !== undefined) sliderValue.value = nextSliderValue
  },
})

const { valueText, fieldListeners } = useNumberFieldTyping({
  fieldValue: sliderValue,
  lowestValue: () => props.min,
  highestValue: () => props.max,
  step: () => props.step,
  fieldElement: valueInput,
  onFieldFocus: (focusEvent) => emit('focus', focusEvent),
  onFieldBlur: (blurEvent) => emit('blur', blurEvent),
})

const hidesResetButton = computed(
  () =>
    props.disabled ||
    (props.resetValue === sliderValue.value && !(sliderControl.value?.isPointerPressing ?? false)),
)

const sliderSlots = computed(() => sliderTheme({ disabled: props.disabled, hidesResetButton: hidesResetButton.value }))

const sliderControlUi = computed(() => ({ ...props.ui, root: props.ui?.container }))

const thumbAttributes = computed(() => ({
  'aria-labelledby': props.label || slots.label ? labelId : undefined,
  'onFocus': (focusEvent: FocusEvent) => emit('focus', focusEvent),
  'onBlur': (blurEvent: FocusEvent) => emit('blur', blurEvent),
}))

function keepValueInRange() {
  const valueInRange = clampToRange(sliderValue.value, props.min, props.max)

  if (valueInRange !== sliderValue.value) sliderValue.value = valueInRange
}

function focusValueInput() {
  valueInput.value?.focus()
}

function resetSliderValue() {
  if (props.resetValue !== undefined) sliderValue.value = props.resetValue
}

watch(() => [props.min, props.max], keepValueInRange)

onMounted(keepValueInRange)
</script>

<template>
  <div :class="sliderSlots.root({ class: [ui?.root, props.class] })">
    <SliderHeader
      :label-id="labelId"
      :label-target-id="valueInputId"
      :label="label"
      :shows-reset-button="resetValue !== undefined"
      :reset-label="resetLabel"
      :hides-reset-button="hidesResetButton"
      :disabled="disabled"
      :ui="ui"
      @reset="resetSliderValue"
      @value-click="focusValueInput"
    >
      <template v-if="slots.label" #label>
        <slot name="label" />
      </template>

      <span v-if="prefixUnit" :class="sliderSlots.unit({ class: ui?.unit })">{{ prefixUnit }}</span>
      <input
        :id="valueInputId"
        ref="valueInput"
        type="text"
        :value="valueText"
        :disabled="disabled"
        :style="{ '--slider-value-length': valueText.length }"
        :class="sliderSlots.valueInput({ class: ui?.valueInput })"
        v-on="fieldListeners"
      />
      <span v-if="unit" :class="sliderSlots.unit({ class: ui?.unit })">{{ unit }}</span>
    </SliderHeader>

    <KSliderControl
      ref="sliderControl"
      v-model="sliderControlValues"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :name="name"
      :marks="marks"
      :track-color="trackColor"
      :range-color="rangeColor"
      :thumb-attributes="thumbAttributes"
      :ui="sliderControlUi"
    />
  </div>
</template>
