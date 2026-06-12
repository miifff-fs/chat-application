import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import chatReducer from '../features/chat/chatSlice.js';
import { rootSaga } from './rootSaga.js';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
