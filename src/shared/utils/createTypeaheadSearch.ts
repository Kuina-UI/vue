/** Build a search that finds the next label starting with the letters typed in quick succession. */
export function createTypeaheadSearch(queryResetDelay = 500) {
  let typedQuery = ''
  let queryResetTimer: ReturnType<typeof setTimeout> | undefined

  return function findTypeaheadMatch(typedCharacter: string, candidateLabels: string[], currentIndex: number) {
    clearTimeout(queryResetTimer)
    typedQuery += typedCharacter.toLowerCase()
    queryResetTimer = setTimeout(() => {
      typedQuery = ''
    }, queryResetDelay)

    const firstTypedCharacter = typedQuery.charAt(0)
    const repeatsOneCharacter = [...typedQuery].every((queryCharacter) => queryCharacter === firstTypedCharacter)
    const searchedPrefix = repeatsOneCharacter ? firstTypedCharacter : typedQuery
    const firstCandidateIndex = searchedPrefix.length === 1 ? currentIndex + 1 : Math.max(currentIndex, 0)

    for (let candidateOffset = 0; candidateOffset < candidateLabels.length; candidateOffset++) {
      const candidateIndex = (firstCandidateIndex + candidateOffset) % candidateLabels.length

      if (candidateLabels[candidateIndex]?.toLowerCase().startsWith(searchedPrefix)) return candidateIndex
    }

    return -1
  }
}
