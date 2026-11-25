import { describe, expect, it, vi } from 'vitest'
import type { FloatingPlacement, FloatingPositionContext, FloatingPositionModifier } from '../types/floating-position'
import { computeFloatingPosition, placeFloatingAgainstAnchor } from './computeFloatingPosition'

const positionContext: FloatingPositionContext = {
  anchorRect: { x: 100, y: 50, width: 200, height: 40 },
  floatingSize: { width: 120, height: 300 },
  viewportSize: { width: 1280, height: 800 },
}

function createPlacement(overrides: Partial<FloatingPlacement> = {}): FloatingPlacement {
  return { side: 'bottom', align: 'start', sideOffset: 0, alignOffset: 0, ...overrides }
}

describe('placeFloatingAgainstAnchor', () => {
  it.each([
    { side: 'bottom', align: 'start', expectedX: 100, expectedY: 90 },
    { side: 'bottom', align: 'center', expectedX: 140, expectedY: 90 },
    { side: 'bottom', align: 'end', expectedX: 180, expectedY: 90 },
    { side: 'top', align: 'start', expectedX: 100, expectedY: -250 },
    { side: 'top', align: 'center', expectedX: 140, expectedY: -250 },
    { side: 'top', align: 'end', expectedX: 180, expectedY: -250 },
  ] as const)('places the floating element at $side-$align', ({ side, align, expectedX, expectedY }) => {
    const floatingPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ side, align }))

    expect(floatingPosition).toMatchObject({ x: expectedX, y: expectedY })
  })

  it('moves the floating element away from the anchor by the side offset', () => {
    const belowPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ sideOffset: 6 }))
    const abovePosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ side: 'top', sideOffset: 6 }))

    expect(belowPosition.y).toBe(96)
    expect(abovePosition.y).toBe(-256)
  })

  it('moves a start or end alignment inward by a positive align offset', () => {
    const startPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ alignOffset: 8 }))
    const endPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ align: 'end', alignOffset: 8 }))

    expect(startPosition.x).toBe(108)
    expect(endPosition.x).toBe(172)
  })

  it('moves a start or end alignment outward by a negative align offset', () => {
    const startPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ alignOffset: -5 }))
    const endPosition = placeFloatingAgainstAnchor(positionContext, createPlacement({ align: 'end', alignOffset: -5 }))

    expect(startPosition.x).toBe(95)
    expect(endPosition.x).toBe(185)
  })

  it('ignores the align offset when centered', () => {
    const centeredPosition = placeFloatingAgainstAnchor(
      positionContext,
      createPlacement({ align: 'center', alignOffset: 20 }),
    )

    expect(centeredPosition.x).toBe(140)
  })

  it('returns the placement it used', () => {
    const placement = createPlacement({ side: 'top', align: 'end' })

    expect(placeFloatingAgainstAnchor(positionContext, placement).placement).toEqual(placement)
  })
})

describe('computeFloatingPosition', () => {
  it('returns the base placement without modifiers', () => {
    const placement = createPlacement({ sideOffset: 6 })

    expect(computeFloatingPosition(positionContext, placement)).toEqual(
      placeFloatingAgainstAnchor(positionContext, placement),
    )
  })

  it('runs each modifier in order on the previous position', () => {
    const shiftRight = vi.fn<FloatingPositionModifier>((floatingPosition) => ({
      ...floatingPosition,
      x: floatingPosition.x + 10,
    }))
    const doubleX = vi.fn<FloatingPositionModifier>((floatingPosition) => ({
      ...floatingPosition,
      x: floatingPosition.x * 2,
    }))

    const floatingPosition = computeFloatingPosition(positionContext, createPlacement(), [shiftRight, doubleX])

    expect(floatingPosition.x).toBe(220)
    expect(shiftRight).toHaveBeenCalledWith(expect.objectContaining({ x: 100 }), positionContext)
    expect(doubleX).toHaveBeenCalledWith(expect.objectContaining({ x: 110 }), positionContext)
  })

  it('lets a modifier change the placement', () => {
    const flipToTop: FloatingPositionModifier = (floatingPosition, context) =>
      placeFloatingAgainstAnchor(context, { ...floatingPosition.placement, side: 'top' })

    const floatingPosition = computeFloatingPosition(positionContext, createPlacement({ sideOffset: 6 }), [flipToTop])

    expect(floatingPosition).toMatchObject({ y: -256, placement: { side: 'top', sideOffset: 6 } })
  })
})
