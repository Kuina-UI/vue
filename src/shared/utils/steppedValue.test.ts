import { describe, expect, it } from 'vitest'
import { clampToRange, countStepDecimals, moveByStep, roundToDecimals, snapToStep } from './steppedValue'

describe('countStepDecimals', () => {
  it.each([
    [1, 0],
    [10, 0],
    [0.5, 1],
    [0.25, 2],
    [0.001, 3],
    [1e-7, 7],
    [1.5e-7, 8],
    [Number.POSITIVE_INFINITY, 0],
  ])('counts the decimals of %d', (step, expectedDecimalCount) => {
    expect(countStepDecimals(step)).toBe(expectedDecimalCount)
  })
})

describe('roundToDecimals', () => {
  it.each([
    [1.005, 2, 1.01],
    [0.1 + 0.2, 1, 0.3],
    [12.34, 0, 12],
    [-1.25, 1, -1.2],
    [1e-7, 7, 1e-7],
    [1234.5678, 2, 1234.57],
  ])('rounds %d to %i decimals', (value, decimalCount, expectedValue) => {
    expect(roundToDecimals(value, decimalCount)).toBe(expectedValue)
  })
})

describe('clampToRange', () => {
  it('keeps the value between min and max', () => {
    expect(clampToRange(-5, 0, 10)).toBe(0)
    expect(clampToRange(5, 0, 10)).toBe(5)
    expect(clampToRange(15, 0, 10)).toBe(10)
  })
})

describe('snapToStep', () => {
  it('rounds to the nearest step counted from min', () => {
    expect(snapToStep(1004, { min: 0, max: 2000, step: 10 })).toBe(1000)
    expect(snapToStep(1005, { min: 0, max: 2000, step: 10 })).toBe(1010)
    expect(snapToStep(4, { min: 1, max: 10, step: 2 })).toBe(5)
  })

  it('removes floating point noise from decimal steps', () => {
    expect(snapToStep(0.30000000000000004, { min: 0, max: 1, step: 0.1 })).toBe(0.3)
  })

  it('never leaves the range, even when max is not on a step', () => {
    expect(snapToStep(-20, { min: 0, max: 10, step: 3 })).toBe(0)
    expect(snapToStep(10, { min: 0, max: 10, step: 3 })).toBe(9)
    expect(snapToStep(11, { min: 0, max: 10, step: 4 })).toBe(10)
  })
})

describe('moveByStep', () => {
  const stepScale = { min: 0, step: 10 }

  it('moves an aligned value by whole steps', () => {
    expect(moveByStep(1000, stepScale, { direction: 1, stepCount: 1 })).toBe(1010)
    expect(moveByStep(1000, stepScale, { direction: -1, stepCount: 1 })).toBe(990)
    expect(moveByStep(1000, stepScale, { direction: 1, stepCount: 10 })).toBe(1100)
  })

  it('lands on the next step in the direction of a value between two steps', () => {
    expect(moveByStep(1005, stepScale, { direction: 1, stepCount: 1 })).toBe(1010)
    expect(moveByStep(1005, stepScale, { direction: -1, stepCount: 10 })).toBe(1000)
  })

  it('keeps decimal steps exact', () => {
    expect(moveByStep(0.2, { min: 0, step: 0.1 }, { direction: 1, stepCount: 1 })).toBe(0.3)
  })
})
