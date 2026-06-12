import { all } from 'redux-saga/effects';

import { chatSaga } from '../features/chat/chatSaga.js';

export function* rootSaga() {
  yield all([chatSaga()]);
}
