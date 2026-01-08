import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { baseApi, classApi, publicApi, workspaceApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import organizationReducer from './slices/organizationSlice';

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Use localStorage on client, noop on server
const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

// Organization persist config - exclude loading state
const organizationPersistConfig = {
  key: 'organization',
  storage,
  blacklist: ['loading'], // Don't persist loading state
};

// Root persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // Persist auth and organization data (not API cache)
  whitelist: ['auth', 'organization'],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  organization: persistReducer(organizationPersistConfig, organizationReducer),
  [baseApi.reducerPath]: baseApi.reducer,
  [classApi.reducerPath]: classApi.reducer,
  [workspaceApi.reducerPath]: workspaceApi.reducer,
  [publicApi.reducerPath]: publicApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      baseApi.middleware,
      classApi.middleware,
      workspaceApi.middleware,
      publicApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
