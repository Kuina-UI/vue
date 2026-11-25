/** Tell whether a link points to another website, so it should open in a new tab. */
export function isExternalUrl(url: string) {
  return /^https?:\/\//.test(url)
}
