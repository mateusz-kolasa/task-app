import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface DraggableCard {
  cardId: number
  sourceListId: number
  overListId: number
  index: number
}

interface DraggableList {
  listId: number
}

export interface DraggableState {
  card: DraggableCard | null
  list: DraggableList | null
}

const initialState: DraggableState = {
  card: null,
  list: null,
}

interface DragOver {
  overListId: number
  index: number
}

export const draggableSlice = createSlice({
  name: 'draggable',
  initialState,
  reducers: {
    clearDraggable: state => {
      state.card = null
      state.list = null
    },
    startCardDrag: (state, action: PayloadAction<DraggableCard>) => {
      state.card = action.payload
    },
    setCardDragOver: (state, action: PayloadAction<DragOver>) => {
      if (state.card) {
        state.card.overListId = action.payload.overListId
        state.card.index = action.payload.index
      }
    },
    startListDrag: (state, action: PayloadAction<DraggableList>) => {
      state.list = action.payload
    },
  },
})

export const { clearDraggable, startCardDrag, setCardDragOver, startListDrag } =
  draggableSlice.actions

export default draggableSlice.reducer
