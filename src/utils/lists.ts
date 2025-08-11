export const mergeUnique = <T extends Record<string, unknown>>(list: T[], newList: T[], key = 'id'): T[] => {
  const existingIds = new Set(list.map((item) => item[key]))
  const merged = [...list]

  newList.forEach((item) => {
    if (!existingIds.has(item[key])) {
      merged.push(item)
    }
  })

  return merged
}
