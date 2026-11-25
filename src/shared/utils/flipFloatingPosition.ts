import type { FloatingPosition, FloatingPositionContext, FloatingPositionModifier, FloatingSide } from '../types/floating-position'
import { placeFloatingAgainstAnchor } from './computeFloatingPosition'

const oppositeSides: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

/** Measure how far the floating element goes past the edge of the viewport on its side, in pixels. */
function measureSideOverflow(
  floatingPosition: FloatingPosition,
  { floatingSize, viewportSize }: FloatingPositionContext,
  viewportPadding: number,
) {
  const sideOverflows: Record<FloatingSide, number> = {
    top: viewportPadding - floatingPosition.y,
    bottom: floatingPosition.y + floatingSize.height - (viewportSize.height - viewportPadding),
    left: viewportPadding - floatingPosition.x,
    right: floatingPosition.x + floatingSize.width - (viewportSize.width - viewportPadding),
  }

  return sideOverflows[floatingPosition.placement.side]
}

/** Move the floating element to the opposite side of its anchor when it has more room there. */
export function flipFloatingPosition(viewportPadding = 8): FloatingPositionModifier {
  return (floatingPosition, positionContext) => {
    const requestedSideOverflow = measureSideOverflow(floatingPosition, positionContext, viewportPadding)

    if (requestedSideOverflow <= 0) return floatingPosition

    const flippedPosition = placeFloatingAgainstAnchor(positionContext, {
      ...floatingPosition.placement,
      side: oppositeSides[floatingPosition.placement.side],
    })
    const flippedSideOverflow = measureSideOverflow(flippedPosition, positionContext, viewportPadding)

    return flippedSideOverflow < requestedSideOverflow ? flippedPosition : floatingPosition
  }
}
