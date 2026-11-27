import { computed, type MaybeRefOrGetter, onMounted, shallowRef, toValue, watch } from 'vue'
import type { PointerGraceArea } from '../types/pointer-grace-area'
import { createPointerGraceArea, isPointInPolygon } from '../utils/pointerGraceArea'

type MaybeElement = HTMLElement | null | undefined

interface PointerGraceAreaOptions {
  active: MaybeRefOrGetter<boolean>
  onPointerLeaveArea: () => void
}

/** Let the pointer travel between an anchor and its floating element, and report when it strays from that path. */
export function usePointerGraceArea(
  anchorElement: MaybeRefOrGetter<MaybeElement>,
  floatingElement: MaybeRefOrGetter<MaybeElement>,
  options: PointerGraceAreaOptions,
) {
  const pointerGraceArea = shallowRef<PointerGraceArea>()

  const isPointerInTransit = computed(() => pointerGraceArea.value !== undefined)

  function removeGraceArea() {
    pointerGraceArea.value = undefined
  }

  function createGraceAreaTowards(pointerLeaveEvent: PointerEvent, targetElement: HTMLElement) {
    const leftElement = pointerLeaveEvent.currentTarget

    if (!(leftElement instanceof HTMLElement)) return

    pointerGraceArea.value = createPointerGraceArea(
      { x: pointerLeaveEvent.clientX, y: pointerLeaveEvent.clientY },
      leftElement.getBoundingClientRect(),
      targetElement.getBoundingClientRect(),
    )
  }

  onMounted(() => {
    watch(
      () => [toValue(options.active), toValue(anchorElement), toValue(floatingElement)] as const,
      ([isActive, anchor, floating], _previousState, onCleanup) => {
        if (!isActive || !anchor || !floating) return

        const createGraceAreaTowardsFloating = (pointerLeaveEvent: PointerEvent) =>
          createGraceAreaTowards(pointerLeaveEvent, floating)
        const createGraceAreaTowardsAnchor = (pointerLeaveEvent: PointerEvent) =>
          createGraceAreaTowards(pointerLeaveEvent, anchor)

        anchor.addEventListener('pointerleave', createGraceAreaTowardsFloating)
        floating.addEventListener('pointerleave', createGraceAreaTowardsAnchor)

        onCleanup(() => {
          anchor.removeEventListener('pointerleave', createGraceAreaTowardsFloating)
          floating.removeEventListener('pointerleave', createGraceAreaTowardsAnchor)
          removeGraceArea()
        })
      },
      { immediate: true },
    )

    watch(pointerGraceArea, (currentGraceArea, _previousGraceArea, onCleanup) => {
      if (!currentGraceArea) return

      const followPointerInGraceArea = (pointerMoveEvent: PointerEvent) => {
        const pointedTarget = pointerMoveEvent.target
        const hasReachedElement =
          pointedTarget instanceof Node &&
          (toValue(anchorElement)?.contains(pointedTarget) || toValue(floatingElement)?.contains(pointedTarget))

        if (hasReachedElement) {
          removeGraceArea()
          return
        }

        if (!isPointInPolygon({ x: pointerMoveEvent.clientX, y: pointerMoveEvent.clientY }, currentGraceArea)) {
          removeGraceArea()
          options.onPointerLeaveArea()
        }
      }

      document.addEventListener('pointermove', followPointerInGraceArea)

      onCleanup(() => document.removeEventListener('pointermove', followPointerInGraceArea))
    })
  })

  return { isPointerInTransit }
}
