export interface StepScale {
  min: number
  max: number
  step: number
}

export interface StepMove {
  direction: 1 | -1
  stepCount: number
}

/** Count the decimals of a step, including steps written in scientific notation like 1e-7. */
export function countStepDecimals(step: number) {
  if (!Number.isFinite(step)) return 0

  const [coefficient = '', exponent] = String(step).split('e')
  const coefficientDecimalCount = coefficient.split('.')[1]?.length ?? 0

  return Math.max(0, coefficientDecimalCount - Number(exponent ?? 0))
}

/** Round a number to a count of decimals by shifting its exponent, so 1.005 rounds to 1.01. */
export function roundToDecimals(value: number, decimalCount: number) {
  const [shiftedCoefficient = '', shiftedExponent] = String(value).split('e')
  const roundedShiftedValue = Math.round(Number(`${shiftedCoefficient}e${Number(shiftedExponent ?? 0) + decimalCount}`))
  const [roundedCoefficient = '', roundedExponent] = String(roundedShiftedValue).split('e')

  return Number(`${roundedCoefficient}e${Number(roundedExponent ?? 0) - decimalCount}`)
}

export function clampToRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Round a value to the nearest step counted from min, then keep it between min and max. */
export function snapToStep(value: number, { min, max, step }: StepScale) {
  const nearestStepValue = Math.round((value - min) / step) * step + min

  return clampToRange(roundToDecimals(nearestStepValue, countStepDecimals(step)), min, max)
}

/** Move a value by whole steps; a value between two steps first lands on the next step in that direction. */
export function moveByStep(value: number, { min, step }: Omit<StepScale, 'max'>, { direction, stepCount }: StepMove) {
  const stepDecimalCount = countStepDecimals(step)
  const stepsFromMin = (value - min) / step
  const nearestStepCount = Math.round(stepsFromMin)
  const isOnStep =
    roundToDecimals(nearestStepCount * step + min, stepDecimalCount) === roundToDecimals(value, stepDecimalCount)

  let targetStepCount = direction > 0 ? Math.ceil(stepsFromMin) : Math.floor(stepsFromMin)

  if (isOnStep) targetStepCount = nearestStepCount + stepCount * direction

  return roundToDecimals(targetStepCount * step + min, stepDecimalCount)
}
