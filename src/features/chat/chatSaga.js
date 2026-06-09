import { call, put, takeLatest } from 'redux-saga/effects';

import { appStarted } from '../../store/appActions.js';
import { serverHealthFailed, serverHealthLoaded } from './chatSlice.js';

function fetchServerHealth() {
  return fetch('/api/health').then((response) => {
    if (!response.ok) {
      throw new Error('Server health check failed');
    }

    return response.json();
  });
}

function* loadServerHealth() {
  try {
    const health = yield call(fetchServerHealth);
    yield put(serverHealthLoaded(health));
  } catch {
    yield put(serverHealthFailed());
  }
}

export function* chatSaga() {
  yield takeLatest(appStarted.type, loadServerHealth);
}
