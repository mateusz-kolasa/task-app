import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './slices/api/api-slice'

const reducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
})

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: reducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat([apiSlice.middleware])
    },
    preloadedState,
  })
}

export const store = setupStore()
export type RootState = ReturnType<typeof reducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
