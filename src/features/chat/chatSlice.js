import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: 'Student',
  draftMessage: '',
  health: {
    status: 'loading',
    realtime: 'checking',
  },
  onlineUsers: ['Student'],
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
      state.onlineUsers = [action.payload || 'Student'];
    },
    setDraftMessage(state, action) {
      state.draftMessage = action.payload;
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

export const { serverHealthFailed, serverHealthLoaded, setDraftMessage, setUsername } =
  chatSlice.actions;

export const selectUsername = (state) => state.chat.username;
export const selectHealth = (state) => state.chat.health;
export const selectOnlineUsers = (state) => state.chat.onlineUsers;
export const selectMessages = (state) => state.chat.messages;

export default chatSlice.reducer;
