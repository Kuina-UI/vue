import {
  computed,
  type CSSProperties,
  onBeforeUnmount,
  onMounted,
  ref,
  type ShallowRef,
  shallowRef,
  watch,
  type WatchSource,
} from 'vue'

interface ThumbPlacement {
  offset: number
  width: number
}

export interface SlidingThumbOptions {
  trackElement: Readonly<ShallowRef<HTMLElement | null>>
  findSelectedElement: () => HTMLElement | null | undefined
  placementSources: WatchSource[]
}

const thumbRevealEdgeRatio = 0.15

/** Measure where the thumb covers the selected element, one pixel narrower when it would touch the end of the track. */
function measureThumbPlacement(trackElement: HTMLElement, selectedElement: HTMLElement): ThumbPlacement {
  const offset = selectedElement.offsetLeft
  const selectedWidth = Math.floor(selectedElement.clientWidth)
  const touchesTrackEnd = trackElement.scrollWidth - (offset + selectedWidth) < 2

  return { offset, width: Math.max(0, touchesTrackEnd ? selectedWidth - 1 : selectedWidth) }
}

function isSameThumbPlacement(currentPlacement: ThumbPlacement | undefined, nextPlacement: ThumbPlacement) {
  return currentPlacement?.offset === nextPlacement.offset && currentPlacement.width === nextPlacement.width
}

/** Scroll an overflowing track to center the thumb when it gets close to the visible edges. */
function revealThumbPlacement(trackElement: HTMLElement, placement: ThumbPlacement, scrollBehavior: ScrollBehavior) {
  const visibleWidth = trackElement.clientWidth

  if (trackElement.scrollWidth <= visibleWidth) return

  const edgeBuffer = visibleWidth * thumbRevealEdgeRatio
  const isNearVisibleEdge =
    placement.offset < trackElement.scrollLeft + edgeBuffer ||
    placement.offset + placement.width > trackElement.scrollLeft + visibleWidth - edgeBuffer

  if (isNearVisibleEdge) {
    trackElement.scrollTo({ left: placement.offset + placement.width / 2 - visibleWidth / 2, behavior: scrollBehavior })
  }
}

function runAfterAnimationFrames(frameCount: number, callback: () => void) {
  let remainingFrames = frameCount
  let frameRequestId = requestAnimationFrame(function countFrame() {
    remainingFrames -= 1

    if (remainingFrames === 0) callback()
    else frameRequestId = requestAnimationFrame(countFrame)
  })

  return () => cancelAnimationFrame(frameRequestId)
}

/** Slide a thumb under the selected element of a track, and jump without sliding when the track resizes. */
export function useSlidingThumb({ trackElement, findSelectedElement, placementSources }: SlidingThumbOptions) {
  const thumbPlacement = shallowRef<ThumbPlacement>()
  const isThumbPlaced = ref(false)
  const animatesThumb = ref(false)

  let cancelThumbAnimationResume: (() => void) | undefined
  let trackResizeObserver: ResizeObserver | undefined

  function measureSelectedPlacement() {
    const track = trackElement.value
    const selectedElement = findSelectedElement()

    return track && selectedElement ? { track, placement: measureThumbPlacement(track, selectedElement) } : undefined
  }

  function jumpThumbToSelection(revealBehavior?: ScrollBehavior) {
    const measurement = measureSelectedPlacement()

    if (!measurement || isSameThumbPlacement(thumbPlacement.value, measurement.placement)) return

    cancelThumbAnimationResume?.()
    animatesThumb.value = false
    thumbPlacement.value = measurement.placement

    if (revealBehavior) revealThumbPlacement(measurement.track, measurement.placement, revealBehavior)

    cancelThumbAnimationResume = runAfterAnimationFrames(2, () => {
      isThumbPlaced.value = true
      animatesThumb.value = true
    })
  }

  function slideThumbToSelection() {
    if (!isThumbPlaced.value) {
      jumpThumbToSelection('instant')
      return
    }

    const measurement = measureSelectedPlacement()

    if (!measurement) return

    thumbPlacement.value = measurement.placement
    revealThumbPlacement(measurement.track, measurement.placement, 'smooth')
  }

  onMounted(() => {
    jumpThumbToSelection('instant')

    if (!trackElement.value) return

    trackResizeObserver = new ResizeObserver(() => jumpThumbToSelection())
    trackResizeObserver.observe(trackElement.value)
  })

  onBeforeUnmount(() => {
    trackResizeObserver?.disconnect()
    cancelThumbAnimationResume?.()
  })

  watch(placementSources, slideThumbToSelection, { flush: 'post' })

  const thumbStyle = computed<CSSProperties | undefined>(() =>
    thumbPlacement.value
      ? { width: `${thumbPlacement.value.width}px`, transform: `translateX(${thumbPlacement.value.offset}px)` }
      : undefined,
  )

  return { thumbStyle, isThumbPlaced, animatesThumb }
}
