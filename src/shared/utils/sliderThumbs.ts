export interface SliderThumbLimits {
  min: number
  max: number
  minRange: number
}

/** Find the values a thumb can take without passing its neighbors, kept minRange apart from them. */
export function resolveThumbBounds(thumbValues: readonly number[], thumbIndex: number, thumbLimits: SliderThumbLimits) {
  const previousThumbValue = thumbValues[thumbIndex - 1]
  const nextThumbValue = thumbValues[thumbIndex + 1]

  return {
    lowestValue: previousThumbValue === undefined ? thumbLimits.min : previousThumbValue + thumbLimits.minRange,
    highestValue: nextThumbValue === undefined ? thumbLimits.max : nextThumbValue - thumbLimits.minRange,
  }
}

/** Pick the thumb closest to a value; among stacked thumbs, the one on the side the value lies. */
export function findClosestThumbIndex(thumbValues: readonly number[], targetValue: number) {
  const thumbDistances = thumbValues.map((thumbValue) => Math.abs(thumbValue - targetValue))
  const closestDistance = Math.min(...thumbDistances)
  const firstClosestIndex = thumbDistances.indexOf(closestDistance)
  const lastClosestIndex = thumbDistances.lastIndexOf(closestDistance)
  const lastClosestValue = thumbValues[lastClosestIndex] ?? targetValue

  return targetValue > lastClosestValue ? lastClosestIndex : firstClosestIndex
}

export function isThumbStacked(thumbValues: readonly number[], thumbIndex: number) {
  return thumbValues.some(
    (thumbValue, otherThumbIndex) => otherThumbIndex !== thumbIndex && thumbValue === thumbValues[thumbIndex],
  )
}
