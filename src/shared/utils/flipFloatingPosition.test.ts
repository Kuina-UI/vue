import { describe, expect, it } from 'vitest'
import type { FloatingPlacement, FloatingPositionContext, FloatingSide } from '../types/floating-position'
import { computeFloatingPosition } from './computeFloatingPosition'
import { flipFloatingPosition } from './flipFloatingPosition'

const viewportSize = { width: 1000, height: 800 }
const floatingSize = { width: 200, height: 300 }

function createPositionContext(anchorX: number, anchorY: number): FloatingPositionContext {
  return { anchorRect: { x: anchorX, y: anchorY, width: 100, height: 40 }, floatingSize, viewportSize }
}

function createPlacement(side: FloatingSide): FloatingPlacement {
  return { side, align: 'start', sideOffset: 6, alignOffset: 0 }
}

function placeWithFlip(positionContext: FloatingPositionContext, side: FloatingSide) {
  return computeFloatingPosition(positionContext, createPlacement(side), [flipFloatingPosition()])
}

describe('flipFloatingPosition', () => {
  it('keeps the requested side when the floating element fits', () => {
    expect(placeWithFlip(createPositionContext(100, 100), 'bottom').placement.side).toBe('bottom')
  })

  it('opens above when there is no room below', () => {
    const floatingPosition = placeWithFlip(createPositionContext(100, 600), 'bottom')

    expect(floatingPosition).toMatchObject({ y: 600 - 300 - 6, placement: { side: 'top' } })
  })

  it('opens below when there is no room above', () => {
    expect(placeWithFlip(createPositionContext(100, 50), 'top').placement.side).toBe('bottom')
  })

  it('opens on the left when there is no room on the right, and the other way around', () => {
    expect(placeWithFlip(createPositionContext(850, 100), 'right')).toMatchObject({
      x: 850 - 200 - 6,
      placement: { side: 'left' },
    })
    expect(placeWithFlip(createPositionContext(20, 100), 'left').placement.side).toBe('right')
  })

  it('stays on the requested side when the opposite side has even less room', () => {
    const positionContext: FloatingPositionContext = {
      anchorRect: { x: 100, y: 250, width: 100, height: 40 },
      floatingSize: { width: 200, height: 500 },
      viewportSize,
    }

    expect(placeWithFlip(positionContext, 'bottom').placement.side).toBe('bottom')
  })

  it('keeps a margin from the edge of the viewport', () => {
    const anchorTouchingTheMargin = createPositionContext(100, 800 - 300 - 6 - 40 - 4)

    expect(placeWithFlip(anchorTouchingTheMargin, 'bottom').placement.side).toBe('top')
  })
})
