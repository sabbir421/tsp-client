'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './index';
import { hydrateFromStorage } from './slices/authSlice';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    storeRef.current.dispatch(hydrateFromStorage());
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
