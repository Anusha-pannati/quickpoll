import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  connected: boolean;
  connection: WebSocket | null;
}

const initialState: WebSocketState = {
  connected: false,
  connection: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnection: (state, action: PayloadAction<WebSocket | null>) => {
      state.connection = action.payload;
      state.connected = action.payload !== null;
    },
    disconnect: (state) => {
      if (state.connection) {
        state.connection.close();
      }
      state.connection = null;
      state.connected = false;
    },
  },
});

export const { setConnection, disconnect } = websocketSlice.actions;
export default websocketSlice.reducer;
