import { describe, expect, it } from 'vitest'
import { findClosestThumbIndex, isThumbStacked, resolveThumbBounds } from './sliderThumbs'

describe('resolveThumbBounds', () => {
  const thumbLimits = { min: 0, max: 5000, minRange: 0 }

  it('lets a single thumb use the whole range', () => {
    expect(resolveThumbBounds([1000], 0, thumbLimits)).toEqual({ lowestValue: 0, highestValue: 5000 })
  })

  it('stops each thumb at its neighbor', () => {
    expect(resolveThumbBounds([500, 2000], 0, thumbLimits)).toEqual({ lowestValue: 0, highestValue: 2000 })
    expect(resolveThumbBounds([500, 2000], 1, thumbLimits)).toEqual({ lowestValue: 500, highestValue: 5000 })
  })

  it('keeps the thumbs minRange apart', () => {
    const spacedLimits = { ...thumbLimits, minRange: 250 }

    expect(resolveThumbBounds([500, 2000], 0, spacedLimits)).toEqual({ lowestValue: 0, highestValue: 1750 })
    expect(resolveThumbBounds([500, 2000], 1, spacedLimits)).toEqual({ lowestValue: 750, highestValue: 5000 })
  })
})

describe('findClosestThumbIndex', () => {
  it('picks the closest thumb', () => {
    expect(findClosestThumbIndex([500, 2000], 800)).toBe(0)
    expect(findClosestThumbIndex([500, 2000], 1500)).toBe(1)
    expect(findClosestThumbIndex([500, 2000], 4000)).toBe(1)
  })

  it('picks the first thumb when two different thumbs are as close', () => {
    expect(findClosestThumbIndex([2, 4], 3)).toBe(0)
  })

  it('picks stacked thumbs by the side of the value', () => {
    expect(findClosestThumbIndex([2500, 2500], 3000)).toBe(1)
    expect(findClosestThumbIndex([2500, 2500], 2000)).toBe(0)
    expect(findClosestThumbIndex([5000, 5000], 4000)).toBe(0)
    expect(findClosestThumbIndex([0, 0], 100)).toBe(1)
  })
})

describe('isThumbStacked', () => {
  it('tells whether another thumb has the same value', () => {
    expect(isThumbStacked([2500, 2500], 0)).toBe(true)
    expect(isThumbStacked([500, 2000], 1)).toBe(false)
    expect(isThumbStacked([1000], 0)).toBe(false)
  })
})
