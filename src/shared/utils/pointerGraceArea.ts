import type {
  ElementEdges,
  PointerExitSide,
  PointerGraceArea,
  PointerPosition,
} from '../types/pointer-grace-area'

const exitPointPadding = 5

/** Find which edge of the element the pointer crossed when it left. */
export function findPointerExitSide(exitPoint: PointerPosition, leftElementEdges: ElementEdges): PointerExitSide {
  const distancesToEdges: [PointerExitSide, number][] = [
    ['left', Math.abs(leftElementEdges.left - exitPoint.x)],
    ['right', Math.abs(leftElementEdges.right - exitPoint.x)],
    ['top', Math.abs(leftElementEdges.top - exitPoint.y)],
    ['bottom', Math.abs(leftElementEdges.bottom - exitPoint.y)],
  ]

  return distancesToEdges.reduce((closestEdge, candidateEdge) =>
    candidateEdge[1] < closestEdge[1] ? candidateEdge : closestEdge,
  )[0]
}

/** Widen the exit point into two points, set back inside the element it left, so the area starts with some width. */
export function padPointerExitPoint(exitPoint: PointerPosition, exitSide: PointerExitSide): PointerPosition[] {
  const { x, y } = exitPoint
  const paddedExitPoints: Record<PointerExitSide, PointerPosition[]> = {
    top: [
      { x: x - exitPointPadding, y: y + exitPointPadding },
      { x: x + exitPointPadding, y: y + exitPointPadding },
    ],
    bottom: [
      { x: x - exitPointPadding, y: y - exitPointPadding },
      { x: x + exitPointPadding, y: y - exitPointPadding },
    ],
    left: [
      { x: x + exitPointPadding, y: y - exitPointPadding },
      { x: x + exitPointPadding, y: y + exitPointPadding },
    ],
    right: [
      { x: x - exitPointPadding, y: y - exitPointPadding },
      { x: x - exitPointPadding, y: y + exitPointPadding },
    ],
  }

  return paddedExitPoints[exitSide]
}

function listElementCorners({ top, right, bottom, left }: ElementEdges): PointerPosition[] {
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ]
}

function comparePointsByPosition(firstPoint: PointerPosition, secondPoint: PointerPosition) {
  return firstPoint.x - secondPoint.x || firstPoint.y - secondPoint.y
}

function turnsClockwiseOrStraight(origin: PointerPosition, pivot: PointerPosition, nextPoint: PointerPosition) {
  return (pivot.x - origin.x) * (nextPoint.y - origin.y) >= (pivot.y - origin.y) * (nextPoint.x - origin.x)
}

function buildHullChain(sortedPoints: PointerPosition[]) {
  const hullChain: PointerPosition[] = []

  for (const nextPoint of sortedPoints) {
    while (
      hullChain.length >= 2 &&
      turnsClockwiseOrStraight(hullChain[hullChain.length - 2]!, hullChain[hullChain.length - 1]!, nextPoint)
    ) {
      hullChain.pop()
    }

    hullChain.push(nextPoint)
  }

  hullChain.pop()

  return hullChain
}

/** Build the smallest convex polygon that contains every point (Andrew's monotone chain). */
export function computeConvexHull(points: PointerPosition[]): PointerPosition[] {
  const sortedPoints = [...points].sort(comparePointsByPosition)

  if (sortedPoints.length <= 1) return sortedPoints

  const upperHull = buildHullChain(sortedPoints)
  const lowerHull = buildHullChain([...sortedPoints].reverse())
  const isSinglePoint =
    upperHull.length === 1 &&
    lowerHull.length === 1 &&
    upperHull[0]!.x === lowerHull[0]!.x &&
    upperHull[0]!.y === lowerHull[0]!.y

  return isSinglePoint ? upperHull : [...upperHull, ...lowerHull]
}

/** Tell whether a point lies inside a polygon, by counting how many of its edges a ray from the point crosses. */
export function isPointInPolygon(point: PointerPosition, polygon: PointerPosition[]) {
  let isInside = false

  polygon.forEach((corner, cornerIndex) => {
    const previousCorner = polygon.at(cornerIndex - 1)!
    const crossesRay =
      corner.y > point.y !== previousCorner.y > point.y &&
      point.x < ((previousCorner.x - corner.x) * (point.y - corner.y)) / (previousCorner.y - corner.y) + corner.x

    if (crossesRay) isInside = !isInside
  })

  return isInside
}

/** Build the area the pointer may cross, from where it left an element to the element it is heading for. */
export function createPointerGraceArea(
  exitPoint: PointerPosition,
  leftElementEdges: ElementEdges,
  targetElementEdges: ElementEdges,
): PointerGraceArea {
  const exitSide = findPointerExitSide(exitPoint, leftElementEdges)

  return computeConvexHull([...padPointerExitPoint(exitPoint, exitSide), ...listElementCorners(targetElementEdges)])
}
