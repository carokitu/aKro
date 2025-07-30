export const mergeUnique = <T extends { id: number | string }>(list: T[], newList: T[]): T[] => {
  const existingIds = new Set(list.map((item) => item.id))
  const merged = [...list]
  newList.forEach((item) => {
    if (!existingIds.has(item.id)) {
      merged.push(item)
    }
  })
  return merged
}
