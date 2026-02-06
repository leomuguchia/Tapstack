import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import actionsReducer from "./actionsSlice";
import shortcutsReducer from "./shortcutsSlice";
import quickActionsReducer from './quickActionsSlice';

// Combine all reducers
const appReducer = combineReducers({
  actions: actionsReducer,
  shortcuts: shortcutsReducer,
  quickActions: quickActionsReducer,
});

// Intercept RESET action to clear state
const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined;
  }
  return appReducer(state, action);
};

// Persistence config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: [
    "actions",
    "shortcuts",
    "quickActions",
  ],
  // Optional: version control for migrations
  version: 1,
  migrate: (state) => {
    if (!state) return Promise.resolve(undefined);
    // Handle migrations here if needed
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store creation
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      immutableCheck: false,
    }),
});

// Persistor
let persistor;
try {
  persistor = persistStore(store);
} catch (err) {
  console.warn('[Persist] Failed to initialize persistor:', err);
  // No-op fallback
  persistor = { 
    purge: () => Promise.resolve(), 
    flush: () => Promise.resolve(), 
    pause: () => {},
    persist: () => {},
  };
}

export { store, persistor };