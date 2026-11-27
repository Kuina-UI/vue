<script lang="ts">
import type { SliderMark } from '../../shared/types/slider'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SliderControlSlotName } from './slider-control.theme'

export interface SliderControlProps {
  min: number
  max: number
  step: number
  minRange?: number
  disabled?: boolean
  name?: string
  marks?: SliderMark[]
  trackColor?: string
  rangeColor?: string
  thumbLabels?: string[]
  thumbAttributes?: Record<string, unknown>
  ui?: Partial<Record<SliderControlSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { type ComponentPublicInstance, computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'
import {
  convertPointerToValue,
  convertValueToPercent,
  convertValueToRatio,
  sortSliderMarks,
} from '../../shared/utils/sliderPosition'
import { findClosestThumbIndex, isThumbStacked, resolveThumbBounds } from '../../shared/utils/sliderThumbs'
import { clampToRange, moveByStep, snapToStep, type StepMove } from '../../shared/utils/steppedValue'
import { sliderControlTheme } from './slider-control.theme'
import { useSliderMarksLayout } from './useSliderMarksLayout'

const props = withDefaults(defineProps<SliderControlProps>(), {
  minRange: 0,
  marks: () => [],
  thumbLabels: () => [],
})

const sliderValues = defineModel<number[]>({ required: true })

const fullTrackMoveDuration = 300
const shortestMoveDuration = 100

const oneStepUp: StepMove = { direction: 1, stepCount: 1 }
const oneStepDown: StepMove = { direction: -1, stepCount: 1 }
const tenStepsUp: StepMove = { direction: 1, stepCount: 10 }
const tenStepsDown: StepMove = { direction: -1, stepCount: 10 }

const rootElement = useTemplateRef<HTMLElement>('rootElement')
const controlElement = useTemplateRef<HTMLElement>('controlElement')
const marksElement = useTemplateRef<HTMLElement>('marksElement')
const formValueInputs = useTemplateRef<HTMLInputElement[]>('formValueInputs')
const thumbElements: HTMLElement[] = []

const isPointerPressing = ref(false)
const isInsideForm = ref(false)
const measuredThumbSize = ref<number>()
const valueMoveDuration = ref(0)
const activeThumbIndex = ref(0)
const initialSliderValues = [...sliderValues.value]

let isStackedThumbChoicePending = false
let slidingControlBox: DOMRect | undefined
let parentForm: HTMLFormElement | null = null
let thumbResizeObserver: ResizeObserver | undefined

defineExpose({ isPointerPressing })

const sortedMarks = computed(() => sortSliderMarks(props.marks, props.min, props.max))

const marksLayoutSignature = computed(() =>
  sortedMarks.value.map((sliderMark) => `${sliderMark.value}:${sliderMark.label}`).join('|'),
)

const { marksLayout } = useSliderMarksLayout(marksElement, [
  marksLayoutSignature,
  () => props.min,
  () => props.max,
  measuredThumbSize,
])

const thumbPercents = computed(() =>
  sliderValues.value.map((thumbValue) => convertValueToPercent(thumbValue, props.min, props.max)),
)

watch(
  () => sliderValues.value.map((thumbValue) => convertValueToRatio(thumbValue, props.min, props.max)),
  (nextThumbRatios, previousThumbRatios) => {
    const longestThumbMove = Math.max(
      ...nextThumbRatios.map((thumbRatio, thumbIndex) =>
        Math.abs(thumbRatio - (previousThumbRatios[thumbIndex] ?? thumbRatio)),
      ),
    )

    valueMoveDuration.value = Math.max(longestThumbMove * fullTrackMoveDuration, shortestMoveDuration)
  },
)

const valueTransitionDuration = computed(() => (isPointerPressing.value ? 0 : valueMoveDuration.value))

const sliderControlSlots = computed(() =>
  sliderControlTheme({ disabled: props.disabled, marksLayout: marksLayout.value }),
)

const rootStyle = computed(() =>
  measuredThumbSize.value === undefined ? undefined : { '--slider-thumb-size': `${measuredThumbSize.value}px` },
)

const controlStyle = computed(() => ({
  '--slider-value-transition-duration': `${valueTransitionDuration.value}ms`,
  '--slider-track-color': props.trackColor,
  '--slider-range-color': props.rangeColor,
}))

const rangeStyle = computed(() => {
  const rangeStartPercent = thumbPercents.value.length > 1 ? Math.min(...thumbPercents.value) : 0

  return { left: `${rangeStartPercent}%`, right: `${100 - Math.max(...thumbPercents.value)}%` }
})

function resolveThumbAnchorStyle(thumbPercent: number) {
  return { left: `calc(${thumbPercent}% + var(--slider-thumb-size) * ${0.5 - thumbPercent / 100})` }
}

function resolveThumbStateAttributes(thumbIndex: number) {
  const { lowestValue, highestValue } = resolveThumbBounds(sliderValues.value, thumbIndex, props)

  return {
    'tabindex': props.disabled ? undefined : 0,
    'aria-label': props.thumbLabels[thumbIndex],
    'aria-valuemin': lowestValue,
    'aria-valuenow': sliderValues.value[thumbIndex],
    'aria-valuemax': highestValue,
    'aria-disabled': props.disabled || undefined,
    'data-disabled': props.disabled ? '' : undefined,
  }
}

function registerThumbElement(thumbElement: Element | ComponentPublicInstance | null, thumbIndex: number) {
  if (thumbElement instanceof HTMLElement) thumbElements[thumbIndex] = thumbElement
}

function activateThumb(thumbIndex: number) {
  activeThumbIndex.value = thumbIndex
}

function announceValuesToForm() {
  nextTick(() => formValueInputs.value?.[0]?.dispatchEvent(new Event('input', { bubbles: true })))
}

function moveThumb(thumbIndex: number, requestedValue: number, isKeyboardInteraction: boolean) {
  if (props.disabled) return

  const { lowestValue, highestValue } = resolveThumbBounds(sliderValues.value, thumbIndex, props)
  const nextThumbValue = clampToRange(snapToStep(requestedValue, props), lowestValue, highestValue)

  if (nextThumbValue === sliderValues.value[thumbIndex]) return

  sliderValues.value = sliderValues.value.map((thumbValue, valueIndex) =>
    valueIndex === thumbIndex ? nextThumbValue : thumbValue,
  )
  activateThumb(thumbIndex)
  thumbElements[thumbIndex]?.focus({ preventScroll: true, focusVisible: isKeyboardInteraction })
  announceValuesToForm()
}

function moveActiveThumbBySteps(stepMove: StepMove) {
  const activeThumbValue = sliderValues.value[activeThumbIndex.value] ?? props.min

  moveThumb(activeThumbIndex.value, moveByStep(activeThumbValue, props, stepMove), true)
}

const moveThumbFromKeys = createShortcutHandler({
  'home': () => moveThumb(activeThumbIndex.value, props.min, true),
  'end': () => moveThumb(activeThumbIndex.value, props.max, true),
  'arrowright': () => moveActiveThumbBySteps(oneStepUp),
  'arrowup': () => moveActiveThumbBySteps(oneStepUp),
  'arrowleft': () => moveActiveThumbBySteps(oneStepDown),
  'arrowdown': () => moveActiveThumbBySteps(oneStepDown),
  'shift+arrowright': () => moveActiveThumbBySteps(tenStepsUp),
  'shift+arrowup': () => moveActiveThumbBySteps(tenStepsUp),
  'shift+arrowleft': () => moveActiveThumbBySteps(tenStepsDown),
  'shift+arrowdown': () => moveActiveThumbBySteps(tenStepsDown),
  'pageup': () => moveActiveThumbBySteps(tenStepsUp),
  'shift+pageup': () => moveActiveThumbBySteps(tenStepsUp),
  'pagedown': () => moveActiveThumbBySteps(tenStepsDown),
  'shift+pagedown': () => moveActiveThumbBySteps(tenStepsDown),
})

function readValueUnderPointer(pointerEvent: PointerEvent) {
  slidingControlBox ??= controlElement.value?.getBoundingClientRect()

  if (!slidingControlBox) return sliderValues.value[activeThumbIndex.value] ?? props.min

  return convertPointerToValue(
    pointerEvent.clientX - slidingControlBox.left,
    slidingControlBox.width,
    props.min,
    props.max,
  )
}

function chooseStackedThumbFromPointer(pointerValue: number) {
  const activeThumbValue = sliderValues.value[activeThumbIndex.value]

  if (!isStackedThumbChoicePending || snapToStep(pointerValue, props) === activeThumbValue) return

  activateThumb(findClosestThumbIndex(sliderValues.value, pointerValue))
  isStackedThumbChoicePending = false
}

function startSlidingFromPointer(pointerEvent: PointerEvent) {
  const pressedElement = pointerEvent.target

  if (pointerEvent.button !== 0 || !(pressedElement instanceof HTMLElement)) return

  isPointerPressing.value = true
  pressedElement.setPointerCapture(pointerEvent.pointerId)
  pointerEvent.preventDefault()

  if (props.disabled) return

  const pressedThumbIndex = thumbElements.indexOf(pressedElement)

  if (pressedThumbIndex >= 0) {
    activateThumb(pressedThumbIndex)
    isStackedThumbChoicePending = isThumbStacked(sliderValues.value, pressedThumbIndex)
    pressedElement.focus({ preventScroll: true, focusVisible: false })
    return
  }

  const pointerValue = readValueUnderPointer(pointerEvent)
  const closestThumbIndex = findClosestThumbIndex(sliderValues.value, pointerValue)

  activateThumb(closestThumbIndex)
  isStackedThumbChoicePending = isThumbStacked(sliderValues.value, closestThumbIndex)
  moveThumb(closestThumbIndex, pointerValue, false)
}

function slideToPointer(pointerEvent: PointerEvent) {
  const pressedElement = pointerEvent.target

  if (!(pressedElement instanceof HTMLElement) || !pressedElement.hasPointerCapture(pointerEvent.pointerId)) return

  const pointerValue = readValueUnderPointer(pointerEvent)

  chooseStackedThumbFromPointer(pointerValue)
  moveThumb(activeThumbIndex.value, pointerValue, false)
}

function stopSlidingFromPointer(pointerEvent: PointerEvent) {
  const pressedElement = pointerEvent.target

  isPointerPressing.value = false
  isStackedThumbChoicePending = false
  slidingControlBox = undefined

  if (pressedElement instanceof HTMLElement && pressedElement.hasPointerCapture(pointerEvent.pointerId)) {
    pressedElement.releasePointerCapture(pointerEvent.pointerId)
  }
}

function restoreInitialValues() {
  sliderValues.value = [...initialSliderValues]
}

function measureThumbSize([thumbResize]: ResizeObserverEntry[]) {
  measuredThumbSize.value = thumbResize?.borderBoxSize[0]?.inlineSize ?? thumbElements[0]?.offsetWidth
}

onMounted(() => {
  parentForm = rootElement.value?.closest('form') ?? null
  isInsideForm.value = Boolean(parentForm)
  parentForm?.addEventListener('reset', restoreInitialValues)

  if (!thumbElements[0]) return

  thumbResizeObserver = new ResizeObserver(measureThumbSize)
  thumbResizeObserver.observe(thumbElements[0])
})

onBeforeUnmount(() => {
  parentForm?.removeEventListener('reset', restoreInitialValues)
  thumbResizeObserver?.disconnect()
})
</script>

<template>
  <div ref="rootElement" :style="rootStyle" :class="sliderControlSlots.root({ class: [ui?.root, props.class] })">
    <span
      ref="controlElement"
      data-orientation="horizontal"
      :data-disabled="disabled ? '' : undefined"
      :style="controlStyle"
      :class="sliderControlSlots.control({ class: ui?.control })"
      @pointerdown="startSlidingFromPointer"
      @pointermove="slideToPointer"
      @pointerup="stopSlidingFromPointer"
      @pointercancel="stopSlidingFromPointer"
      @keydown="moveThumbFromKeys"
    >
      <span :class="sliderControlSlots.track({ class: ui?.track })">
        <span :style="rangeStyle" :class="sliderControlSlots.range({ class: ui?.range })" />
      </span>

      <span
        v-for="(thumbPercent, thumbIndex) in thumbPercents"
        :key="thumbIndex"
        :style="resolveThumbAnchorStyle(thumbPercent)"
        :class="
          sliderControlSlots.thumbAnchor({ isActiveThumb: thumbIndex === activeThumbIndex, class: ui?.thumbAnchor })
        "
      >
        <span
          :ref="(thumbElement) => registerThumbElement(thumbElement, thumbIndex)"
          role="slider"
          aria-orientation="horizontal"
          data-orientation="horizontal"
          v-bind="{ ...resolveThumbStateAttributes(thumbIndex), ...thumbAttributes }"
          :class="sliderControlSlots.thumb({ class: ui?.thumb })"
          @focus="activateThumb(thumbIndex)"
        />
      </span>
    </span>

    <template v-if="name || isInsideForm">
      <input
        v-for="(thumbValue, thumbIndex) in sliderValues"
        :key="thumbIndex"
        ref="formValueInputs"
        type="hidden"
        :name="name && sliderValues.length > 1 ? `${name}[]` : name"
        :value="thumbValue"
      />
    </template>

    <div v-if="sortedMarks.length > 0" ref="marksElement" :class="sliderControlSlots.marks({ class: ui?.marks })">
      <div
        v-for="sliderMark in sortedMarks"
        :key="sliderMark.value"
        :style="{ '--slider-mark-ratio': convertValueToRatio(sliderMark.value, min, max) }"
        :class="sliderControlSlots.mark({ class: ui?.mark })"
      >
        <span :class="sliderControlSlots.markLabel({ class: ui?.markLabel })">{{ sliderMark.label }}</span>
      </div>
    </div>
  </div>
</template>
