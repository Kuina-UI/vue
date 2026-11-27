import type { FloatingPositionModifier } from '../types/floating-position'

function clampBetween(coordinate: number, lowestCoordinate: number, highestCoordinate: number) {
  return Math.max(lowestCoordinate, Math.min(coordinate, highestCoordinate))
}

/** Slide the floating element along its anchor to keep it inside the viewport, without letting it leave the anchor. */
export function shiftFloatingPosition(viewportPadding = 8): FloatingPositionModifier {
  return (floatingPosition, { anchorRect, floatingSize, viewportSize }) => {
    const isVerticalSide = floatingPosition.placement.side === 'top' || floatingPosition.placement.side === 'bottom'

    if (isVerticalSide) {
      const shiftedX = clampBetween(
        floatingPosition.x,
        viewportPadding,
        viewportSize.width - viewportPadding - floatingSize.width,
      )

      return {
        ...floatingPosition,
        x: clampBetween(shiftedX, anchorRect.x - floatingSize.width, anchorRect.x + anchorRect.width),
      }
    }

    const shiftedY = clampBetween(
      floatingPosition.y,
      viewportPadding,
      viewportSize.height - viewportPadding - floatingSize.height,
    )

    return {
      ...floatingPosition,
      y: clampBetween(shiftedY, anchorRect.y - floatingSize.height, anchorRect.y + anchorRect.height),
    }
  }
}
