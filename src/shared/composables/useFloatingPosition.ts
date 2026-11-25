import {
  computed,
  type CSSProperties,
  type MaybeRefOrGetter,
  nextTick,
  onMounted,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import type {
  FloatingAlign,
  FloatingPlacement,
  FloatingPosition,
  FloatingPositionContext,
  FloatingPositionModifier,
  FloatingSide,
  FloatingStrategy,
} from '../types/floating-position'
import { computeFloatingPosition } from '../utils/computeFloatingPosition'

type MaybeElement = HTMLElement | null | undefined

export interface FloatingPositionOptions {
  open: MaybeRefOrGetter<boolean>
  side?: MaybeRefOrGetter<FloatingSide>
  align?: MaybeRefOrGetter<FloatingAlign>
  sideOffset?: MaybeRefOrGetter<number>
  alignOffset?: MaybeRefOrGetter<number>
  strategy?: MaybeRefOrGetter<FloatingStrategy>
  positionModifiers?: MaybeRefOrGetter<FloatingPositionModifier[]>
}

/** Find where the coordinates of the floating element start, in viewport coordinates. */
function measureContainingBlockOrigin(floatingElement: HTMLElement, strategy: FloatingStrategy) {
  if (strategy === 'fixed') return { x: 0, y: 0 }

  const containingElement = floatingElement.offsetParent
  const isPageContainingBlock =
    !(containingElement instanceof HTMLElement) ||
    ((containingElement === document.body || containingElement === document.documentElement) &&
      getComputedStyle(containingElement).position === 'static')

  if (isPageContainingBlock) return { x: -window.scrollX, y: -window.scrollY }

  const containingBounds = containingElement.getBoundingClientRect()

  return {
    x: containingBounds.x + containingElement.clientLeft - containingElement.scrollLeft,
    y: containingBounds.y + containingElement.clientTop - containingElement.scrollTop,
  }
}

function roundToDevicePixel(coordinate: number) {
  return Math.round(coordinate * window.devicePixelRatio) / window.devicePixelRatio
}

function isSameFloatingPosition(currentPosition: FloatingPosition | undefined, nextPosition: FloatingPosition) {
  return (
    currentPosition?.x === nextPosition.x &&
    currentPosition.y === nextPosition.y &&
    currentPosition.placement.side === nextPosition.placement.side &&
    currentPosition.placement.align === nextPosition.placement.align
  )
}

/** Keep a floating element, such as a dropdown panel, placed against its anchor while it is open. */
export function useFloatingPosition(
  anchorElement: MaybeRefOrGetter<MaybeElement>,
  floatingElement: MaybeRefOrGetter<MaybeElement>,
  options: FloatingPositionOptions,
) {
  const floatingPosition = shallowRef<FloatingPosition>()
  const anchorWidth = shallowRef(0)

  const strategy = computed(() => toValue(options.strategy) ?? 'absolute')

  const requestedPlacement = computed<FloatingPlacement>(() => ({
    side: toValue(options.side) ?? 'bottom',
    align: toValue(options.align) ?? 'start',
    sideOffset: toValue(options.sideOffset) ?? 0,
    alignOffset: toValue(options.alignOffset) ?? 0,
  }))

  function updatePosition() {
    const anchor = toValue(anchorElement)
    const floating = toValue(floatingElement)

    if (!toValue(options.open) || !anchor || !floating) return

    const anchorBounds = anchor.getBoundingClientRect()

    if (anchorBounds.width !== anchorWidth.value) {
      anchorWidth.value = anchorBounds.width
      nextTick(updatePosition)
      return
    }

    const positionContext: FloatingPositionContext = {
      anchorRect: { x: anchorBounds.x, y: anchorBounds.y, width: anchorBounds.width, height: anchorBounds.height },
      floatingSize: { width: floating.offsetWidth, height: floating.offsetHeight },
      viewportSize: {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
    }

    const viewportPosition = computeFloatingPosition(
      positionContext,
      requestedPlacement.value,
      toValue(options.positionModifiers),
    )
    const containingBlockOrigin = measureContainingBlockOrigin(floating, strategy.value)

    const nextPosition: FloatingPosition = {
      x: roundToDevicePixel(viewportPosition.x - containingBlockOrigin.x),
      y: roundToDevicePixel(viewportPosition.y - containingBlockOrigin.y),
      placement: viewportPosition.placement,
    }

    if (!isSameFloatingPosition(floatingPosition.value, nextPosition)) floatingPosition.value = nextPosition
  }

  function updatePositionOnAnchorScroll(scrollEvent: Event) {
    const scrolledTarget = scrollEvent.target
    const isPageScroll = scrolledTarget === document || scrolledTarget === document.documentElement

    if (isPageScroll) {
      if (strategy.value === 'fixed') updatePosition()
      return
    }

    const anchor = toValue(anchorElement)

    if (anchor && scrolledTarget instanceof Node && scrolledTarget.contains(anchor)) updatePosition()
  }

  onMounted(() => {
    watch(
      () => [toValue(options.open), toValue(anchorElement), toValue(floatingElement)] as const,
      ([isOpen, anchor, floating], _previousState, onCleanup) => {
        if (!isOpen || !anchor || !floating) return

        updatePosition()

        const sizeObserver = new ResizeObserver(() => updatePosition())
        sizeObserver.observe(anchor)
        sizeObserver.observe(floating)

        window.addEventListener('scroll', updatePositionOnAnchorScroll, { capture: true, passive: true })
        window.addEventListener('resize', updatePosition, { passive: true })

        onCleanup(() => {
          sizeObserver.disconnect()
          window.removeEventListener('scroll', updatePositionOnAnchorScroll, { capture: true })
          window.removeEventListener('resize', updatePosition)
        })
      },
      { immediate: true, flush: 'post' },
    )

    watch([requestedPlacement, strategy, () => toValue(options.positionModifiers)], updatePosition, {
      flush: 'post',
    })
  })

  const isPositioned = computed(() => floatingPosition.value !== undefined)

  const floatingStyles = computed<CSSProperties>(() => ({
    position: strategy.value,
    top: `${floatingPosition.value?.y ?? 0}px`,
    left: `${floatingPosition.value?.x ?? 0}px`,
    visibility: isPositioned.value ? undefined : 'hidden',
    '--floating-anchor-width': `${anchorWidth.value}px`,
  }))

  const floatingPlacement = computed(() => floatingPosition.value?.placement ?? requestedPlacement.value)

  return { floatingStyles, floatingPlacement, isPositioned, updatePosition }
}
