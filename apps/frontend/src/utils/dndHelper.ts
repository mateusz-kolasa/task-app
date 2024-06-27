import { Update } from '@reduxjs/toolkit'
import { SortableByPosition } from 'store/slices/api/api-slice'

export const extractDraggableId = (draggableId: string) => {
  return parseInt(draggableId.split('_')[1])
}

export const movePosition = (
  ids: number[],
  entities: Record<number, SortableByPosition>,
  originalPosition: number,
  changedPosition: number,
  itemId: number
) =>
  ids.reduce((updated: Update<SortableByPosition, number>[], id) => {
    const current = entities[id]

    if (id === itemId) {
      updated.push({
        id,
        changes: {
          position: changedPosition,
        },
      })
    } else if (
      changedPosition > originalPosition &&
      current.position > originalPosition &&
      current.position <= changedPosition
    ) {
      updated.push({
        id,
        changes: {
          position: current.position - 1,
        },
      })
    } else if (
      changedPosition < originalPosition &&
      current.position < originalPosition &&
      current.position >= changedPosition
    ) {
      updated.push({
        id,
        changes: {
          position: current.position + 1,
        },
      })
    }

    return updated
  }, [])
