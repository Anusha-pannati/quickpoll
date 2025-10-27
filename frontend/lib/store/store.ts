import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pollsReducer from './slices/pollsSlice';
import websocketReducer from './slices/websocketSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      polls: pollsReducer,
      websocket: websocketReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore WebSocket instance in state
          ignoredActions: ['websocket/setConnection'],
          ignoredPaths: ['websocket.connection'],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
