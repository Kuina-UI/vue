/** Tell whether the user is on macOS or iOS, where shortcuts use Command instead of Ctrl. */
export function isApplePlatform() {
  return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
}
