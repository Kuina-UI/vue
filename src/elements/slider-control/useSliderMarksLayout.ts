import { nextTick, ref, type ShallowRef, watch, type WatchSource } from 'vue'
import type { SliderMarksLayout } from '../../shared/types/slider'
import { hasCrowdedMarks } from '../../shared/utils/sliderPosition'

const minimumMarkSpacing = 16

/** Fit the mark labels under the track: wrap their words when they collide, then hide them all when they still do. */
export function useSliderMarksLayout(marksElement: Readonly<ShallowRef<HTMLElement | null>>, layoutSources: WatchSource[]) {
  const marksLayout = ref<SliderMarksLayout>('inline')
  let latestLayoutRequest = 0
  let measuredMarksWidth: number | undefined

  function areMarksCrowded() {
    const markElements = [...(marksElement.value?.children ?? [])]

    return hasCrowdedMarks(
      markElements.map((markElement) => markElement.getBoundingClientRect()),
      minimumMarkSpacing,
    )
  }

  async function fitMarksInTrack() {
    const layoutRequest = ++latestLayoutRequest
    const isLayoutRequestOutdated = () => layoutRequest !== latestLayoutRequest

    marksLayout.value = 'inline'
    await nextTick()

    if (isLayoutRequestOutdated() || !areMarksCrowded()) return

    marksLayout.value = 'wrapped'
    await nextTick()

    if (isLayoutRequestOutdated() || !areMarksCrowded()) return

    marksLayout.value = 'hidden'
  }

  watch(
    marksElement,
    (shownMarksElement, _previousMarksElement, onCleanup) => {
      if (!shownMarksElement) return

      measuredMarksWidth = undefined

      const marksResizeObserver = new ResizeObserver(([marksResize]) => {
        const marksWidth = marksResize?.contentRect.width

        if (marksWidth === measuredMarksWidth) return

        measuredMarksWidth = marksWidth
        fitMarksInTrack()
      })

      marksResizeObserver.observe(shownMarksElement)

      onCleanup(() => marksResizeObserver.disconnect())
    },
    { flush: 'post' },
  )

  watch(layoutSources, fitMarksInTrack, { flush: 'post' })

  return { marksLayout }
}
