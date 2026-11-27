import type { SliderMark } from '../types/slider'
import { clampToRange } from './steppedValue'

/** Place a value along the track, from 0 at min to 1 at max, or 0 when the range is empty. */
export function convertValueToRatio(value: number, min: number, max: number) {
  return max > min ? (value - min) / (max - min) : 0
}

/** Convert a value to its position along the track, as a percentage kept between 0 and 100. */
export function convertValueToPercent(value: number, min: number, max: number) {
  return clampToRange(convertValueToRatio(value, min, max) * 100, 0, 100)
}

/** Read the value under a pointer from its distance to the start of the track. */
export function convertPointerToValue(pointerOffset: number, trackLength: number, min: number, max: number) {
  return trackLength > 0 ? min + ((max - min) / trackLength) * pointerOffset : min
}

/** Sort the marks along the track, and throw when one is outside the range or repeats a value. */
export function sortSliderMarks(sliderMarks: readonly SliderMark[], min: number, max: number) {
  const markValues = new Set<number>()

  for (const sliderMark of sliderMarks) {
    if (sliderMark.value < min || sliderMark.value > max) {
      throw new Error(`Slider mark value ${sliderMark.value} is out of bounds [${min}, ${max}]`)
    }

    if (markValues.has(sliderMark.value)) throw new Error('Slider marks must have unique values')

    markValues.add(sliderMark.value)
  }

  return [...sliderMarks].sort((firstMark, secondMark) => firstMark.value - secondMark.value)
}

/** Tell whether two neighboring mark labels come closer than the minimum spacing. */
export function hasCrowdedMarks(markBoxes: readonly Pick<DOMRect, 'left' | 'right'>[], minimumSpacing: number) {
  return markBoxes.some((markBox, markIndex) => {
    const nextMarkBox = markBoxes[markIndex + 1]

    return nextMarkBox !== undefined && markBox.right + minimumSpacing > nextMarkBox.left
  })
}
