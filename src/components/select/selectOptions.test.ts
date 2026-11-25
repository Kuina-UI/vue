import { describe, expect, it } from 'vitest'
import {
  collectSelectOptions,
  filterSelectEntries,
  isResolvedSelectGroup,
  readOptionField,
  resolveSelectEntries,
  type SelectOptionFieldKeys,
} from './selectOptions'

const defaultFieldKeys: SelectOptionFieldKeys = {
  valueKey: 'value',
  labelKey: 'label',
  descriptionKey: 'description',
  avatarKey: 'avatar',
}

describe('readOptionField', () => {
  it('reads nested fields with a dotted path', () => {
    expect(readOptionField({ profile: { email: 'avery@example.com' } }, 'profile.email')).toBe('avery@example.com')
  })

  it('returns undefined when a step of the path is missing', () => {
    expect(readOptionField({ profile: null }, 'profile.email')).toBeUndefined()
  })
})

describe('resolveSelectEntries', () => {
  it('uses a string option as both its value and its label', () => {
    const [adminOption] = resolveSelectEntries(['Admin'], defaultFieldKeys, 'role')

    expect(adminOption).toMatchObject({ value: 'Admin', label: 'Admin', disabled: false, optionId: 'role-option-0' })
  })

  it('reads raw objects through the given keys', () => {
    const [userOption] = resolveSelectEntries(
      [{ id: 7, fullName: 'Avery Collins', contact: { email: 'avery@example.com' }, photoUrl: '/avery.webp' }],
      { valueKey: 'id', labelKey: 'fullName', descriptionKey: 'contact.email', avatarKey: 'photoUrl' },
      'assignee',
    )

    expect(userOption).toMatchObject({
      value: 7,
      label: 'Avery Collins',
      description: 'avery@example.com',
      avatar: { imageUrl: '/avery.webp' },
    })
  })

  it('keeps an avatar object as avatar props', () => {
    const [memberOption] = resolveSelectEntries(
      [{ value: 'drew', label: 'Drew Parker', avatar: { initials: 'DP', color: 'info' } }],
      defaultFieldKeys,
      'member',
    )

    expect(memberOption).toMatchObject({ avatar: { initials: 'DP', color: 'info' } })
  })

  it('keeps only the avatar fields, so other fields of an API object never become HTML attributes', () => {
    const [memberOption] = resolveSelectEntries(
      [{ value: 'drew', label: 'Drew Parker', avatar: { id: 42, imageUrl: '/drew.webp' } }],
      defaultFieldKeys,
      'member',
    )

    expect(memberOption).toMatchObject({ avatar: { imageUrl: '/drew.webp' } })
    expect(memberOption).not.toMatchObject({ avatar: { id: 42 } })
  })

  it('numbers the options of groups after the options before them', () => {
    const resolvedEntries = resolveSelectEntries(
      [{ value: 'utc', label: 'UTC' }, { label: 'Europe', options: [{ value: 'paris', label: 'Paris' }] }],
      defaultFieldKeys,
      'timezone',
    )

    expect(collectSelectOptions(resolvedEntries).map((resolvedOption) => resolvedOption.optionId)).toEqual([
      'timezone-option-0',
      'timezone-option-1',
    ])
    expect(isResolvedSelectGroup(resolvedEntries[1]!)).toBe(true)
  })
})

describe('filterSelectEntries', () => {
  const resolvedEntries = resolveSelectEntries(
    [
      { value: 'groceries', label: 'Groceries' },
      { label: 'Trips', options: [{ value: 'travel', label: 'Travel' }, { value: 'hotels', label: 'Hotels' }] },
      { label: 'Bills', options: [{ value: 'utilities', label: 'Utilities' }] },
    ],
    defaultFieldKeys,
    'category',
  )

  it('keeps the options whose label contains the query, whatever its case', () => {
    const matchingLabels = collectSelectOptions(filterSelectEntries(resolvedEntries, 'TR')).map(
      (resolvedOption) => resolvedOption.label,
    )

    expect(matchingLabels).toEqual(['Travel'])
  })

  it('drops the groups left without any option', () => {
    const filteredEntries = filterSelectEntries(resolvedEntries, 'tra')

    expect(filteredEntries).toHaveLength(1)
    expect(filteredEntries.every(isResolvedSelectGroup)).toBe(true)
  })

  it('keeps every entry when the query is blank', () => {
    expect(filterSelectEntries(resolvedEntries, '  ')).toBe(resolvedEntries)
  })
})
