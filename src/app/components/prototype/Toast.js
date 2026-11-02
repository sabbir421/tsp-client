'use client';

import { useState, useEffect } from 'react';

let toastFn = null;

export function showToast(message) {
  if (toastFn) {
    toastFn(message);
  }
}

export default function Toast() {
  const [toastMessage, setToastMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastFn = (msg) => {
      setToastMessage(msg);
      setVisible(true);
      clearTimeout(toastFn._t);
      toastFn._t = setTimeout(() => {
        setVisible(false);
      }, 2800);
    };
    return () => {
      toastFn = null;
    };
  }, []);

  return (
    <div className={`toast ${visible ? 'show' : ''}`} id="toast">
      {toastMessage}
    </div>
  );
}
