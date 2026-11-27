import { describe, expect, it } from 'vitest'
import {
  computeConvexHull,
  createPointerGraceArea,
  findPointerExitSide,
  isPointInPolygon,
  padPointerExitPoint,
} from './pointerGraceArea'

const triggerEdges = { top: 200, right: 140, bottom: 232, left: 100 }
const tooltipEdges = { top: 120, right: 270, bottom: 195, left: -30 }

describe('findPointerExitSide', () => {
  it('finds the edge closest to where the pointer left', () => {
    expect(findPointerExitSide({ x: 120, y: 201 }, triggerEdges)).toBe('top')
    expect(findPointerExitSide({ x: 120, y: 231 }, triggerEdges)).toBe('bottom')
    expect(findPointerExitSide({ x: 101, y: 216 }, triggerEdges)).toBe('left')
    expect(findPointerExitSide({ x: 139, y: 216 }, triggerEdges)).toBe('right')
  })

  it('prefers the left and right edges when the pointer leaves through a corner', () => {
    expect(findPointerExitSide({ x: 100, y: 200 }, triggerEdges)).toBe('left')
  })
})

describe('padPointerExitPoint', () => {
  it('sets two points back inside the element, five pixels on each side of the exit point', () => {
    expect(padPointerExitPoint({ x: 120, y: 200 }, 'top')).toEqual([
      { x: 115, y: 205 },
      { x: 125, y: 205 },
    ])
    expect(padPointerExitPoint({ x: 140, y: 216 }, 'right')).toEqual([
      { x: 135, y: 211 },
      { x: 135, y: 221 },
    ])
  })
})

describe('computeConvexHull', () => {
  it('drops the points inside the hull', () => {
    const hull = computeConvexHull([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ])

    expect(hull).toHaveLength(4)
    expect(hull).not.toContainEqual({ x: 5, y: 5 })
  })

  it('keeps a single point as it is', () => {
    expect(computeConvexHull([{ x: 3, y: 4 }])).toEqual([{ x: 3, y: 4 }])
  })
})

describe('isPointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ]

  it('tells points inside from points outside', () => {
    expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true)
    expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false)
  })
})

describe('createPointerGraceArea', () => {
  const graceArea = createPointerGraceArea({ x: 120, y: 200 }, triggerEdges, tooltipEdges)

  it('covers the path from the trigger to the tooltip above it', () => {
    expect(isPointInPolygon({ x: 120, y: 198 }, graceArea)).toBe(true)
    expect(isPointInPolygon({ x: 200, y: 150 }, graceArea)).toBe(true)
  })

  it('leaves out the space beside that path', () => {
    expect(isPointInPolygon({ x: 260, y: 199 }, graceArea)).toBe(false)
    expect(isPointInPolygon({ x: 120, y: 240 }, graceArea)).toBe(false)
  })
})
