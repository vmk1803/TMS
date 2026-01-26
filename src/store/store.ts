import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import ordersReducer from './ordersSlice' 
import storage from './storage'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

const rootReducer = combineReducers({
  orders: ordersReducer,
})

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], // No slices persisted - only persist minimal auth/preferences if needed
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Helper type to get the non-persisted state type
export type NonPersistedRootState = ReturnType<typeof rootReducer>

export default store
