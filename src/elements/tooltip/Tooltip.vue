<script lang="ts">
import type { VNode } from 'vue'
import type { FloatingAlign, FloatingSide } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TooltipSlotName, TooltipThemeVariants } from './tooltip.theme'

export interface TooltipProps {
  content?: string
  label?: string
  side?: FloatingSide
  align?: FloatingAlign
  sideOffset?: number
  alignOffset?: number
  maxWidth?: number | 'none'
  gutterSize?: TooltipThemeVariants['gutterSize']
  compact?: boolean
  openDelay?: number
  interactive?: boolean
  preventUnintentionalClickToClose?: boolean
  ui?: Partial<Record<TooltipSlotName, ClassNameValue>>
  class?: ClassNameValue
}

export interface TooltipSlots {
  default?: () => VNode[]
  content?: () => VNode[]
}
</script>

<script setup lang="ts">
import {
  cloneVNode,
  type ComponentPublicInstance,
  computed,
  createCommentVNode,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  Text,
  useAttrs,
  useId,
  useTemplateRef,
  watch,
} from 'vue'
import { useDismissOnOutsidePointerDown } from '../../shared/composables/useDismissOnOutsidePointerDown'
import { useFloatingPosition } from '../../shared/composables/useFloatingPosition'
import { usePointerGraceArea } from '../../shared/composables/usePointerGraceArea'
import { useShortcuts } from '../../shared/composables/useShortcuts'
import { findFirstRenderedVNode } from '../../shared/utils/findFirstRenderedVNode'
import { flipFloatingPosition } from '../../shared/utils/flipFloatingPosition'
import { shiftFloatingPosition } from '../../shared/utils/shiftFloatingPosition'
import { tooltipTheme } from './tooltip.theme'
import { useTooltipOpenState } from './useTooltipOpenState'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TooltipProps>(), {
  side: 'top',
  align: 'center',
  sideOffset: 5,
  alignOffset: 0,
  maxWidth: 300,
  gutterSize: 'md',
  openDelay: 150,
})

const isOpen = defineModel<boolean>('open', { default: false })

const slots = defineSlots<TooltipSlots>()
const forwardedTriggerAttributes = useAttrs()

const viewportCollisionPadding = 15

const tooltipId = useId()
const triggerElement = shallowRef<HTMLElement>()
const tooltipBubble = useTemplateRef<HTMLElement>('tooltipBubble')
let isPointerPressingTrigger = false
let hasPointerMoveOpenedTooltip = false

function hasTooltipContent() {
  return Boolean(props.content) || Boolean(slots.content)
}

function isTooltipShown() {
  return isOpen.value && hasTooltipContent()
}

const {
  tooltipState,
  openTooltipNow,
  openTooltipOnPointerEnter,
  cancelPendingOpen,
  closeTooltip,
  closeTooltipOnTriggerPress,
} = useTooltipOpenState(isOpen, {
  openDelay: () => props.openDelay,
  hasContent: hasTooltipContent,
  preventUnintentionalClickToClose: () => props.preventUnintentionalClickToClose,
})

const { floatingStyles } = useFloatingPosition(triggerElement, tooltipBubble, {
  open: isTooltipShown,
  side: () => props.side,
  align: () => props.align,
  sideOffset: () => props.sideOffset,
  alignOffset: () => props.alignOffset,
  strategy: 'fixed',
  positionModifiers: [
    flipFloatingPosition(viewportCollisionPadding),
    shiftFloatingPosition(viewportCollisionPadding),
  ],
})

const { isPointerInTransit } = usePointerGraceArea(triggerElement, tooltipBubble, {
  active: () => props.interactive && isOpen.value,
  onPointerLeaveArea: closeTooltip,
})

useShortcuts({ escape: { handler: closeTooltip, allowInEditable: true } }, { enabled: isOpen })

useDismissOnOutsidePointerDown([triggerElement, tooltipBubble], { active: isOpen, onDismiss: closeTooltip })

const tooltipSlots = computed(() =>
  tooltipTheme({ gutterSize: props.gutterSize, compact: props.compact, open: tooltipState.value !== 'closed' }),
)

const bubbleStyles = computed(() => ({
  ...floatingStyles.value,
  maxWidth: props.maxWidth === 'none' ? undefined : `${props.maxWidth}px`,
}))

function releaseTriggerPress() {
  isPointerPressingTrigger = false
}

