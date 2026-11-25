import type { AvatarProps } from '../../elements/avatar'

export type SelectOptionAvatar = Pick<AvatarProps, 'imageUrl' | 'initials' | 'icon' | 'color' | 'variant' | 'pill'>

export interface SelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
  avatar?: SelectOptionAvatar | string
}

export interface SelectOptionGroup<SourceOption = SelectOption> {
  label: string
  options: SourceOption[]
}

export type SelectOptionEntry<SourceOption = SelectOption> = SourceOption | SelectOptionGroup<SourceOption>

export interface SelectOptionFieldKeys {
  valueKey: string
  labelKey: string
  descriptionKey: string
  avatarKey: string
}

export interface ResolvedSelectOption<SourceOption = unknown> {
  optionId: string
  value: unknown
  label: string
  description?: string
  disabled: boolean
  avatar?: SelectOptionAvatar
  sourceOption: SourceOption
}

export interface ResolvedSelectGroup<SourceOption = unknown> {
  groupLabel: string
  options: ResolvedSelectOption<SourceOption>[]
}

export type ResolvedSelectEntry<SourceOption = unknown> = ResolvedSelectOption<SourceOption> | ResolvedSelectGroup<SourceOption>

export function isSelectOptionGroup<SourceOption>(
  optionEntry: SelectOptionEntry<SourceOption>,
): optionEntry is SelectOptionGroup<SourceOption> {
  return typeof optionEntry === 'object' && optionEntry !== null && Array.isArray(Reflect.get(optionEntry, 'options'))
}

export function isResolvedSelectGroup<SourceOption>(
  resolvedEntry: ResolvedSelectEntry<SourceOption>,
): resolvedEntry is ResolvedSelectGroup<SourceOption> {
  return 'groupLabel' in resolvedEntry
}

/** Read a field of an option, following dotted paths such as "profile.name". */
export function readOptionField(sourceOption: unknown, fieldPath: string) {
  return fieldPath.split('.').reduce<unknown>((fieldOwner, fieldName) => {
    if (typeof fieldOwner !== 'object' || fieldOwner === null) return undefined
    return Reflect.get(fieldOwner, fieldName)
  }, sourceOption)
}

const selectOptionAvatarFieldNames = ['imageUrl', 'initials', 'icon', 'color', 'variant', 'pill'] as const

function resolveOptionAvatar(avatarField: unknown): SelectOptionAvatar | undefined {
  if (typeof avatarField === 'string') return { imageUrl: avatarField }
  if (typeof avatarField !== 'object' || avatarField === null) return undefined

  const avatarEntries = selectOptionAvatarFieldNames
    .filter((avatarFieldName) => Reflect.get(avatarField, avatarFieldName) !== undefined)
    .map((avatarFieldName) => [avatarFieldName, Reflect.get(avatarField, avatarFieldName)])

  return Object.fromEntries(avatarEntries) as SelectOptionAvatar
}

function resolveSelectOption<SourceOption>(
  sourceOption: SourceOption,
  fieldKeys: SelectOptionFieldKeys,
  optionId: string,
): ResolvedSelectOption<SourceOption> {
  if (typeof sourceOption !== 'object' || sourceOption === null) {
    return { optionId, value: sourceOption, label: String(sourceOption), disabled: false, sourceOption }
  }

  const description = readOptionField(sourceOption, fieldKeys.descriptionKey)

  return {
    optionId,
    value: readOptionField(sourceOption, fieldKeys.valueKey),
    label: String(readOptionField(sourceOption, fieldKeys.labelKey) ?? ''),
    description: description === undefined || description === null ? undefined : String(description),
    disabled: Boolean(readOptionField(sourceOption, 'disabled')),
    avatar: resolveOptionAvatar(readOptionField(sourceOption, fieldKeys.avatarKey)),
    sourceOption,
  }
}

/** Turn the options given to a select, raw API objects included, into options it can display. */
export function resolveSelectEntries<SourceOption>(
  optionEntries: SelectOptionEntry<SourceOption>[],
  fieldKeys: SelectOptionFieldKeys,
  optionIdPrefix: string,
): ResolvedSelectEntry<SourceOption>[] {
  let optionIndex = 0
  const createOptionId = () => `${optionIdPrefix}-option-${optionIndex++}`

  return optionEntries.map((optionEntry) => {
    if (!isSelectOptionGroup(optionEntry)) return resolveSelectOption(optionEntry, fieldKeys, createOptionId())

    return {
      groupLabel: optionEntry.label,
      options: optionEntry.options.map((groupOption) => resolveSelectOption(groupOption, fieldKeys, createOptionId())),
    }
  })
}

/** Keep the options whose label contains the search query, and drop the groups left empty. */
export function filterSelectEntries<SourceOption>(resolvedEntries: ResolvedSelectEntry<SourceOption>[], searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase()

  if (!normalizedQuery) return resolvedEntries

  const matchesQuery = (resolvedOption: ResolvedSelectOption<SourceOption>) =>
    resolvedOption.label.toLocaleLowerCase().includes(normalizedQuery)

  return resolvedEntries.flatMap<ResolvedSelectEntry<SourceOption>>((resolvedEntry) => {
    if (!isResolvedSelectGroup(resolvedEntry)) return matchesQuery(resolvedEntry) ? [resolvedEntry] : []

    const matchingOptions = resolvedEntry.options.filter(matchesQuery)

    return matchingOptions.length ? [{ ...resolvedEntry, options: matchingOptions }] : []
  })
}

export function collectSelectOptions<SourceOption>(resolvedEntries: ResolvedSelectEntry<SourceOption>[]) {
  return resolvedEntries.flatMap((resolvedEntry) =>
    isResolvedSelectGroup(resolvedEntry) ? resolvedEntry.options : [resolvedEntry],
  )
}
