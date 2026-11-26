/** Pick how much a pressed element shrinks horizontally: the wider it is, the less it shrinks. */
export function resolvePressScale(elementWidth: number) {
  if (elementWidth <= 80) return 0.96
  if (elementWidth <= 150) return 0.97
  if (elementWidth <= 220) return 0.98
  if (elementWidth > 600) return 0.995

  return 0.985
}
