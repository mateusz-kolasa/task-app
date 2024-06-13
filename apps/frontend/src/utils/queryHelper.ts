interface PositionSortable {
  id: number
  position: number
}

export const sortAndMapToIds = (data: PositionSortable[]) => {
  return [...data].sort((listA, listB) => listA.position - listB.position).map(list => list.id)
}
