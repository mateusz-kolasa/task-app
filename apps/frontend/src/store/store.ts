import { configureStore } from '@reduxjs/toolkit'
import { authApiSlice } from './slices/auth-api-slice'
import { boardApiSlice } from './slices/board-api-slice'
import { listApiSlice } from './slices/list-api-slice'
import { cardApiSlice } from './slices/card-api-slice'

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [boardApiSlice.reducerPath]: boardApiSlice.reducer,
    [listApiSlice.reducerPath]: listApiSlice.reducer,
    [cardApiSlice.reducerPath]: cardApiSlice.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware().concat([
      authApiSlice.middleware,
      boardApiSlice.middleware,
      listApiSlice.middleware,
      cardApiSlice.middleware,
    ])
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
