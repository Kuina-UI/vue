import { describe, expect, it } from 'vitest'
import type { BoxRect, FloatingPlacement, FloatingSide } from '../types/floating-position'
import { computeFloatingPosition } from './computeFloatingPosition'
import { shiftFloatingPosition } from './shiftFloatingPosition'

const viewportSize = { width: 1000, height: 800 }
const floatingSize = { width: 300, height: 120 }
const viewportPadding = 15

function placeWithShift(anchorRect: BoxRect, side: FloatingSide) {
  const placement: FloatingPlacement = { side, align: 'center', sideOffset: 5, alignOffset: 0 }

  return computeFloatingPosition({ anchorRect, floatingSize, viewportSize }, placement, [
    shiftFloatingPosition(viewportPadding),
  ])
}

describe('shiftFloatingPosition', () => {
  it('keeps a centered position that fits', () => {
    expect(placeWithShift({ x: 450, y: 400, width: 100, height: 32 }, 'top').x).toBe(350)
  })

  it('slides right to stay away from the left edge of the viewport', () => {
    expect(placeWithShift({ x: 20, y: 400, width: 100, height: 32 }, 'top').x).toBe(viewportPadding)
  })

  it('slides left to stay away from the right edge of the viewport', () => {
    expect(placeWithShift({ x: 900, y: 400, width: 80, height: 32 }, 'bottom').x).toBe(1000 - viewportPadding - 300)
  })

  it('never slides past the anchor, so the floating element keeps touching it', () => {
    expect(placeWithShift({ x: -60, y: 400, width: 40, height: 32 }, 'top').x).toBe(-60 + 40)
  })

  it('slides vertically for the left and right sides', () => {
    expect(placeWithShift({ x: 400, y: 10, width: 100, height: 32 }, 'right').y).toBe(viewportPadding)
    expect(placeWithShift({ x: 400, y: 760, width: 100, height: 32 }, 'left').y).toBe(800 - viewportPadding - 120)
  })
})
