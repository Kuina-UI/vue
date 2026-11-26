import type { FloatingPlacement } from '../types/floating-position'

export const floatingPanelTransitionClasses = {
  enterFromClass: 'scale-95 opacity-0',
  enterActiveClass: 'transition duration-350 ease-[cubic-bezier(0.19,1,0.22,1)] motion-reduce:transition-none',
  leaveActiveClass: 'transition duration-200 ease-[cubic-bezier(0.8,0,0.4,1)] motion-reduce:transition-none',
  leaveToClass: 'scale-95 opacity-0',
}

const transformOriginOppositeSides = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const

/** Find the point a floating panel zooms from: the edge facing its anchor, on the side it is aligned with. */
export function findFloatingTransformOrigin(placement: Pick<FloatingPlacement, 'side' | 'align'>) {
  const anchorFacingEdge = transformOriginOppositeSides[placement.side]
  const isVerticalSide = placement.side === 'top' || placement.side === 'bottom'
  const alignedEdges = isVerticalSide
    ? { start: 'left', center: 'center', end: 'right' }
    : { start: 'top', center: 'center', end: 'bottom' }

  return isVerticalSide
    ? `${alignedEdges[placement.align]} ${anchorFacingEdge}`
    : `${anchorFacingEdge} ${alignedEdges[placement.align]}`
}
