import { describe, expect, it } from 'vitest'
import { resolvePressScale } from './resolvePressScale'

describe('resolvePressScale', () => {
  it.each([
    [48, 0.96],
    [80, 0.96],
    [81, 0.97],
    [150, 0.97],
    [220, 0.98],
    [221, 0.985],
    [600, 0.985],
    [601, 0.995],
  ])('shrinks a %ipx wide element to %f of its width', (elementWidth, expectedScale) => {
    expect(resolvePressScale(elementWidth)).toBe(expectedScale)
  })
})