function openTooltipOnTriggerPointerMove(pointerMoveEvent: PointerEvent) {
  if (pointerMoveEvent.defaultPrevented || pointerMoveEvent.pointerType === 'touch') return
  if (hasPointerMoveOpenedTooltip || isPointerInTransit.value) return

  openTooltipOnPointerEnter()
  hasPointerMoveOpenedTooltip = true
}

function closeTooltipOnTriggerPointerLeave(pointerLeaveEvent: PointerEvent) {
  if (pointerLeaveEvent.defaultPrevented) return

  if (props.interactive) cancelPendingOpen()
  else closeTooltip()

  hasPointerMoveOpenedTooltip = false
}

function closeTooltipOnTriggerPointerDown(pointerDownEvent: PointerEvent) {
  if (pointerDownEvent.defaultPrevented) return

  if (isOpen.value) closeTooltipOnTriggerPress()

  isPointerPressingTrigger = true
  document.addEventListener('pointerup', releaseTriggerPress, { once: true })
}

function openTooltipOnTriggerFocus(focusEvent: FocusEvent) {
  if (focusEvent.defaultPrevented || isPointerPressingTrigger) return

  openTooltipNow()
}

function closeTooltipOnTriggerBlur(blurEvent: FocusEvent) {
  if (!blurEvent.defaultPrevented) closeTooltip()
}

function closeTooltipOnTriggerClick(clickEvent: MouseEvent) {
  if (!clickEvent.defaultPrevented) closeTooltipOnTriggerPress()
}

function captureTriggerElement(triggerReference: Element | ComponentPublicInstance | null) {
  const triggerRoot = triggerReference instanceof Element ? triggerReference : triggerReference?.$el

  triggerElement.value = triggerRoot instanceof HTMLElement ? triggerRoot : undefined
}

function describeTrigger(existingDescription: unknown) {
  const describingIds = new Set(String(existingDescription ?? '').split(/\s+/).filter(Boolean))

  if (isTooltipShown()) describingIds.add(tooltipId)

  return describingIds.size > 0 ? [...describingIds].join(' ') : undefined
}

function renderDecoratedTrigger(triggerText: string) {
  return h('span', { tabindex: 0, class: tooltipSlots.value.trigger({ class: props.ui?.trigger }) }, triggerText)
}

function findTriggerVNode() {
  if (props.label) return renderDecoratedTrigger(props.label)

  const slotTriggerVNode = findFirstRenderedVNode(slots.default?.() ?? [])

  return slotTriggerVNode?.type === Text ? renderDecoratedTrigger(String(slotTriggerVNode.children)) : slotTriggerVNode
}

function renderTooltipTrigger() {
  const triggerVNode = findTriggerVNode()

  if (!triggerVNode) return createCommentVNode('')

  return cloneVNode(
    triggerVNode,
    {
      ...forwardedTriggerAttributes,
      'ref': captureTriggerElement,
      'aria-describedby': describeTrigger(
        triggerVNode.props?.['aria-describedby'] ?? forwardedTriggerAttributes['aria-describedby'],
      ),
      'data-state': tooltipState.value,
      'onPointermove': openTooltipOnTriggerPointerMove,
      'onPointerleave': closeTooltipOnTriggerPointerLeave,
      'onPointerdown': closeTooltipOnTriggerPointerDown,
      'onFocusin': openTooltipOnTriggerFocus,
      'onFocusout': closeTooltipOnTriggerBlur,
      'onClick': closeTooltipOnTriggerClick,
    },
    true,
  )
}

onMounted(() => {
  watch(
    [isOpen, triggerElement],
    ([isNowOpen, trigger], _previousState, onCleanup) => {
      if (!isNowOpen || !trigger) return

      const closeTooltipOnTriggerScroll = (scrollEvent: Event) => {
        if (scrollEvent.target instanceof Node && scrollEvent.target.contains(trigger)) closeTooltip()
      }

      window.addEventListener('scroll', closeTooltipOnTriggerScroll, { capture: true, passive: true })

      onCleanup(() => window.removeEventListener('scroll', closeTooltipOnTriggerScroll, { capture: true }))
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => document.removeEventListener('pointerup', releaseTriggerPress))
</script>

<template>
  <component :is="renderTooltipTrigger()" />

  <Teleport to="body">
    <div
      v-if="isTooltipShown()"
      :id="tooltipId"
      ref="tooltipBubble"
      role="tooltip"
      :data-state="tooltipState"
      :style="bubbleStyles"
      :class="tooltipSlots.base({ class: [ui?.base, props.class] })"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </Teleport>
</template>
