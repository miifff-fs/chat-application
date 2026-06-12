import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: 'Student',
  draftMessage: '',
  connectionStatus: 'idle',
  clientId: null,
  health: {
    status: 'loading',
    realtime: 'checking',
  },
  onlineUsers: [
    {
      id: 'local',
      username: 'Student',
    },
  ],
  messages: [
    {
      id: 'welcome',
      author: 'System',
      time: '10:42 PM',
      text: 'Welcome to the general room.',
    },
  ],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsername(state, action) {
      state.username = action.payload;
    },
    setDraftMessage(state, action) {
      state.draftMessage = action.payload;
    },
    sendMessageRequested(state) {
      state.draftMessage = '';
    },
    websocketConnecting(state) {
      state.connectionStatus = 'connecting';
    },
    websocketConnected(state, action) {
      state.connectionStatus = 'connected';
      state.clientId = action.payload?.clientId ?? state.clientId;
    },
    websocketDisconnected(state) {
      state.connectionStatus = 'disconnected';
      state.clientId = null;
      state.onlineUsers = [];
    },
    onlineUsersUpdated(state, action) {
      state.onlineUsers = action.payload;
    },
    messagesLoaded(state, action) {
      if (action.payload.length > 0) {
        state.messages = action.payload;
      }
    },
    messageReceived(state, action) {
      state.messages.push(action.payload);
    },
    serverHealthLoaded(state, action) {
      state.health = action.payload;
    },
    serverHealthFailed(state) {
      state.health = {
        status: 'offline',
        realtime: 'server-unavailable',
      };
    },
  },
});

export const {
  messageReceived,
  messagesLoaded,
  onlineUsersUpdated,
  sendMessageRequested,
  serverHealthFailed,
  serverHealthLoaded,
  setDraftMessage,
  setUsername,
  websocketConnected,
  websocketConnecting,
  websocketDisconnected,
} = chatSlice.actions;

export const selectUsername = (state) => state.chat.username;
export const selectDraftMessage = (state) => state.chat.draftMessage;
export const selectConnectionStatus = (state) => state.chat.connectionStatus;
export const selectHealth = (state) => state.chat.health;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectMessages = (state) => state.chat.messages;

export default chatSlice.reducer;
