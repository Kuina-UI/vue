import type {
  FloatingPlacement,
  FloatingPosition,
  FloatingPositionContext,
  FloatingPositionModifier,
  FloatingSide,
} from '../types/floating-position'

/** Align a box along one axis with the anchor's start, center or end. */
function alignAlongAnchor(
  anchorStart: number,
  anchorLength: number,
  floatingLength: number,
  placement: FloatingPlacement,
) {
  if (placement.align === 'center') return anchorStart + (anchorLength - floatingLength) / 2
  if (placement.align === 'end') return anchorStart + anchorLength - floatingLength - placement.alignOffset
  return anchorStart + placement.alignOffset
}

const placeAgainstAnchorSide: Record<
  FloatingSide,
  (positionContext: FloatingPositionContext, placement: FloatingPlacement) => Pick<FloatingPosition, 'x' | 'y'>
> = {
  top: ({ anchorRect, floatingSize }, placement) => ({
    x: alignAlongAnchor(anchorRect.x, anchorRect.width, floatingSize.width, placement),
    y: anchorRect.y - floatingSize.height - placement.sideOffset,
  }),
  bottom: ({ anchorRect, floatingSize }, placement) => ({
    x: alignAlongAnchor(anchorRect.x, anchorRect.width, floatingSize.width, placement),
    y: anchorRect.y + anchorRect.height + placement.sideOffset,
  }),
  left: ({ anchorRect, floatingSize }, placement) => ({
    x: anchorRect.x - floatingSize.width - placement.sideOffset,
    y: alignAlongAnchor(anchorRect.y, anchorRect.height, floatingSize.height, placement),
  }),
  right: ({ anchorRect, floatingSize }, placement) => ({
    x: anchorRect.x + anchorRect.width + placement.sideOffset,
    y: alignAlongAnchor(anchorRect.y, anchorRect.height, floatingSize.height, placement),
  }),
}

/** Place the floating element against its anchor, in viewport coordinates. */
export function placeFloatingAgainstAnchor(
  positionContext: FloatingPositionContext,
  placement: FloatingPlacement,
): FloatingPosition {
  return { ...placeAgainstAnchorSide[placement.side](positionContext, placement), placement }
}

/** Place the floating element against its anchor, then let each modifier adjust the position. */
export function computeFloatingPosition(
  positionContext: FloatingPositionContext,
  placement: FloatingPlacement,
  positionModifiers: FloatingPositionModifier[] = [],
): FloatingPosition {
  return positionModifiers.reduce(
    (floatingPosition, modifyPosition) => modifyPosition(floatingPosition, positionContext),
    placeFloatingAgainstAnchor(positionContext, placement),
  )
}
