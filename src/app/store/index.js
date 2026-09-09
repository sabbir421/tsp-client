import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authReducer from './slices/authSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware();

      if (process.env.NODE_ENV === 'development') {
        return middleware.concat(logger);
      }

      return middleware;
    },
  });
