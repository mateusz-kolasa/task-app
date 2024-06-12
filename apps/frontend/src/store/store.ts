import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authApiSlice } from './slices/auth-api-slice'
import { boardApiSlice } from './slices/board-api-slice'
import { listApiSlice } from './slices/list-api-slice'
import { cardApiSlice } from './slices/card-api-slice'

const reducer = combineReducers({
  [authApiSlice.reducerPath]: authApiSlice.reducer,
  [boardApiSlice.reducerPath]: boardApiSlice.reducer,
  [listApiSlice.reducerPath]: listApiSlice.reducer,
  [cardApiSlice.reducerPath]: cardApiSlice.reducer,
})

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: reducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat([
        authApiSlice.middleware,
        boardApiSlice.middleware,
        listApiSlice.middleware,
        cardApiSlice.middleware,
      ])
    },
    preloadedState,
  })
}

export type RootState = ReturnType<typeof reducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
