import { eventChannel } from 'redux-saga';
import { call, cancel, fork, put, select, take, takeLatest } from 'redux-saga/effects';

import { appStarted } from '../../store/appActions.js';
import {
  messageReceived,
  messagesLoaded,
  onlineUsersUpdated,
  selectUsername,
  sendMessageRequested,
  serverHealthFailed,
  serverHealthLoaded,
  setUsername,
  websocketConnected,
  websocketConnecting,
  websocketDisconnected,
} from './chatSlice.js';

function fetchServerHealth() {
  return fetch('/api/health').then((response) => {
    if (!response.ok) {
      throw new Error('Server health check failed');
    }

    return response.json();
  });
}

function resolveWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host =
    window.location.port === '5173' ? `${window.location.hostname}:3001` : window.location.host;

  return `${protocol}//${host}/ws`;
}

function createSocketChannel(username, socketRef) {
  return eventChannel((emit) => {
    const socket = new WebSocket(resolveWebSocketUrl());
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          type: 'user:join',
          payload: { username },
        }),
      );
      emit({ type: 'socket:open' });
    });

    socket.addEventListener('message', (event) => {
      try {
        emit({
          type: 'socket:message',
          payload: JSON.parse(event.data),
        });
      } catch {
        emit({ type: 'socket:error' });
      }
    });

    socket.addEventListener('close', () => {
      emit({ type: 'socket:close' });
    });

    socket.addEventListener('error', () => {
      emit({ type: 'socket:error' });
    });

    return () => {
      socketRef.current = null;
      socket.close();
    };
  });
}

function sendWhenReady(socketRef, event) {
  const socket = socketRef.current;

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(event));
  }
}

function* loadServerHealth() {
  try {
    const health = yield call(fetchServerHealth);
    yield put(serverHealthLoaded(health));
  } catch {
    yield put(serverHealthFailed());
  }
}

function* sendOutgoingMessages(socketRef) {
  while (true) {
    const action = yield take(sendMessageRequested.type);
    yield call(sendWhenReady, socketRef, {
      type: 'message:send',
      payload: {
        text: action.payload.text,
      },
    });
  }
}

function* sendUsernameUpdates(socketRef) {
  while (true) {
    const action = yield take(setUsername.type);
    yield call(sendWhenReady, socketRef, {
      type: 'user:update',
      payload: {
        username: action.payload,
      },
    });
  }
}

function* connectWebSocket() {
  const socketRef = { current: null };
  const username = yield select(selectUsername);
  const channel = yield call(createSocketChannel, username, socketRef);

  yield put(websocketConnecting());
  const outgoingTask = yield fork(sendOutgoingMessages, socketRef);
  const usernameTask = yield fork(sendUsernameUpdates, socketRef);

  while (true) {
    const event = yield take(channel);

    if (event.type === 'socket:open') {
      yield put(websocketConnected());
      continue;
    }

    if (event.type === 'socket:close' || event.type === 'socket:error') {
      yield put(websocketDisconnected());
      break;
    }

    if (event.type !== 'socket:message') {
      continue;
    }

    const serverEvent = event.payload;

    if (serverEvent.type === 'connection:ready') {
      yield put(websocketConnected({ clientId: serverEvent.payload.clientId }));
      yield put(onlineUsersUpdated(serverEvent.payload.users));
      yield put(messagesLoaded(serverEvent.payload.history));
    }

    if (serverEvent.type === 'users:update') {
      yield put(onlineUsersUpdated(serverEvent.payload.users));
    }

    if (serverEvent.type === 'message:new') {
      yield put(messageReceived(serverEvent.payload.message));
    }
  }

  yield cancel(outgoingTask);
  yield cancel(usernameTask);
  channel.close();
}

export function* chatSaga() {
  yield takeLatest(appStarted.type, loadServerHealth);
  yield takeLatest(appStarted.type, connectWebSocket);
}
