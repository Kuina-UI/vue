export interface MaskToken {
  pattern: RegExp
  transform?: (character: string) => string
}

export type MaskTokens = Record<string, MaskToken>

export interface MaskSettings {
  pattern: string | string[]
  tokens?: MaskTokens
  eager?: boolean
  preprocess?: (text: string) => string
}

export type MaskOptions = string | string[] | MaskSettings

export interface MaskResult {
  masked: string
  unmasked: string
  completed: boolean
}
