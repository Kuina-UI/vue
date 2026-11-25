export type FloatingSide = 'top' | 'bottom'

export type FloatingAlign = 'start' | 'center' | 'end'

export type FloatingStrategy = 'absolute' | 'fixed'

export interface FloatingPlacement {
  side: FloatingSide
  align: FloatingAlign
  sideOffset: number
  alignOffset: number
}

export interface BoxSize {
  width: number
  height: number
}

export interface BoxRect extends BoxSize {
  x: number
  y: number
}

export interface FloatingPositionContext {
  anchorRect: BoxRect
  floatingSize: BoxSize
  viewportSize: BoxSize
}

export interface FloatingPosition {
  x: number
  y: number
  placement: FloatingPlacement
}

export type FloatingPositionModifier = (
  floatingPosition: FloatingPosition,
  positionContext: FloatingPositionContext,
) => FloatingPosition
