import type { MaskOptions, MaskResult, MaskSettings, MaskToken, MaskTokens } from '../types/mask'

type MaskStep = { token: MaskToken; literal?: undefined } | { token?: undefined; literal: string }

interface ParsedPattern {
  steps: MaskStep[]
  tokenCount: number
}

const escapeCharacter = '!'

export const defaultMaskTokens: MaskTokens = {
  '#': { pattern: /\d/ },
  '@': { pattern: /\p{L}/u },
  '*': { pattern: /[\p{L}\d]/u },
}

function normalizeMaskOptions(maskOptions: MaskOptions): MaskSettings {
  return typeof maskOptions === 'string' || Array.isArray(maskOptions) ? { pattern: maskOptions } : maskOptions
}

function parsePattern(pattern: string, maskTokens: MaskTokens): ParsedPattern {
  const steps: MaskStep[] = []
  const patternCharacters = [...pattern]

  for (let characterIndex = 0; characterIndex < patternCharacters.length; characterIndex += 1) {
    const patternCharacter = patternCharacters[characterIndex]

    if (patternCharacter === escapeCharacter && characterIndex + 1 < patternCharacters.length) {
      characterIndex += 1
      steps.push({ literal: patternCharacters[characterIndex] })
    } else if (maskTokens[patternCharacter]) {
      steps.push({ token: maskTokens[patternCharacter] })
    } else {
      steps.push({ literal: patternCharacter })
    }
  }

  return { steps, tokenCount: steps.filter((maskStep) => maskStep.token).length }
}

/** Fill the steps of a pattern with the accepted characters of a text, skipping the ones no token accepts. */
function fillPattern(parsedPattern: ParsedPattern, text: string, appendsNextLiterals: boolean): MaskResult {
  const textCharacters = [...text]
  let masked = ''
  let unmasked = ''
  let pendingLiterals = ''
  let textIndex = 0

  for (const maskStep of parsedPattern.steps) {
    if (maskStep.literal !== undefined) {
      pendingLiterals += maskStep.literal
      if (textCharacters[textIndex] === maskStep.literal) textIndex += 1
      continue
    }

    while (textIndex < textCharacters.length && !maskStep.token.pattern.test(textCharacters[textIndex])) textIndex += 1

    if (textIndex >= textCharacters.length) break

    const acceptedCharacter = maskStep.token.transform?.(textCharacters[textIndex]) ?? textCharacters[textIndex]
    masked += pendingLiterals + acceptedCharacter
    unmasked += acceptedCharacter
    pendingLiterals = ''
    textIndex += 1
  }

  if (appendsNextLiterals && unmasked) masked += pendingLiterals

  return { masked, unmasked, completed: [...unmasked].length === parsedPattern.tokenCount }
}

/** Build a mask from a pattern like `##/##/####`, where tokens accept characters and anything else is written as is. */
export function createMask(maskOptions: MaskOptions) {
  const maskSettings = normalizeMaskOptions(maskOptions)
  const maskTokens = { ...defaultMaskTokens, ...maskSettings.tokens }
  const patterns = Array.isArray(maskSettings.pattern) ? maskSettings.pattern : [maskSettings.pattern]
  const parsedPatterns = patterns
    .map((pattern) => parsePattern(pattern, maskTokens))
    .sort((firstPattern, secondPattern) => firstPattern.tokenCount - secondPattern.tokenCount)
  const longestPattern = parsedPatterns[parsedPatterns.length - 1]

  function selectPattern(acceptedCharacterCount: number) {
    return parsedPatterns.find((parsedPattern) => parsedPattern.tokenCount >= acceptedCharacterCount) ?? longestPattern
  }

  /** Mask a text, adding the separators that follow a completed group unless `eager` is false. */
  function apply(text: string, applyOptions: { eager?: boolean } = {}): MaskResult {
    const preparedText = maskSettings.preprocess ? maskSettings.preprocess(text) : text
    const appendsNextLiterals = applyOptions.eager ?? maskSettings.eager ?? true
    const acceptedCharacterCount = [...fillPattern(longestPattern, preparedText, false).unmasked].length

    return fillPattern(selectPattern(acceptedCharacterCount), preparedText, appendsNextLiterals)
  }

  /** Find where the caret goes in a masked text so that it sits right after the given number of accepted characters. */
  function findCaretPosition(maskedText: string, acceptedCharacterCount: number) {
    if (acceptedCharacterCount <= 0) return 0

    const { steps } = selectPattern([...apply(maskedText, { eager: false }).unmasked].length)
    let passedAcceptedCount = 0
    let caretPosition = 0

    for (const [stepIndex, maskStep] of steps.entries()) {
      if (stepIndex >= maskedText.length) break
      caretPosition = stepIndex + 1
      if (maskStep.token) passedAcceptedCount += 1
      if (passedAcceptedCount === acceptedCharacterCount) return caretPosition
    }

    return maskedText.length
  }

  return { apply, findCaretPosition }
}

export type Mask = ReturnType<typeof createMask>
